#!/usr/bin/env python3
"""Convierte la paleta del sitio a una version oscura, una sola vez.

No es un tema conmutable: el sitio pasa a ser oscuro y punto, como la interfaz
de Oktavia. Se deja versionado porque documenta como se hizo la conversion y
con que criterio, no porque haya que volver a correrlo.

Como funciona. El diseno es practicamente monocromo azul, asi que invertir la
luminosidad de cada color y conservar el tono produce un equivalente oscuro
coherente: lo que era un fondo casi blanco queda como una superficie casi
negra, y el texto azul oscuro queda como texto azul claro.

Lo que NO se toca, y por que:
  - los acentos de marca (azules y cianes saturados), que ya funcionan sobre
    oscuro y son la identidad;
  - las reglas de componentes que ya eran oscuros (cabecera, hero, banda de
    marcas, pie, boton principal): invertirlos los volveria claros, que es
    justo lo contrario de lo que se busca;
  - la tira de fabricantes, porque sus logotipos son oscuros sobre transparente
    y sobre fondo oscuro desaparecerian: se queda sobre un panel claro.
"""
from __future__ import annotations

import colorsys
import re
import sys

RUTA = "style/home_style.css"

# Selectores de componentes que ya eran oscuros o que viven sobre la marca.
INTACTOS = (
    "site-header", "main-nav", "nav-", "brand", "lang-", "btn-primary",
    "hero-visual", "family",
    "trust-strip", "trust-", "license-status",
    # Documentacion: cabecera y pie ya eran oscuros, y la cabecera de las
    # tablas es un degradado de marca con texto blanco encima.
    "doc-header", "doc-brand", "doc-btn", "doc-footer", "thead",
)

# Tono y saturacion de la superficie base, para que los grises tiren a azul
# marino en vez de a gris plano.
TONO_BASE, SAT_MINIMA_FONDO = 0.585, 0.30


def a_hsl(r, g, b):
    return colorsys.rgb_to_hls(r / 255, g / 255, b / 255)


def de_hsl(h, l, s):
    r, g, b = colorsys.hls_to_rgb(h, l, s)
    return round(r * 255), round(g * 255), round(b * 255)


def es_acento(h, l, s) -> bool:
    """Azul o cian saturado: la identidad, que ya se ve bien sobre oscuro."""
    return s >= 0.42 and 0.22 <= l <= 0.80


def invertir(r, g, b):
    h, l, s = a_hsl(r, g, b)

    if es_acento(h, l, s):
        # Se aclara un punto para que respire sobre fondo oscuro.
        return de_hsl(h, min(0.72, l * 1.12), s)

    nueva_l = 1 - l
    # Ni blanco puro ni negro puro: el primero deslumbra y el segundo aplasta.
    nueva_l = max(0.075, min(0.93, nueva_l))

    if nueva_l < 0.32:
        # Superficies: se les da el tono azul marino de la marca.
        return de_hsl(TONO_BASE, nueva_l, max(s, SAT_MINIMA_FONDO))

    return de_hsl(h, nueva_l, s)


def convertir_hex(m):
    v = m.group(0)[1:]
    if len(v) == 3:
        v = "".join(c * 2 for c in v)
    if len(v) == 8:          # con alfa: se conserva el alfa
        alfa = v[6:]
        r, g, b = invertir(int(v[0:2], 16), int(v[2:4], 16), int(v[4:6], 16))
        return "#%02x%02x%02x%s" % (r, g, b, alfa)
    r, g, b = invertir(int(v[0:2], 16), int(v[2:4], 16), int(v[4:6], 16))
    return "#%02x%02x%02x" % (r, g, b)


def convertir_rgba(m):
    partes = [p.strip() for p in m.group(1).split(",")]
    if len(partes) < 3:
        return m.group(0)
    try:
        r, g, b = (int(float(p)) for p in partes[:3])
    except ValueError:
        return m.group(0)
    nr, ng, nb = invertir(r, g, b)
    if len(partes) == 4:
        return f"rgba({nr}, {ng}, {nb}, {partes[3]})"
    return f"rgb({nr}, {ng}, {nb})"


def transformar(texto: str) -> str:
    texto = re.sub(r"#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b", convertir_hex, texto)
    texto = re.sub(r"rgba?\(([^)]*)\)", convertir_rgba, texto)
    return texto


def sin_comentarios(texto: str) -> str:
    """Quita los comentarios del texto que precede a una regla.

    Sin esto, un comentario que mencione "@media print" o el nombre de un
    componente hace que la regla siguiente se clasifique mal.
    """
    return re.sub(r"/\*.*?\*/", " ", texto, flags=re.S)


def intacto(selector: str) -> bool:
    return any(s in selector for s in INTACTOS)


def recorrer(css: str) -> tuple[str, int, int]:
    """Recorre regla a regla; las de componentes ya oscuros se dejan igual."""
    salida, i, cambiadas, saltadas = [], 0, 0, 0
    n = len(css)
    while i < n:
        llave = css.find("{", i)
        if llave == -1:
            salida.append(css[i:])
            break
        selector = css[i:llave]

        # La hoja de impresion se queda como esta: el PDF va en papel, blanco.
        limpio = sin_comentarios(selector)
        if "@media" in limpio and "print" in limpio.split("@media")[-1]:
            prof, j = 0, llave
            while j < n:
                if css[j] == "{":
                    prof += 1
                elif css[j] == "}":
                    prof -= 1
                    if prof == 0:
                        break
                j += 1
            salida.append(css[i:j + 1])
            saltadas += 1
            i = j + 1
            continue

        if limpio.strip().startswith("@") and "{" in css[llave + 1:]:
            prof, j = 0, llave
            while j < n:
                if css[j] == "{":
                    prof += 1
                elif css[j] == "}":
                    prof -= 1
                    if prof == 0:
                        break
                j += 1
            dentro, c, s = recorrer(css[llave + 1:j])
            cambiadas += c
            saltadas += s
            salida.append(selector + "{" + dentro + "}")
            i = j + 1
            continue

        cierre = css.find("}", llave)
        cuerpo = css[llave:cierre + 1]
        if intacto(sin_comentarios(selector)):
            saltadas += 1
        else:
            nuevo = transformar(cuerpo)
            if nuevo != cuerpo:
                cambiadas += 1
            cuerpo = nuevo
        salida.append(selector + cuerpo)
        i = cierre + 1
    return "".join(salida), cambiadas, saltadas


if __name__ == "__main__":
    ruta = sys.argv[1] if len(sys.argv) > 1 else RUTA
    original = open(ruta, encoding="utf-8").read()
    nuevo, cambiadas, saltadas = recorrer(original)
    open(ruta, "w", encoding="utf-8").write(nuevo)
    print(f"{ruta}: {cambiadas} reglas convertidas, {saltadas} intactas")
