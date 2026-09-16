#!/usr/bin/env python3
"""Descarga las caratulas de los videos de YouTube que muestra la portada.

Por que no se enlazan directamente desde los servidores de YouTube: la portada
pinta una caratula propia y solo carga el reproductor cuando alguien pulsa, y
traer la imagen desde `i.ytimg.com` delataria a cada visitante ante Google sin
que haya pedido ver nada. Sirviendolas desde el propio sitio no hay peticion a
terceros hasta el clic.

Uso:
    python3 tools/build_videos.py

La lista de videos vive en VIDEOS, y tiene que coincidir con la del diccionario
`videoLista` de script/home_script.js.
"""
from __future__ import annotations

import os
import urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Identificador de YouTube de cada video que aparece en la portada.
VIDEOS = [
    "FGh8p9j2Wg0",   # Tu red bajo control (recorrido comercial)
    "WFgD9l0nNmo",   # Centro de automatizacion de red
    "bS2W2ZSfbJo",   # Descubrimiento de red
    "VKBOfMsdLzQ",   # Inventario
    "Tb6tp0IMpm0",   # De la visibilidad al cumplimiento
    "HmoXtXVi-io",   # Gemelo digital, de la deteccion a la remediacion
]

# maxres no existe para todos los videos; se cae a la siguiente calidad.
CALIDADES = ("maxresdefault", "sddefault", "hqdefault")


def descargar(vid: str) -> None:
    destino = os.path.join(RAIZ, "img", f"video-{vid}.jpg")
    for calidad in CALIDADES:
        url = f"https://i.ytimg.com/vi/{vid}/{calidad}.jpg"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=20) as r:
                datos = r.read()
        except Exception:
            continue
        # YouTube responde con una imagen gris de 120x90 cuando la calidad no
        # existe; pesa muy poco y se descarta por tamano.
        if len(datos) < 4096:
            continue
        with open(destino, "wb") as f:
            f.write(datos)
        print(f"img/video-{vid}.jpg  {calidad}  {len(datos) // 1024} KB")
        return
    raise SystemExit("sin caratula para " + vid)


if __name__ == "__main__":
    for vid in VIDEOS:
        descargar(vid)
