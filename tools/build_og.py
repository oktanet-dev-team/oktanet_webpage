#!/usr/bin/env python3
"""Genera la imagen que se ve al compartir el sitio (Open Graph).

Sin `og:image`, compartir oktanet.io en LinkedIn o WhatsApp produce un enlace
pelado, sin imagen. Esto renderiza tools/og_template.html a 1200x630, que es el
tamano que esperan esas plataformas, y deja el PNG en img/.

Uso:
    python3 tools/build_og.py            # los dos idiomas
    python3 tools/build_og.py es

Requiere google-chrome en el PATH. Levanta su propio servidor sobre el repo,
porque la plantilla carga los logos por ruta relativa y las fuentes por red.
"""
from __future__ import annotations

import functools
import http.server
import os
import socket
import socketserver
import subprocess
import sys
import threading
import urllib.parse

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDIOMAS = {"es": "img/og-es.png", "en": "img/og-en.png"}
ANCHO, ALTO = 1200, 630

#: Imagen propia por articulo del blog. Sin esto todas las entradas comparten
#: la misma tarjeta en el feed y el lector asume que ya vio ese enlace.
#: La clave es el nombre del archivo; cada entrada trae rotulo, titulo y bajada
#: en los dos idiomas.
ARTICULOS = {
    "og-blog-inventario": {
        "es": {
            "rotulo": "Fuente de verdad",
            "titulo": "El inventario que nadie tiene",
            "bajada": "La diferencia entre una lista de equipos y una fuente de verdad, y por que multivendor es donde casi todas las herramientas se rompen.",
        },
        "en": {
            "rotulo": "Source of truth",
            "titulo": "The inventory nobody has",
            "bajada": "The difference between a list of devices and a source of truth, and why multi-vendor is where most tools break.",
        },
    },
    "og-blog-estado": {
        "es": {
            "rotulo": "Cumplimiento",
            "titulo": "Su configuracion cumple y su red sigue rota",
            "bajada": "La diferencia entre cumplimiento de configuracion y cumplimiento de estado, y por que correlacionarlos cambia lo que puede afirmar.",
        },
        "en": {
            "rotulo": "Compliance",
            "titulo": "Your config passes, your network is broken",
            "bajada": "The difference between configuration compliance and state compliance, and why correlating them changes what you can claim.",
        },
    },
    "og-blog-ciclo": {
        "es": {
            "rotulo": "Gemelo digital",
            "titulo": "Detectar es facil. Cerrar el ciclo no",
            "bajada": "Por que la correccion automatica es peligrosa, y que hace falta para que un hallazgo se cierre de verdad.",
        },
        "en": {
            "rotulo": "Digital twin",
            "titulo": "Detecting is easy. Closing the loop is not",
            "bajada": "Why automatic remediation is dangerous, and what it takes for a finding to actually close.",
        },
    },
    "og-blog-chatops": {
        "es": {
            "rotulo": "ChatOps",
            "titulo": "ChatOps util si declara lo que cuesta",
            "bajada": "Por que buena parte de lo que se pregunta no necesita un modelo de lenguaje, y que barandillas hacen falta.",
        },
        "en": {
            "rotulo": "ChatOps",
            "titulo": "ChatOps that declares what it costs",
            "bajada": "Why much of what operators ask needs no language model, and what guardrails a chat that changes config requires.",
        },
    },
    "og-blog-telemetria": {
        "es": {
            "rotulo": "Telemetria",
            "titulo": "La red se degrada antes de que llamen",
            "bajada": "Por que una auditoria es una fotografia, y como escribir reglas de evento que no terminen silenciadas.",
        },
        "en": {
            "rotulo": "Telemetry",
            "titulo": "Networks degrade before anyone calls",
            "bajada": "Why an audit is a snapshot, and how to write event rules that do not end up silenced.",
        },
    },
}


def servir(raiz: str):
    class Silencioso(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *_args):
            """El build no necesita el registro de acceso."""

    handler = functools.partial(Silencioso, directory=raiz)
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd.server_address[1], httpd.shutdown


def render(puerto: int, destino_rel: str, consulta: str) -> None:
    """Fotografia la plantilla a 1200x630 y guarda el PNG."""
    destino = os.path.join(RAIZ, destino_rel)
    perfil = os.path.join("/tmp", f"oktanet-og-{os.getpid()}-{os.path.basename(destino_rel)}")
    subprocess.run([
        "google-chrome", "--headless", "--disable-gpu", "--no-sandbox",
        f"--user-data-dir={perfil}", "--no-first-run",
        "--hide-scrollbars",
        "--virtual-time-budget=8000",
        f"--window-size={ANCHO},{ALTO}",
        f"--screenshot={destino}",
        f"http://127.0.0.1:{puerto}/tools/og_template.html?{consulta}",
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)
    subprocess.run(["rm", "-rf", perfil], check=False)

    if not os.path.isfile(destino):
        raise SystemExit("no se genero " + destino_rel)
    print(f"{destino_rel}  {ANCHO}x{ALTO}  {os.path.getsize(destino) // 1024} KB")


def main(idiomas) -> None:
    puerto, apagar = servir(RAIZ)
    try:
        for idioma in idiomas:
            render(puerto, IDIOMAS[idioma], f"lang={idioma}")

        # Una imagen por articulo y por idioma.
        for base, por_idioma in ARTICULOS.items():
            for idioma in idiomas:
                datos = por_idioma.get(idioma)
                if not datos:
                    continue
                consulta = urllib.parse.urlencode({"lang": idioma, **datos})
                render(puerto, f"img/{base}-{idioma}.png", consulta)
    finally:
        apagar()


if __name__ == "__main__":
    pedidos = sys.argv[1:] or list(IDIOMAS)
    malos = [i for i in pedidos if i not in IDIOMAS]
    if malos:
        raise SystemExit(f"idioma desconocido: {', '.join(malos)} (usa: es, en)")
    main(pedidos)
