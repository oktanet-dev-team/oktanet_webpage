#!/usr/bin/env python3
"""Oktavia SP en violeta para el sitio: escribe style/edition_sp.css.

Cada regla de las hojas del sitio que pinta con un azul de la marca se repite
bajo ``body.edition-sp`` con el mismo color girado a violeta (misma luz y
saturación). Los fondos oscuros (luz < 25 %) no se tocan: el sitio sigue casi
negro. Verdes, rojos, ámbar y grises quedan igual.

    python3 tools/build_sp_theme.py           # escribe la hoja
    python3 tools/build_sp_theme.py --check   # falla si quedó vieja

Las páginas de Oktavia SP llevan <body class="edition-sp"> y enlazan la hoja.
"""
from __future__ import annotations

import colorsys
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
HOJAS = ("style/home_style.css", "style/docs_style.css", "style/oktavia_docs_style.css")
SALIDA = RAIZ / "style" / "edition_sp.css"
PREFIJO = "body.edition-sp"

AZUL = (0.50, 0.62)      # matiz (0-1) que cuenta como azul de la marca: cian a azul
VIOLETA = 0.725          # destino; el cian queda un poco más lila
LUZ_MIN = 0.25           # debajo, es fondo: se queda igual
LUZ_MAX = 0.82           # encima, es texto claro: se queda igual
SAT_MIN = 0.45           # menos, es gris azulado (textos, líneas): se queda igual

#: Ajustes a mano que el giro no resuelve (degradados que mezclan un azul claro
#: con uno de fondo): siempre oscuros, casi negros.
AJUSTES = (
    "body.edition-sp .doc-header { background: linear-gradient(180deg, #1e1240 0%, #0b0a18 100%); }",
)

_HEX = re.compile(r"#([0-9a-fA-F]{6})\b")
_RGB = re.compile(r"rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})")
_COMENTARIO = re.compile(r"/\*.*?\*/", re.S)


def girar(r: int, g: int, b: int) -> tuple[int, int, int] | None:
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    if not (AZUL[0] <= h <= AZUL[1]) or not (LUZ_MIN <= l <= LUZ_MAX) or s < SAT_MIN:
        return None
    nh = VIOLETA + (0.58 - h) * 0.25
    nl = l if l < 0.45 else min(0.86, l * 1.08 + 0.05)   # los oscuros siguen oscuros
    nr, ng, nb = colorsys.hls_to_rgb(nh, nl, min(1.0, s * 0.85))
    return round(nr * 255), round(ng * 255), round(nb * 255)


def recolor(valor: str) -> str:
    def _hex(m: re.Match) -> str:
        v = m.group(1)
        nuevo = girar(int(v[0:2], 16), int(v[2:4], 16), int(v[4:6], 16))
        return "#%02x%02x%02x" % nuevo if nuevo else m.group(0)

    def _rgb(m: re.Match) -> str:
        nuevo = girar(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        return m.group(0).split("(")[0] + "({}, {}, {}".format(*nuevo) if nuevo else m.group(0)

    return _RGB.sub(_rgb, _HEX.sub(_hex, valor))


def _alcance(sel: str) -> str:
    s = sel.strip()
    if s in (":root", "html", "body"):
        return PREFIJO
    m = re.match(r"^body(?=[.\[:#]|$)", s)
    if m:
        return PREFIJO + s[m.end():]
    m = re.match(r"^(?::root|html)\s+body(?=[.\[:#\s>]|$)", s)
    if m:
        return PREFIJO + s[m.end():]
    m = re.match(r"^(?::root|html)(?=[\s>]|$)", s)
    if m:
        return f"{PREFIJO}{s[m.end():]}" if s[m.end():].strip() else PREFIJO
    return f"{PREFIJO} {s}"


def _selectores(sel: str) -> list[str]:
    partes, prof, actual = [], 0, ""
    for ch in sel:
        prof += ch in "(["
        prof -= ch in ")]"
        if ch == "," and prof == 0:
            partes.append(actual)
            actual = ""
        else:
            actual += ch
    partes.append(actual)
    return [p.strip() for p in partes if p.strip()]


def _bloques(css: str, i: int = 0):
    out, n = [], len(css)
    while i < n:
        j, k = css.find("{", i), css.find("}", i)
        if j == -1 or (k != -1 and k < j):
            return out, (k + 1 if k != -1 else n)
        pre = css[i:j].strip()
        if pre.startswith("@") and not pre.startswith(("@font-face", "@page")):
            hijos, i = _bloques(css, j + 1)
            if not pre.startswith(("@keyframes", "@-webkit-keyframes")):
                out.append((pre, hijos))
            continue
        fin = css.find("}", j)
        out.append((pre, css[j + 1:fin]))
        i = fin + 1
    return out, n


def _emitir(bloques, sangria=""):
    lineas = []
    for pre, cuerpo in bloques:
        if isinstance(cuerpo, list):
            dentro = _emitir(cuerpo, sangria + "  ")
            if dentro:
                lineas += [f"{sangria}{pre} {{", *dentro, f"{sangria}}}"]
            continue
        if pre.startswith("@"):
            continue
        decls = []
        for d in str(cuerpo).split(";"):
            if ":" in d:
                nuevo = recolor(d)
                if nuevo != d:
                    decls.append(" ".join(nuevo.split()))
        if decls:
            sel = ", ".join(_alcance(s) for s in _selectores(pre))
            lineas.append(f"{sangria}{sel} {{ {'; '.join(decls)}; }}")
    return lineas


def construir() -> str:
    partes = ["/* Generado por tools/build_sp_theme.py: no editar a mano.",
              "   Oktavia SP en violeta: sólo aplica con <body class=\"edition-sp\">. */"]
    for hoja in HOJAS:
        bloques, _ = _bloques(_COMENTARIO.sub("", (RAIZ / hoja).read_text(encoding="utf-8")))
        lineas = _emitir(bloques)
        if lineas:
            partes += ["", f"/* {hoja} */", *lineas]
    partes += ["", "/* Ajustes */", *AJUSTES]
    return "\n".join(partes) + "\n"


def main() -> int:
    hoja = construir()
    if "--check" in sys.argv:
        if not SALIDA.exists() or SALIDA.read_text(encoding="utf-8") != hoja:
            print("edition_sp.css está vieja: corre python3 tools/build_sp_theme.py")
            return 1
        print("edition_sp.css al día")
        return 0
    SALIDA.write_text(hoja, encoding="utf-8")
    print(f"escrita {SALIDA.relative_to(RAIZ)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
