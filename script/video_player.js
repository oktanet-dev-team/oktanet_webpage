/* Reproductor de videos para las páginas fuera de la portada (Oktavia SP):
   la carátula es un botón y el reproductor de YouTube (sin cookies) sólo se
   carga cuando alguien lo pulsa; hasta entonces la página no habla con Google.
   La portada tiene el mismo comportamiento dentro de home_script.js. */
(function () {
    'use strict';
    document.querySelectorAll('.video-caratula').forEach(function (caratula) {
        caratula.addEventListener('click', function () {
            var id = caratula.dataset.video;
            if (!id || !/^[\w-]{6,20}$/.test(id)) {
                return;
            }
            var inicio = parseInt(caratula.dataset.start, 10);
            var titulo = caratula.closest('.video-item') && caratula.closest('.video-item').querySelector('h3');
            var marco = document.createElement('iframe');
            marco.className = 'video-iframe';
            marco.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0' + (inicio > 0 ? '&start=' + inicio : '');
            marco.title = titulo ? titulo.textContent : 'Video';
            marco.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture';
            marco.allowFullscreen = true;
            marco.referrerPolicy = 'strict-origin-when-cross-origin';
            caratula.replaceWith(marco);
        });
    });
}());
