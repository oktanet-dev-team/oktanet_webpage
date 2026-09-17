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

/* Iconos de las secciones de un articulo.
 *
 * Van como SVG en linea y no como fuente de iconos por dos razones: el
 * articulo se imprime a PDF —y una fuente externa puede no haber cargado
 * cuando Chrome captura la pagina—, y asi no se agrega una peticion de red
 * bloqueante a una pagina que existe para leerse.
 *
 * Se inyectan desde aqui, con `data-icono` en cada seccion, para que agregar
 * un articulo sea poner un atributo y no pegar 200 bytes de SVG por titulo.
 * Son decorativos: sin JavaScript el articulo se lee igual. */
(function () {
    const TRAZOS = {
        hoja: 'M4 3h16v18H4zM4 9h16M4 15h16M10 3v18',
        comparar: 'M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M12 2v20',
        capas: 'M12 3 3 8l9 5 9-5-9-5zM3 14l9 5 9-5M3 11l9 5 9-5',
        llave: 'M15 7a4 4 0 1 1-3.9 5H7v3H4v-3H2v-3h9.1A4 4 0 0 1 15 7z',
        alerta: 'M12 3 2 20h20L12 3zM12 10v5M12 17.5v.5',
        ciclo: 'M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6',
        escudo: 'M12 3 4 6v6c0 5 3.4 8.5 8 9 4.6-.5 8-4 8-9V6l-8-3zM9 12l2.2 2.2L15.5 10',
        verificar: 'M4 12.5 9 17.5 20 6.5',
        chat: 'M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z',
        grafica: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
        rayo: 'M13 2 4 14h7l-1 8 9-12h-7l1-8z',
        red: 'M12 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM5 15a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM19 15a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM12 9v3M12 12 6.5 15M12 12l5.5 3',
        marca: 'M12 2 3 7v10l9 5 9-5V7l-9-5zM12 7v10M7.5 9.5v5M16.5 9.5v5'
    };

    // Secciones de un articulo (h2) y tarjetas del indice (h3): mismo juego de
    // iconos para que el indice y el articulo se reconozcan como lo mismo.
    document.querySelectorAll('[data-icono]').forEach(function (seccion) {
        const trazo = TRAZOS[seccion.getAttribute('data-icono')];
        const titulo = seccion.querySelector('h2, h3');
        if (!trazo || !titulo) {
            return;
        }

        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('class', 'post-section-icon');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');

        const path = document.createElementNS(ns, 'path');
        path.setAttribute('d', trazo);
        svg.appendChild(path);
        titulo.insertBefore(svg, titulo.firstChild);
    });
}());
