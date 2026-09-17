/* Reproductor diferido de los vídeos incrustados en un artículo.
 *
 * La carátula es un archivo local y el iframe de YouTube sólo se crea cuando
 * el lector pulsa. Así el artículo no hace ni una petición a Google antes de
 * que alguien decida ver el vídeo: mismo criterio que la portada del sitio.
 * Además evita cargar un reproductor por artículo en una página que puede
 * leerse completa sin verlo. */
(function () {
    const marcos = document.querySelectorAll('.post-video-frame[data-video]');
    if (!marcos.length) {
        return;
    }

    const textos = {
        es: { reproducir: 'Reproducir el vídeo' },
        en: { reproducir: 'Play the video' }
    };
    const idioma = document.documentElement.lang === 'en' ? 'en' : 'es';

    marcos.forEach(function (marco) {
        const identificador = marco.getAttribute('data-video');
        if (!identificador) {
            return;
        }

        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'post-video-play';
        boton.setAttribute('aria-label', textos[idioma].reproducir);
        boton.innerHTML = '<span aria-hidden="true">&#9654;</span>';
        marco.appendChild(boton);

        const reproducir = function () {
            const iframe = document.createElement('iframe');
            iframe.src = 'https://www.youtube-nocookie.com/embed/' + identificador + '?autoplay=1&rel=0';
            iframe.title = marco.querySelector('img') ? marco.querySelector('img').alt : 'Vídeo';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            marco.textContent = '';
            marco.appendChild(iframe);
        };

        boton.addEventListener('click', reproducir);
        marco.addEventListener('click', function (evento) {
            if (evento.target === boton) {
                return;
            }
            reproducir();
        });
    });
}());
