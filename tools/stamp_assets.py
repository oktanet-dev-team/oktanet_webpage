#!/usr/bin/env python3
"""Sella los CSS y JS propios con un hash de su contenido.

Por que hace falta: el sitio es estatico y los navegadores cachean
`home_script.js` y `home_style.css` sin preguntar. Cuando cambia el HTML y
el script no, el resultado no es "se ve viejo": es una pagina ROTA de una
forma dificil de diagnosticar, porque el diccionario de traduccion se
aplica POR POSICION. Un arreglo viejo de 4 textos sobre 7 enlaces nuevos
reparte los textos corridos, y aparecen etiquetas que no existen en ningun
lado.

La solucion es que la URL cambie cuando cambia el archivo: `?v=<hash>`.
El navegador la trata como otro recurso y la vuelve a pedir; si el archivo
no cambio, el hash es el mismo y la cache sigue sirviendo.

Correr antes de publicar, junto con check_copy.py:

    python3 tools/stamp_assets.py
"""
from __future__ import annotations

import hashlib
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent

#: Solo recursos propios. Un CDN externo trae su propia politica de cache.
PATRON = re.compile(r'(?P<attr>href|src)="(?P<ruta>(?:\.\./)?(?:style|script)/[\w.-]+\.(?:css|js))(?:\?v=[0-9a-f]+)?"')


def hash_de(ruta: pathlib.Path) -> str:
    return hashlib.sha256(ruta.read_bytes()).hexdigest()[:10]


def main() -> int:
    paginas = (sorted(RAIZ.glob("*.html"))
               + sorted(RAIZ.glob("docs/*.html"))
               + sorted(RAIZ.glob("blog/*.html")))
    if not paginas:
        print("no se encontro ninguna pagina HTML", file=sys.stderr)
        return 1

    faltantes: list[str] = []
    tocadas = 0

    for pagina in paginas:
        texto = pagina.read_text()

        def sellar(m: re.Match) -> str:
            ruta = m.group("ruta")
            destino = (pagina.parent / ruta).resolve()
            if not destino.is_file():
                faltantes.append(f"{pagina.relative_to(RAIZ)} -> {ruta}")
                return m.group(0)
            return f'{m.group("attr")}="{ruta}?v={hash_de(destino)}"'

        nuevo = PATRON.sub(sellar, texto)
        if nuevo != texto:
            pagina.write_text(nuevo)
            tocadas += 1
            print(f"  sellado {pagina.relative_to(RAIZ)}")

    if faltantes:
        # Un recurso que no existe es un 404 en produccion, no un detalle.
        print("\nERROR: referencias a archivos que no existen:", file=sys.stderr)
        for f in faltantes:
            print(f"  {f}", file=sys.stderr)
        return 1

    print(f"\n{tocadas} pagina(s) actualizada(s), {len(paginas)} revisada(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
