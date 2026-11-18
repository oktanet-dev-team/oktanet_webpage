#!/usr/bin/env python3
"""Mete cursos, ficha técnica, resumen y artículos dentro de la Documentación
de Oktavia: una sola documentación con el formato del portal, al estilo de un
portal de documentación (índice a la izquierda, contenido, «En esta página» a
la derecha).

Cada página conserva su contenido y lo propio de su barra (Imprimir, PDF,
English, Cotizar) y recibe lo del portal:

- la barra superior mínima: [Índice] · marca de Oktavia · «Documentación» ·
  acciones de la página · botón Menú; los enlaces del sitio (Inicio, Oktavia
  Pro, Oktavia SP, Documentación, Academia, Artículos, Contacto) viven en un
  cajón oculto que abre ese botón;
- la barra lateral (#docs-side) con el filtro y el árbol del catálogo
  (script/oktavia_docs_data.js), con la página actual marcada; en pantallas
  angostas es un cajón que abre el botón Índice;
- la ruta «Documentación de Oktavia › Sección › Documento», arriba del
  contenido;
- el paginador entre los documentos de su sección;
- la hoja de estilos y los scripts del portal.

También normaliza la barra, la barra lateral y la ruta de las páginas propias
del portal (docs/oktavia-docs*.html), incluida su portada. Es idempotente:
correrlo dos veces no cambia nada.

Las páginas en inglés (docs/*-en.html, blog/*-en.html) no son parte del portal
(no hay catálogo en inglés), pero reciben la misma barra superior mínima con
el menú del sitio en inglés.

Uso:  python3 tools/portalize.py          (desde la raíz del sitio)
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]

#: Página → (sección del catálogo, título en la ruta). La ruta es la misma
#: `href` del catálogo (relativa a docs/).
ENVUELTAS = {
    "curso-automatizacion-redes.html": ("Academia", "Fundamentos de automatización de redes"),
    "curso-oktavia-fundamentos.html": ("Academia", "Oktavia Fundamentos"),
    "oktavia-resumen.html": ("Ficha técnica y resumen", "Resumen ejecutivo"),
    "oktavia.html": ("Ficha técnica y resumen", "Ficha técnica"),
    "oktavia-sp.html": ("Oktavia SP · Proveedores de servicios", "Documentación de Oktavia SP"),
    "guia-intencion.html": ("Guías para ingenieros de red", "Guía de intención para ingenieros de red"),
    "guia-servicios.html": ("Guías para ingenieros de red", "Servicios y plantillas"),
    "../blog/automatizar-oktavia-api-ansible-python.html": ("Artículos", "Automatiza Oktavia con su API, Ansible y Python"),
    "../blog/ia-local-contexto-empresarial.html": ("Artículos", "IA local con el contexto de su empresa"),
    "../blog/seguridad-en-oktavia-y-argos.html": ("Artículos", "Seguridad en Oktavia y Argos"),
    "../blog/red-de-pruebas-cml-y-sd-wan.html": ("Artículos", "La red de pruebas de Oktavia"),
    "../blog/telemetria-y-automatizacion-de-eventos.html": ("Artículos", "Telemetría y eventos"),
    "../blog/chatops-en-automatizacion-de-redes.html": ("Artículos", "ChatOps en redes"),
    "../blog/cerrar-el-ciclo-gemelo-digital.html": ("Artículos", "Cerrar el ciclo"),
    "../blog/cumplimiento-configuracion-y-estado.html": ("Artículos", "Cumplimiento de configuración y estado"),
    "../blog/inventario-fuente-de-verdad.html": ("Artículos", "Inventario y fuente de verdad"),
}
ANCLA_SECCION = {"Academia": "academia", "Ficha técnica y resumen": "producto", "Artículos": "articulos",
                 "Oktavia SP · Proveedores de servicios": "sp",
                 "Guías para ingenieros de red": "ingenieros"}

ICONOS = ('<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:'
          'opsz,wght,FILL,GRAD@24,400,0,0&amp;display=swap" rel="stylesheet">')


def _version(asset: str, html: str) -> str:
    """El sello anti-caché que ya usan las páginas del portal (stamp_assets)."""
    m = re.search(re.escape(asset) + r"\?v=([0-9a-f]+)", html)
    return f"?v={m.group(1)}" if m else ""


#: Iconos de la barra superior en SVG en línea: las páginas en inglés no
#: cargan la fuente de iconos y la barra debe verse igual en todas.
SVG_MENU = ('<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">'
            '<path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>')
SVG_CERRAR = ('<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">'
              '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>')
SVG_INDICE = ('<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">'
              '<rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>'
              '<path d="M9 4v16" stroke="currentColor" stroke-width="2" fill="none"/></svg>')

#: Textos de la barra superior por idioma.
TEXTOS = {
    "es": {"doc": "Documentación", "menu": "Menú", "abrir_menu": "Abrir el menú del sitio",
           "cerrar_menu": "Cerrar el menú", "sitio": "Sitio", "acciones": "Esta página",
           "indice": "Índice", "abrir_indice": "Abrir el índice de la documentación"},
    "en": {"doc": "Documentation", "menu": "Menu", "abrir_menu": "Open the site menu",
           "cerrar_menu": "Close the menu", "sitio": "Site", "acciones": "This page",
           "indice": "Contents", "abrir_indice": "Open the documentation contents"},
}


def _enlaces(lang: str, d: str, b: str) -> list[tuple[str, str]]:
    """Los enlaces del sitio, en el orden del menú. `d` lleva de la carpeta de
    la página a docs/ y `b` a blog/."""
    if lang == "en":
        return [
            ("../", "Home"),
            ("../#plataforma", "Oktavia Pro"),
            ("../oktavia-sp-en.html", "Oktavia SP"),
            (f"{d}index-en.html", "Documentation"),
            (f"{d}academy-en.html", "Academy"),
            (f"{b}index-en.html", "Articles"),
            ("../#contacto", "Contact"),
        ]
    return [
        ("../", "Inicio"),
        ("../#plataforma", "Oktavia Pro"),
        ("../oktavia-sp.html", "Oktavia SP"),
        (f"{d}oktavia-docs.html", "Documentación"),
        (f"{d}oktavia-docs.html#academia", "Academia"),
        (f"{d}oktavia-docs.html#articulos", "Artículos"),
        ("../#contacto", "Contacto"),
    ]


def _extras(header_html: str) -> list[str]:
    """Lo propio de cada página: botones (Imprimir), descargas, idioma, Cotizar.

    En una cabecera ya convertida viven en `.doc-actions`; en una vieja, entre
    los enlaces del menú."""
    m = re.search(r'<div class="doc-actions">(.*?)</div>', header_html, re.S)
    if m:
        fuente = m.group(1)
    elif "site-drawer" in header_html:
        return []  # ya convertida y sin acciones propias
    else:
        m = re.search(r"<nav\b[^>]*>.*?</nav>", header_html, re.S)
        fuente = m.group(0) if m else ""
    out = []
    for m in re.finditer(r"<(a|button)\b[^>]*>.*?</\1>", fuente, re.S):
        tag = m.group(0)
        if "<button" in tag or "doc-btn" in tag or "data-doc-lang" in tag or " download" in tag:
            out.append(re.sub(r"\s+", " ", tag))
    return out


def _cabecera(lang: str, d: str, b: str, extras: list[str], con_indice: bool, marca: str) -> str:
    """Barra superior mínima: [índice] marca · Documentación … acciones · Menú,
    y el cajón (oculto) con los enlaces del sitio."""
    t = TEXTOS[lang]
    portada_docs = f"{d}oktavia-docs.html" if lang == "es" else f"{d}index-en.html"
    i = "            "
    lineas = ['<header class="doc-header doc-header-min no-print">', '        <div class="doc-header-inner">']
    if con_indice:
        lineas.append(f'{i}<button class="doc-icon-btn docs-side-open" type="button" aria-controls="docs-side" '
                      f'aria-expanded="false" aria-label="{t["abrir_indice"]}" data-docs-side-open>{SVG_INDICE}'
                      f'<span>{t["indice"]}</span></button>')
    lineas.append(i + marca)
    lineas.append(f'{i}<a class="doc-header-section" href="{portada_docs}">{t["doc"]}</a>')
    if extras:
        lineas.append(f'{i}<div class="doc-actions">')
        lineas += [f"{i}    {x}" for x in extras]
        lineas.append(f"{i}</div>")
    lineas.append(f'{i}<button class="doc-icon-btn doc-menu-btn" type="button" aria-controls="site-menu" '
                  f'aria-expanded="false" aria-label="{t["abrir_menu"]}" data-site-menu-open>{SVG_MENU}'
                  f'<span>{t["menu"]}</span></button>')
    lineas.append("        </div>")
    lineas.append(f'        <nav class="site-drawer" id="site-menu" aria-label="{t["sitio"]}" data-site-menu>')
    lineas.append('            <div class="site-drawer-head">')
    lineas.append('                <span>Oktanet</span>')
    lineas.append(f'                <button class="doc-icon-btn" type="button" aria-label="{t["cerrar_menu"]}" '
                  f'data-site-menu-close>{SVG_CERRAR}</button>')
    lineas.append("            </div>")
    lineas.append("            <ul>")
    lineas += [f'                <li><a href="{h}">{x}</a></li>' for h, x in _enlaces(lang, d, b)]
    lineas.append("            </ul>")
    if extras:
        lineas.append(f'            <p class="site-drawer-label">{t["acciones"]}</p>')
        lineas.append('            <div class="site-drawer-actions">')
        lineas += [f"                {x}" for x in extras]
        lineas.append("            </div>")
    lineas.append("        </nav>")
    lineas.append("    </header>")
    return "\n".join(lineas)


#: Marca de la cabecera del portal: el icono de Oktavia, el mismo de la portada.
MARCA_ES = (
    '<a class="doc-brand" href="../">\n'
    '                <picture>\n'
    '                    <source srcset="../img/LOGO_Oktavia.webp" type="image/webp">\n'
    '                    <img src="../img/LOGO_Oktavia.png" alt="Logo de Oktavia" width="34" height="34">\n'
    '                </picture>\n'
    '                <span>Oktavia</span>\n'
    '            </a>'
)


def _cambiar_marca(html: str) -> str:
    """Cambia la marca vieja (icono de Oktanet) por la de Oktavia."""
    return re.sub(r'<a class="doc-brand" href="\.\./">\s*<img src="\.\./img/Oktanet_Logo_Textless\.png"'
                  r'[^>]*>\s*<span>Oktanet</span>\s*</a>', MARCA_ES, html, count=1)


def _marca(html: str) -> str:
    m = re.search(r'<a class="doc-brand" href="\.\./">.*?</a>', html, re.S)
    return m.group(0) if m else ""


def _cambiar_cabecera(html: str, lang: str, d: str, b: str, con_indice: bool) -> str:
    m = re.search(r'<header class="doc-header[^"]*">.*?</header>', html, re.S)
    if not m:
        return html
    marca = _marca(m.group(0))
    if not marca:
        return html
    nuevo = _cabecera(lang, d, b, _extras(m.group(0)), con_indice, marca)
    return html[: m.start()] + nuevo + html[m.end():]


def _ruta(d: str, seccion: str, titulo: str) -> str:
    return (
        '        <nav class="docs-crumbs" aria-label="Ruta">\n'
        "            <ol>\n"
        f'                <li><a href="{d}oktavia-docs.html">Documentación de Oktavia</a></li>\n'
        f'                <li><a href="{d}oktavia-docs.html#{ANCLA_SECCION[seccion]}">{seccion}</a></li>\n'
        f'                <li><span aria-current="page">{titulo}</span></li>\n'
        "            </ol>\n"
        "        </nav>\n"
    )


def _lateral(d: str) -> str:
    """La barra lateral: título, filtro del árbol y el árbol (lo pinta
    oktavia_docs.js desde el catálogo). En pantallas angostas es un cajón."""
    return (
        '<aside class="docs-side no-print" id="docs-side" aria-label="Índice de la documentación">\n'
        '                <div class="docs-side-head">\n'
        f'                    <a class="docs-side-title" href="{d}oktavia-docs.html">Documentación de Oktavia</a>\n'
        '                    <button class="doc-icon-btn docs-side-close" type="button" aria-label="Cerrar el índice" '
        f'data-docs-side-close>{SVG_CERRAR}</button>\n'
        '                </div>\n'
        '                <div class="docs-filter" data-docs-filter>\n'
        '                    <span class="material-symbols-outlined" aria-hidden="true">search</span>\n'
        '                    <input type="search" placeholder="Filtrar el índice" aria-label="Filtrar el índice de la documentación" autocomplete="off">\n'
        '                </div>\n'
        '                <nav aria-label="Documentos" data-docs-tree></nav>\n'
        '            </aside>'
    )


def _normalizar_lateral(html: str, d: str) -> str:
    """Pone la barra lateral canónica y deja la ruta dentro de la columna del
    contenido (encima del documento, como en un portal de documentación)."""
    html = re.sub(r'<aside class="docs-side[^"]*"[^>]*>.*?</aside>', lambda _m: _lateral(d), html, count=1, flags=re.S)
    m = re.search(r'( *)<nav class="docs-crumbs".*?</nav>\n\n?', html, re.S)
    lay = html.find('<div class="docs-layout">')
    if m and lay > m.start():
        ruta = m.group(0)
        html = html[: m.start()] + html[m.end():]
        col = re.search(r'<div class="docs-main-col">\n', html)
        bloque = "\n".join(("    " + x if x.strip() else x) for x in ruta.rstrip("\n").split("\n")) + "\n\n"
        html = html[: col.end()] + bloque + html[col.end():]
    return html


ABRE_LATERAL = """
        <div class="docs-layout">
            <aside class="docs-side"></aside>

            <div class="docs-main-col">
"""


def envolver(ruta_catalogo: str, seccion: str, titulo: str, portal_html: str) -> bool:
    archivo = (RAIZ / "docs" / ruta_catalogo).resolve()
    html = archivo.read_text(encoding="utf-8")
    original = html
    en_blog = archivo.parent.name == "blog"
    d = "../docs/" if en_blog else ""
    b = "" if en_blog else "../blog/"

    html = _cambiar_marca(html)
    html = _cambiar_cabecera(html, "es", d, b, True)
    if 'class="docs-layout"' not in html:
        base = ' data-docs-base="../docs/"' if en_blog else ""
        html = html.replace("<body>", f'<body class="docs-portal" data-docs-page="{ruta_catalogo}"{base}>', 1)
        estilo_portal = (f'<link rel="stylesheet" href="../style/oktavia_docs_style.css'
                         f'{_version("oktavia_docs_style.css", portal_html)}">')
        m = re.search(r'<link rel="stylesheet" href="\.\./style/docs_style\.css[^"]*">', html)
        extra_head = estilo_portal if "Material+Symbols" in html else ICONOS + "\n    " + estilo_portal
        html = html[: m.end()] + "\n    " + extra_head + html[m.end():]
        html = html.replace('<main class="doc-main">\n',
                            '<main class="doc-main">\n' + _ruta(d, seccion, titulo) + ABRE_LATERAL, 1)
        html = html.replace('        <footer class="doc-footer">',
                            '        <nav class="docs-pager no-print" aria-label="Documentos vecinos" data-docs-pager></nav>\n\n'
                            '        <footer class="doc-footer">', 1)
        html = html.replace("    </main>", "            </div>\n        </div>\n    </main>", 1)
        scripts = (f'\n    <script src="../script/oktavia_docs_data.js{_version("oktavia_docs_data.js", portal_html)}"></script>'
                   f'\n    <script src="../script/oktavia_docs.js{_version("oktavia_docs.js", portal_html)}"></script>')
        m = re.search(r'<script src="\.\./script/docs_script\.js[^"]*"></script>', html)
        html = html[: m.end()] + scripts + html[m.end():]
    html = _normalizar_lateral(html, d)
    if html != original:
        archivo.write_text(html, encoding="utf-8")
        return True
    return False


def portal_propio(archivo: Path) -> bool:
    html = archivo.read_text(encoding="utf-8")
    original = html
    html = _cambiar_marca(html)
    html = _cambiar_cabecera(html, "es", "", "../blog/", True)
    # La ruta empieza en la Documentación: la Academia ahora vive dentro.
    html = html.replace('                <li><a href="academia.html">Academia</a></li>\n', "")
    # La portada del portal también lleva la barra lateral.
    if 'class="docs-layout"' not in html:
        html = html.replace('    <main class="doc-main">\n', '    <main class="doc-main">\n' + ABRE_LATERAL.lstrip("\n").replace("\n\n", "\n\n", 1), 1)
        html = html.replace("    </main>", "            </div>\n        </div>\n    </main>", 1)
    html = _normalizar_lateral(html, "")
    if html != original:
        archivo.write_text(html, encoding="utf-8")
        return True
    return False


def pagina_ingles(archivo: Path) -> bool:
    """Las páginas en inglés no son parte del portal, pero llevan la misma
    barra superior mínima con el menú del sitio en inglés."""
    html = archivo.read_text(encoding="utf-8")
    en_blog = archivo.parent.name == "blog"
    d = "../docs/" if en_blog else ""
    b = "" if en_blog else "../blog/"
    nuevo = _cambiar_cabecera(html, "en", d, b, False)
    if nuevo != html:
        archivo.write_text(nuevo, encoding="utf-8")
        return True
    return False


def main() -> int:
    portal = (RAIZ / "docs" / "oktavia-docs.html").read_text(encoding="utf-8")
    cambios = []
    for archivo in sorted((RAIZ / "docs").glob("oktavia-docs*.html")):
        if portal_propio(archivo):
            cambios.append(archivo.relative_to(RAIZ))
    for ruta, (seccion, titulo) in ENVUELTAS.items():
        if envolver(ruta, seccion, titulo, portal):
            cambios.append((RAIZ / "docs" / ruta).resolve().relative_to(RAIZ))
    for archivo in sorted((RAIZ / "docs").glob("*-en.html")) + sorted((RAIZ / "blog").glob("*-en.html")):
        if pagina_ingles(archivo):
            cambios.append(archivo.relative_to(RAIZ))
    for c in cambios:
        print(f"actualizado: {c}")
    print(f"{len(cambios)} página(s) cambiadas")
    return 0


if __name__ == "__main__":
    sys.exit(main())
