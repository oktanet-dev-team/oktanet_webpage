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
    const heroBadgesContainer = document.querySelector('.hero-badges');
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

            return '<tr class="' + rowClasses.join(' ') + '">' +
                '<th scope="row" class="licensing-table-module"><button type="button" class="licensing-module-trigger" data-licensing-description="' + escapeHtml(row.description) + '">' + escapeHtml(row.module) + '</button></th>' +
                '<td class="licensing-table-status">' + renderLicensingStatus(row.core, copy.licensingIncludedLabel, copy.licensingUnavailableLabel, copy.licensingIncludedMark, copy.licensingUnavailableMark) + '</td>' +
                '<td class="licensing-table-status">' + renderLicensingStatus(row.pro, copy.licensingIncludedLabel, copy.licensingUnavailableLabel, copy.licensingIncludedMark, copy.licensingUnavailableMark) + '</td>' +
                '</tr>';
        }).join('');
        hideLicensingHoverCard();
    };

    const translations = {
        es: {
            htmlLang: 'es',
            title: 'Oktavia',
            metaDescription: 'Oktavia unifica descubrimiento, cumplimiento y generación de configuraciones deseadas con tareas asíncronas, artefactos versionables y operación auditable para redes empresariales.',
            brandAria: 'Ir al inicio',
            navAria: 'Principal',
            navToggleOpen: 'Abrir menú',
            navToggleClose: 'Cerrar menú',
            navLinks: ['Plataforma', 'Servicios', 'Metodología', 'Casos de uso', 'Quiénes somos', 'Licencias'],
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
            heroEyebrow: 'Automatización de redes segura y auditable',
            heroTitle: 'Estandariza el descubrimiento, el cumplimiento y las configuraciones deseadas desde una sola plataforma.',
            heroBody: 'Oktavia es una plataforma de automatización de redes diseñada para automatizar el descubrimiento de red, el cumplimiento de configuraciones y la generación de configuraciones de estado deseado en infraestructuras empresariales multivendor.',
            heroActions: ['Solicitar una demostración', 'Conocer Oktavia'],
            heroBadgesAria: 'Puntos clave de la plataforma',
            heroBadges: ['Listo para múltiples fabricantes', 'Auditoría continua', 'Automatización guiada'],
            heroPoints: [
                'Modelo de ejecución basado en tareas asíncronas que generan resultados estructurados y versionables (JSON, CSV, CFG).',
                'Sin cambios directos en la red: primero se generan configuraciones deseadas.',
                'Remediación controlada con validación y aprobación previa.'
            ],
            trustLabel: 'Compatible con infraestructura multifabricante:',
            platformEyebrow: 'Producto principal',
            platformTitle: 'Oktavia: motor de automatización + interfaz web para operar redes con control continuo.',
            platformBody: 'Diseñada para despliegues simples y demostraciones, con arquitectura preparada para servicios externos, Oktavia integra descubrimiento multifabricante, cumplimiento por sitio o dispositivo y generación de configuraciones deseadas en una sola consola.',
            platformChips: [
                'Tareas asíncronas',
                'Artefactos versionables',
                'Reglas de cumplimiento editables',
                'API REST con clave de API'
            ],
            servicesEyebrow: 'Capacidades de la plataforma',
            servicesTitle: 'Módulos diseñados para descubrimiento, cumplimiento y operación trazable.',
            serviceTitles: [
                'Descubrimiento multifabricante',
                'Pruebas y reglas de cumplimiento',
                'Generador de configuraciones deseadas',
                'Telemetría en tiempo real',
                'Inventario de red',
                'Topología de red',
                'Gemelo digital',
                'Reportes avanzados',
                'Orquestador de tareas'
            ],
            serviceBodies: [
                'Reúne la información clave de la red y la organiza para que todo el equipo trabaje con una misma base operativa.',
                'Revisa si la red cumple con tus estándares y muestra hallazgos, prioridades y acciones sugeridas.',
                'Prepara configuraciones de forma consistente para distintos sitios, roles y equipos, sin depender de procesos manuales.',
                'Muestra CPU, memoria e interfaces en tiempo real para detectar comportamientos anómalos con rapidez.',
                'Centraliza equipos, sitios y roles para facilitar la búsqueda, la segmentación y la exportación de información.',
                'Visualiza cómo están conectados los equipos y cómo fluye la red para entender mejor el impacto de cada cambio.',
                'Compara el estado esperado con el estado real para detectar desvíos antes de que se conviertan en incidentes.',
                'Resume salud, riesgo, capacidad y cambios en reportes claros para auditoría y toma de decisiones.',
                'Programa auditorías y validaciones recurrentes para mantener seguimiento continuo y resultados descargables.'
            ],
            showcaseTitle: 'Interfaz pensada para operar flujos complejos con una experiencia simple.',
            showcaseIntro: 'Desde cumplimiento y generación de configuraciones hasta topología, enrutamiento e inteligencia de IP, cada módulo produce resultados accionables.',
            showcaseCaptions: [
                'Cumplimiento por dominio, sitio y criticidad con reglas y pruebas editables.',
                'Inventario técnico consolidado con trazabilidad de software, hardware y metadatos.',
                'Topología física y plano de control, con vistas de enrutamiento (BGP/OSPF) para análisis de impacto.'
            ],
            featureFocusEyebrow: 'Capacidades destacadas',
            featureFocusTitle: 'Telemetría, gemelo digital y generador de configuración como núcleo operativo.',
            featureFocusIntro: 'Estos tres módulos aceleran diagnóstico, reducen riesgo de cambio y mejoran trazabilidad en cada ejecución.',
            featureFocusTitles: [
                'Telemetría operativa',
                'Gemelo digital y desvío de configuración',
                'Generador de configuraciones deseadas'
            ],
            featureFocusBodies: [
                'Centraliza métricas, tendencias e historial para detectar anomalías y priorizar acciones de forma proactiva.',
                'Compara instantáneas por dispositivo para identificar desviaciones, validar impacto y proponer cambios con evidencia.',
                'Produce configuraciones desde plantillas Jinja y variables de servicio, manteniendo control antes de cualquier remediación.'
            ],
            methodEyebrow: 'Modelo de ejecución',
            methodTitle: 'Operación basada en tareas asíncronas, logs, registros y aprobación.',
            methodTitles: ['Descubrimiento', 'Cumplimiento', 'Configuraciones deseadas', 'Validación y aprobación'],
            methodBodies: [
                'Recolectamos y normalizamos el estado de la red por sitio y dispositivo para construir una línea base confiable.',
                'Ejecutamos pruebas contra reglas editables para identificar desvíos y priorizar remediación controlada.',
                'Generamos logs y registros versionables (JSON/CSV/CFG) antes de cualquier cambio en la infraestructura.',
                'Aplicamos cambios solo con control operativo, trazabilidad completa y seguimiento de desvíos.'
            ],
            casesEyebrow: 'Casos de uso',
            casesTitle: 'Aplicaciones reales en operación de redes empresariales.',
            caseTitles: ['Auditorías de cumplimiento', 'Configuraciones deseadas', 'Tableros técnicos'],
            caseBodies: [
                'Evalúa cumplimiento por sitio o dispositivo sin procesos manuales y con evidencia exportable.',
                'Genera configuraciones desde plantillas y variables de servicio para reducir riesgo operativo en cambios.',
                'Visualiza inventario, topología, enrutamiento y tendencias para acelerar diagnóstico y priorización.'
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
                'Oktavia no busca reemplazar un NMS de monitoreo en tiempo real. Su foco es estandarizar descubrimiento, cumplimiento y generación de configuraciones deseadas con un modelo de ejecución controlado y trazable.',
                'La arquitectura separa la interfaz web y el motor de automatización para facilitar despliegues simples y evolución a servicios externos sin perder compatibilidad de API ni trazabilidad de artefactos.'
            ],
            aboutCardTitles: [
                'Extensibilidad por fabricante',
                'Control y visibilidad en la automatización',
                'Licenciamiento básico / avanzado'
            ],
            aboutCardBodies: [
                'Cada fabricante se integra con adaptador de descubrimiento, normalizador, reglas de cumplimiento y plantillas Jinja.',
                'Prioriza remediación supervisada con aprobación, evitando automatizaciones opacas y no auditables.',
                'La licencia básica cubre cumplimiento e inventario; la avanzada agrega observabilidad, programación y gemelo digital.'
            ],
            licensingAria: 'Licenciamiento Oktavia',
            licensingEyebrow: 'Licenciamiento',
            licensingTitle: 'Oktavia Core y Oktavia Pro',
            licensingIntro: 'Compara los módulos incluidos en cada edición.',
            licensingPlanLabels: [],
            licensingPlanTitles: [],
            licensingPlanBodies: [],
            licensingHeaders: ['Módulo Oktavia', 'Oktavia Core', 'Oktavia Pro'],
            licensingIncludedLabel: 'Incluido',
            licensingUnavailableLabel: 'No incluido',
            licensingIncludedMark: '✓',
            licensingUnavailableMark: 'X',
            licensingRows: [
                {
                    module: 'Auditoría del estado de red',
                    description: 'Ejecuta un análisis integral del estado actual de la red en minutos, evaluando inventario, conectividad, configuración y cumplimiento desde una sola operación.',
                    core: true,
                    pro: true
                },
                {
                    module: 'Inventario de red',
                    description: 'Inventario dinámico multi-fabricante con filtros por sitio, rol, plataforma y proveedor, modelo, metadata.',
                    core: true,
                    pro: true
                },
                {
                    module: 'Topología de red',
                    description: 'Mapa interactivo de la red con vistas física, control plane, ruteo, protocolos LLDP, CDP, OSPF, EIGRP, BGP y STP, VRRP, direccionamiento IP.',
                    core: true,
                    pro: true
                },
                {
                    module: 'Cumplimiento de configuración',
                    description: 'Verificación de cumplimiento de configuración con reglas, tests y diagnóstico',
                    core: true,
                    pro: true
                },
                {
                    module: 'Generador de configuración',
                    description: 'Generación de configuraciones estándar mediante plantillas y variables de servicio',
                    core: true,
                    pro: true
                },
                {
                    module: 'Orquestador de automatizaciones',
                    description: 'Ejecución de auditorías, sincronización de inventario y orquestador de tareas',
                    core: true,
                    pro: true
                },
                {
                    module: 'Respaldos de configuración',
                    description: 'Visualización y descarga de archivos de configuración',
                    core: true,
                    pro: true
                },
                {
                    module: 'Inteligencia IP (IPAM)',
                    description: 'Mapa de direccionamiento IP, subredes detectadas y vecinos de routing',
                    core: true,
                    pro: true
                },
                {
                    module: 'FinOps',
                    description: 'Calculadora de ROI de automatización y análisis de ahorro operativo',
                    core: true,
                    pro: true
                },
                {
                    module: 'Telemetría en tiempo real',
                    description: 'Métricas SNMP (CPU, memoria, interfaces), GrPC(telemetria streaming), APIs, con visualización temporal',
                    core: false,
                    pro: true,
                    advanced: true
                },
                {
                    module: 'Gemelo digital',
                    description: 'Capturas del estado de la red, comparación de configuración deseada vs activa y detección de cambios de configuracion',
                    core: false,
                    pro: true,
                    advanced: true
                },
                {
                    module: 'Análisis inteligente de red',
                    description: 'Analisis de red automáticos de riesgo, configuración y capacidad, documentación de la red.',
                    core: false,
                    pro: true,
                    advanced: true
                },
                {
                    module: 'Reportes avanzados',
                    description: 'Reportes de salud de red, cambios de configuración, capacidad, puertos y analisis de riesgos.',
                    core: false,
                    pro: true,
                    advanced: true
                },
                {
                    module: 'Gestión multi-tenant',
                    description: 'Multi-organización, gestión de usuarios y separación de datos por tenant.',
                    core: false,
                    pro: true,
                    advanced: true
                }
            ],
            featureDetailsAria: 'Detalle de módulos de Oktavia',
            featureDetailsEyebrow: 'Detalle de módulos',
            featureDetailsTitle: 'Descripción por módulo',
            featureDetailsIntro: 'Consulta el alcance funcional de cada capacidad incluida en Oktavia.',
            featureDetailsHeaders: ['Módulo Oktavia', 'Descripción'],
            featureDetailsRows: [
                {
                    feature: 'Auditoría del estado de red',
                    description: 'Ejecuta un análisis integral del estado actual de la red en minutos, evaluando inventario, conectividad, configuración y cumplimiento desde una sola operación.'
                },
                {
                    feature: 'Inventario de red',
                    description: 'Inventario dinámico multi-fabricante con filtros por sitio, rol, plataforma y proveedor, modelo, metadata.'
                },
                {
                    feature: 'Topología de red',
                    description: 'Mapa interactivo de la red con vistas física, control plane, ruteo, protocolos LLDP, CDP, OSPF, EIGRP, BGP y STP, VRRP, direccionamiento IP.'
                },
                {
                    feature: 'Cumplimiento de configuración',
                    description: 'Verificación de cumplimiento de configuración con reglas, tests y diagnóstico'
                },
                {
                    feature: 'Generador de configuración',
                    description: 'Generación de configuraciones estándar mediante plantillas y variables de servicio'
                },
                {
                    feature: 'Orquestador de automatizaciones',
                    description: 'Ejecución de auditorías, sincronización de inventario y orquestador de tareas'
                },
                {
                    feature: 'Respaldos de configuración',
                    description: 'Visualización y descarga de archivos de configuración'
                },
                {
                    feature: 'Inteligencia IP (IPAM)',
                    description: 'Mapa de direccionamiento IP, subredes detectadas y vecinos de routing'
                },
                {
                    feature: 'FinOps',
                    description: 'Calculadora de ROI de automatización y análisis de ahorro operativo'
                },
                {
                    feature: 'Telemetría en tiempo real',
                    description: 'Métricas SNMP (CPU, memoria, interfaces), GrPC(telemetria streaming), APIs, con visualización temporal',
                    advanced: true
                },
                {
                    feature: 'Gemelo digital',
                    description: 'Capturas del estado de la red, comparación de configuración deseada vs activa y detección de cambios de configuracion',
                    advanced: true
                },
                {
                    feature: 'Análisis inteligente de red',
                    description: 'Analisis de red automáticos de riesgo, configuración y capacidad, documentación de la red.',
                    advanced: true
                },
                {
                    feature: 'Reportes avanzados',
                    description: 'Reportes de salud de red, cambios de configuración, capacidad, puertos y analisis de riesgos.',
                    advanced: true
                },
                {
                    feature: 'Gestión multi-tenant',
                    description: 'Multi-organización, gestión de usuarios y separación de datos por tenant.',
                    advanced: true
                }
            ],
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
                'Icono de configuración',
                'Icono de herramienta de configuración',
                'Icono de telemetría',
                'Icono de inventario',
                'Icono de topología en grafo',
                'Icono de gemelo digital',
                'Icono de reportes',
                'Icono de calendario y tareas'
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
            title: 'Oktavia',
            metaDescription: 'Oktavia unifies discovery, compliance, and desired configuration generation with async jobs, versioned artifacts, and auditable operations for enterprise networks.',
            brandAria: 'Back to top',
            navAria: 'Main',
            navToggleOpen: 'Open menu',
            navToggleClose: 'Close menu',
            navLinks: ['Platform', 'Services', 'Methodology', 'Use Cases', 'About us', 'Licensing'],
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
            heroEyebrow: 'Secure and auditable network automation',
            heroTitle: 'Standardize discovery, compliance, and desired configurations from one platform.',
            heroBody: 'Oktavia is a network automation platform designed to automate network discovery, configuration compliance, and desired-state configuration generation across multi-vendor enterprise infrastructures.',
            heroActions: ['Request a Demo', 'Explore Oktavia'],
            heroBadgesAria: 'Platform highlights',
            heroBadges: ['Multi-vendor ready', 'Continuous auditing', 'Guided automation'],
            heroPoints: [
                'Execution model based on async jobs that generate structured, versioned outputs (JSON, CSV, CFG).',
                'No direct network changes: desired configurations are generated first.',
                'Controlled remediation with validation and approval gates.'
            ],
            trustLabel: 'Compatible with multi-vendor infrastructure:',
            platformEyebrow: 'Core Product',
            platformTitle: 'Oktavia: Automation Engine + UI for continuous-control network operations.',
            platformBody: 'Built for simple deployments and demos, with architecture ready for external backends, Oktavia unifies multi-vendor discovery, per-site/device compliance, and desired configuration generation in one console.',
            platformChips: [
                'Async jobs',
                'Versioned artifacts',
                'Editable compliance rules',
                'REST API with API key'
            ],
            servicesEyebrow: 'Platform capabilities',
            servicesTitle: 'Modules built for discovery, compliance, and traceable operations.',
            serviceTitles: [
                'Multi-vendor discovery',
                'Compliance tests and rules',
                'Desired Configuration Generator',
                'Real-time telemetry',
                'Network Inventory',
                'Network Topology',
                'Digital Twin',
                'Advanced Reports',
                'Task Orchestrator'
            ],
            serviceBodies: [
                'Brings together key network information so the whole team can work from the same operational baseline.',
                'Checks whether the network meets your standards and highlights findings, priorities, and suggested actions.',
                'Prepares configurations consistently for different sites, roles, and devices without relying on manual work.',
                'Shows CPU, memory, and interfaces in real time so unusual behavior is easier to spot quickly.',
                'Centralizes devices, sites, and roles to make search, segmentation, and export much easier.',
                'Shows how devices are connected and how traffic flows so teams can better understand change impact.',
                'Compares expected state with live state to catch drift before it turns into an incident.',
                'Summarizes health, risk, capacity, and changes in clear reports for audits and decision-making.',
                'Schedules recurring audits and validations to keep operations monitored with downloadable results.'
            ],
            showcaseTitle: 'A UI designed for complex workflows with simple operation.',
            showcaseIntro: 'From compliance and config generation to topology, routing, and IP intelligence, each module produces actionable output.',
            showcaseCaptions: [
                'Compliance by domain, site, and criticality with editable rules and tests.',
                'Consolidated technical inventory with software, hardware, and metadata traceability.',
                'Physical/control-plane topology and routing views (BGP/OSPF) for impact analysis.'
            ],
            featureFocusEyebrow: 'Highlighted capabilities',
            featureFocusTitle: 'Telemetry, Digital Twin, and Desired Configuration Generator as core modules.',
            featureFocusIntro: 'These three modules accelerate diagnosis, reduce change risk, and improve traceability in every run.',
            featureFocusTitles: [
                'Operational telemetry',
                'Digital Twin and drift',
                'Desired Configuration Generator'
            ],
            featureFocusBodies: [
                'Centralizes metrics, trends, and history to detect anomalies and prioritize actions proactively.',
                'Compares per-device snapshots to identify deviations, validate impact, and propose evidence-based changes.',
                'Produces configurations from Jinja templates and service vars, preserving control before any remediation.'
            ],
            methodEyebrow: 'Execution model',
            methodTitle: 'Operations based on async jobs, logs, records, and approvals.',
            methodTitles: ['Discovery', 'Compliance', 'Desired Configurations', 'Validation and approval'],
            methodBodies: [
                'Collect and normalize network state by site/device to build a reliable operational baseline.',
                'Run tests against editable rules to identify deviations and prioritize controlled remediation.',
                'Generate versioned logs and records (JSON/CSV/CFG) before any infrastructure change.',
                'Apply changes only with operational control, full traceability, and drift follow-up.'
            ],
            casesEyebrow: 'Use Cases',
            casesTitle: 'Real applications for enterprise network operations.',
            caseTitles: ['Compliance audits', 'Desired configurations', 'Technical dashboards'],
            caseBodies: [
                'Evaluate compliance by site or device without manual processes and with exportable evidence.',
                'Generate configs from templates and service vars to reduce operational change risk.',
                'Visualize inventory, topology, routing, and trends to accelerate diagnosis and prioritization.'
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
                'Oktavia is not meant to replace real-time monitoring NMS platforms. Its focus is to standardize discovery, compliance, and desired configuration generation through a controlled and traceable execution model.',
                'The architecture separates UI and Automation Engine to support simple deployments and evolution to external backends without losing API compatibility or artifact traceability.'
            ],
            aboutCardTitles: [
                'Vendor extensibility',
                'Control and visibility in automation',
                'Core / Pro licensing'
            ],
            aboutCardBodies: [
                'Each vendor is integrated through a discovery adapter, normalizer, compliance rule set, and Jinja templates.',
                'It prioritizes supervised remediation with approvals, avoiding opaque and non-auditable automation.',
                'Core covers compliance and inventory; Pro adds advanced observability, scheduler, and Digital Twin.'
            ],
            licensingAria: 'Oktavia licensing',
            licensingEyebrow: 'Licensing',
            licensingTitle: 'Oktavia Core and Oktavia Pro',
            licensingIntro: 'Compare the modules included in each edition.',
            licensingPlanLabels: [],
            licensingPlanTitles: [],
            licensingPlanBodies: [],
            licensingHeaders: ['Module', 'Core', 'Pro'],
            licensingIncludedLabel: 'Included',
            licensingUnavailableLabel: 'Not included',
            licensingIncludedMark: '✓',
            licensingUnavailableMark: '—',
            licensingRows: [
                {
                    module: 'Network Status Audit',
                    description: 'Run a comprehensive analysis of the network’s current state in minutes, assessing inventory, connectivity, configuration, and compliance in a single operation.',
                    core: true,
                    pro: true
                },
                {
                    module: 'Network Inventory',
                    description: 'Dynamic multi-vendor inventory with filters by site, role and platform',
                    core: true,
                    pro: true
                },
                {
                    module: 'Network Topology',
                    description: 'Interactive topology map with physical, control plane, routing, OSPF, BGP and STP views',
                    core: true,
                    pro: true
                },
                {
                    module: 'Configuration Compliance',
                    description: 'Configuration compliance validation with rules, tests and diagnostics',
                    core: true,
                    pro: true
                },
                {
                    module: 'Configuration Generator',
                    description: 'Standard configuration generation using templates and service variables',
                    core: true,
                    pro: true
                },
                {
                    module: 'Automation Orchestrator',
                    description: 'Audit execution, inventory sync and scheduled jobs',
                    core: true,
                    pro: true
                },
                {
                    module: 'Configuration Backups',
                    description: 'Device configuration viewer and download',
                    core: true,
                    pro: true
                },
                {
                    module: 'IP Intelligence (IPAM)',
                    description: 'Network IP addressing map with detected subnets and routing peers',
                    core: true,
                    pro: true
                },
                {
                    module: 'FinOps',
                    description: 'Automation ROI calculator and operational cost analysis',
                    core: true,
                    pro: true
                },
                {
                    module: 'Real-time Telemetry',
                    description: 'SNMP metrics (CPU, memory, interfaces) with time-series visualization',
                    core: false,
                    pro: true,
                    advanced: true
                },
                {
                    module: 'Digital Twin',
                    description: 'Network snapshots, intended vs running comparison and drift detection',
                    core: false,
                    pro: true,
                    advanced: true
                },
                {
                    module: 'AI Network Insights',
                    description: 'Automated analysis of risk, configuration and capacity',
                    core: false,
                    pro: true,
                    advanced: true
                },
                {
                    module: 'Advanced Reports',
                    description: 'Network health, drift, capacity, port usage and configuration risk reports',
                    core: false,
                    pro: true,
                    advanced: true
                },
                {
                    module: 'Multi-tenant Management',
                    description: 'Multi-organization platform with tenant data isolation',
                    core: false,
                    pro: true,
                    advanced: true
                }
            ],
            featureDetailsAria: 'Oktavia module details',
            featureDetailsEyebrow: 'Module details',
            featureDetailsTitle: 'Description by module',
            featureDetailsIntro: 'Review the functional scope of each capability included in Oktavia.',
            featureDetailsHeaders: ['Module', 'Description'],
            featureDetailsRows: [
                {
                    feature: 'Network Status Audit',
                    description: 'Run a comprehensive analysis of the network’s current state in minutes, assessing inventory, connectivity, configuration, and compliance in a single operation.'
                },
                {
                    feature: 'Network Inventory',
                    description: 'Dynamic multi-vendor inventory with filters by site, role and platform'
                },
                {
                    feature: 'Network Topology',
                    description: 'Interactive topology map with physical, control plane, routing, OSPF, BGP and STP views'
                },
                {
                    feature: 'Configuration Compliance',
                    description: 'Configuration compliance validation with rules, tests and diagnostics'
                },
                {
                    feature: 'Configuration Generator',
                    description: 'Standard configuration generation using templates and service variables'
                },
                {
                    feature: 'Automation Orchestrator',
                    description: 'Audit execution, inventory sync and scheduled jobs'
                },
                {
                    feature: 'Configuration Backups',
                    description: 'Device configuration viewer and download'
                },
                {
                    feature: 'IP Intelligence (IPAM)',
                    description: 'Network IP addressing map with detected subnets and routing peers'
                },
                {
                    feature: 'FinOps',
                    description: 'Automation ROI calculator and operational cost analysis'
                },
                {
                    feature: 'Real-time Telemetry',
                    description: 'SNMP metrics (CPU, memory, interfaces) with time-series visualization',
                    advanced: true
                },
                {
                    feature: 'Digital Twin',
                    description: 'Network snapshots, intended vs running comparison and drift detection',
                    advanced: true
                },
                {
                    feature: 'AI Network Insights',
                    description: 'Automated analysis of risk, configuration and capacity',
                    advanced: true
                },
                {
                    feature: 'Advanced Reports',
                    description: 'Network health, drift, capacity, port usage and configuration risk reports',
                    advanced: true
                },
                {
                    feature: 'Multi-tenant Management',
                    description: 'Multi-organization platform with tenant data isolation',
                    advanced: true
                }
            ],
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
                'Configuration icon',
                'Configuration build icon',
                'Telemetry icon',
                'Inventory icon',
                'Graph topology icon',
                'Digital twin icon',
                'Reports icon',
                'Calendar and jobs icon'
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
        if (heroBadgesContainer) {
            heroBadgesContainer.setAttribute('aria-label', copy.heroBadgesAria);
        }
        setTextList(document.querySelectorAll('.hero-badges span'), copy.heroBadges);
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

        setText(document.querySelector('.contact-copy .eyebrow'), copy.contactEyebrow);
        setText(document.querySelector('.contact-copy h2'), copy.contactTitle);
        setText(document.querySelector('.contact-copy > p'), copy.contactBody);
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
