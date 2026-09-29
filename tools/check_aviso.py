#!/usr/bin/env python3
"""Impide publicar el aviso de privacidad con datos sin llenar.

El borrador trae marcas «[POR COMPLETAR: …]» para la razón social, el
domicilio, el correo de privacidad y la fecha. Un aviso publicado con esas
marcas no sirve legalmente y se ve descuidado.

    python3 tools/check_aviso.py

Devuelve código distinto de cero si queda alguna marca.
"""
import pathlib
import re
import sys

AVISO = pathlib.Path(__file__).resolve().parent.parent / "docs" / "aviso-de-privacidad.html"

pendientes = re.findall(r"\[POR COMPLETAR:([^\]]*)\]", AVISO.read_text(encoding="utf-8"))
if pendientes:
    print(f"aviso INCOMPLETO: faltan {len(pendientes)} dato(s):")
    for p in pendientes:
        print(f"  -{p}")
    sys.exit(1)
print("aviso OK: sin datos por completar.")
