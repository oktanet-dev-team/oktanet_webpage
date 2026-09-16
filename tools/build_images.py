#!/usr/bin/env python3
"""Recorta capturas de pantalla y las exporta en WebP y PNG para el sitio.

Por que existe: la maquina no tiene cwebp ni ninguna libreria de imagenes, y
las capturas salen de Oktavia a 1715 px de ancho con partes que no aportan.
Chrome si sabe recortar y codificar WebP desde un lienzo, y ya se usa aqui para
generar los PDF, asi que no se agrega ninguna dependencia nueva.

La diferencia de peso no es cosmetica: las capturas del sitio pesan 587 KB en
PNG y 48 KB en WebP, y la pagina sirve la WebP con la PNG como respaldo.

Uso:
    python3 tools/build_images.py [directorio_de_origen]

El recorte de cada imagen esta en ORIGENES, en pixeles del archivo original.
"""
from __future__ import annotations

import base64
import functools
import http.server
import json
import os
import socket
import socketserver
import subprocess
import sys
import threading
import time
import urllib.parse
import urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEN_POR_OMISION = "/home/oktanet/Documents/Oktanet/data/imagenes"

# destino -> archivo de origen, recorte (x, y, ancho, alto) y ancho de salida.
# Los tres recortes son 2:1 para que las tres tarjetas queden a la misma altura
# sin recortar nada por CSS.
# Los recortes buscan la parte que explica la capacidad, no la pantalla entera:
# en Argos, la reja de acciones con sus marcas de IA; en el Gemelo, el cambio
# propuesto con sus botones de aprobar y ejecutar; en Seguridad, el puntaje por
# dominio y la tabla de equipos.
ORIGENES = {
    # Los tres logos vienen cuadrados y con mucho margen alrededor. Se recortan
    # pegados a la marca; el fondo casi negro que les queda lo neutraliza el CSS
    # con mix-blend-mode, asi que no hace falta recortar el canal alfa.
    "LOGO_Oktanet": {
        "archivo": "oktanet.png",
        "recorte": (245, 85, 545, 545),
        "ancho": 512,
        "alfa": True,
    },
    "LOGO_Oktavia": {
        "archivo": "oktavia.png",
        "recorte": (240, 200, 775, 755),
        "ancho": 512,
        "alfa": True,
    },
    "LOGO_Argos": {
        "archivo": "argos_chatops.png",
        "recorte": (195, 170, 630, 635),
        "ancho": 512,
        "alfa": True,
    },
    # La captura del hero llega ya encuadrada desde el origen, asi que el
    # recorte cubre la imagen completa: aqui solo se escala y se convierte.
    "DASHB_main": {
        "archivo": "Centro de automatización de red.png",
        "recorte": (0, 0, 1670, 1187),
        "ancho": 1400,
    },
    "FEAT_Argos": {
        "archivo": "Screenshot 2026-09-16 at 15-15-10 Oktavia – Centro de automatización de red.png",
        "recorte": (24, 18, 1668, 834),
        "ancho": 1100,
    },
    "FEAT_GemeloDigital": {
        "archivo": "Screenshot 2026-09-16 at 15-14-52 Gemelo digital Oktavia.png",
        "recorte": (85, 55, 1545, 772),
        "ancho": 1100,
    },
    "FEAT_Seguridad": {
        "archivo": "Screenshot 2026-09-16 at 15-13-54 Seguridad de red Oktavia.png",
        "recorte": (257, 195, 1207, 603),
        "ancho": 1100,
    },
}

CALIDAD_WEBP = 0.86

JS = """
(async function () {
    const tareas = %s;
    const salida = {};

    for (const t of tareas) {
        const img = new Image();
        await new Promise(function (ok, err) {
            img.onload = ok;
            img.onerror = function () { err(new Error('no cargo ' + t.url)); };
            img.src = t.url;
        });

        const alto = Math.round(t.sh * t.ancho / t.sw);
        const lienzo = document.createElement('canvas');
        lienzo.width = t.ancho;
        lienzo.height = alto;
        const ctx = lienzo.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, t.sx, t.sy, t.sw, t.sh, 0, 0, t.ancho, alto);

        if (t.alfa) {
            // Los logos vienen como trazos brillantes sobre un fondo casi negro,
            // sin canal alfa. Puestos sobre cualquier superficie oscura se les
            // ve el cuadro. Se recupera la transparencia usando el canal mas
            // alto de cada pixel como opacidad y reescalando el color para que
            // el tono no se apague: el fondo casi negro desaparece y el trazo
            // conserva su gradiente.
            const datos = ctx.getImageData(0, 0, lienzo.width, lienzo.height);
            const p = datos.data;

            for (let i = 0; i < p.length; i += 4) {
                const maximo = Math.max(p[i], p[i + 1], p[i + 2]);

                // El fondo no es negro puro sino un azul muy oscuro con
                // vineta: sin umbral queda como un cuadro translucido. Todo lo
                // que esta por debajo se descarta, y el resto se reescala para
                // que el trazo no pierda opacidad.
                if (maximo <= t.umbral) {
                    p[i + 3] = 0;
                    continue;
                }

                p[i] = Math.min(255, Math.round(p[i] * 255 / maximo));
                p[i + 1] = Math.min(255, Math.round(p[i + 1] * 255 / maximo));
                p[i + 2] = Math.min(255, Math.round(p[i + 2] * 255 / maximo));
                p[i + 3] = Math.round((maximo - t.umbral) * 255 / (255 - t.umbral));
            }

            ctx.putImageData(datos, 0, 0);
        }

        salida[t.nombre] = {
            ancho: t.ancho,
            alto: alto,
            origen: [img.naturalWidth, img.naturalHeight],
            webp: lienzo.toDataURL('image/webp', %s),
            png: lienzo.toDataURL('image/png')
        };
    }

    return JSON.stringify(salida);
}())
"""


def servir(raiz: str):
    class Silencioso(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *_args):
            """El build no necesita el registro de acceso."""

    handler = functools.partial(Silencioso, directory=raiz)
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd.server_address[1], httpd.shutdown


def puerto_libre() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def main(origen: str) -> None:
    if not os.path.isdir(origen):
        raise SystemExit("no existe el directorio de origen: " + origen)

    pendientes = {n: d for n, d in ORIGENES.items()
                  if os.path.isfile(os.path.join(origen, d["archivo"]))}
    faltan = [d["archivo"] for n, d in ORIGENES.items() if n not in pendientes]

    if faltan:
        print("sin original, se conserva lo ya generado en img/:")
        for f in faltan:
            print("  " + f)

    if not pendientes:
        raise SystemExit("no hay ningun original en " + origen)

    # Chrome se sirve las imagenes desde el mismo origen que la pagina: si no,
    # el lienzo queda contaminado y toDataURL lanza una excepcion de seguridad.
    puerto_http, apagar = servir(origen)
    puerto_cdp = puerto_libre()
    perfil = os.path.join("/tmp", f"oktanet-img-{os.getpid()}")
    chrome = subprocess.Popen([
        "google-chrome", "--headless", "--disable-gpu", "--no-sandbox",
        f"--remote-debugging-port={puerto_cdp}", f"--user-data-dir={perfil}",
        "--no-first-run", "--no-default-browser-check", "about:blank",
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    try:
        import websocket

        limite = time.time() + 20
        ws_url = None
        while time.time() < limite and not ws_url:
            try:
                with urllib.request.urlopen(f"http://127.0.0.1:{puerto_cdp}/json/version", timeout=1) as r:
                    ws_url = json.load(r)["webSocketDebuggerUrl"]
            except Exception:
                time.sleep(0.3)
        if not ws_url:
            raise SystemExit("Chrome no expuso el protocolo de depuracion a tiempo")

        ws = websocket.create_connection(ws_url, timeout=120, suppress_origin=True)
        contador = iter(range(1, 10_000))

        def pedir(metodo, params=None, sesion=None):
            ident = next(contador)
            mensaje = {"id": ident, "method": metodo, "params": params or {}}
            if sesion:
                mensaje["sessionId"] = sesion
            ws.send(json.dumps(mensaje))
            while True:
                dato = json.loads(ws.recv())
                if dato.get("id") == ident:
                    if "error" in dato:
                        raise SystemExit(f"{metodo}: {dato['error']}")
                    return dato.get("result", {})

        destino_url = f"http://127.0.0.1:{puerto_http}/"
        objetivo = pedir("Target.createTarget", {"url": destino_url})["targetId"]
        sesion = pedir("Target.attachToTarget", {"targetId": objetivo, "flatten": True})["sessionId"]
        time.sleep(1.5)

        tareas = []
        for nombre, d in pendientes.items():
            x, y, w, h = d["recorte"]
            tareas.append({"nombre": nombre, "url": destino_url + urllib.parse.quote(d["archivo"]),
                           "sx": x, "sy": y, "sw": w, "sh": h, "ancho": d["ancho"],
                           "alfa": bool(d.get("alfa")), "umbral": d.get("umbral", 48)})

        r = pedir("Runtime.evaluate", {
            "expression": JS % (json.dumps(tareas), CALIDAD_WEBP),
            "returnByValue": True,
            "awaitPromise": True,
        }, sesion=sesion)

        if "value" not in r.get("result", {}):
            raise SystemExit("el navegador no devolvio las imagenes: " + json.dumps(r)[:400])

        for nombre, dato in json.loads(r["result"]["value"]).items():
            for formato in ("webp", "png"):
                crudo = dato[formato].split(",", 1)[1]
                ruta = os.path.join(RAIZ, "img", f"{nombre}.{formato}")
                with open(ruta, "wb") as f:
                    f.write(base64.b64decode(crudo))
                print(f"img/{nombre}.{formato}  {dato['ancho']}x{dato['alto']}  "
                      f"{os.path.getsize(ruta) // 1024} KB")
    finally:
        chrome.terminate()
        try:
            chrome.wait(timeout=10)
        except subprocess.TimeoutExpired:
            chrome.kill()
        apagar()
        subprocess.run(["rm", "-rf", perfil], check=False)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ORIGEN_POR_OMISION)
