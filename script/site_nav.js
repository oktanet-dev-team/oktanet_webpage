/* Menu principal: submenus desplegables (hoy, «Oktavia SP») y, en las paginas
   sueltas que reusan la cabecera de la portada, el boton de menu movil y el
   selector de idioma.

   La portada ya maneja su boton de menu y su idioma en home_script.js, con el
   diccionario de traducciones; aqui solo se agrega el submenu. Las paginas
   sueltas son un archivo por idioma (como la documentacion), asi que su
   selector de idioma son enlaces y lo unico que se guarda es la preferencia,
   para que volver a la portada no cambie el idioma. Se activan con
   `data-site-nav="standalone"` en el <body>. */
(function () {
    const storageKey = 'oktanet-language';
    const grupos = document.querySelectorAll('.nav-group');

    const cerrarGrupo = function (grupo, devolverFoco) {
        const boton = grupo.querySelector('.nav-group-toggle');
        const menu = grupo.querySelector('.nav-submenu');
        if (!boton || !menu || menu.hidden) {
            return;
        }
        menu.hidden = true;
        boton.setAttribute('aria-expanded', 'false');
        grupo.classList.remove('is-open');
        if (devolverFoco) {
            boton.focus();
        }
    };

    const abrirGrupo = function (grupo) {
        grupos.forEach(function (otro) {
            if (otro !== grupo) {
                cerrarGrupo(otro, false);
            }
        });
        const boton = grupo.querySelector('.nav-group-toggle');
        const menu = grupo.querySelector('.nav-submenu');
        menu.hidden = false;
        boton.setAttribute('aria-expanded', 'true');
        grupo.classList.add('is-open');
    };

    grupos.forEach(function (grupo) {
        const boton = grupo.querySelector('.nav-group-toggle');
        const menu = grupo.querySelector('.nav-submenu');
        if (!boton || !menu) {
            return;
        }
        const enlaces = Array.prototype.slice.call(menu.querySelectorAll('a'));

        boton.addEventListener('click', function (evento) {
            evento.stopPropagation();
            if (menu.hidden) {
                abrirGrupo(grupo);
            } else {
                cerrarGrupo(grupo, false);
            }
        });

        // Flecha abajo abre y entra al primer enlace; dentro, las flechas
        // recorren los enlaces y Escape regresa al boton.
        grupo.addEventListener('keydown', function (evento) {
            const indice = enlaces.indexOf(document.activeElement);
            if (evento.key === 'Escape') {
                cerrarGrupo(grupo, true);
            } else if (evento.key === 'ArrowDown') {
                evento.preventDefault();
                if (menu.hidden) {
                    abrirGrupo(grupo);
                }
                enlaces[indice < 0 ? 0 : Math.min(indice + 1, enlaces.length - 1)].focus();
            } else if (evento.key === 'ArrowUp' && indice >= 0) {
                evento.preventDefault();
                if (indice === 0) {
                    boton.focus();
                } else {
                    enlaces[indice - 1].focus();
                }
            }
        });

        // Si el foco sale del grupo con Tab, el submenu se cierra solo.
        grupo.addEventListener('focusout', function (evento) {
            if (evento.relatedTarget && !grupo.contains(evento.relatedTarget)) {
                cerrarGrupo(grupo, false);
            }
        });
    });

    document.addEventListener('click', function (evento) {
        grupos.forEach(function (grupo) {
            if (!grupo.contains(evento.target)) {
                cerrarGrupo(grupo, false);
            }
        });
    });

    if (document.body.dataset.siteNav !== 'standalone') {
        return;
    }

    /* ----------------------- Paginas sueltas ----------------------- */
    const body = document.body;
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    const dropdown = document.querySelector('.language-dropdown');
    const langToggle = document.querySelector('.lang-toggle');
    const langMenu = document.getElementById('lang-menu');

    const cerrarIdioma = function () {
        if (langMenu && langToggle) {
            langMenu.hidden = true;
            langToggle.setAttribute('aria-expanded', 'false');
            dropdown.classList.remove('is-open');
        }
    };

    if (navToggle && mainNav) {
        const etiquetaAbrir = navToggle.dataset.labelOpen || navToggle.getAttribute('aria-label');
        const etiquetaCerrar = navToggle.dataset.labelClose || etiquetaAbrir;
        const cerrarMenu = function () {
            body.classList.remove('nav-open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', etiquetaAbrir);
        };

        navToggle.addEventListener('click', function () {
            const abierto = body.classList.toggle('nav-open');
            navToggle.setAttribute('aria-expanded', String(abierto));
            navToggle.setAttribute('aria-label', abierto ? etiquetaCerrar : etiquetaAbrir);
        });

        mainNav.querySelectorAll('a').forEach(function (enlace) {
            enlace.addEventListener('click', cerrarMenu);
        });

        // Mismo umbral que el CSS del menu.
        window.addEventListener('resize', function () {
            if (window.innerWidth > 1340) {
                cerrarMenu();
            }
        });
    }

    if (dropdown && langToggle && langMenu) {
        langToggle.addEventListener('click', function (evento) {
            evento.stopPropagation();
            if (langMenu.hidden) {
                langMenu.hidden = false;
                langToggle.setAttribute('aria-expanded', 'true');
                dropdown.classList.add('is-open');
            } else {
                cerrarIdioma();
            }
        });

        document.addEventListener('click', function (evento) {
            if (!dropdown.contains(evento.target)) {
                cerrarIdioma();
            }
        });

        dropdown.addEventListener('keydown', function (evento) {
            if (evento.key === 'Escape') {
                cerrarIdioma();
                langToggle.focus();
            }
        });
    }

    // Recordar el idioma: el de esta pagina al llegar y el elegido al cambiar.
    const guardar = function (idioma) {
        try {
            window.localStorage.setItem(storageKey, idioma);
        } catch (_error) {
            // Modo privado o almacenamiento bloqueado: la navegacion sigue.
        }
    };

    guardar(document.documentElement.lang === 'en' ? 'en' : 'es');

    document.querySelectorAll('[data-doc-lang]').forEach(function (enlace) {
        enlace.addEventListener('click', function () {
            guardar(enlace.dataset.docLang);
        });
    });

    const anio = document.getElementById('current-year');
    if (anio) {
        anio.textContent = String(new Date().getFullYear());
    }
}());
