#!/usr/bin/env python3
"""Mete cursos, ficha técnica, resumen y artículos dentro de la Documentación
de Oktavia: una sola documentación con el formato del portal.

Cada página conserva su contenido y lo propio de su menú (Imprimir, PDF,
English, Cotizar) y recibe lo del portal:

- la marca de la cabecera: el icono y el nombre de Oktavia;
- el menú común (Inicio · Documentación · Academia · Artículos · Oktavia SP ·
  Contacto); «Oktavia SP» lleva a la presentación comercial (../oktavia-sp.html);
- la ruta «Documentación de Oktavia › Sección › Documento»;
- la barra lateral con el buscador y el árbol del catálogo
  (script/oktavia_docs_data.js), con la página actual marcada;
- el paginador entre los documentos de su sección;
- la hoja de estilos y los scripts del portal.

También normaliza el menú y la ruta de las páginas propias del portal
(docs/oktavia-docs*.html). Es idempotente: correrlo dos veces no cambia nada.

Las páginas en inglés (docs/*-en.html, blog/*-en.html) no son parte del portal
(cada una tiene su menú propio); de ellas sólo se asegura el enlace
«Oktavia SP» a ../oktavia-sp-en.html, antes de «Contact».

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


def _menu(d: str, extras: list[str]) -> str:
    """Menú común; `d` lleva de la carpeta de la página a docs/."""
    raiz = "../"
    enlaces = [
        f'<a href="{raiz}">Inicio</a>',
        f'<a href="{d}oktavia-docs.html">Documentación</a>',
        f'<a href="{d}oktavia-docs.html#academia">Academia</a>',
        f'<a href="{d}oktavia-docs.html#articulos">Artículos</a>',
        f'<a href="{raiz}oktavia-sp.html">Oktavia SP</a>',
        f'<a href="{raiz}#contacto">Contacto</a>',
    ]
    cuerpo = "\n".join("                " + x for x in enlaces + extras)
    return f'<nav aria-label="Documentación de Oktavia">\n{cuerpo}\n            </nav>'


def _extras(nav_html: str) -> list[str]:
    """Lo propio de cada página: botones (Imprimir), descargas, idioma, Cotizar."""
    out = []
    for m in re.finditer(r"<(a|button)\b[^>]*>.*?</\1>", nav_html, re.S):
        tag = m.group(0)
        if "<button" in tag or "doc-btn" in tag or "data-doc-lang" in tag or " download" in tag:
            out.append(re.sub(r"\s+", " ", tag))
    return out


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


def _cambiar_menu(html: str, d: str) -> str:
    m = re.search(r'(<header class="doc-header[^"]*">.*?)(<nav\b[^>]*>.*?</nav>)(.*?</header>)', html, re.S)
    if not m:
        return html
    nuevo = _menu(d, _extras(m.group(2)))
    return html[: m.start(2)] + nuevo + html[m.end(2):]


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


LATERAL = """
        <div class="docs-layout">
            <aside class="docs-side no-print">
                <button class="docs-side-toggle" type="button" aria-expanded="true" aria-controls="docs-side-body">
                    <span>Contenido de la documentación</span>
                    <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>
                </button>
                <div class="docs-side-body" id="docs-side-body">
                    <div class="docs-search" data-docs-search>
                        <form class="docs-search-form" role="search">
                            <span class="material-symbols-outlined" aria-hidden="true">search</span>
                            <input type="search" name="q" placeholder="Buscar en la documentación" aria-label="Buscar en la documentación" autocomplete="off">
                            <button type="submit">Buscar</button>
                        </form>
                    </div>
                    <nav aria-label="Documentos" data-docs-tree></nav>
                </div>
            </aside>

            <div class="docs-main-col">
"""


def envolver(ruta_catalogo: str, seccion: str, titulo: str, portal_html: str) -> bool:
    archivo = (RAIZ / "docs" / ruta_catalogo).resolve()
    html = archivo.read_text(encoding="utf-8")
    original = html
    en_blog = archivo.parent.name == "blog"
    d = "../docs/" if en_blog else ""

    html = _cambiar_marca(_cambiar_menu(html, d))
    if 'class="docs-layout"' not in html:
        base = ' data-docs-base="../docs/"' if en_blog else ""
        html = html.replace("<body>", f'<body class="docs-portal" data-docs-page="{ruta_catalogo}"{base}>', 1)
        estilo_portal = (f'<link rel="stylesheet" href="../style/oktavia_docs_style.css'
                         f'{_version("oktavia_docs_style.css", portal_html)}">')
        m = re.search(r'<link rel="stylesheet" href="\.\./style/docs_style\.css[^"]*">', html)
        extra_head = estilo_portal if "Material+Symbols" in html else ICONOS + "\n    " + estilo_portal
        html = html[: m.end()] + "\n    " + extra_head + html[m.end():]
        html = html.replace('<main class="doc-main">\n',
                            '<main class="doc-main">\n' + _ruta(d, seccion, titulo) + LATERAL, 1)
        html = html.replace('        <footer class="doc-footer">',
                            '        <nav class="docs-pager no-print" aria-label="Documentos vecinos" data-docs-pager></nav>\n\n'
                            '        <footer class="doc-footer">', 1)
        html = html.replace("    </main>", "            </div>\n        </div>\n    </main>", 1)
        scripts = (f'\n    <script src="../script/oktavia_docs_data.js{_version("oktavia_docs_data.js", portal_html)}"></script>'
                   f'\n    <script src="../script/oktavia_docs.js{_version("oktavia_docs.js", portal_html)}"></script>')
        m = re.search(r'<script src="\.\./script/docs_script\.js[^"]*"></script>', html)
        html = html[: m.end()] + scripts + html[m.end():]
    if html != original:
        archivo.write_text(html, encoding="utf-8")
        return True
    return False


def portal_propio(archivo: Path) -> bool:
    html = archivo.read_text(encoding="utf-8")
    original = html
    html = _cambiar_marca(_cambiar_menu(html, ""))
    # La ruta empieza en la Documentación: la Academia ahora vive dentro.
    html = html.replace('                <li><a href="academia.html">Academia</a></li>\n', "")
    if html != original:
        archivo.write_text(html, encoding="utf-8")
        return True
    return False


#: Enlace a Oktavia SP en el menú de las páginas en inglés.
SP_EN = '<a href="../oktavia-sp-en.html">Oktavia SP</a>'


def menu_ingles(archivo: Path) -> bool:
    """Agrega «Oktavia SP» al menú de una página en inglés, antes de «Contact»."""
    html = archivo.read_text(encoding="utf-8")
    m = re.search(r'<header class="doc-header[^"]*">.*?(<nav\b[^>]*>.*?</nav>)', html, re.S)
    if not m or "oktavia-sp-en.html" in m.group(1):
        return False
    nav = m.group(1)
    c = re.search(r'( *)<a href="\.\./#contacto">Contact</a>', nav)
    if not c:
        return False
    nuevo = nav[: c.start()] + c.group(1) + SP_EN + "\n" + nav[c.start():]
    archivo.write_text(html[: m.start(1)] + nuevo + html[m.end(1):], encoding="utf-8")
    return True


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
        if menu_ingles(archivo):
            cambios.append(archivo.relative_to(RAIZ))
    for c in cambios:
        print(f"actualizado: {c}")
    print(f"{len(cambios)} página(s) cambiadas")
    return 0


if __name__ == "__main__":
    sys.exit(main())
