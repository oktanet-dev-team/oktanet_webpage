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
}());
