#!/usr/bin/env python3
"""Revisa que el material publico no lleve datos reales de un cliente.

Por que existe: la ficha tecnica se escribio con cuidado y de una sola vez.
Los articulos no — se escriben seguido, con prisa, y muchas veces copiando y
pegando de una sesion real de laboratorio. Ahi es donde se cuela una direccion
de gestion o el nombre de un equipo de un cliente, y una vez publicado en
oktanet.io ya lo indexo un buscador.

Ya paso algo parecido: el catalogo del Configurador traia direcciones del
laboratorio como valores de ejemplo. Nadie lo puso a proposito.

La regla es simple: en material publico SOLO se usan los rangos que existen
justamente para documentar (RFC 5737 y RFC 3849). Cualquier otra direccion se
reporta, incluidas las privadas — un 10.x de un cliente es informacion suya
aunque no sea enrutable en internet.

    python3 tools/check_datos.py

Devuelve codigo distinto de cero si encuentra algo, para poder encadenarlo.
"""
from __future__ import annotations

import ipaddress
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent

#: Rangos reservados para documentacion. Son los unicos permitidos.
PERMITIDOS = [
    ipaddress.ip_network("192.0.2.0/24"),    # RFC 5737 TEST-NET-1
    ipaddress.ip_network("198.51.100.0/24"),  # RFC 5737 TEST-NET-2
    ipaddress.ip_network("203.0.113.0/24"),   # RFC 5737 TEST-NET-3
]

#: Valores que no identifican a nadie: comodines y mascaras.
NEUTRAS = {"0.0.0.0", "255.255.255.255", "127.0.0.1"}

IPV4 = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")

#: Patrones de nombre de equipo del laboratorio y de los clientes.
EQUIPOS = re.compile(
    r"\b(?:sw|rt|fw|fgsw|juno|fgt)[_-][a-z0-9]{2,4}[_-][a-z0-9]{2,4}[_-]?\d*\b"
    r"|\bFortigate_\d+\b",
    re.IGNORECASE,
)

#: Identificadores de organizacion del despliegue.
TENANTS = re.compile(r"\b(?:ok-mtvl-lb|mltv-lb|oktanet-lab)\b", re.IGNORECASE)


def es_mascara(texto: str) -> bool:
    """Una mascara de red no identifica a nadie: 255.255.255.0 y sus parientes."""
    try:
        octetos = [int(o) for o in texto.split(".")]
    except ValueError:
        return False
    return all(o in (0, 128, 192, 224, 240, 248, 252, 254, 255) for o in octetos) and octetos[0] == 255


def revisar(ruta: pathlib.Path) -> list[str]:
    texto = ruta.read_text()
    hallazgos: list[str] = []

    for bruto in set(IPV4.findall(texto)):
        if bruto in NEUTRAS or es_mascara(bruto):
            continue
        try:
            direccion = ipaddress.ip_address(bruto)
        except ValueError:
            continue  # no era una IP, p.ej. un numero de version
        if any(direccion in red for red in PERMITIDOS):
            continue
        hallazgos.append(f"direccion fuera de los rangos de documentacion: {bruto}")

    for nombre in sorted(set(EQUIPOS.findall(texto))):
        hallazgos.append(f"nombre de equipo real: {nombre}")

    for tenant in sorted(set(TENANTS.findall(texto))):
        hallazgos.append(f"identificador de organizacion: {tenant}")

    return hallazgos


def main() -> int:
    paginas = sorted(RAIZ.glob("blog/*.html")) + sorted(RAIZ.glob("docs/*.html")) + sorted(RAIZ.glob("*.html"))
    total = 0

    for pagina in paginas:
        for hallazgo in revisar(pagina):
            print(f"{pagina.relative_to(RAIZ)}: {hallazgo}", file=sys.stderr)
            total += 1

    if total:
        print(
            f"\n{total} hallazgo(s). Usa los rangos de documentacion: "
            "192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24.",
            file=sys.stderr,
        )
        return 1

    print(f"datos OK: {len(paginas)} paginas revisadas, sin direcciones ni nombres reales.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
