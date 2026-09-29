/* Documentacion de Oktanet: utilidades minimas compartidas por el indice y
   los documentos largos.

   El idioma aqui NO se resuelve con un diccionario como en la portada: cada
   documento es un archivo por idioma, porque son textos largos y mantener dos
   arreglos paralelos de cien entradas se rompe en la primera correccion. Lo
   unico que se comparte con la portada es la preferencia guardada, para que
   volver al inicio no cambie el idioma debajo de los pies del lector. */
(function () {
    const storageKey = 'oktanet-language';

    const year = document.getElementById('doc-year');
    if (year) {
        year.textContent = String(new Date().getFullYear());
    }

    // Al cambiar de idioma se recuerda la eleccion antes de navegar.
    document.querySelectorAll('[data-doc-lang]').forEach(function (link) {
        link.addEventListener('click', function () {
            try {
                window.localStorage.setItem(storageKey, link.dataset.docLang);
            } catch (_error) {
                // Modo privado o almacenamiento bloqueado: la navegacion sigue.
            }
        });
    });

    document.querySelectorAll('[data-doc-print]').forEach(function (button) {
        button.addEventListener('click', function () {
            window.print();
        });
    });

    /* ------------------------------ Compartir ------------------------------
       Los enlaces se arman contra la URL canonica, no contra la del navegador:
       durante una prueba local la barra dice `localhost`, y compartir eso no
       le sirve a nadie. Se usan las URL de intencion de cada servicio en vez
       de sus widgets oficiales, que cargan scripts de terceros y rastrean al
       lector sin que este documento gane nada a cambio. */
    const canonical = document.querySelector('link[rel="canonical"]');
    const compartirUrl = canonical ? canonical.href : window.location.href;
    const titulo = (document.title || 'Oktavia').split('|')[0].trim();
    const resumen = document.querySelector('meta[name="description"]');
    const texto = resumen ? resumen.getAttribute('content') : titulo;

    const enc = encodeURIComponent;
    const destinos = {
        linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + enc(compartirUrl),
        x: 'https://x.com/intent/post?url=' + enc(compartirUrl) + '&text=' + enc(titulo),
        whatsapp: 'https://api.whatsapp.com/send?text=' + enc(titulo + ' ' + compartirUrl),
        email: 'mailto:?subject=' + enc(titulo) + '&body=' + enc(texto + '\n\n' + compartirUrl)
    };

    document.querySelectorAll('[data-share]').forEach(function (link) {
        const destino = destinos[link.dataset.share];

        if (destino) {
            link.setAttribute('href', destino);
        }
    });

    document.querySelectorAll('[data-share-copy]').forEach(function (button) {
        const original = button.textContent;

        button.addEventListener('click', function () {
            const avisar = function () {
                button.textContent = button.dataset.copied || original;
                button.classList.add('is-done');
                window.setTimeout(function () {
                    button.textContent = original;
                    button.classList.remove('is-done');
                }, 2200);
            };

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(compartirUrl).then(avisar, function () {
                    window.prompt(original, compartirUrl);
                });
                return;
            }

            // Navegador sin API de portapapeles: se ofrece el texto para copiar.
            window.prompt(original, compartirUrl);
        });
    });

    // El menu nativo del sistema cubre las aplicaciones que no estan arriba,
    // pero solo existe en moviles: si no esta, el boton no se muestra.
    document.querySelectorAll('[data-share-native]').forEach(function (button) {
        if (!navigator.share) {
            return;
        }

        button.hidden = false;
        button.addEventListener('click', function () {
            navigator.share({ title: titulo, text: texto, url: compartirUrl })
                .catch(function () {
                    // El lector cancelo el menu: no hay nada que hacer.
                });
        });
    });

    // Examen del curso de preventa. La clave vive en data-answer de cada
    // pregunta ("b", o "ab" si lleva varias respuestas): una pregunta de varias
    // cuenta solo si se eligen exactamente las correctas. Calificar no revela
    // nada; la respuesta y su explicacion aparecen solo si el alumno las pide.
    const quiz = document.getElementById('quiz');
    if (quiz) {
        const preguntas = Array.prototype.slice.call(quiz.querySelectorAll('.quiz-q'));
        const resultado = quiz.querySelector('.quiz-result');
        const calificar = quiz.querySelector('[type="submit"]');
        const revelar = quiz.querySelector('[data-quiz-reveal]');
        const reiniciar = quiz.querySelector('[data-quiz-reset]');
        const minimo = Number(quiz.dataset.pass) || preguntas.length;

        const elegidas = function (pregunta) {
            return Array.prototype.slice.call(pregunta.querySelectorAll('input:checked'))
                .map(function (input) { return input.value; })
                .sort()
                .join('');
        };

        const mostrarRespuestas = function (mostrar) {
            quiz.classList.toggle('quiz-revealed', mostrar);
            revelar.setAttribute('aria-pressed', String(mostrar));
            revelar.textContent = mostrar ? 'Ocultar respuestas' : 'Ver respuestas';
            preguntas.forEach(function (pregunta) {
                pregunta.querySelector('.quiz-why').hidden = !mostrar;
            });
        };

        quiz.addEventListener('submit', function (evento) {
            evento.preventDefault();
            let aciertos = 0;
            let sinResponder = 0;
            preguntas.forEach(function (pregunta) {
                const clave = pregunta.dataset.answer;
                const elegida = elegidas(pregunta);
                const correcta = elegida === clave;
                if (correcta) {
                    aciertos += 1;
                }
                if (!elegida) {
                    sinResponder += 1;
                }
                pregunta.classList.toggle('is-correct', correcta);
                pregunta.classList.toggle('is-wrong', !correcta);
                pregunta.querySelectorAll('.quiz-opt').forEach(function (opcion) {
                    const input = opcion.querySelector('input');
                    const esRespuesta = clave.indexOf(input.value) !== -1;
                    opcion.classList.toggle('is-answer', esRespuesta);
                    opcion.classList.toggle('is-chosen-wrong', input.checked && !esRespuesta);
                    input.disabled = true;
                });
            });
            const aprobado = aciertos >= minimo;
            resultado.textContent = aciertos + ' de ' + preguntas.length + ' · ' +
                (aprobado ? 'Aprobado' : 'Aún no: se aprueba con ' + minimo) +
                (sinResponder ? ' · ' + sinResponder + ' sin responder' : '');
            resultado.classList.toggle('is-pass', aprobado);
            resultado.classList.toggle('is-fail', !aprobado);
            quiz.classList.add('quiz-graded');
            calificar.disabled = true;
            revelar.hidden = false;
            reiniciar.hidden = false;
            mostrarRespuestas(false);
            resultado.scrollIntoView({ block: 'nearest' });
        });

        revelar.addEventListener('click', function () {
            mostrarRespuestas(!quiz.classList.contains('quiz-revealed'));
        });

        // El reset nativo limpia las casillas; aqui se limpia lo demas.
        quiz.addEventListener('reset', function () {
            preguntas.forEach(function (pregunta) {
                pregunta.classList.remove('is-correct', 'is-wrong');
                pregunta.querySelectorAll('.quiz-opt').forEach(function (opcion) {
                    opcion.classList.remove('is-answer', 'is-chosen-wrong');
                    opcion.querySelector('input').disabled = false;
                });
            });
            mostrarRespuestas(false);
            quiz.classList.remove('quiz-graded');
            resultado.textContent = '';
            resultado.classList.remove('is-pass', 'is-fail');
            calificar.disabled = false;
            revelar.hidden = true;
            reiniciar.hidden = true;
            quiz.scrollIntoView({ block: 'start' });
        });
    }
}());
