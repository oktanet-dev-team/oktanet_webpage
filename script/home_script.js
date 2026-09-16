(function () {
    const body = document.body;
    const brandLink = document.querySelector('.brand');
    const navShell = document.querySelector('.nav-shell');
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.main-nav a');
    const navCta = document.querySelector('.nav-cta');
    const contactForm = document.querySelector('.contact-form');
    const languageDropdown = document.querySelector('.language-dropdown');
    const langToggle = document.querySelector('.lang-toggle');
    const langMenu = document.getElementById('lang-menu');
    const langCode = document.querySelector('.lang-code');
    const langOptions = document.querySelectorAll('.lang-option');
    const metaDescription = document.querySelector('meta[name="description"]');
    const currentYear = document.getElementById('current-year');
    const footerLinks = document.querySelectorAll('.footer-links a');
    const copyrightText = document.getElementById('copyright-text');
    const trustStrip = document.querySelector('.trust-strip');
    const showcaseSectionEl = document.querySelector('.showcase-section');
    const featureFocusSectionEl = document.querySelector('.feature-focus-section');
    const metricsSectionLabelEl = document.querySelector('.metrics-section');
    const licensingSectionEl = document.querySelector('.licensing-section');
    const resourcesSectionEl = document.querySelector('.resources-section');
    const resourcePdfLink = document.querySelector('.resource-actions [data-resource="pdf"]');
    const resourceOnlineLink = document.querySelector('.resource-actions [data-resource="online"]');
    const brandImage = document.querySelector('.brand img');
    const brandWordmark = document.querySelector('.brand-wordmark');
    const heroImage = document.querySelector('.hero-visual img');
    const platformImage = document.querySelector('.platform-visual img');
    const serviceIcons = document.querySelectorAll('.services-grid .service-card .service-icon');
    const showcaseImages = document.querySelectorAll('.showcase-grid img');
    const licensingTableHeadRow = document.querySelector('.licensing-table thead tr');
    const licensingTableBody = document.querySelector('.licensing-table tbody');
    const footerLogo = document.querySelector('.footer-brand img');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const globalAnimationDelayMs = 140;
    const storageKey = 'oktanet-language';
    const formSubmittedStorageKey = 'oktanet-contact-form-submitted';

    const setText = function (element, text) {
        if (element && typeof text === 'string') {
            element.textContent = text;
        }
    };

    const setTextList = function (elements, texts) {
        if (!elements || !texts) {
            return;
        }

        elements.forEach(function (element, index) {
            if (typeof texts[index] === 'string') {
                element.textContent = texts[index];
            }
        });
    };

    const setAltList = function (elements, texts) {
        if (!elements || !texts) {
            return;
        }

        elements.forEach(function (element, index) {
            if (typeof texts[index] === 'string') {
                element.alt = texts[index];
            }
        });
    };

    const setServiceIconLabels = function (elements, texts) {
        if (!elements || !texts) {
            return;
        }

        elements.forEach(function (element, index) {
            if (typeof texts[index] !== 'string') {
                return;
            }

            if (element.tagName === 'IMG') {
                element.alt = texts[index];
                return;
            }

            element.setAttribute('role', 'img');
            element.setAttribute('aria-label', texts[index]);
        });
    };

    const escapeHtml = function (value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    const licensingHoverCard = licensingTableBody ? document.createElement('div') : null;
    let activeLicensingTrigger = null;

    if (licensingHoverCard) {
        licensingHoverCard.className = 'licensing-hover-card';
        licensingHoverCard.setAttribute('role', 'tooltip');
        body.appendChild(licensingHoverCard);
    }

    const hideLicensingHoverCard = function () {
        if (!licensingHoverCard) {
            return;
        }

        licensingHoverCard.classList.remove('is-visible');
        activeLicensingTrigger = null;
    };

    const positionLicensingHoverCard = function (trigger) {
        if (!licensingHoverCard || !trigger) {
            return;
        }

        const rect = trigger.getBoundingClientRect();
        const viewportPadding = 16;
        let left = rect.left;
        let top = rect.bottom + 12;

        licensingHoverCard.style.left = '0px';
        licensingHoverCard.style.top = '0px';
        licensingHoverCard.classList.add('is-visible');

        const tooltipRect = licensingHoverCard.getBoundingClientRect();

        if (left + tooltipRect.width > window.innerWidth - viewportPadding) {
            left = window.innerWidth - tooltipRect.width - viewportPadding;
        }

        if (left < viewportPadding) {
            left = viewportPadding;
        }

        if (top + tooltipRect.height > window.innerHeight - viewportPadding) {
            top = rect.top - tooltipRect.height - 12;
        }

        if (top < viewportPadding) {
            top = viewportPadding;
        }

        licensingHoverCard.style.left = left + 'px';
        licensingHoverCard.style.top = top + 'px';
    };

    const showLicensingHoverCard = function (trigger) {
        if (!licensingHoverCard || !trigger) {
            return;
        }

        const description = trigger.getAttribute('data-licensing-description');

        if (!description) {
            hideLicensingHoverCard();
            return;
        }

        activeLicensingTrigger = trigger;
        licensingHoverCard.textContent = description;
        positionLicensingHoverCard(trigger);
    };

    const renderLicensingStatus = function (isIncluded, includedLabel, unavailableLabel, includedMark, unavailableMark) {
        return '<span class="license-status ' + (isIncluded ? 'is-included' : 'is-unavailable') + '" aria-label="' + (isIncluded ? includedLabel : unavailableLabel) + '"><span aria-hidden="true">' + (isIncluded ? includedMark : unavailableMark) + '</span></span>';
    };

    const renderLicensingTable = function (copy) {
        if (!licensingTableHeadRow || !licensingTableBody || !copy.licensingHeaders || !copy.licensingRows) {
            return;
        }

        licensingTableHeadRow.innerHTML = copy.licensingHeaders.map(function (header) {
            return '<th scope="col">' + header + '</th>';
        }).join('');

        licensingTableBody.innerHTML = copy.licensingRows.map(function (row, index) {
            const rowClasses = ['licensing-table-main'];

            if (row.advanced) {
                rowClasses.push('licensing-row-advanced');
            }

            if (index % 2 === 1) {
                rowClasses.push('is-even');
            }

            // Las columnas salen de `row.plans`, no de campos fijos `core`/`pro`:
            // el modelo de licenciamiento cambio una vez y va a volver a cambiar.
            const plans = Array.isArray(row.plans) ? row.plans : [];

            return '<tr class="' + rowClasses.join(' ') + '">' +
                '<th scope="row" class="licensing-table-module"><button type="button" class="licensing-module-trigger" data-licensing-description="' + escapeHtml(row.description) + '">' + escapeHtml(row.module) + '</button></th>' +
                plans.map(function (included) {
                    return '<td class="licensing-table-status">' + renderLicensingStatus(included, copy.licensingIncludedLabel, copy.licensingUnavailableLabel, copy.licensingIncludedMark, copy.licensingUnavailableMark) + '</td>';
                }).join('') +
                '</tr>';
        }).join('');
        hideLicensingHoverCard();
    };

    const translations = {
        es: {
            htmlLang: 'es',
            title: 'Oktavia 2.0 — Automatización de redes multivendor | Oktanet',
            metaDescription: 'Oktavia 2.0 automatiza descubrimiento, cumplimiento, seguridad y remediación verificada en redes multivendor: detecta la desviación, propone el cambio, lo aplica con aprobación y confirma que cerró.',
            brandAria: 'Ir al inicio',
            navAria: 'Principal',
            navToggleOpen: 'Abrir menú',
            navToggleClose: 'Cerrar menú',
            navLinks: ['Plataforma', 'Servicios', 'Metodología', 'Casos de uso', 'Quiénes somos', 'Licencias', 'Recursos'],
            navCta: 'Solicitar demostración',
            langToggleAria: 'Cambiar idioma',
            langCode: 'ES',
            brandLogoAlt: 'Logo de Oktanet',
            langOptionLabels: {
                es: 'Español',
                en: 'English'
            },
            trustAria: 'Tecnologías compatibles',
            showcaseAria: 'Paneles de ejemplo',
            featureFocusAria: 'Capacidades destacadas',
            metricsAria: 'Impacto operativo',
            metricsEyebrow: 'Impacto medible',
            metricsTitle: 'Resultados operativos desde las primeras iteraciones de adopción.',
            metricsIntro: 'Métricas de referencia en equipos que migran de procesos manuales a flujos controlados con artefactos.',
            heroEyebrow: 'Oktavia 2.0 · Automatización de redes segura y auditable',
            heroTitle: 'De detectar la desviación a remediarla verificada, sin salir de una sola plataforma.',
            heroBody: 'Oktavia es una plataforma de automatización para redes multivendor. Descubre la red, verifica que cumpla tu estándar, propone el cambio contra la intención declarada y, con tu aprobación, lo aplica y confirma que el hallazgo cerró.',
            heroActions: ['Solicitar una demostración', 'Descargar el data sheet'],
            heroPoints: [
                'Ningún cambio llega a la red sin que una persona lo apruebe: primero se genera la configuración deseada y se revisa el diff contra lo activo.',
                'Cada ejecución deja artefactos descargables y versionables (JSON, CSV, CFG) y queda registrada en el historial de trabajos.',
                'El ciclo completo usa la primitiva segura de cada fabricante: commit confirmed en Junos, operaciones CMDB en FortiGate, diff y verificación en IOS y FortiSwitch.'
            ],
            trustLabel: 'Compatible con infraestructura multifabricante:',
            platformEyebrow: 'Producto principal',
            platformTitle: 'Oktavia 2.0: motor de automatización, interfaz web y ChatOps para operar la red con control continuo.',
            platformBody: 'Oktavia integra descubrimiento multifabricante, cumplimiento por sitio, rol o dispositivo, configuración deseada, seguridad de red y remediación verificada en una sola consola. Argos, el asistente de ChatOps, atraviesa todos los módulos y declara en cada acción si consume el modelo de IA o si se resuelve de forma determinista.',
            platformChips: [
                'Ciclo cerrado con aprobación',
                'ChatOps con el costo de IA a la vista',
                'Artefactos versionables',
                'Multi-tenant',
                'API REST con clave de API'
            ],
            servicesEyebrow: 'Capacidades de la plataforma',
            servicesTitle: 'Quince módulos para descubrir, verificar, remediar y dar de alta servicios nuevos.',
            serviceTitles: [
                'Descubrimiento multifabricante',
                'Inventario de red',
                'Topología y trazado de rutas',
                'Cumplimiento de configuración',
                'Configuración deseada por alcance',
                'Ciclo cerrado de remediación',
                'Alta de servicios nuevos',
                'Argos, ChatOps de red',
                'Seguridad de red',
                'Inventario de servicios',
                'Gemelo digital',
                'Análisis de políticas de firewall',
                'Inteligencia IP (IPAM)',
                'Reportes avanzados',
                'Telemetría y automatización de eventos'
            ],
            serviceBodies: [
                'Recolecta y normaliza el estado de la red respetando el modelo de cada fabricante, en lugar de traducirlo todo a sintaxis Cisco.',
                'Centraliza equipos, sitios, roles, plataformas y metadatos, con filtros y exportación para que todo el equipo trabaje sobre la misma base.',
                'Mapa físico y de plano de control con LLDP, CDP, OSPF, BGP, STP y VRRP, más el camino real entre dos direcciones IP con ida y regreso.',
                'Verifica la red contra reglas editables por sitio, rol o dispositivo, y entrega hallazgos con severidad y las líneas de configuración que faltan.',
                'Genera la configuración desde plantillas y variables de servicio, con precedencia por sitio, plataforma, modelo, rol y equipo.',
                'Auditar, proponer, revisar el diff, aprobar, aplicar y volver a auditar para confirmar que el hallazgo cerró. Con artefacto y vuelta atrás.',
                'Túneles entre sitios, publicación de una red en OSPF y BGP, o DHCP por VLAN. Cada servicio se propone, se edita y trae su rollback.',
                'Se le pregunta en lenguaje natural y responde con datos de la red. Cada acción declara antes de pulsarla si consume IA o si es determinista.',
                'Postura calculada sobre la configuración real en cuatro dominios: perímetro, gestión, identidades y segmentación, con la evidencia de cada hallazgo.',
                'Responde qué hay configurado en cada equipo y cuánto de eso está declarado como intención, para cerrar los puntos ciegos sin tocar la red.',
                'Compara la configuración deseada contra la activa, detecta desvíos y sostiene el diff que se aprueba antes de cualquier cambio.',
                'Qué política decide un flujo en cada salto, con su NAT y su registro. Si un objeto no se puede resolver lo dice, en vez de afirmar que bloquea.',
                'Mapa de direccionamiento, subredes detectadas, solapamientos y la ubicación de una IP hasta el puerto de acceso cruzando ARP con la tabla MAC.',
                'Salud de red, riesgo de configuración, desvíos, capacidad y puertos, en reportes descargables listos para auditoría.',
                'Métricas en tiempo real y reglas que reaccionan solas ante caídas de BGP u OSPF y umbrales de CPU. Se licencia por separado.'
            ],
            showcaseTitle: 'Interfaz pensada para operar flujos complejos con una experiencia simple.',
            showcaseIntro: 'Desde cumplimiento y configuración deseada hasta topología, enrutamiento, seguridad e inteligencia de IP, cada módulo produce resultados accionables.',
            showcaseCaptions: [
                'Cumplimiento por dominio, sitio y criticidad con reglas y pruebas editables.',
                'Inventario técnico consolidado con trazabilidad de software, hardware y metadatos.',
                'Topología física y plano de control, con vistas de enrutamiento (BGP/OSPF) para análisis de impacto.'
            ],
            featureFocusEyebrow: 'Capacidades destacadas',
            featureFocusTitle: 'Ciclo cerrado, servicios nuevos y ChatOps: lo que separa a Oktavia de una herramienta de auditoría.',
            featureFocusIntro: 'Encontrar un problema no sirve si corregirlo sigue siendo manual, y aplicar un cambio a ciegas no sirve si nadie verifica que quedó bien.',
            featureFocusTitles: [
                'Ciclo cerrado de remediación verificada',
                'Servicios nuevos, no sólo correcciones',
                'Argos: ChatOps con el costo de la IA a la vista'
            ],
            featureFocusBodies: [
                'Auditar, proponer contra la intención declarada, revisar el diff en el Gemelo Digital, aprobar, aplicar con la primitiva segura del fabricante y volver a auditar para confirmar que cerró.',
                'El mismo ciclo da de alta un túnel entre sitios, publica una red en OSPF y BGP o levanta DHCP en una VLAN, siempre con su rollback y con aprobación previa.',
                'La mayoría de las consultas no consumen el modelo: son cálculos reproducibles sobre datos ya recolectados. Cada acción lleva su marca antes de pulsarla.'
            ],
            methodEyebrow: 'Modelo de ejecución',
            methodTitle: 'Operación basada en tareas asíncronas, artefactos, aprobación y verificación.',
            methodTitles: ['Descubrimiento', 'Cumplimiento', 'Configuración deseada', 'Aprobación y verificación'],
            methodBodies: [
                'Recolectamos y normalizamos el estado de la red por sitio y dispositivo para construir una línea base confiable.',
                'Ejecutamos pruebas contra reglas editables para identificar desvíos, priorizarlos por severidad y ubicar la evidencia de cada uno.',
                'Generamos la configuración deseada y su diff contra lo activo, con artefactos versionables, antes de cualquier cambio en la red.',
                'Una persona aprueba, Oktavia aplica con la primitiva segura del fabricante y vuelve a auditar para confirmar que el hallazgo cerró.'
            ],
            casesEyebrow: 'Casos de uso',
            casesTitle: 'Aplicaciones reales en operación de redes empresariales.',
            caseTitles: [
                'Auditorías de cumplimiento',
                'Remediación verificada',
                'Alta de servicios nuevos',
                'Seguridad de red',
                'Análisis de flujos y rutas',
                'Adopción de lo existente'
            ],
            caseBodies: [
                'Evalúa cumplimiento por sitio, rol o dispositivo en minutos, con evidencia exportable para auditoría o licitación.',
                'Corrige una desviación de punta a punta: proponer, aprobar, aplicar y verificar que cerró, sin salir de la herramienta.',
                'Levanta un túnel entre dos sitios con sus rutas, o publica una red nueva en OSPF y BGP con verificación por ping incluida.',
                'Postura de firewalls y switches con la línea de configuración que sustenta cada hallazgo y la corrección en CLI del fabricante.',
                'Traza el camino entre dos direcciones IP con ida y regreso, y qué política de firewall decide el flujo en cada salto.',
                'Declara como intención la configuración que un equipo ya tiene, para empezar a auditarla sin rediseñar nada.'
            ],
            metricsBodies: [
                'menos tiempo en revisiones manuales de cumplimiento y configuración.',
                'más visibilidad sobre desvíos de configuración por sitio, rol y dispositivo.',
                'menos tareas repetitivas con tareas programadas y artefactos descargables.',
                'capacidad de operación trazable 24/7 con validación y aprobación previa.'
            ],
            aboutEyebrow: 'Arquitectura y enfoque',
            aboutTitle: 'Automatización segura, auditable y extensible para entornos multifabricante.',
            aboutParagraphs: [
                'Oktavia no busca reemplazar un NMS de monitoreo en tiempo real. Su foco es estandarizar descubrimiento, cumplimiento y configuración deseada, y cerrar el ciclo hasta la remediación verificada con un modelo de ejecución controlado y trazable.',
                'La arquitectura separa la interfaz web y el motor de automatización para facilitar despliegues simples y evolución a servicios externos sin perder compatibilidad de API ni trazabilidad de artefactos.'
            ],
            aboutCardTitles: [
                'Extensibilidad por fabricante',
                'Control y visibilidad en la automatización',
                'Dos licencias, sin ediciones recortadas'
            ],
            aboutCardBodies: [
                'Cada fabricante se integra con adaptador de descubrimiento, normalizador, reglas de cumplimiento y plantillas Jinja.',
                'Prioriza remediación supervisada con aprobación, evitando automatizaciones opacas y no auditables.',
                'Oktavia Pro incluye la plataforma completa. La telemetría continua y la orquestación de eventos se licencian aparte por su perfil de consumo.'
            ],
            licensingAria: 'Licenciamiento Oktavia',
            licensingEyebrow: 'Licenciamiento',
            licensingTitle: 'Dos licencias, no tres ediciones',
            licensingIntro: 'Oktavia Pro es la plataforma completa. La telemetría continua y el motor de eventos se licencian aparte porque almacenan series de tiempo y corren un evaluador permanente, y no toda red los necesita desde el día uno.',
            licensingPlanLabels: [],
            licensingPlanTitles: [],
            licensingPlanBodies: [],
            licensingHeaders: ['Módulo Oktavia', 'Oktavia Pro', 'Telemetría y Eventos'],
            licensingIncludedLabel: 'Incluido',
            licensingUnavailableLabel: 'No incluido',
            licensingIncludedMark: '✓',
            licensingUnavailableMark: '—',
            licensingRows: [
                {
                    module: 'Auditoría del estado de red',
                    description: 'Análisis integral del estado actual de la red en minutos: inventario, conectividad, configuración y cumplimiento desde una sola operación.',
                    plans: [true, false]
                },
                {
                    module: 'Inventario de red',
                    description: 'Inventario dinámico multifabricante con filtros por sitio, rol, plataforma, fabricante, modelo y metadatos.',
                    plans: [true, false]
                },
                {
                    module: 'Topología y trazado de rutas',
                    description: 'Mapa interactivo con vistas física, de plano de control y de enrutamiento (LLDP, CDP, OSPF, EIGRP, BGP, STP, VRRP), más el camino real entre dos direcciones IP con ida y regreso.',
                    plans: [true, false]
                },
                {
                    module: 'Cumplimiento de configuración',
                    description: 'Verificación contra reglas y pruebas editables por sitio, rol o dispositivo, con severidad, evidencia y diagnóstico.',
                    plans: [true, false]
                },
                {
                    module: 'Configuración deseada por alcance',
                    description: 'Generación desde plantillas y variables de servicio, con precedencia por sitio, tipo de sitio, plataforma, modelo, rol y equipo.',
                    plans: [true, false]
                },
                {
                    module: 'Ciclo cerrado de remediación',
                    description: 'Auditar, proponer el cambio contra la intención declarada, revisar el diff, aprobar, aplicar con la primitiva segura del fabricante y volver a auditar para confirmar que el hallazgo cerró.',
                    plans: [true, false]
                },
                {
                    module: 'Alta de servicios nuevos',
                    description: 'El mismo ciclo para dar de alta servicios: túneles entre sitios, publicación de una red en OSPF y BGP, DHCP por VLAN, cada uno con su rollback.',
                    plans: [true, false]
                },
                {
                    module: 'Argos — ChatOps de red',
                    description: 'Asistente en lenguaje natural integrado en todas las pantallas. Cada acción declara antes de pulsarla si consume el modelo de IA o si se resuelve de forma determinista.',
                    plans: [true, false]
                },
                {
                    module: 'Seguridad de red',
                    description: 'Postura de seguridad calculada sobre la configuración recolectada en cuatro dominios: perímetro, plano de gestión, identidades y segmentación, con la evidencia de cada hallazgo.',
                    plans: [true, false]
                },
                {
                    module: 'Inventario de servicios',
                    description: 'Qué hay configurado en cada equipo y cuánto de eso está declarado como intención, clasificado en cubierto, punto ciego, sin aplicar e inaplicable.',
                    plans: [true, false]
                },
                {
                    module: 'Análisis de políticas de firewall',
                    description: 'Qué política decide un flujo en cada salto, con su NAT y su registro. Un objeto que no se puede resolver se reporta como indeterminado, nunca como bloqueo.',
                    plans: [true, false]
                },
                {
                    module: 'Gemelo digital',
                    description: 'Capturas del estado de la red, comparación de configuración deseada contra activa y detección de desvíos de configuración.',
                    plans: [true, false]
                },
                {
                    module: 'Respaldos de configuración',
                    description: 'Visualización, comparación y descarga de archivos de configuración por dispositivo y fecha.',
                    plans: [true, false]
                },
                {
                    module: 'Inteligencia IP (IPAM)',
                    description: 'Mapa de direccionamiento, subredes detectadas, solapamientos, vecinos de enrutamiento y ubicación de una IP hasta el puerto de acceso.',
                    plans: [true, false]
                },
                {
                    module: 'Reportes avanzados',
                    description: 'Salud de red, riesgo de configuración, desvíos, capacidad, puertos y topología, en reportes descargables listos para auditoría.',
                    plans: [true, false]
                },
                {
                    module: 'Provisioning y gestión de sitios',
                    description: 'Estructura lógica de tipos de sitio, sitios y roles definida antes del primer descubrimiento.',
                    plans: [true, false]
                },
                {
                    module: 'Operaciones y auditorías programadas',
                    description: 'Ejecución y programación de auditorías, descubrimiento, sincronización de inventario y validaciones de conectividad, con historial de trabajos y artefactos.',
                    plans: [true, false]
                },
                {
                    module: 'FinOps',
                    description: 'Calculadora de retorno de inversión de la automatización y análisis de ahorro operativo.',
                    plans: [true, false]
                },
                {
                    module: 'Gestión multi-tenant',
                    description: 'Multi-organización, gestión de usuarios y separación de datos por tenant.',
                    plans: [true, false]
                },
                {
                    module: 'Telemetría en tiempo real',
                    description: 'Métricas SNMP y de streaming (CPU, memoria, interfaces) almacenadas como series de tiempo, con visualización temporal y umbrales.',
                    plans: [false, true],
                    advanced: true
                },
                {
                    module: 'Dashboards de telemetría y Grafana',
                    description: 'Tableros de telemetría propios; la base de series de tiempo de Oktavia es datasource directo de Grafana, sin ETL adicional.',
                    plans: [false, true],
                    advanced: true
                },
                {
                    module: 'Motor de automatización de eventos',
                    description: 'Reglas condición→acción que reaccionan solas ante caídas de BGP u OSPF, interfaces abajo y umbrales de CPU, memoria, temperatura o errores.',
                    plans: [false, true],
                    advanced: true
                }
            ],
            resourcesAria: 'Recursos y documentación de Oktavia',
            resourcesEyebrow: 'Recursos',
            resourcesTitle: 'Documentación abierta para evaluar Oktavia sin pedir permiso.',
            resourcesIntro: 'El data sheet reúne módulos, cobertura por fabricante, integraciones, licenciamiento y tiempos de implementación en un documento que se puede leer en línea o descargar.',
            resourceCardTitle: 'Data sheet de Oktavia 2.0',
            resourceCardBody: 'Documento comercial y técnico de la plataforma: los quince módulos con su alcance, las siete categorías de valor, cobertura y acceso por fabricante, integraciones con el ecosistema, el modelo de dos licencias, casos de uso y el proceso de implementación con sus tiempos estimados.',
            resourceCardMeta: 'PDF · Español e inglés · Actualizado en 2026',
            resourceActions: ['Ver en línea', 'Descargar PDF', 'Ver toda la documentación'],
            resourceUpcomingLabel: 'En preparación:',
            resourceUpcoming: ['Guía de network automation', 'Catálogo de servicios', 'Guía de integración multifabricante'],
            resourcePdfHref: 'docs/oktavia-2.0-datasheet-es.pdf',
            resourceOnlineHref: 'docs/datasheet.html',
            contactEyebrow: 'Conversemos',
            contactTitle: 'Evalúa Oktavia en un entorno controlado y orientado a resultados.',
            contactBody: 'Comparte tu contexto técnico para diseñar un inicio rápido de descubrimiento, cumplimiento y generación de configuraciones en tu entorno actual.',
            officeTitle: 'Oficina principal',
            officeLines: ['Torre de Oficinas, Downtown Reforma', 'Ciudad de México'],
            formLabels: ['Nombre completo', 'Correo electrónico', 'Empresa', '¿Qué deseas resolver?'],
            submitButton: 'Enviar solicitud',
            footerTagline: 'Oktavia: automatización inteligente para redes empresariales.',
            copyright: 'Todos los derechos reservados.',
            heroImageAlt: 'Tablero principal de monitoreo y auditoría de red',
            platformImageAlt: 'Vista de cumplimiento de configuración en Oktavia',
            serviceIconAlts: [
                'Icono de visibilidad de red',
                'Icono de inventario',
                'Icono de topología en grafo',
                'Icono de cumplimiento de configuración',
                'Icono de generación de configuración',
                'Icono de ciclo cerrado de remediación',
                'Icono de alta de servicio',
                'Icono de conversación',
                'Icono de seguridad de red',
                'Icono de inventario de servicios',
                'Icono de gemelo digital',
                'Icono de política de firewall',
                'Icono de direccionamiento IP',
                'Icono de reportes',
                'Icono de telemetría'
            ],
            showcaseImageAlts: [
                'Tablero de cumplimiento general',
                'Tablero de inventario',
                'Tablero de topología'
            ],
            footerLogoAlt: 'Símbolo de Oktanet'
        },
        en: {
            htmlLang: 'en',
            title: 'Oktavia 2.0 — Multi-vendor network automation | Oktanet',
            metaDescription: 'Oktavia 2.0 automates discovery, compliance, security, and verified remediation across multi-vendor networks: it finds the deviation, proposes the change, applies it with approval, and confirms the finding closed.',
            brandAria: 'Back to top',
            navAria: 'Main',
            navToggleOpen: 'Open menu',
            navToggleClose: 'Close menu',
            navLinks: ['Platform', 'Services', 'Methodology', 'Use Cases', 'About us', 'Licensing', 'Resources'],
            navCta: 'Request Demo',
            langToggleAria: 'Change language',
            langCode: 'EN',
            brandLogoAlt: 'Oktanet logo',
            langOptionLabels: {
                es: 'Spanish',
                en: 'English'
            },
            trustAria: 'Compatible technologies',
            showcaseAria: 'Sample dashboards',
            featureFocusAria: 'Highlighted capabilities',
            metricsAria: 'Operational impact',
            metricsEyebrow: 'Measurable impact',
            metricsTitle: 'Operational outcomes from the first adoption cycles.',
            metricsIntro: 'Reference metrics from teams moving from manual processes to controlled artifact-based workflows.',
            heroEyebrow: 'Oktavia 2.0 · Secure and auditable network automation',
            heroTitle: 'From spotting the deviation to verified remediation, without leaving one platform.',
            heroBody: 'Oktavia is an automation platform for multi-vendor networks. It discovers the network, checks it against your standard, proposes the change against declared intent and, once you approve, applies it and confirms the finding closed.',
            heroActions: ['Request a Demo', 'Download the data sheet'],
            heroPoints: [
                'No change reaches the network without a person approving it: the desired configuration is generated first and the diff against live config is reviewed.',
                'Every run leaves downloadable, versioned artifacts (JSON, CSV, CFG) and is recorded in the job history.',
                'The full cycle uses each vendor safe primitive: commit confirmed on Junos, CMDB operations on FortiGate, diff and verification on IOS and FortiSwitch.'
            ],
            trustLabel: 'Compatible with multi-vendor infrastructure:',
            platformEyebrow: 'Flagship product',
            platformTitle: 'Oktavia 2.0: automation engine, web UI, and ChatOps for continuous-control network operations.',
            platformBody: 'Oktavia unifies multi-vendor discovery, compliance by site, role, or device, desired configuration, network security, and verified remediation in one console. Argos, the ChatOps assistant, spans every module and states for each action whether it consumes the AI model or resolves deterministically.',
            platformChips: [
                'Closed loop with approval',
                'ChatOps with AI cost in plain sight',
                'Versioned artifacts',
                'Multi-tenant',
                'REST API with API key'
            ],
            servicesEyebrow: 'Platform capabilities',
            servicesTitle: 'Fifteen modules to discover, verify, remediate, and roll out new services.',
            serviceTitles: [
                'Multi-vendor discovery',
                'Network inventory',
                'Topology and path tracing',
                'Configuration compliance',
                'Scoped desired configuration',
                'Closed-loop remediation',
                'New service rollout',
                'Argos, network ChatOps',
                'Network security',
                'Service inventory',
                'Digital Twin',
                'Firewall policy analysis',
                'IP Intelligence (IPAM)',
                'Advanced reports',
                'Telemetry and event automation'
            ],
            serviceBodies: [
                'Collects and normalizes network state in each vendor own model, instead of translating everything into Cisco syntax.',
                'Centralizes devices, sites, roles, platforms, and metadata, with filters and export so the whole team works from the same baseline.',
                'Physical and control-plane map with LLDP, CDP, OSPF, BGP, STP, and VRRP, plus the live path between two IP addresses, forward and return.',
                'Checks the network against rules that are editable by site, role, or device, and returns findings with severity and the missing configuration lines.',
                'Generates configuration from templates and service vars, with precedence by site, platform, model, role, and device.',
                'Audit, propose, review the diff, approve, apply, and audit again to confirm the finding closed. With artifacts and a way back.',
                'Tunnels between sites, advertising a network in OSPF and BGP, or DHCP per VLAN. Every service is proposed, edited, and ships with its rollback.',
                'Ask in plain language and it answers with network data. Every action states, before you click it, whether it consumes AI or is deterministic.',
                'Posture computed on the collected configuration across four domains: perimeter, management plane, identities, and segmentation, with evidence for each finding.',
                'Answers what is configured on each device and how much of it is declared as intent, so blind spots close without touching the network.',
                'Compares desired configuration against live configuration, detects drift, and backs the diff that gets approved before any change.',
                'Which policy decides a flow at each hop, with its NAT and its logging. An object that cannot be resolved is reported as undetermined, never as a block.',
                'Addressing map, detected subnets, overlaps, and the location of an IP down to the access port by crossing ARP with the MAC table.',
                'Network health, configuration risk, drift, capacity, and ports, in downloadable reports ready for audit.',
                'Real-time metrics and rules that react on their own to BGP or OSPF drops and CPU thresholds. Licensed separately.'
            ],
            showcaseTitle: 'A UI designed for complex workflows with simple operation.',
            showcaseIntro: 'From compliance and desired configuration to topology, routing, security, and IP intelligence, each module produces actionable output.',
            showcaseCaptions: [
                'Compliance by domain, site, and criticality with editable rules and tests.',
                'Consolidated technical inventory with software, hardware, and metadata traceability.',
                'Physical/control-plane topology and routing views (BGP/OSPF) for impact analysis.'
            ],
            featureFocusEyebrow: 'Highlighted capabilities',
            featureFocusTitle: 'Closed loop, new services, and ChatOps: what sets Oktavia apart from an audit tool.',
            featureFocusIntro: 'Finding a problem is worthless if fixing it stays manual, and applying a change blind is worthless if nobody verifies it landed right.',
            featureFocusTitles: [
                'Verified closed-loop remediation',
                'New services, not just fixes',
                'Argos: ChatOps with the AI cost in plain sight'
            ],
            featureFocusBodies: [
                'Audit, propose against declared intent, review the diff in the Digital Twin, approve, apply with the vendor safe primitive, and audit again to confirm it closed.',
                'The same cycle rolls out a tunnel between sites, advertises a network in OSPF and BGP, or brings up DHCP on a VLAN, always with its rollback and prior approval.',
                'Most queries never touch the model: they are reproducible calculations over data already collected. Every action carries its mark before you click it.'
            ],
            methodEyebrow: 'Execution model',
            methodTitle: 'Operations based on async jobs, artifacts, approval, and verification.',
            methodTitles: ['Discovery', 'Compliance', 'Desired configuration', 'Approval and verification'],
            methodBodies: [
                'Collect and normalize network state by site and device to build a reliable operational baseline.',
                'Run tests against editable rules to identify deviations, rank them by severity, and pin down the evidence for each.',
                'Generate the desired configuration and its diff against live config, with versioned artifacts, before any network change.',
                'A person approves, Oktavia applies with the vendor safe primitive, and audits again to confirm the finding closed.'
            ],
            casesEyebrow: 'Use Cases',
            casesTitle: 'Real applications for enterprise network operations.',
            caseTitles: [
                'Compliance audits',
                'Verified remediation',
                'New service rollout',
                'Network security',
                'Flow and path analysis',
                'Adopting what already exists'
            ],
            caseBodies: [
                'Evaluate compliance by site, role, or device in minutes, with evidence exportable for audits or public tenders.',
                'Fix a deviation end to end: propose, approve, apply, and verify it closed, without leaving the tool.',
                'Bring up a tunnel between two sites with its routes, or advertise a new network in OSPF and BGP with ping verification included.',
                'Firewall and switch posture with the configuration line backing each finding and the fix in the vendor own CLI.',
                'Trace the path between two IP addresses, forward and return, and which firewall policy decides the flow at each hop.',
                'Declare the configuration a device already has as intent, so auditing can start without redesigning anything.'
            ],
            metricsBodies: [
                'less time spent on manual compliance and configuration reviews.',
                'more visibility into deviations and drift by site, role, and device.',
                'fewer repetitive tasks with scheduled jobs and downloadable artifacts.',
                '24/7 traceable operations with validation and approval gates.'
            ],
            aboutEyebrow: 'Architecture and approach',
            aboutTitle: 'Secure, auditable, and extensible automation for multi-vendor environments.',
            aboutParagraphs: [
                'Oktavia is not meant to replace real-time monitoring NMS platforms. Its focus is to standardize discovery, compliance, and desired configuration, and to close the loop through verified remediation with a controlled and traceable execution model.',
                'The architecture separates UI and Automation Engine to support simple deployments and evolution to external backends without losing API compatibility or artifact traceability.'
            ],
            aboutCardTitles: [
                'Vendor extensibility',
                'Control and visibility in automation',
                'Two licenses, no cut-down editions'
            ],
            aboutCardBodies: [
                'Each vendor is integrated through a discovery adapter, normalizer, compliance rule set, and Jinja templates.',
                'It prioritizes supervised remediation with approvals, avoiding opaque and non-auditable automation.',
                'Oktavia Pro includes the complete platform. Continuous telemetry and event orchestration are licensed separately because of their consumption profile.'
            ],
            licensingAria: 'Oktavia licensing',
            licensingEyebrow: 'Licensing',
            licensingTitle: 'Two licenses, not three editions',
            licensingIntro: 'Oktavia Pro is the complete platform. Continuous telemetry and the event engine are licensed separately because they store time series and run a permanent evaluator, and not every network needs them on day one.',
            licensingPlanLabels: [],
            licensingPlanTitles: [],
            licensingPlanBodies: [],
            licensingHeaders: ['Oktavia module', 'Oktavia Pro', 'Telemetry and Events'],
            licensingIncludedLabel: 'Included',
            licensingUnavailableLabel: 'Not included',
            licensingIncludedMark: '✓',
            licensingUnavailableMark: '—',
            licensingRows: [
                {
                    module: 'Network state audit',
                    description: 'End-to-end analysis of current network state in minutes: inventory, connectivity, configuration, and compliance from a single operation.',
                    plans: [true, false]
                },
                {
                    module: 'Network inventory',
                    description: 'Dynamic multi-vendor inventory with filters by site, role, platform, vendor, model, and metadata.',
                    plans: [true, false]
                },
                {
                    module: 'Topology and path tracing',
                    description: 'Interactive map with physical, control-plane, and routing views (LLDP, CDP, OSPF, EIGRP, BGP, STP, VRRP), plus the live path between two IP addresses, forward and return.',
                    plans: [true, false]
                },
                {
                    module: 'Configuration compliance',
                    description: 'Verification against rules and tests editable by site, role, or device, with severity, evidence, and diagnosis.',
                    plans: [true, false]
                },
                {
                    module: 'Scoped desired configuration',
                    description: 'Generation from templates and service vars, with precedence by site, site type, platform, model, role, and device.',
                    plans: [true, false]
                },
                {
                    module: 'Closed-loop remediation',
                    description: 'Audit, propose the change against declared intent, review the diff, approve, apply with the vendor safe primitive, and audit again to confirm the finding closed.',
                    plans: [true, false]
                },
                {
                    module: 'New service rollout',
                    description: 'The same cycle for rolling out services: tunnels between sites, advertising a network in OSPF and BGP, DHCP per VLAN, each with its rollback.',
                    plans: [true, false]
                },
                {
                    module: 'Argos — network ChatOps',
                    description: 'Plain-language assistant embedded in every screen. Each action states, before you click it, whether it consumes the AI model or resolves deterministically.',
                    plans: [true, false]
                },
                {
                    module: 'Network security',
                    description: 'Security posture computed on collected configuration across four domains: perimeter, management plane, identities, and segmentation, with evidence for each finding.',
                    plans: [true, false]
                },
                {
                    module: 'Service inventory',
                    description: 'What is configured on each device and how much of it is declared as intent, classified as covered, blind spot, not applied, or not applicable.',
                    plans: [true, false]
                },
                {
                    module: 'Firewall policy analysis',
                    description: 'Which policy decides a flow at each hop, with its NAT and its logging. An object that cannot be resolved is reported as undetermined, never as a block.',
                    plans: [true, false]
                },
                {
                    module: 'Digital Twin',
                    description: 'Network state snapshots, desired versus live configuration comparison, and configuration drift detection.',
                    plans: [true, false]
                },
                {
                    module: 'Configuration backups',
                    description: 'View, compare, and download configuration files by device and date.',
                    plans: [true, false]
                },
                {
                    module: 'IP Intelligence (IPAM)',
                    description: 'Addressing map, detected subnets, overlaps, routing neighbors, and the location of an IP down to the access port.',
                    plans: [true, false]
                },
                {
                    module: 'Advanced reports',
                    description: 'Network health, configuration risk, drift, capacity, ports, and topology, in downloadable reports ready for audit.',
                    plans: [true, false]
                },
                {
                    module: 'Provisioning and site management',
                    description: 'Logical structure of site types, sites, and roles defined before the first discovery run.',
                    plans: [true, false]
                },
                {
                    module: 'Operations and scheduled audits',
                    description: 'Running and scheduling audits, discovery, inventory sync, and connectivity validation, with job history and artifacts.',
                    plans: [true, false]
                },
                {
                    module: 'FinOps',
                    description: 'Automation return-on-investment calculator and operational savings analysis.',
                    plans: [true, false]
                },
                {
                    module: 'Multi-tenant management',
                    description: 'Multi-organization, user management, and per-tenant data separation.',
                    plans: [true, false]
                },
                {
                    module: 'Real-time telemetry',
                    description: 'SNMP and streaming metrics (CPU, memory, interfaces) stored as time series, with temporal visualization and thresholds.',
                    plans: [false, true],
                    advanced: true
                },
                {
                    module: 'Telemetry dashboards and Grafana',
                    description: 'Native telemetry dashboards; Oktavia time-series database is a direct Grafana datasource, with no extra ETL.',
                    plans: [false, true],
                    advanced: true
                },
                {
                    module: 'Event automation engine',
                    description: 'Condition-to-action rules that react on their own to BGP or OSPF drops, interfaces down, and CPU, memory, temperature, or error thresholds.',
                    plans: [false, true],
                    advanced: true
                }
            ],
            resourcesAria: 'Oktavia resources and documentation',
            resourcesEyebrow: 'Resources',
            resourcesTitle: 'Open documentation, so evaluating Oktavia never requires asking permission.',
            resourcesIntro: 'The data sheet gathers modules, per-vendor coverage, integrations, licensing, and implementation timelines into one document you can read online or download.',
            resourceCardTitle: 'Oktavia 2.0 data sheet',
            resourceCardBody: 'Commercial and technical document for the platform: the fifteen modules and their scope, the seven value categories, coverage and access method per vendor, ecosystem integrations, the two-license model, use cases, and the implementation process with estimated timelines.',
            resourceCardMeta: 'PDF · Spanish and English · Updated 2026',
            resourceActions: ['Read online', 'Download PDF', 'Browse all documentation'],
            resourceUpcomingLabel: 'In preparation:',
            resourceUpcoming: ['Network automation guide', 'Service catalog', 'Multi-vendor integration guide'],
            resourcePdfHref: 'docs/oktavia-2.0-datasheet-en.pdf',
            resourceOnlineHref: 'docs/datasheet-en.html',
            contactEyebrow: 'Let\'s talk',
            contactTitle: 'Evaluate Oktavia in a controlled, outcome-driven setup.',
            contactBody: 'Share your technical context to design a quickstart for discovery, compliance, and config generation in your current environment.',
            officeTitle: 'Head Office',
            officeLines: ['Office Tower, Downtown Reforma', 'Mexico City'],
            formLabels: ['Full name', 'Email', 'Company', 'What do you need to solve?'],
            submitButton: 'Send Request',
            footerTagline: 'Oktavia: intelligent automation for enterprise networks.',
            copyright: 'All rights reserved.',
            heroImageAlt: 'Main dashboard for network monitoring and auditing',
            platformImageAlt: 'Configuration compliance view in Oktavia',
            serviceIconAlts: [
                'Network visibility icon',
                'Inventory icon',
                'Graph topology icon',
                'Configuration compliance icon',
                'Configuration generation icon',
                'Closed-loop remediation icon',
                'Service rollout icon',
                'Conversation icon',
                'Network security icon',
                'Service inventory icon',
                'Digital Twin icon',
                'Firewall policy icon',
                'IP addressing icon',
                'Reports icon',
                'Telemetry icon'
            ],
            showcaseImageAlts: [
                'General compliance dashboard',
                'Inventory dashboard',
                'Topology dashboard'
            ],
            footerLogoAlt: 'Oktanet symbol'
        }
    };

    const updateNavToggleLabel = function (languageKey) {
        if (!navToggle) {
            return;
        }

        const copy = translations[languageKey] || translations.es;
        const isOpen = body.classList.contains('nav-open');
        navToggle.setAttribute('aria-label', isOpen ? copy.navToggleClose : copy.navToggleOpen);
    };

    const updateBrandWordmarkVisibility = function () {
        if (!navShell || !brandWordmark) {
            return;
        }

        // Keep the wordmark on mobile menu layout; collapse it only on desktop before overlap.
        if (window.innerWidth <= 860) {
            navShell.classList.remove('nav-compact-brand');
            return;
        }

        navShell.classList.remove('nav-compact-brand');

        if (navShell.scrollWidth > navShell.clientWidth + 10) {
            navShell.classList.add('nav-compact-brand');
        }
    };

    const applyLanguage = function (languageKey) {
        const selectedKey = translations[languageKey] ? languageKey : 'es';
        const copy = translations[selectedKey];

        document.documentElement.lang = copy.htmlLang;
        document.title = copy.title;

        if (metaDescription) {
            metaDescription.setAttribute('content', copy.metaDescription);
        }

        if (brandLink) {
            brandLink.setAttribute('aria-label', copy.brandAria);
        }

        if (mainNav) {
            mainNav.setAttribute('aria-label', copy.navAria);
        }

        if (trustStrip) {
            trustStrip.setAttribute('aria-label', copy.trustAria);
        }

        if (showcaseSectionEl) {
            showcaseSectionEl.setAttribute('aria-label', copy.showcaseAria);
        }

        if (featureFocusSectionEl) {
            featureFocusSectionEl.setAttribute('aria-label', copy.featureFocusAria);
        }

        if (metricsSectionLabelEl) {
            metricsSectionLabelEl.setAttribute('aria-label', copy.metricsAria);
        }

        if (licensingSectionEl) {
            licensingSectionEl.setAttribute('aria-label', copy.licensingAria);
        }

        if (resourcesSectionEl) {
            resourcesSectionEl.setAttribute('aria-label', copy.resourcesAria);
        }

        if (langToggle) {
            langToggle.setAttribute('aria-label', copy.langToggleAria);
        }

        setText(langCode, copy.langCode);
        setTextList(navLinks, copy.navLinks);
        setText(navCta, copy.navCta);
        setTextList(footerLinks, copy.navLinks);

        setText(document.querySelector('.hero-copy .eyebrow'), copy.heroEyebrow);
        setText(document.querySelector('.hero-copy h1'), copy.heroTitle);
        setText(document.querySelector('.hero-copy > p:not(.eyebrow)'), copy.heroBody);
        setTextList(document.querySelectorAll('.hero-actions a'), copy.heroActions);
        setTextList(document.querySelectorAll('.hero-points li'), copy.heroPoints);

        setText(document.querySelector('.trust-grid > p'), copy.trustLabel);

        setText(document.querySelector('.platform-copy .eyebrow'), copy.platformEyebrow);
        setText(document.querySelector('.platform-copy h2'), copy.platformTitle);
        setText(document.querySelector('.platform-copy > p:not(.eyebrow)'), copy.platformBody);
        setTextList(document.querySelectorAll('.chip-list span'), copy.platformChips);

        setText(document.querySelector('.services-section .eyebrow'), copy.servicesEyebrow);
        setText(document.querySelector('.services-section h2'), copy.servicesTitle);
        setTextList(document.querySelectorAll('.services-grid .service-card h3'), copy.serviceTitles);
        setTextList(document.querySelectorAll('.services-grid .service-card p'), copy.serviceBodies);

        setText(document.querySelector('.showcase-section h2'), copy.showcaseTitle);
        setText(document.querySelector('.showcase-section .section-intro'), copy.showcaseIntro);
        setTextList(document.querySelectorAll('.showcase-grid figcaption'), copy.showcaseCaptions);

        setText(document.querySelector('.feature-focus-section .eyebrow'), copy.featureFocusEyebrow);
        setText(document.querySelector('.feature-focus-section h2'), copy.featureFocusTitle);
        setText(document.querySelector('.feature-focus-section .section-intro'), copy.featureFocusIntro);
        setTextList(document.querySelectorAll('.feature-focus-card h3'), copy.featureFocusTitles);
        setTextList(document.querySelectorAll('.feature-focus-card p'), copy.featureFocusBodies);

        setText(document.querySelector('.method-section .eyebrow'), copy.methodEyebrow);
        setText(document.querySelector('.method-section h2'), copy.methodTitle);
        setTextList(document.querySelectorAll('.method-grid h3'), copy.methodTitles);
        setTextList(document.querySelectorAll('.method-grid p'), copy.methodBodies);

        setText(document.querySelector('.cases-section .eyebrow'), copy.casesEyebrow);
        setText(document.querySelector('.cases-section h2'), copy.casesTitle);
        setTextList(document.querySelectorAll('.cases-grid h3'), copy.caseTitles);
        setTextList(document.querySelectorAll('.cases-grid p'), copy.caseBodies);

        setText(document.querySelector('.metrics-copy .eyebrow'), copy.metricsEyebrow);
        setText(document.querySelector('.metrics-copy h2'), copy.metricsTitle);
        setText(document.querySelector('.metrics-copy .section-intro'), copy.metricsIntro);
        setTextList(document.querySelectorAll('.metrics-grid article p'), copy.metricsBodies);

        setText(document.querySelector('.about-section .eyebrow'), copy.aboutEyebrow);
        setText(document.querySelector('.about-section h2'), copy.aboutTitle);
        setTextList(document.querySelectorAll('.about-copy .about-text'), copy.aboutParagraphs);
        setTextList(document.querySelectorAll('.about-card h3'), copy.aboutCardTitles);
        setTextList(document.querySelectorAll('.about-card p'), copy.aboutCardBodies);

        setText(document.querySelector('.licensing-copy .eyebrow'), copy.licensingEyebrow);
        setText(document.querySelector('.licensing-copy h2'), copy.licensingTitle);
        setText(document.querySelector('.licensing-copy .section-intro'), copy.licensingIntro);
        setTextList(document.querySelectorAll('.licensing-plan-label'), copy.licensingPlanLabels);
        setTextList(document.querySelectorAll('.licensing-plan h3'), copy.licensingPlanTitles);
        setTextList(document.querySelectorAll('.licensing-plan p:last-child'), copy.licensingPlanBodies);
        renderLicensingTable(copy);

        setText(document.querySelector('.resources-section .eyebrow'), copy.resourcesEyebrow);
        setText(document.querySelector('.resources-section h2'), copy.resourcesTitle);
        setText(document.querySelector('.resources-section .section-intro'), copy.resourcesIntro);
        setText(document.querySelector('.resource-card h3'), copy.resourceCardTitle);
        setText(document.querySelector('.resource-card .resource-body > p'), copy.resourceCardBody);
        setText(document.querySelector('.resource-meta'), copy.resourceCardMeta);
        setTextList(document.querySelectorAll('.resource-actions a'), copy.resourceActions);
        setText(document.querySelector('.resource-upcoming-label'), copy.resourceUpcomingLabel);
        setTextList(document.querySelectorAll('.resource-upcoming-list span'), copy.resourceUpcoming);

        if (resourcePdfLink && typeof copy.resourcePdfHref === 'string') {
            resourcePdfLink.setAttribute('href', copy.resourcePdfHref);
        }

        if (resourceOnlineLink && typeof copy.resourceOnlineHref === 'string') {
            resourceOnlineLink.setAttribute('href', copy.resourceOnlineHref);
        }

        setText(document.querySelector('.contact-copy .eyebrow'), copy.contactEyebrow);
        setText(document.querySelector('.contact-copy h2'), copy.contactTitle);
        setText(document.querySelector('.contact-copy > p:not(.eyebrow)'), copy.contactBody);
        setText(document.querySelector('.office-card h3'), copy.officeTitle);
        setTextList(document.querySelectorAll('.office-card p'), copy.officeLines);
        setTextList(document.querySelectorAll('.contact-form label'), copy.formLabels);
        setText(document.querySelector('.contact-form button'), copy.submitButton);

        setText(document.querySelector('.footer-brand p'), copy.footerTagline);
        setText(copyrightText, copy.copyright);

        if (brandImage) {
            brandImage.alt = copy.brandLogoAlt;
        }

        if (heroImage) {
            heroImage.alt = copy.heroImageAlt;
        }

        if (platformImage) {
            platformImage.alt = copy.platformImageAlt;
        }

        setServiceIconLabels(serviceIcons, copy.serviceIconAlts);
        setAltList(showcaseImages, copy.showcaseImageAlts);

        if (footerLogo) {
            footerLogo.alt = copy.footerLogoAlt;
        }

        langOptions.forEach(function (option) {
            const optionLang = option.dataset.lang;
            option.textContent = copy.langOptionLabels[optionLang] || option.textContent;
            option.setAttribute('aria-checked', String(optionLang === selectedKey));
        });

        updateNavToggleLabel(selectedKey);
        requestAnimationFrame(updateBrandWordmarkVisibility);

        try {
            window.localStorage.setItem(storageKey, selectedKey);
        } catch (_error) {
            // Ignore storage errors in private mode or restricted contexts.
        }
    };

    const closeLanguageMenu = function () {
        if (!langMenu || !langToggle) {
            return;
        }

        langMenu.hidden = true;
        langToggle.setAttribute('aria-expanded', 'false');

        if (languageDropdown) {
            languageDropdown.classList.remove('is-open');
        }
    };

    const openLanguageMenu = function () {
        if (!langMenu || !langToggle) {
            return;
        }

        langMenu.hidden = false;
        langToggle.setAttribute('aria-expanded', 'true');

        if (languageDropdown) {
            languageDropdown.classList.add('is-open');
        }
    };

    if (langToggle && langMenu && languageDropdown) {
        langToggle.addEventListener('click', function (event) {
            event.stopPropagation();

            if (langMenu.hidden) {
                openLanguageMenu();
                return;
            }

            closeLanguageMenu();
        });

        langOptions.forEach(function (option) {
            option.addEventListener('click', function () {
                const selectedLanguage = option.dataset.lang;
                applyLanguage(selectedLanguage);
                closeLanguageMenu();
            });
        });

        document.addEventListener('click', function (event) {
            if (!languageDropdown.contains(event.target)) {
                closeLanguageMenu();
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeLanguageMenu();
            }
        });
    }

    let initialLanguage = 'es';

    try {
        const savedLanguage = window.localStorage.getItem(storageKey);

        if (savedLanguage === 'es' || savedLanguage === 'en') {
            initialLanguage = savedLanguage;
        }
    } catch (_error) {
        initialLanguage = 'es';
    }

    applyLanguage(initialLanguage);
    requestAnimationFrame(updateBrandWordmarkVisibility);

    if (currentYear) {
        currentYear.textContent = String(new Date().getFullYear());
    }

    if (contactForm) {
        const clearFormIfSubmitted = function () {
            try {
                if (window.sessionStorage.getItem(formSubmittedStorageKey) === '1') {
                    contactForm.reset();
                    window.sessionStorage.removeItem(formSubmittedStorageKey);
                }
            } catch (_error) {
                // Ignore storage errors in private mode or restricted contexts.
            }
        };

        window.addEventListener('pageshow', clearFormIfSubmitted);

        contactForm.addEventListener('submit', function () {
            try {
                window.sessionStorage.setItem(formSubmittedStorageKey, '1');
            } catch (_error) {
                // Ignore storage errors in private mode or restricted contexts.
            }
        });
    }

    if (navToggle && mainNav) {
        const closeNav = function () {
            body.classList.remove('nav-open');
            navToggle.setAttribute('aria-expanded', 'false');
            updateNavToggleLabel(document.documentElement.lang);
            closeLanguageMenu();
        };

        navToggle.addEventListener('click', function () {
            const isOpen = body.classList.toggle('nav-open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
            updateNavToggleLabel(document.documentElement.lang);
        });

        navLinks.forEach(function (link) {
            link.addEventListener('click', closeNav);
        });

        if (brandLink) {
            brandLink.addEventListener('click', closeNav);
        }

        window.addEventListener('resize', function () {
            if (window.innerWidth > 860) {
                closeNav();
            }

            updateBrandWordmarkVisibility();
        });
    }

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
            updateBrandWordmarkVisibility();
        });
    }

    const revealTargets = document.querySelectorAll(
        '.hero-copy, .hero-visual, .platform-copy, .platform-visual, .about-copy, ' +
        '.services-section .service-card, .showcase-section .showcase-grid figure, ' +
        '.feature-focus-section .feature-focus-card, ' +
        '.cases-section .cases-grid article, .metrics-copy, .metrics-section .metrics-grid article, ' +
        '.licensing-copy, .licensing-plan, .licensing-table-wrap, ' +
        '.contact-copy, .contact-form, .footer-brand, .footer-links'
    );

    if (licensingTableBody && licensingHoverCard) {
        licensingTableBody.addEventListener('mouseover', function (event) {
            if (!window.matchMedia('(hover: hover)').matches) {
                return;
            }

            const trigger = event.target.closest('.licensing-module-trigger');

            if (trigger) {
                showLicensingHoverCard(trigger);
            }
        });

        licensingTableBody.addEventListener('mouseout', function (event) {
            if (!window.matchMedia('(hover: hover)').matches) {
                return;
            }

            const trigger = event.target.closest('.licensing-module-trigger');

            if (trigger && !trigger.contains(event.relatedTarget)) {
                hideLicensingHoverCard();
            }
        });

        licensingTableBody.addEventListener('focusin', function (event) {
            if (window.matchMedia('(hover: none)').matches) {
                return;
            }

            const trigger = event.target.closest('.licensing-module-trigger');

            if (trigger) {
                showLicensingHoverCard(trigger);
            }
        });

        licensingTableBody.addEventListener('focusout', function (event) {
            if (window.matchMedia('(hover: none)').matches) {
                return;
            }

            const trigger = event.target.closest('.licensing-module-trigger');

            if (trigger && !trigger.contains(event.relatedTarget)) {
                hideLicensingHoverCard();
            }
        });

        licensingTableBody.addEventListener('click', function (event) {
            const trigger = event.target.closest('.licensing-module-trigger');

            if (!trigger) {
                return;
            }

            if (window.matchMedia('(hover: none)').matches && activeLicensingTrigger === trigger && licensingHoverCard.classList.contains('is-visible')) {
                hideLicensingHoverCard();
                trigger.blur();
                return;
            }

            showLicensingHoverCard(trigger);
        });

        document.addEventListener('click', function (event) {
            if (!event.target.closest('.licensing-module-trigger')) {
                hideLicensingHoverCard();
            }
        });

        window.addEventListener('scroll', function () {
            if (activeLicensingTrigger) {
                positionLicensingHoverCard(activeLicensingTrigger);
            }
        }, true);

        window.addEventListener('resize', function () {
            if (activeLicensingTrigger) {
                positionLicensingHoverCard(activeLicensingTrigger);
            }
        });
    }

    if (revealTargets.length > 0) {
        body.classList.add('anim-ready');

        revealTargets.forEach(function (element, index) {
            element.classList.add('reveal');
            element.style.setProperty('--reveal-delay', String(globalAnimationDelayMs + (index % 4) * 70) + 'ms');
        });

        if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
            revealTargets.forEach(function (element) {
                element.classList.add('reveal-visible');
            });
        } else {
            const revealObserver = new IntersectionObserver(
                function (entries, observer) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('reveal-visible');
                            observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    threshold: 0.12,
                    rootMargin: '0px 0px -8% 0px'
                }
            );

            revealTargets.forEach(function (element) {
                revealObserver.observe(element);
            });
        }
    }

    const setupReplayObserver = function (section, enterRatio, onEnter, onFullyExit) {
        const startRatio = Math.min(0.95, Math.max(0.01, enterRatio));
        let hasEntered = false;

        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.target !== section) {
                        return;
                    }

                    const ratio = entry.intersectionRatio;

                    if (!hasEntered && ratio >= startRatio) {
                        hasEntered = true;
                        onEnter();
                        return;
                    }

                    // Reset only when the whole section is fully out of view.
                    if (hasEntered && ratio === 0) {
                        hasEntered = false;
                        onFullyExit();
                    }
                });
            },
            {
                threshold: [0, startRatio]
            }
        );

        observer.observe(section);
    };

    const serviceSection = document.querySelector('.services-section');
    const serviceCards = document.querySelectorAll('.services-section .service-card');

    if (serviceSection && serviceCards.length > 0) {
        serviceSection.classList.add('block-fade-ready');
        const serviceStartDelayMs = 90 + globalAnimationDelayMs;

        serviceCards.forEach(function (card, index) {
            card.style.setProperty('--block-delay', String(serviceStartDelayMs + index * 80) + 'ms');
        });

        const runServiceFade = function () {
            serviceSection.classList.remove('block-fade-active');
            // Force a reflow so the animation can replay on each entry.
            void serviceSection.offsetHeight;
            serviceSection.classList.add('block-fade-active');
        };

        if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
            serviceSection.classList.add('block-fade-active');
        } else {
            setupReplayObserver(serviceSection, 0.18, runServiceFade, function () {
                serviceSection.classList.remove('block-fade-active');
            });
        }
    }

    const casesSection = document.querySelector('.cases-section');
    const caseCards = document.querySelectorAll('.cases-section .cases-grid article');

    if (casesSection && caseCards.length > 0) {
        casesSection.classList.add('block-fade-ready');
        const casesStartDelayMs = 90 + globalAnimationDelayMs;

        caseCards.forEach(function (card, index) {
            card.style.setProperty('--block-delay', String(casesStartDelayMs + index * 95) + 'ms');
        });

        const runCasesFade = function () {
            casesSection.classList.remove('block-fade-active');
            // Force a reflow so the animation can replay on each entry.
            void casesSection.offsetHeight;
            casesSection.classList.add('block-fade-active');
        };

        if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
            casesSection.classList.add('block-fade-active');
        } else {
            setupReplayObserver(casesSection, 0.2, runCasesFade, function () {
                casesSection.classList.remove('block-fade-active');
            });
        }
    }

    const methodSection = document.querySelector('.method-section');
    const dominoItems = document.querySelectorAll('.method-section .method-grid article');

    if (methodSection && dominoItems.length > 0) {
        methodSection.classList.add('domino-ready');
        const dominoStartDelayMs = 150 + globalAnimationDelayMs;

        dominoItems.forEach(function (item, index) {
            item.style.setProperty('--domino-delay', String(dominoStartDelayMs + index * 130) + 'ms');
        });

        const runDominoAnimation = function () {
            methodSection.classList.remove('domino-active');
            // Force a reflow so the same animation can replay on re-entry.
            void methodSection.offsetHeight;
            methodSection.classList.add('domino-active');
        };

        if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
            methodSection.classList.add('domino-active');
        } else {
            setupReplayObserver(methodSection, 0.2, runDominoAnimation, function () {
                methodSection.classList.remove('domino-active');
            });
        }
    }

    const aboutSection = document.querySelector('.about-section');
    const aboutCards = document.querySelectorAll('.about-pillars .about-card');

    if (aboutSection && aboutCards.length > 0) {
        aboutSection.classList.add('about-float-ready');
        const aboutStartDelayMs = 140 + globalAnimationDelayMs;

        aboutCards.forEach(function (card, index) {
            card.style.setProperty('--about-delay', String(aboutStartDelayMs + index * 130) + 'ms');
        });

        const runAboutFloat = function () {
            aboutSection.classList.remove('about-float-active');
            // Force a reflow so the animation replays on each re-entry.
            void aboutSection.offsetHeight;
            aboutSection.classList.add('about-float-active');
        };

        if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
            aboutSection.classList.add('about-float-active');
        } else {
            setupReplayObserver(aboutSection, 0.2, runAboutFloat, function () {
                aboutSection.classList.remove('about-float-active');
            });
        }
    }

    const metricsSection = document.querySelector('.metrics-section');
    const counters = document.querySelectorAll('.counter');

    if (metricsSection && counters.length > 0) {
        const setMetricRingProgress = function (counter, value) {
            const card = counter.closest('.metric-card');

            if (!card || !card.classList.contains('metric-percent')) {
                return;
            }

            const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
            card.style.setProperty('--ring-progress', String(safeValue));
        };

        const setCounterToFinalValue = function (counter) {
            const target = Number(counter.dataset.target || 0);
            const suffix = counter.dataset.suffix || '';
            counter.classList.remove('is-typing');
            counter.textContent = String(target) + suffix;
            setMetricRingProgress(counter, target);
        };

        const setCounterToStartValue = function (counter) {
            const suffix = counter.dataset.suffix || '';
            counter.classList.remove('is-typing');
            counter.textContent = suffix === '/7' ? '' : '0' + suffix;
            setMetricRingProgress(counter, 0);
        };

        let metricsAnimationCycle = 0;

        const animateCountUp = function (counter, startDelayMs, cycleId) {
            const target = Number(counter.dataset.target || 0);
            const suffix = counter.dataset.suffix || '';
            const duration = 1220;
            const startTime = performance.now() + startDelayMs;

            const step = function (timestamp) {
                if (cycleId !== metricsAnimationCycle) {
                    return;
                }

                if (timestamp < startTime) {
                    window.requestAnimationFrame(step);
                    return;
                }

                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const value = Math.round(target * eased);
                counter.textContent = String(value) + suffix;
                setMetricRingProgress(counter, value);

                if (progress < 1) {
                    window.requestAnimationFrame(step);
                    return;
                }

                counter.textContent = String(target) + suffix;
                setMetricRingProgress(counter, target);
            };

            window.requestAnimationFrame(step);
        };

        const animateTypewriterCounter = function (counter, startDelayMs, cycleId) {
            const target = Number(counter.dataset.target || 0);
            const suffix = counter.dataset.suffix || '';
            const finalText = String(target) + suffix;
            const duration = 640;
            const startTime = performance.now() + startDelayMs;

            const step = function (timestamp) {
                if (cycleId !== metricsAnimationCycle) {
                    counter.classList.remove('is-typing');
                    return;
                }

                if (timestamp < startTime) {
                    counter.classList.add('is-typing');
                    window.requestAnimationFrame(step);
                    return;
                }

                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const charCount = Math.max(1, Math.ceil(finalText.length * progress));
                counter.textContent = finalText.slice(0, charCount);

                if (progress < 1) {
                    window.requestAnimationFrame(step);
                    return;
                }

                counter.textContent = finalText;
                counter.classList.remove('is-typing');
            };

            window.requestAnimationFrame(step);
        };

        const runMetricsAnimations = function () {
            metricsAnimationCycle += 1;
            const cycleId = metricsAnimationCycle;
            const startDelayMs = 90 + globalAnimationDelayMs;
            const stepDelayMs = 110;

            counters.forEach(setCounterToStartValue);

            counters.forEach(function (counter, index) {
                const delay = startDelayMs + index * stepDelayMs;
                const suffix = counter.dataset.suffix || '';

                if (suffix === '/7') {
                    animateTypewriterCounter(counter, delay, cycleId);
                    return;
                }

                animateCountUp(counter, delay, cycleId);
            });
        };

        const resetMetricsAnimations = function () {
            metricsAnimationCycle += 1;
            counters.forEach(setCounterToStartValue);
        };

        if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
            counters.forEach(setCounterToFinalValue);
            return;
        }

        resetMetricsAnimations();
        setupReplayObserver(metricsSection, 0.2, runMetricsAnimations, resetMetricsAnimations);
    }
})();
