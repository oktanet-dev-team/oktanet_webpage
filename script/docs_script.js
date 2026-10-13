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

    // Registro de un curso gratuito de la Academia. Es un registro suave: el
    // contenido va en el HTML (buscadores, sin JavaScript, impresión) y aquí
    // sólo se oculta en pantalla hasta que la persona se registra. El registro
    // viaja a Formspree como cualquier formulario del sitio, y el navegador lo
    // recuerda para no volver a pedirlo.
    const puerta = document.querySelector('[data-course-gate]');
    if (puerta) {
        const clave = 'oktanet-academia:' + puerta.dataset.courseGate;
        const cerrados = Array.prototype.slice.call(document.querySelectorAll('[data-gated]'));
        const abrir = function () {
            puerta.hidden = true;
            cerrados.forEach(function (el) { el.hidden = false; });
        };
        let registrado = false;
        try {
            registrado = window.localStorage.getItem(clave) === '1';
        } catch (_error) {
            // Almacenamiento bloqueado: se pide el registro en esta visita.
        }
        if (!registrado) {
            puerta.hidden = false;
            cerrados.forEach(function (el) { el.hidden = true; });
            const forma = puerta.querySelector('form');
            const aviso = puerta.querySelector('.gate-error');
            const boton = forma.querySelector('[type="submit"]');
            forma.addEventListener('submit', function (evento) {
                evento.preventDefault();
                if (!forma.reportValidity()) {
                    return;
                }
                boton.disabled = true;
                aviso.hidden = true;
                window.fetch(forma.action, {
                    method: 'POST',
                    body: new FormData(forma),
                    headers: { Accept: 'application/json' }
                }).then(function (respuesta) {
                    if (!respuesta.ok) {
                        throw new Error('envio rechazado');
                    }
                    try {
                        window.localStorage.setItem(clave, '1');
                    } catch (_error) {
                        // Sin almacenamiento: queda abierto sólo en esta visita.
                    }
                    abrir();
                    window.scrollTo({ top: 0 });
                }).catch(function () {
                    aviso.hidden = false;
                }).then(function () {
                    boton.disabled = false;
                });
            });
        }
    }

    /* ---------------------- Certificado de aprobación ----------------------
       Los dos cursos gratuitos entregan un certificado al aprobar el examen.
       No hay servidor: el certificado se arma en el navegador y se guarda como
       PDF desde «Imprimir». El folio lleva una huella del nombre, el curso, la
       fecha y la calificación, y `certificado.html` la recalcula antes de
       pintar: cambiar un dato en la URL deja el folio sin calzar y la página
       lo dice. Es una validación local, no un registro en Oktanet. */
    const CURSOS = {
        'automatizacion-redes': {
            codigo: 'FAR',
            nivel: 'Nivel 1',
            nombre: 'Fundamentos de automatización de redes',
            url: 'curso-automatizacion-redes.html'
        },
        'oktavia-fundamentos': {
            codigo: 'OKF',
            nivel: 'Nivel 2',
            nombre: 'Oktavia Fundamentos',
            url: 'curso-oktavia-fundamentos.html'
        }
    };

    const dosDigitos = function (n) {
        return (n < 10 ? '0' : '') + n;
    };

    const limpiarNombre = function (texto) {
        return String(texto || '').replace(/\s+/g, ' ').trim();
    };

    // FNV-1a de 32 bits: basta para detectar un dato editado a mano. No es
    // criptografía ni pretende serlo.
    const huella = function (texto) {
        let h = 0x811c9dc5;
        for (let i = 0; i < texto.length; i += 1) {
            h ^= texto.charCodeAt(i);
            h = Math.imul(h, 0x01000193) >>> 0;
        }
        return ('00000000' + h.toString(16)).slice(-8).slice(-6).toUpperCase();
    };

    const folioDe = function (cursoId, datos) {
        const curso = CURSOS[cursoId];
        const base = [cursoId, datos.fecha, datos.aciertos, datos.total, datos.minimo, limpiarNombre(datos.nombre)].join('|');
        return 'AOK-' + curso.codigo + '-' + datos.fecha.replace(/-/g, '') + '-' +
            dosDigitos(datos.aciertos) + dosDigitos(datos.total) + '-' + huella(base);
    };

    // Examen interactivo de los cursos. La clave vive en data-answer de cada
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

        // Bloque del certificado: vive fuera del <form> del examen (un form no
        // puede anidar otro) y fuera de los marcadores QUIZ, para que
        // tools/quiz.py no lo borre al regenerar las preguntas.
        const cert = document.querySelector('[data-quiz-cert]');
        const certCurso = cert ? CURSOS[cert.dataset.course] : null;
        const certForm = cert ? cert.querySelector('form') : null;
        let aprobadoCon = null;

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
            aprobadoCon = aprobado ? aciertos : null;
            if (cert && certCurso) {
                cert.hidden = !aprobado;
            }
            if (aprobado && cert && certCurso) {
                cert.scrollIntoView({ block: 'nearest' });
                const campo = cert.querySelector('input');
                if (campo) {
                    campo.focus({ preventScroll: true });
                }
            } else {
                resultado.scrollIntoView({ block: 'nearest' });
            }
        });

        if (certForm && certCurso) {
            certForm.addEventListener('submit', function (evento) {
                evento.preventDefault();
                if (aprobadoCon === null || !certForm.reportValidity()) {
                    return;
                }
                const hoy = new Date();
                const datos = {
                    nombre: limpiarNombre(certForm.elements.nombre.value),
                    aciertos: aprobadoCon,
                    total: preguntas.length,
                    minimo: minimo,
                    fecha: hoy.getFullYear() + '-' + dosDigitos(hoy.getMonth() + 1) + '-' + dosDigitos(hoy.getDate())
                };
                if (datos.nombre.length < 3) {
                    certForm.elements.nombre.focus();
                    return;
                }
                const params = new URLSearchParams({
                    nombre: datos.nombre,
                    curso: cert.dataset.course,
                    aciertos: String(datos.aciertos),
                    total: String(datos.total),
                    minimo: String(datos.minimo),
                    fecha: datos.fecha,
                    folio: folioDe(cert.dataset.course, datos)
                });
                const url = 'certificado.html?' + params.toString();
                // Pestaña nueva para no perder el examen calificado; si el
                // navegador la bloquea, se abre en esta misma.
                const ventana = window.open(url, '_blank');
                if (ventana) {
                    ventana.opener = null;
                } else {
                    window.location.href = url;
                }
            });
        }

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
            aprobadoCon = null;
            if (cert) {
                cert.hidden = true;
                if (certForm) {
                    certForm.reset();
                }
            }
            quiz.scrollIntoView({ block: 'start' });
        });
    }

    // Página del certificado: todo viene en la URL. Se pinta sólo si el folio
    // calza con los datos y la calificación alcanza el mínimo; si no, se
    // explica y se manda al curso.
    const hoja = document.querySelector('[data-certificado]');
    if (hoja) {
        const params = new URLSearchParams(window.location.search);
        const cursoId = params.get('curso') || '';
        const curso = CURSOS[cursoId];
        const datos = {
            nombre: limpiarNombre(params.get('nombre')),
            aciertos: Number(params.get('aciertos')),
            total: Number(params.get('total')),
            minimo: Number(params.get('minimo')),
            fecha: params.get('fecha') || ''
        };
        const folio = params.get('folio') || '';
        const entero = function (n) {
            return Number.isInteger(n) && n > 0;
        };
        const valido = Boolean(curso) &&
            datos.nombre.length >= 3 && datos.nombre.length <= 80 &&
            entero(datos.aciertos) && entero(datos.total) && entero(datos.minimo) &&
            datos.minimo <= datos.total && datos.aciertos <= datos.total &&
            datos.aciertos >= datos.minimo &&
            /^\d{4}-\d{2}-\d{2}$/.test(datos.fecha) &&
            folio === folioDe(cursoId, datos);

        const invalido = document.querySelector('[data-certificado-invalido]');
        if (!valido) {
            hoja.hidden = true;
            if (invalido) {
                invalido.hidden = false;
            }
            document.title = 'Certificado no válido | Academia Oktanet';
        } else {
            const partes = datos.fecha.split('-').map(Number);
            const fechaLocal = new Date(partes[0], partes[1] - 1, partes[2]);
            const fechaTexto = fechaLocal.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
            const campos = {
                nombre: datos.nombre,
                curso: curso.nombre,
                nivel: curso.nivel,
                calificacion: datos.aciertos + ' de ' + datos.total,
                minimo: String(datos.minimo),
                fecha: fechaTexto,
                folio: folio
            };
            Object.keys(campos).forEach(function (clave) {
                hoja.querySelectorAll('[data-cert="' + clave + '"]').forEach(function (el) {
                    el.textContent = campos[clave];
                });
            });
            document.querySelectorAll('[data-cert-curso-link]').forEach(function (enlace) {
                enlace.href = curso.url;
            });
            hoja.hidden = false;
            if (invalido) {
                invalido.hidden = true;
            }
            // El título es el nombre que el navegador propone para el PDF.
            document.title = 'Certificado - ' + datos.nombre + ' - ' + curso.nombre;
        }
    }
}());
