/* Documentación de Oktavia: el portal técnico dentro de la Academia.

   El CONTENIDO de cada documento vive en el HTML de su página, como el resto
   de la documentación del sitio: así lo indexan los buscadores, se imprime y
   se lee sin JavaScript. Lo que aquí se pinta es lo que un portal tiene y un
   documento no, y que sale todo del mismo catálogo (oktavia_docs_data.js):

   - el buscador, que indexa títulos, resúmenes y palabras clave;
   - las tarjetas y categorías de la página de inicio;
   - el árbol de navegación de la barra lateral y el paginador;
   - las tablas de la Referencia de datos, que son datos y no prosa.

   Cuando se agrega un documento, se da de alta UNA vez en el catálogo y
   aparece en el buscador, en la categoría, en el árbol y en el paginador. */
(function () {
    const data = window.OKTAVIA_DOCS;
    if (!data) {
        return;
    }

    const sections = data.sections;
    // La página actual tal como la nombra el catálogo (relativa a docs/).
    const page = document.body.dataset.docsPage || '';
    // Las páginas fuera de docs/ (los artículos en blog/) declaran cómo llegar
    // a docs/: todas las rutas del catálogo son relativas a docs/.
    const base = document.body.dataset.docsBase || '';
    const ruta = function (href) {
        return /^(https?:|\/|#)/.test(href) ? href : base + href;
    };

    /* ------------------------------ Utilidades ----------------------------- */

    const el = function (tag, attrs, children) {
        const node = document.createElement(tag);
        Object.keys(attrs || {}).forEach(function (key) {
            if (key === 'text') {
                node.textContent = attrs[key];
            } else if (key === 'html') {
                node.innerHTML = attrs[key];
            } else if (attrs[key] === true) {
                node.setAttribute(key, '');
            } else if (attrs[key] !== false && attrs[key] !== null && attrs[key] !== undefined) {
                node.setAttribute(key, attrs[key]);
            }
        });
        (children || []).forEach(function (child) {
            if (child) {
                node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
            }
        });
        return node;
    };

    const icon = function (name) {
        return el('span', { class: 'material-symbols-outlined', 'aria-hidden': 'true', text: name });
    };

    const badge = function (status) {
        if (status === 'soon') {
            return el('span', { class: 'docs-badge is-soon', text: 'Próximamente' });
        }
        if (status === 'prep') {
            return el('span', { class: 'docs-badge is-soon', text: 'En preparación' });
        }
        return null;
    };

    const docHref = function (section, doc) {
        // Documento con página propia (curso, ficha, artículo) o ancla dentro
        // de la página de su sección. Uno «Próximamente» de una sección sin
        // página propia lleva al bloque de la sección en la portada.
        if (doc.href) {
            return ruta(doc.href);
        }
        if (section.page.indexOf('#') >= 0) {
            return ruta(section.page);
        }
        return ruta(section.page + '#' + doc.id);
    };
    const sectionHref = function (section) {
        return ruta(section.page);
    };

    const sectionById = function (id) {
        return sections.filter(function (s) { return s.id === id; })[0];
    };

    const findDoc = function (ref) {
        // Una referencia "seccion/documento" del catálogo.
        const parts = ref.split('/');
        const section = sectionById(parts[0]);
        if (!section) {
            return null;
        }
        const doc = section.docs.filter(function (d) { return d.id === parts[1]; })[0];
        return doc ? { section: section, doc: doc } : null;
    };

    // Sin acentos ni mayúsculas, para que "auditoria" encuentre "Auditoría".
    const plano = function (texto) {
        return String(texto || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '');
    };

    /* ------------------------------- Buscador ------------------------------ */

    const indice = [];
    sections.forEach(function (section) {
        indice.push({
            title: section.title,
            path: 'Sección',
            summary: section.summary,
            href: sectionHref(section),
            texto: plano([section.title, section.summary, (section.keywords || []).join(' ')].join(' '))
        });
        section.docs.forEach(function (doc) {
            indice.push({
                title: doc.title,
                path: section.title,
                summary: doc.summary,
                href: docHref(section, doc),
                status: doc.status,
                texto: plano([doc.title, doc.summary, (doc.keywords || []).join(' ')].join(' '))
            });
        });
    });
    const buscar = function (consulta) {
        const terminos = plano(consulta).split(/\s+/).filter(Boolean);
        if (!terminos.length) {
            return [];
        }
        return indice
            .map(function (item) {
                let puntos = 0;
                const enTitulo = plano(item.title);
                terminos.forEach(function (t) {
                    if (enTitulo.indexOf(t) !== -1) {
                        puntos += 3;
                    } else if (item.texto.indexOf(t) !== -1) {
                        puntos += 1;
                    } else {
                        puntos -= 10;
                    }
                });
                return { item: item, puntos: puntos };
            })
            .filter(function (r) { return r.puntos > 0; })
            .sort(function (a, b) { return b.puntos - a.puntos; })
            .slice(0, 8)
            .map(function (r) { return r.item; });
    };

    document.querySelectorAll('[data-docs-search]').forEach(function (contenedor) {
        const form = contenedor.querySelector('form');
        const input = contenedor.querySelector('input');
        const lista = el('ul', { class: 'docs-search-results', role: 'listbox', hidden: true });
        contenedor.appendChild(lista);
        let activo = -1;

        const cerrar = function () {
            lista.hidden = true;
            lista.innerHTML = '';
            activo = -1;
        };

        const pintar = function () {
            const resultados = buscar(input.value);
            lista.innerHTML = '';
            activo = -1;
            if (!input.value.trim()) {
                lista.hidden = true;
                return;
            }
            if (!resultados.length) {
                lista.appendChild(el('li', {}, [el('p', { text: 'Sin resultados. Prueba con otro término o recorre las categorías.' })]));
            }
            resultados.forEach(function (item) {
                const enlace = el('a', { href: item.href }, [
                    el('span', { class: 'docs-result-path', text: item.path }),
                    el('span', { class: 'docs-result-title' }, [item.title, badge(item.status)]),
                    el('span', { class: 'docs-result-summary', text: item.summary })
                ]);
                lista.appendChild(el('li', { role: 'option' }, [enlace]));
            });
            lista.hidden = false;
        };

        const mover = function (paso) {
            const opciones = lista.querySelectorAll('li[role="option"]');
            if (!opciones.length) {
                return;
            }
            activo = (activo + paso + opciones.length) % opciones.length;
            opciones.forEach(function (li, i) { li.classList.toggle('is-active', i === activo); });
        };

        input.addEventListener('input', pintar);
        input.addEventListener('focus', function () {
            if (input.value.trim()) {
                pintar();
            }
        });
        input.addEventListener('keydown', function (evento) {
            if (evento.key === 'ArrowDown') {
                evento.preventDefault();
                mover(1);
            } else if (evento.key === 'ArrowUp') {
                evento.preventDefault();
                mover(-1);
            } else if (evento.key === 'Escape') {
                cerrar();
            }
        });
        form.addEventListener('submit', function (evento) {
            evento.preventDefault();
            const opciones = lista.querySelectorAll('li[role="option"] a');
            const destino = opciones[activo >= 0 ? activo : 0];
            if (destino) {
                window.location.href = destino.getAttribute('href');
            } else {
                pintar();
            }
        });
        document.addEventListener('click', function (evento) {
            if (!contenedor.contains(evento.target)) {
                cerrar();
            }
        });
    });

    /* --------------------------- Página de inicio -------------------------- */

    const destacados = document.querySelector('[data-docs-featured]');
    if (destacados) {
        data.featured.forEach(function (ref) {
            const hit = findDoc(ref.doc);
            if (!hit) {
                return;
            }
            destacados.appendChild(el('li', {}, [
                el('a', { class: 'docs-card', href: docHref(hit.section, hit.doc) }, [
                    icon(ref.icon || hit.section.icon),
                    el('h3', {}, [ref.title || hit.doc.title, badge(hit.doc.status)]),
                    el('p', { text: ref.summary || hit.doc.summary }),
                    el('span', { class: 'docs-card-kind', text: hit.section.kind })
                ])
            ]));
        });
    }

    // Tarjetas con todos los documentos de una sección (Artículos, Academia).
    document.querySelectorAll('[data-docs-cards]').forEach(function (lista) {
        const section = sectionById(lista.dataset.docsCards);
        if (!section) {
            return;
        }
        section.docs.forEach(function (doc) {
            const pie = doc.date ? doc.date + (doc.minutes ? ' · ' + doc.minutes + ' min' : '') : section.kind;
            lista.appendChild(el('li', {}, [
                el('a', { class: 'docs-card', href: docHref(section, doc) }, [
                    icon(doc.icon || section.icon),
                    el('h3', {}, [doc.title, badge(doc.status)]),
                    el('p', { text: doc.summary }),
                    el('span', { class: 'docs-card-kind', text: pie })
                ])
            ]));
        });
    });

    document.querySelectorAll('[data-docs-linklist]').forEach(function (lista) {
        const section = sectionById(lista.dataset.docsLinklist);
        if (!section) {
            return;
        }
        section.docs.forEach(function (doc) {
            lista.appendChild(el('li', {}, [
                el('a', { href: docHref(section, doc) }, [doc.title, badge(doc.status)]),
                el('span', { text: doc.summary })
            ]));
        });
    });

    document.querySelectorAll('[data-docs-catalog]').forEach(function (catalogo) {
        const ids = catalogo.dataset.docsCatalog.split(/\s+/).filter(Boolean);
        ids.forEach(function (id) {
            const section = sectionById(id);
            if (!section) {
                return;
            }
            const items = section.docs.map(function (doc) {
                return el('li', {}, [
                    el('a', { href: docHref(section, doc), text: doc.title }),
                    badge(doc.status)
                ]);
            });
            catalogo.appendChild(el('li', { class: 'docs-category' }, [
                el('div', { class: 'docs-category-head' }, [
                    icon(section.icon),
                    el('h3', {}, [el('a', { href: sectionHref(section), text: section.title })])
                ]),
                el('p', { text: section.summary }),
                el('ul', {}, items),
                section.page.indexOf('#') >= 0 ? null
                    : el('a', { class: 'docs-category-more', href: sectionHref(section), text: 'Ver la sección completa' })
            ]));
        });
    });

    /* ------------------------------ Barra lateral -------------------------- */

    // Índice persistente a la izquierda, como en un portal de documentación:
    // grupos de secciones, cada sección plegable con sus documentos, la página
    // actual marcada y un filtro arriba. En pantallas angostas es un cajón.
    const lateral = document.querySelector('[data-docs-tree]');
    const chevron = function () {
        return el('span', { class: 'material-symbols-outlined docs-tree-chevron', 'aria-hidden': 'true', text: 'chevron_right' });
    };
    const ramas = [];
    if (lateral) {
        const arbol = el('ul', { class: 'docs-tree' });
        const enPortada = page === data.homePage;
        arbol.appendChild(el('li', { class: 'docs-tree-home' + (enPortada ? ' is-active' : '') }, [
            el('a', { href: ruta(data.homePage), 'aria-current': enPortada ? 'page' : null }, [icon('home'), 'Inicio del portal'])
        ]));

        const rama = function (section) {
            const propia = section.docs.some(function (doc) { return doc.href && doc.href === page; });
            const esPagina = section.page === page;
            const abierta = esPagina || propia;
            const idHijos = 'docs-tree-' + section.id;
            const hijos = el('ul', { id: idHijos }, section.docs.map(function (doc) {
                const aqui = Boolean(doc.href) && doc.href === page;
                return el('li', {
                    'data-doc': doc.id,
                    'data-texto': plano([doc.title, doc.summary, (doc.keywords || []).join(' ')].join(' ')),
                    class: aqui ? 'is-active' : null
                }, [
                    el('a', { href: docHref(section, doc), 'aria-current': aqui ? 'page' : null }, [
                        el('span', { text: doc.title }), badge(doc.status)
                    ])
                ]);
            }));
            const boton = el('button', {
                type: 'button',
                class: 'docs-tree-twist',
                'aria-expanded': String(abierta),
                'aria-controls': idHijos,
                'aria-label': 'Mostrar u ocultar ' + section.title
            }, [chevron()]);
            const li = el('li', {
                class: 'docs-tree-branch' + (abierta ? ' is-open' : '') + (abierta ? ' is-current' : ''),
                'data-texto': plano([section.title, section.summary, (section.keywords || []).join(' ')].join(' '))
            }, [
                el('div', { class: 'docs-tree-row' + (esPagina ? ' is-active' : '') }, [
                    boton,
                    el('a', { href: sectionHref(section), 'aria-current': esPagina ? 'page' : null }, [icon(section.icon), el('span', { text: section.title })])
                ]),
                hijos
            ]);
            const fijar = function (abrir) {
                li.classList.toggle('is-open', abrir);
                boton.setAttribute('aria-expanded', String(abrir));
            };
            boton.addEventListener('click', function () {
                fijar(!li.classList.contains('is-open'));
            });
            ramas.push({ li: li, fijar: fijar, abierta: abierta });
            return li;
        };

        const usadas = {};
        const grupos = (data.treeGroups || []).map(function (g) {
            return { title: g.title, sections: g.sections.map(sectionById).filter(Boolean) };
        });
        grupos.forEach(function (g) { g.sections.forEach(function (s) { usadas[s.id] = true; }); });
        const sueltas = sections.filter(function (s) { return !usadas[s.id]; });
        if (sueltas.length) {
            grupos.push({ title: '', sections: sueltas });
        }
        grupos.forEach(function (g) {
            if (g.title) {
                arbol.appendChild(el('li', { class: 'docs-tree-group', role: 'presentation', text: g.title }));
            }
            g.sections.forEach(function (section) { arbol.appendChild(rama(section)); });
        });
        const sinResultados = el('p', { class: 'docs-tree-empty', hidden: true, text: 'Nada coincide con el filtro.' });
        lateral.appendChild(arbol);
        lateral.appendChild(sinResultados);

        // El documento activo queda a la vista dentro del índice.
        const activo = arbol.querySelector('[aria-current="page"]');
        const lado = lateral.closest('.docs-side');
        if (activo && lado) {
            const caja = lado.getBoundingClientRect();
            const pos = activo.getBoundingClientRect();
            if (pos.bottom > caja.bottom - 24) {
                lado.scrollTop += pos.top - caja.top - lado.clientHeight / 3;
            }
        }

        // Al desplazarse, el documento visible se marca en el árbol.
        const anclas = Array.prototype.slice.call(document.querySelectorAll('.doc-section[id]'));
        const marcar = function (id) {
            arbol.querySelectorAll('.docs-tree-branch.is-current li[data-doc]').forEach(function (li) {
                li.classList.toggle('is-active', li.dataset.doc === id);
            });
        };
        if (anclas.length && 'IntersectionObserver' in window) {
            const visibles = {};
            const observador = new IntersectionObserver(function (entradas) {
                entradas.forEach(function (entrada) {
                    visibles[entrada.target.id] = entrada.isIntersecting;
                });
                const primera = anclas.filter(function (s) { return visibles[s.id]; })[0];
                if (primera) {
                    marcar(primera.id);
                }
            }, { rootMargin: '-80px 0px -60% 0px' });
            anclas.forEach(function (s) { observador.observe(s); });
        }
        if (window.location.hash) {
            marcar(window.location.hash.slice(1));
        }

        // Filtro del índice: deja los documentos que coinciden (título,
        // resumen o palabras clave) y abre sus secciones. Enter abre el primero.
        const filtro = lado ? lado.querySelector('[data-docs-filter] input') : null;
        if (filtro) {
            const aplicar = function () {
                const terminos = plano(filtro.value).split(/\s+/).filter(Boolean);
                const filtrando = terminos.length > 0;
                arbol.classList.toggle('is-filtering', filtrando);
                let total = 0;
                const coincide = function (texto) {
                    return terminos.every(function (t) { return texto.indexOf(t) !== -1; });
                };
                ramas.forEach(function (r) {
                    const deSeccion = filtrando && coincide(r.li.dataset.texto);
                    let hijos = 0;
                    r.li.querySelectorAll('li[data-doc]').forEach(function (hoja) {
                        const ve = !filtrando || deSeccion || coincide(hoja.dataset.texto);
                        hoja.hidden = !ve;
                        if (ve) {
                            hijos += 1;
                        }
                    });
                    const ve = !filtrando || deSeccion || hijos > 0;
                    r.li.hidden = !ve;
                    if (ve) {
                        total += 1;
                    }
                    r.fijar(filtrando ? ve : r.abierta);
                });
                arbol.querySelectorAll('.docs-tree-group, .docs-tree-home').forEach(function (x) {
                    x.hidden = filtrando;
                });
                sinResultados.hidden = !filtrando || total > 0;
            };
            filtro.addEventListener('input', aplicar);
            filtro.addEventListener('keydown', function (evento) {
                if (evento.key === 'Enter') {
                    evento.preventDefault();
                    const primero = arbol.querySelector('li[data-doc]:not([hidden]) a, .docs-tree-branch:not([hidden]) .docs-tree-row a');
                    if (primero && filtro.value.trim()) {
                        window.location.href = primero.getAttribute('href');
                    }
                } else if (evento.key === 'Escape' && filtro.value) {
                    evento.stopPropagation();
                    filtro.value = '';
                    aplicar();
                }
            });
        }

        // En pantallas angostas la barra es un cajón que se abre desde la
        // barra superior (docs_script.js da el comportamiento del cajón).
        if (lado && window.OktaCajon) {
            const cajon = window.OktaCajon(lado,
                document.querySelectorAll('[data-docs-side-open]'),
                document.querySelectorAll('[data-docs-side-close]'));
            const ancho = window.matchMedia('(min-width: 1025px)');
            const alCambiar = function () {
                if (ancho.matches) {
                    cajon.cerrar();
                }
            };
            if (ancho.addEventListener) {
                ancho.addEventListener('change', alCambiar);
            }
        }
    }

    /* ---------------------------- En esta página --------------------------- */

    // Mini índice a la derecha en pantallas anchas: sale de la tabla de
    // contenido de la página (.doc-toc) o, si no tiene, de sus títulos h2.
    const columna = document.querySelector('.docs-main-col');
    const disposicion = document.querySelector('.docs-layout');
    if (columna && disposicion) {
        let entradas = Array.prototype.slice.call(columna.querySelectorAll('.doc-toc ol > li > a[href^="#"]'))
            .map(function (a) { return { id: a.getAttribute('href').slice(1), texto: a.textContent.trim() }; });
        if (!entradas.length) {
            entradas = Array.prototype.slice.call(columna.querySelectorAll('.doc-section > h2, .docs-block h2[id]'))
                .map(function (h) {
                    // Un título sin ancla (los artículos) recibe una derivada
                    // de su texto; las anclas existentes no se tocan.
                    if (!h.id && !h.parentNode.id) {
                        const base = plano(h.textContent).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
                        let id = base || 'seccion';
                        let n = 2;
                        while (document.getElementById(id)) {
                            id = base + '-' + n;
                            n += 1;
                        }
                        h.id = id;
                    }
                    const id = h.parentNode.id || h.id;
                    return { id: id, texto: h.textContent.trim() };
                });
        }
        entradas = entradas.filter(function (e) { return e.id && document.getElementById(e.id); });
        if (entradas.length > 1) {
            const lista = el('ul', {}, entradas.map(function (e) {
                return el('li', { 'data-onpage': e.id }, [el('a', { href: '#' + e.id, text: e.texto })]);
            }));
            disposicion.appendChild(el('aside', { class: 'docs-onpage no-print', 'aria-label': 'En esta página' }, [
                el('p', { class: 'docs-onpage-title', text: 'En esta página' }),
                lista
            ]));
            disposicion.classList.add('has-onpage');
            const objetivos = entradas.map(function (e) { return document.getElementById(e.id); });
            let pendiente = false;
            const resaltar = function () {
                pendiente = false;
                const limite = 120;
                let actual = objetivos[0];
                objetivos.forEach(function (o) {
                    if (o.getBoundingClientRect().top <= limite) {
                        actual = o;
                    }
                });
                if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
                    actual = objetivos[objetivos.length - 1];
                }
                lista.querySelectorAll('li').forEach(function (li) {
                    li.classList.toggle('is-active', li.dataset.onpage === actual.id);
                });
            };
            window.addEventListener('scroll', function () {
                if (!pendiente) {
                    pendiente = true;
                    window.requestAnimationFrame(resaltar);
                }
            }, { passive: true });
            resaltar();
        }
    }

    /* ------------------------------- Paginador ----------------------------- */

    const paginador = document.querySelector('[data-docs-pager]');
    // En la página propia de un documento (curso, ficha, artículo) el
    // paginador recorre los documentos de SU sección; en las páginas de
    // sección, las secciones con página.
    const delDocumento = (function () {
        for (let i = 0; i < sections.length; i += 1) {
            const docs = sections[i].docs.filter(function (d) { return d.href; });
            const idx = docs.map(function (d) { return d.href; }).indexOf(page);
            if (idx >= 0) {
                return { section: sections[i], docs: docs, idx: idx };
            }
        }
        return null;
    })();
    if (paginador && delDocumento) {
        const docs = delDocumento.docs;
        const ant = docs[delDocumento.idx - 1];
        const sig = docs[delDocumento.idx + 1];
        paginador.appendChild(el('a', { href: ant ? ruta(ant.href) : sectionHref(delDocumento.section) }, [
            el('span', { text: 'Anterior' }),
            el('strong', { text: ant ? ant.title : delDocumento.section.title })
        ]));
        if (sig) {
            paginador.appendChild(el('a', { href: ruta(sig.href), class: 'is-next' }, [
                el('span', { text: 'Siguiente' }),
                el('strong', { text: sig.title })
            ]));
        }
    } else if (paginador) {
        const orden = sections
            .filter(function (s) { return s.page.indexOf('#') < 0; })
            .map(function (s) { return { title: s.title, page: s.page }; });
        const indiceActual = orden.map(function (o) { return o.page; }).indexOf(page);
        const anterior = indiceActual > 0 ? orden[indiceActual - 1] : { title: 'Inicio del portal', page: data.homePage };
        const siguiente = indiceActual >= 0 && indiceActual < orden.length - 1 ? orden[indiceActual + 1] : null;
        paginador.appendChild(el('a', { href: ruta(anterior.page) }, [
            el('span', { text: 'Anterior' }),
            el('strong', { text: anterior.title })
        ]));
        if (siguiente) {
            paginador.appendChild(el('a', { href: ruta(siguiente.page), class: 'is-next' }, [
                el('span', { text: 'Siguiente' }),
                el('strong', { text: siguiente.title })
            ]));
        }
    }

    /* ------------------------- Referencia de datos ------------------------- */

    document.querySelectorAll('[data-docs-fields]').forEach(function (contenedor) {
        const table = (data.fieldTables || []).filter(function (t) { return t.id === contenedor.dataset.docsFields; })[0];
        if (!table) {
            return;
        }
        const columnas = ['Campo', 'Tipo', 'Obligatorio', 'Scope', 'Fuente', 'Descripción'];
        const claves = ['campo', 'tipo', 'obligatorio', 'scope', 'fuente', 'descripcion'];
        const cuerpo = el('tbody');
        table.rows.forEach(function (fila) {
            cuerpo.appendChild(el('tr', {}, claves.map(function (clave, i) {
                const valor = fila[clave] || '';
                if (i === 0) {
                    return el('td', {}, [el('code', { text: valor })]);
                }
                if (clave === 'descripcion') {
                    return el('td', { html: valor });
                }
                return el('td', { text: valor });
            })));
        });
        const tabla = el('table', { class: 'doc-table docs-fields' }, [
            el('thead', {}, [el('tr', {}, columnas.map(function (c) { return el('th', { scope: 'col', text: c }); }))]),
            cuerpo
        ]);
        const vacio = el('p', { class: 'docs-fields-empty', hidden: true, text: 'Ningún campo coincide con el filtro.' });
        const salida = el('output', { text: table.rows.length + ' campos' });
        const filtro = el('input', {
            type: 'search',
            placeholder: 'Filtrar campos de ' + table.title.toLowerCase() + '…',
            'aria-label': 'Filtrar campos de ' + table.title
        });
        filtro.addEventListener('input', function () {
            const q = plano(filtro.value);
            let visibles = 0;
            Array.prototype.forEach.call(cuerpo.rows, function (tr) {
                const coincide = !q || plano(tr.textContent).indexOf(q) !== -1;
                tr.hidden = !coincide;
                if (coincide) {
                    visibles += 1;
                }
            });
            salida.textContent = visibles + ' de ' + table.rows.length + ' campos';
            vacio.hidden = visibles > 0;
        });
        contenedor.appendChild(el('div', { class: 'docs-fields-filter no-print' }, [filtro, salida]));
        contenedor.appendChild(el('div', { class: 'doc-table-wrap' }, [tabla, vacio]));
    });
}());
