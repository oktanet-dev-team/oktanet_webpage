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

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDIOMAS = {"es": "img/og-es.png", "en": "img/og-en.png"}
ANCHO, ALTO = 1200, 630


def servir(raiz: str):
    class Silencioso(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *_args):
            """El build no necesita el registro de acceso."""

    handler = functools.partial(Silencioso, directory=raiz)
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd.server_address[1], httpd.shutdown


def main(idiomas) -> None:
    puerto, apagar = servir(RAIZ)
    try:
        for idioma in idiomas:
            destino = os.path.join(RAIZ, IDIOMAS[idioma])
            perfil = os.path.join("/tmp", f"oktanet-og-{os.getpid()}-{idioma}")
            subprocess.run([
                "google-chrome", "--headless", "--disable-gpu", "--no-sandbox",
                f"--user-data-dir={perfil}", "--no-first-run",
                "--hide-scrollbars",
                "--virtual-time-budget=8000",
                f"--window-size={ANCHO},{ALTO}",
                f"--screenshot={destino}",
                f"http://127.0.0.1:{puerto}/tools/og_template.html?lang={idioma}",
            ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)
            subprocess.run(["rm", "-rf", perfil], check=False)

            if not os.path.isfile(destino):
                raise SystemExit("no se genero " + IDIOMAS[idioma])
            print(f"{IDIOMAS[idioma]}  {ANCHO}x{ALTO}  {os.path.getsize(destino) // 1024} KB")
    finally:
        apagar()


if __name__ == "__main__":
    pedidos = sys.argv[1:] or list(IDIOMAS)
    malos = [i for i in pedidos if i not in IDIOMAS]
    if malos:
        raise SystemExit(f"idioma desconocido: {', '.join(malos)} (usa: es, en)")
    main(pedidos)
