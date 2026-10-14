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

    /* ----------------------- Barra lateral y paginador --------------------- */

    const lateral = document.querySelector('[data-docs-tree]');
    if (lateral) {
        const arbol = el('ul', { class: 'docs-tree' });
        arbol.appendChild(el('li', {}, [
            el('a', { href: ruta(data.homePage) }, [icon('home'), 'Inicio del portal'])
        ]));
        sections.forEach(function (section) {
            const propia = section.docs.some(function (doc) { return doc.href && doc.href === page; });
            const esActual = section.page === page || propia;
            const hijos = el('ul', {}, section.docs.map(function (doc) {
                const aqui = Boolean(doc.href) && doc.href === page;
                return el('li', { 'data-doc': doc.id, class: aqui ? 'is-active' : null }, [
                    el('a', { href: docHref(section, doc), 'aria-current': aqui ? 'page' : null }, [doc.title, badge(doc.status)])
                ]);
            }));
            arbol.appendChild(el('li', { class: esActual ? 'is-current' : null }, [
                el('a', { href: sectionHref(section) }, [icon(section.icon), section.title]),
                hijos
            ]));
        });
        lateral.appendChild(arbol);

        // Al desplazarse, el documento visible se marca en el árbol.
        const anclas = Array.prototype.slice.call(document.querySelectorAll('.doc-section[id]'));
        const marcar = function (id) {
            arbol.querySelectorAll('li[data-doc]').forEach(function (li) {
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

        // En pantallas chicas el árbol se pliega bajo un botón.
        const cuerpo = lateral.closest('.docs-side-body');
        const boton = document.querySelector('.docs-side-toggle');
        if (cuerpo && boton) {
            const mq = window.matchMedia('(max-width: 960px)');
            const ajustar = function () {
                const chico = mq.matches;
                boton.setAttribute('aria-expanded', String(!chico));
                cuerpo.hidden = chico;
            };
            boton.addEventListener('click', function () {
                const abierto = boton.getAttribute('aria-expanded') === 'true';
                boton.setAttribute('aria-expanded', String(!abierto));
                cuerpo.hidden = abierto;
            });
            if (mq.addEventListener) {
                mq.addEventListener('change', ajustar);
            }
            ajustar();
        }
    }

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
