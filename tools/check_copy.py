#!/usr/bin/env python3
"""Revisa que el diccionario de la portada este completo y calce con el HTML.

El copy del sitio vive en dos objetos paralelos, `es` y `en`, dentro de
script/home_script.js, y se aplica al DOM por posicion: el elemento numero 3 de
una lista recibe el texto numero 3 del arreglo. Eso hace que dos errores pasen
inadvertidos hasta que alguien cambia de idioma en produccion:

  - una clave que existe en un idioma y no en el otro (el texto se queda en el
    del idioma anterior, sin fallar);
  - un arreglo mas corto que los elementos que pinta (las tarjetas de mas se
    quedan con el texto del idioma anterior).

Este script falla ruidosamente en los dos casos. Correr antes de publicar:

    python3 tools/check_copy.py
"""
from __future__ import annotations

import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS = os.path.join(RAIZ, "script", "home_script.js")
HTML = os.path.join(RAIZ, "index.html")

# Arreglo de copy -> selector cuyo conteo en index.html debe coincidir.
LISTAS_CONTRA_HTML = {
    "serviceTitles": r'class="service-card"',
    "serviceBodies": r'class="service-card"',
    "serviceIconAlts": r'class="service-card"',
    "heroPoints": r"<li>",           # solo dentro de .hero-points, se acota abajo
    "platformChips": r"chip",
}


def bloque(texto: str, idioma: str) -> str:
    """Devuelve el cuerpo del objeto de traducciones de un idioma."""
    inicio = texto.index("        %s: {" % idioma)
    prof, i = 0, texto.index("{", inicio)
    j = i
    en_cadena, comilla = False, ""
    while j < len(texto):
        c = texto[j]
        if en_cadena:
            if c == "\\":
                j += 2
                continue
            if c == comilla:
                en_cadena = False
        elif c in "'\"":
            en_cadena, comilla = True, c
        elif c == "{":
            prof += 1
        elif c == "}":
            prof -= 1
            if prof == 0:
                return texto[i:j + 1]
        j += 1
    raise SystemExit("no se pudo delimitar el bloque " + idioma)


def claves(cuerpo: str) -> list[str]:
    return re.findall(r"^            ([A-Za-z][A-Za-z0-9]*):", cuerpo, re.M)


def span_de_arreglo(cuerpo: str, clave: str) -> tuple[int | None, int | None]:
    """Limites del arreglo de una clave, para inspeccionar su contenido."""
    m = re.search(r"^            " + re.escape(clave) + r": \[", cuerpo, re.M)
    if not m:
        return None, None
    i = m.end() - 1
    prof, j, en_cadena, comilla = 0, i, False, ""
    while j < len(cuerpo):
        c = cuerpo[j]
        if en_cadena:
            if c == "\\":
                j += 2
                continue
            if c == comilla:
                en_cadena = False
        elif c in "'\"":
            en_cadena, comilla = True, c
        elif c in "[{":
            prof += 1
        elif c in "]}":
            prof -= 1
            if prof == 0:
                return i, j + 1
        j += 1
    return None, None


def largo_de_arreglo(cuerpo: str, clave: str) -> int | None:
    """Cuenta los elementos de primer nivel de un arreglo de cadenas."""
    m = re.search(r"^            " + re.escape(clave) + r": \[", cuerpo, re.M)
    if not m:
        return None
    i = m.end() - 1
    prof, j, en_cadena, comilla, elementos = 0, i, False, "", 0
    while j < len(cuerpo):
        c = cuerpo[j]
        if en_cadena:
            if c == "\\":
                j += 2
                continue
            if c == comilla:
                en_cadena = False
                if prof == 1:
                    elementos += 1
        elif c in "'\"":
            en_cadena, comilla = True, c
        elif c in "[{":
            prof += 1
        elif c in "]}":
            prof -= 1
            if prof == 0:
                return elementos
        j += 1
    return None


def main() -> int:
    js = open(JS, encoding="utf-8").read()
    html = open(HTML, encoding="utf-8").read()
    es, en = bloque(js, "es"), bloque(js, "en")
    fallas: list[str] = []

    solo_es = [k for k in claves(es) if k not in claves(en)]
    solo_en = [k for k in claves(en) if k not in claves(es)]
    if solo_es:
        fallas.append("claves solo en espanol: " + ", ".join(solo_es))
    if solo_en:
        fallas.append("claves solo en ingles: " + ", ".join(solo_en))

    for clave in claves(es):
        a, b = largo_de_arreglo(es, clave), largo_de_arreglo(en, clave)
        if a is not None and b is not None and a != b:
            fallas.append(f"{clave}: {a} elementos en espanol y {b} en ingles")

    tarjetas = html.count('class="service-card"')
    for clave in ("serviceTitles", "serviceBodies", "serviceIconAlts"):
        n = largo_de_arreglo(es, clave)
        if n != tarjetas:
            fallas.append(f"{clave} tiene {n} textos y el HTML {tarjetas} tarjetas de servicio")

    chips = html.count('<span>', html.index('class="chip-list"'), html.index("</div>", html.index('class="chip-list"')))
    if largo_de_arreglo(es, "platformChips") != chips:
        fallas.append(f"platformChips tiene {largo_de_arreglo(es, 'platformChips')} textos y el HTML {chips} chips")

    casos = html.count("<h3>", html.index('class="cases-grid"'), html.index("</section>", html.index('class="cases-grid"')))
    if largo_de_arreglo(es, "caseTitles") != casos:
        fallas.append(f"caseTitles tiene {largo_de_arreglo(es, 'caseTitles')} textos y el HTML {casos} casos")

    # Las licencias: tantas tarjetas en el HTML como entradas de copy, y la
    # misma cantidad de modulos listados en cada idioma.
    planes = html.count('class="licensing-plan ')
    for clave in ("licensingPlanLabels", "licensingPlanTitles", "licensingPlanBodies"):
        if largo_de_arreglo(es, clave) != planes:
            fallas.append(f"{clave} tiene {largo_de_arreglo(es, clave)} textos y el HTML {planes} licencias")

    def modulos_por_plan(cuerpo: str) -> list[int]:
        a, b = span_de_arreglo(cuerpo, "licensingPlanItems")
        if a is None:
            return []
        return [len(re.findall(r"module: '", g))
                for g in re.findall(r"\[\s*\{.*?\}\s*\]", cuerpo[a:b], re.S)]

    por_plan_es, por_plan_en = modulos_por_plan(es), modulos_por_plan(en)
    if por_plan_es != por_plan_en:
        fallas.append(f"licensingPlanItems: {por_plan_es} modulos en espanol y {por_plan_en} en ingles")
    elif len(por_plan_es) != planes:
        fallas.append(f"licensingPlanItems tiene {len(por_plan_es)} listas y el HTML {planes} licencias")
    else:
        seccion = html[html.index('class="licensing-plans"'):html.index("</section>", html.index('class="licensing-plans"'))]
        if sum(por_plan_es) != seccion.count("<li><strong>"):
            fallas.append(f"licensingPlanItems suma {sum(por_plan_es)} modulos y el HTML lista "
                          f"{seccion.count('<li><strong>')}")

    # Los videos: mismo numero de titulos, cuerpos y tarjetas en el HTML.
    videos_html = html.count('class="video-item"')
    for clave in ("videoTitulos", "videoCuerpos"):
        n = largo_de_arreglo(es, clave)
        if n != videos_html:
            fallas.append(f"{clave} tiene {n} textos y el HTML {videos_html} videos")

    ids_html = re.findall(r'data-video="([\w-]+)"', html)
    if len(set(ids_html)) != len(ids_html):
        fallas.append("hay identificadores de video repetidos en el HTML")

    # Los puntos del hero tambien son objetos con entradilla y texto.
    def puntos_del_hero(cuerpo: str) -> int:
        a, b = span_de_arreglo(cuerpo, "heroPoints")
        return 0 if a is None else len(re.findall(r"label: '", cuerpo[a:b]))

    hero_es, hero_en = puntos_del_hero(es), puntos_del_hero(en)
    hero_html = html.count("<li><strong>", html.index('class="hero-points"'),
                           html.index("</ul>", html.index('class="hero-points"')))
    if hero_es != hero_en:
        fallas.append(f"heroPoints: {hero_es} puntos en espanol y {hero_en} en ingles")
    elif hero_es != hero_html:
        fallas.append(f"heroPoints tiene {hero_es} puntos y el HTML {hero_html}")

    if fallas:
        print("El copy tiene problemas:")
        for f in fallas:
            print("  - " + f)
        return 1

    print(f"copy OK: {len(claves(es))} claves en ambos idiomas, "
          f"{tarjetas} tarjetas de servicio, {casos} casos, "
          f"{planes} licencias con {sum(por_plan_es)} modulos, {hero_es} puntos en el hero, "
          f"{videos_html} videos")
    return 0


if __name__ == "__main__":
    sys.exit(main())
