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
}());
