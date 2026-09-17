#!/usr/bin/env python3
"""Genera los PDF de la documentacion a partir de las paginas HTML.

Por que no basta `google-chrome --print-to-pdf`: ese modo o imprime sin pie de
pagina, o imprime el pie por omision, que incluye la URL desde la que se genero
(en local, `localhost`). Un documento que va a licitaciones necesita numero de
pagina y no necesita la URL de la maquina de quien lo compilo. El protocolo de
depuracion si acepta una plantilla de pie propia, asi que se usa esa via.

Uso:
    python3 tools/build_pdf.py                  # genera los cuatro PDF
    python3 tools/build_pdf.py es               # solo la ficha tecnica en espanol
    python3 tools/build_pdf.py resumen-es       # solo el resumen ejecutivo

Requisitos: google-chrome en el PATH y el paquete `websocket-client`.
El script levanta su propio servidor HTTP sobre el repo y lo apaga al terminar.
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
import urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DOCUMENTOS = {
    "es": {
        "pagina": "docs/oktavia.html",
        "salida": "docs/oktavia-es.pdf",
        "pie": "Oktavia · Ficha técnica · Oktanet",
        "de": "de",
    },
    "en": {
        "pagina": "docs/oktavia-en.html",
        "salida": "docs/oktavia-en.pdf",
        "pie": "Oktavia · Technical sheet · Oktanet",
        "de": "of",
    },
    "resumen-es": {
        "pagina": "docs/oktavia-resumen.html",
        "salida": "docs/oktavia-resumen-es.pdf",
        "pie": "Oktavia · Resumen ejecutivo · Oktanet",
        "de": "de",
    },
    "resumen-en": {
        "pagina": "docs/oktavia-resumen-en.html",
        "salida": "docs/oktavia-resumen-en.pdf",
        "pie": "Oktavia · Executive summary · Oktanet",
        "de": "of",
    },
    # Los articulos del blog salen en PDF con la misma maquinaria: asi un
    # comercial puede mandar el articulo como adjunto sin depender de que el
    # cliente abra un enlace.
    "blog-inventario-es": {
        "pagina": "blog/inventario-fuente-de-verdad.html",
        "salida": "blog/inventario-fuente-de-verdad-es.pdf",
        "pie": "El inventario que nadie tiene · Oktanet",
        "de": "de",
    },
    "blog-inventario-en": {
        "pagina": "blog/inventario-fuente-de-verdad-en.html",
        "salida": "blog/inventario-fuente-de-verdad-en.pdf",
        "pie": "The inventory nobody has · Oktanet",
        "de": "of",
    },
    "blog-estado-es": {
        "pagina": "blog/cumplimiento-configuracion-y-estado.html",
        "salida": "blog/cumplimiento-configuracion-y-estado-es.pdf",
        "pie": "Su configuracion cumple y su red sigue rota · Oktanet",
        "de": "de",
    },
    "blog-estado-en": {
        "pagina": "blog/cumplimiento-configuracion-y-estado-en.html",
        "salida": "blog/cumplimiento-configuracion-y-estado-en.pdf",
        "pie": "Your configuration passes and your network is still broken · Oktanet",
        "de": "of",
    },
    "blog-ciclo-es": {
        "pagina": "blog/cerrar-el-ciclo-gemelo-digital.html",
        "salida": "blog/cerrar-el-ciclo-gemelo-digital-es.pdf",
        "pie": "Detectar es facil. Cerrar el ciclo es el problema · Oktanet",
        "de": "de",
    },
    "blog-ciclo-en": {
        "pagina": "blog/cerrar-el-ciclo-gemelo-digital-en.html",
        "salida": "blog/cerrar-el-ciclo-gemelo-digital-en.pdf",
        "pie": "Detecting is easy. Closing the loop is the problem · Oktanet",
        "de": "of",
    },
    "blog-chatops-es": {
        "pagina": "blog/chatops-en-automatizacion-de-redes.html",
        "salida": "blog/chatops-en-automatizacion-de-redes-es.pdf",
        "pie": "ChatOps en redes · Oktanet",
        "de": "de",
    },
    "blog-chatops-en": {
        "pagina": "blog/chatops-en-automatizacion-de-redes-en.html",
        "salida": "blog/chatops-en-automatizacion-de-redes-en.pdf",
        "pie": "ChatOps for networks · Oktanet",
        "de": "of",
    },
    "blog-telemetria-es": {
        "pagina": "blog/telemetria-y-automatizacion-de-eventos.html",
        "salida": "blog/telemetria-y-automatizacion-de-eventos-es.pdf",
        "pie": "La red se degrada semanas antes de que alguien llame · Oktanet",
        "de": "de",
    },
    "blog-telemetria-en": {
        "pagina": "blog/telemetria-y-automatizacion-de-eventos-en.html",
        "salida": "blog/telemetria-y-automatizacion-de-eventos-en.pdf",
        "pie": "Networks degrade for weeks before anyone calls · Oktanet",
        "de": "of",
    },
}

PIE = """
<div style="width:100%;font-family:Helvetica,Arial,sans-serif;font-size:7.5pt;
            color:#4a5d7a;padding:0 14mm;display:flex;justify-content:space-between;">
  <span>{etiqueta}</span>
  <span><span class="pageNumber"></span> {de} <span class="totalPages"></span></span>
</div>
"""

ENCABEZADO = '<div style="display:none"></div>'


def puerto_libre() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def servir(raiz: str):
    """Sirve el repo en un hilo aparte y devuelve (puerto, apagar)."""
    class Silencioso(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *_args):
            """El build no necesita el registro de acceso."""

    handler = functools.partial(Silencioso, directory=raiz)
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    hilo = threading.Thread(target=httpd.serve_forever, daemon=True)
    hilo.start()
    return httpd.server_address[1], httpd.shutdown


def esperar_devtools(puerto: int, segundos: int = 20) -> str:
    limite = time.time() + segundos
    while time.time() < limite:
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{puerto}/json/version", timeout=1) as r:
                return json.load(r)["webSocketDebuggerUrl"]
        except Exception:
            time.sleep(0.3)
    raise SystemExit("Chrome no expuso el protocolo de depuracion a tiempo")


def imprimir(ws_url: str, url_pagina: str, etiqueta: str, de: str) -> bytes:
    import websocket  # se importa aqui para que --help funcione sin la dependencia

    ws = websocket.create_connection(ws_url, timeout=60, suppress_origin=True)
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

    destino = pedir("Target.createTarget", {"url": "about:blank"})["targetId"]
    sesion = pedir("Target.attachToTarget", {"targetId": destino, "flatten": True})["sessionId"]
    pedir("Page.enable", sesion=sesion)
    pedir("Page.navigate", {"url": url_pagina}, sesion=sesion)

    # Se espera al evento de carga; el margen extra deja asentar las fuentes web.
    limite = time.time() + 30
    while time.time() < limite:
        dato = json.loads(ws.recv())
        if dato.get("method") == "Page.loadEventFired":
            break
    time.sleep(2.5)

    resultado = pedir("Page.printToPDF", {
        "printBackground": True,
        "preferCSSPageSize": True,
        "displayHeaderFooter": True,
        "headerTemplate": ENCABEZADO,
        "footerTemplate": PIE.format(etiqueta=etiqueta, de=de),
        "marginTop": 0.63,      # pulgadas ~ 16mm, igual que el @page del CSS
        "marginBottom": 0.63,
        "marginLeft": 0.55,
        "marginRight": 0.55,
    }, sesion=sesion)

    pdf = base64.b64decode(resultado["data"])
    pedir("Target.closeTarget", {"targetId": destino})
    ws.close()
    return pdf


def main(idiomas):
    puerto_http, apagar = servir(RAIZ)
    puerto_cdp = puerto_libre()
    perfil = os.path.join("/tmp", f"oktanet-pdf-{os.getpid()}")
    chrome = subprocess.Popen([
        "google-chrome", "--headless", "--disable-gpu", "--no-sandbox",
        f"--remote-debugging-port={puerto_cdp}",
        f"--user-data-dir={perfil}",
        "--no-first-run", "--no-default-browser-check",
        "about:blank",
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    try:
        ws_url = esperar_devtools(puerto_cdp)
        for idioma in idiomas:
            doc = DOCUMENTOS[idioma]
            url = f"http://127.0.0.1:{puerto_http}/{doc['pagina']}"
            pdf = imprimir(ws_url, url, doc["pie"], doc["de"])
            destino = os.path.join(RAIZ, doc["salida"])
            with open(destino, "wb") as f:
                f.write(pdf)
            print(f"{doc['salida']}  ({len(pdf) // 1024} KB)")
    finally:
        chrome.terminate()
        try:
            chrome.wait(timeout=10)
        except subprocess.TimeoutExpired:
            chrome.kill()
        apagar()
        subprocess.run(["rm", "-rf", perfil], check=False)


if __name__ == "__main__":
    pedidos = sys.argv[1:] or list(DOCUMENTOS)
    desconocidos = [i for i in pedidos if i not in DOCUMENTOS]
    if desconocidos:
        raise SystemExit(
            f"documento desconocido: {', '.join(desconocidos)} "
            f"(usa: {', '.join(DOCUMENTOS)})"
        )
    main(pedidos)
