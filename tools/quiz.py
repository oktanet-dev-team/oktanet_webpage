#!/usr/bin/env python3
"""Inserta el examen interactivo y su clave en un curso a partir de un JSON.

El JSON es una lista de preguntas:
    {"q": "enunciado", "opts": ["a", "b", "c", "d"], "ans": "b" | "ab",
     "why": "explicación", "mod": "id-de-la-sección-para-repasar"}

"ans" con más de una letra es una pregunta de varias respuestas (casillas);
cuenta sólo si se eligen exactamente las correctas. El HTML lleva dos pares de
marcadores que este script reemplaza:
    <!-- QUIZ:START --> ... <!-- QUIZ:END -->
    <!-- CLAVE:START --> ... <!-- CLAVE:END -->

    python3 tools/quiz.py docs/curso-tecnico-asociado.html docs/preguntas-asociado.json 16
"""
import html
import json
import re
import sys

LETRAS = "abcdefgh"


def bloque(preguntas, minimo):
    out = [
        f'            <form class="quiz" id="quiz" data-pass="{minimo}" novalidate>',
        '                <p class="quiz-intro no-print">Elige tus respuestas y pulsa <strong>Calificar</strong>. '
        'Las preguntas de varias respuestas cuentan sólo si eliges exactamente las correctas. '
        'Después puedes ver, si quieres, la respuesta y su explicación.</p>',
        '                <ol class="quiz-list">',
    ]
    for i, p in enumerate(preguntas, 1):
        multi = len(p["ans"]) > 1
        tipo = "checkbox" if multi else "radio"
        etiqueta = ' <span class="quiz-multi">Varias respuestas</span>' if multi else ""
        out.append(f'                    <li class="quiz-q" data-answer="{p["ans"]}">')
        out.append('                        <fieldset>')
        out.append(f'                            <legend>{html.escape(p["q"], quote=False)}{etiqueta}</legend>')
        for j, texto in enumerate(p["opts"]):
            out.append(
                f'                            <label class="quiz-opt"><input type="{tipo}" name="q{i}" value="{LETRAS[j]}">'
                f'<span class="quiz-letter">{LETRAS[j]})</span> <span>{html.escape(texto, quote=False)}</span></label>'
            )
        out.append(
            f'                            <p class="quiz-why" hidden><strong>Respuesta: {", ".join(p["ans"])}.</strong> '
            f'{html.escape(p["why"], quote=False)} <a href="#{p["mod"]}">Repasar</a></p>'
        )
        out.append('                        </fieldset>')
        out.append('                    </li>')
    out += [
        '                </ol>',
        '                <div class="quiz-bar no-print">',
        '                    <button class="quiz-btn quiz-btn-solid" type="submit">Calificar</button>',
        '                    <button class="quiz-btn" type="button" data-quiz-reveal hidden aria-pressed="false">Ver respuestas</button>',
        '                    <button class="quiz-btn" type="reset" data-quiz-reset hidden>Volver a empezar</button>',
        '                    <p class="quiz-result" role="status" aria-live="polite"></p>',
        '                </div>',
        '            </form>',
    ]
    return "\n".join(out)


def main(pagina, preguntas_json, minimo):
    preguntas = json.load(open(preguntas_json, encoding="utf-8"))
    for i, p in enumerate(preguntas, 1):
        assert set(p["ans"]) <= set(LETRAS[: len(p["opts"])]), f"pregunta {i}: respuesta fuera de rango"
        assert p["mod"], f"pregunta {i}: falta el módulo"
    s = open(pagina, encoding="utf-8").read()
    for ancla in re.findall(r'href="#([^"]+)"', bloque(preguntas, minimo)):
        assert f'id="{ancla}"' in s, f"no existe la sección #{ancla}"
    clave = " · ".join(f'{i} {", ".join(p["ans"])}' for i, p in enumerate(preguntas, 1))
    s, n_quiz = re.subn(r"(<!-- QUIZ:START -->).*?(\s*<!-- QUIZ:END -->)",
                        lambda m: m.group(1) + "\n" + bloque(preguntas, minimo) + m.group(2), s, flags=re.S)
    s, n_clave = re.subn(r"(<!-- CLAVE:START -->).*?(<!-- CLAVE:END -->)",
                         lambda m: m.group(1) + clave + m.group(2), s, flags=re.S)
    assert n_quiz == 1 and n_clave == 1, "faltan los marcadores QUIZ o CLAVE en la página"
    open(pagina, "w", encoding="utf-8").write(s)
    print(f"{len(preguntas)} preguntas, se aprueba con {minimo}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], int(sys.argv[3]))
