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
    const familySectionEl = document.querySelector('.family-section');
    const argosSectionEl = document.querySelector('.argos-section');
    const proSectionEl = document.querySelector('.pro-section');
    const videoSectionEl = document.querySelector('.video-section');
    const resourcesSectionEl = document.querySelector('.resources-section');
    const brandImage = document.querySelector('.brand img');
    const brandWordmark = document.querySelector('.brand-wordmark');
    const heroImage = document.querySelector('.hero-visual img');
    const platformImage = document.querySelector('.platform-visual img');
    const serviceIcons = document.querySelectorAll('.services-grid .service-card .service-icon');
    const showcaseImages = document.querySelectorAll('.showcase-grid img');
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

    // Las dos licencias dejaron de ser comparables celda por celda: Oktavia Pro
    // incluye diecinueve modulos y la otra tres. Una tabla de palomitas contra
    // guiones ocupaba media pantalla para decir "casi todo esta en Pro". Cada
    // licencia se lista con lo que trae, y cada modulo con lo que hace, que es
    // lo que un evaluador necesita leer sin pasar el raton por encima.
    const renderLicensingPlans = function (copy) {
        const listas = document.querySelectorAll('.licensing-plan-list');

        if (!listas.length || !Array.isArray(copy.licensingPlanItems)) {
            return;
        }

        listas.forEach(function (lista, indice) {
            const modulos = copy.licensingPlanItems[indice];

            if (!Array.isArray(modulos)) {
                return;
            }

            // Se arma por DOM y no concatenando HTML: el texto viene del
            // diccionario, pero no hay razon para reintroducir un escape manual.
            const fragmento = document.createDocumentFragment();

            modulos.forEach(function (modulo) {
                const item = document.createElement('li');
                const nombre = document.createElement('strong');

                nombre.textContent = modulo.module;
                item.appendChild(nombre);
                item.appendChild(document.createTextNode(modulo.description));
                fragmento.appendChild(item);
            });

            lista.textContent = '';
            lista.appendChild(fragmento);
        });
    };

    // Cada punto abre con lo que hace la capacidad, en negrita, y sigue con el
    // detalle. Se arma por DOM para no reintroducir un escape manual de HTML.
    const renderHeroPoints = function (copy) {
        const puntos = document.querySelectorAll('.hero-points li');

        if (!puntos.length || !Array.isArray(copy.heroPoints)) {
            return;
        }

        puntos.forEach(function (elemento, indice) {
            const punto = copy.heroPoints[indice];

            if (!punto || typeof punto.label !== 'string') {
                return;
            }

            const etiqueta = document.createElement('strong');
            etiqueta.textContent = punto.label;
            elemento.textContent = '';
            elemento.appendChild(etiqueta);
            elemento.appendChild(document.createTextNode(punto.text || ''));
        });
    };

    const translations = {
        es: {
            htmlLang: 'es',
            title: 'Oktanet · Automatización de redes multivendor',
            metaDescription: 'Oktanet presta servicios profesionales de automatización de redes: Oktavia como plataforma y Argos como asistente. Detecta la desviación, propone el cambio, lo aplica con aprobación y confirma que cerró.',
            brandAria: 'Ir al inicio',
            navAria: 'Principal',
            navToggleOpen: 'Abrir menú',
            navToggleClose: 'Cerrar menú',
            navLinks: ['Oktavia', 'Argos', 'Servicios', 'Metodología', 'Casos de uso', 'Licencias', 'Recursos'],
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
            heroTitle: 'tu red bajo control.',
            heroTitleBrand: 'Oktanet:',
            heroBody: 'Servicios profesionales de automatización de redes. Llevamos tu red multivendor a un estándar declarado, verificable y corregible, con Oktavia como plataforma y Argos como asistente. Diseño, implementación y operación, llave en mano.',
            heroActions: ['Solicitar una demostración', 'Ver la información', 'Descargar el PDF'],
            heroPoints: [
                {
                    label: 'Descubre y audita.',
                    text: ' Inventario, topología y cumplimiento de toda la red en minutos, sin revisar un solo equipo a mano.'
                },
                {
                    label: 'Corrige y verifica.',
                    text: ' Propone el cambio, lo aplica sólo con tu aprobación y vuelve a auditar para confirmar que el problema cerró.'
                },
                {
                    label: 'Seguridad con evidencia.',
                    text: ' La postura de tus firewalls y switches, con la línea de configuración que sustenta cada hallazgo.'
                },
                {
                    label: 'Pregunta en tu idioma.',
                    text: ' Argos responde con datos de tu red, y te dice antes de pulsar si la respuesta consume IA.'
                }
            ],
            trustLabel: 'Multivendor en producción, y más fabricantes se integran por proyecto:',
            platformEyebrow: 'Oktavia · La plataforma',
            platformTitle: 'Oktavia: motor de automatización, interfaz web y ChatOps para operar la red con control continuo.',
            platformBody: 'Oktavia integra descubrimiento multifabricante, cumplimiento por sitio, rol o dispositivo, configuración deseada, seguridad de red y remediación verificada en una sola consola. Argos, el asistente de ChatOps, atraviesa todos los módulos y declara en cada acción si consume el modelo de IA o si se resuelve de forma determinista.',
            platformChips: [
                'Ciclo cerrado con aprobación',
                'ChatOps con el costo de IA a la vista',
                'Artefactos versionables',
                'Multi-tenant',
                'API REST con clave de API'
            ],
            videoAria: 'Oktavia en video',
            videoEyebrow: 'Oktavia en video',
            videoTitle: 'Ver la plataforma funcionando, sin pedir una demostración.',
            videoIntro: 'Recorridos cortos por cada módulo, grabados sobre la plataforma real. El reproductor sólo se carga cuando pulsas, así que pasar por aquí no te rastrea.',
            videoTitulo: 'Video de Oktavia',
            videoTitulos: [
                'Tu red bajo control',
                'El centro de automatización',
                'Descubrimiento de red',
                'El inventario',
                'De la visibilidad al cumplimiento',
                'Gemelo digital: detectar y remediar'
            ],
            videoCuerpos: [
                'El recorrido comercial de la plataforma, en dos minutos.',
                'El panel principal: cumplimiento, dispositivos accesibles y actividad reciente.',
                'Cómo se construye la fuente de verdad a partir de los equipos que ya tienes.',
                'Equipos, sitios, roles y plataformas, con filtros y exportación.',
                'La auditoría: qué falló, con qué severidad y qué líneas de configuración faltan.',
                'El ciclo cerrado: proponer, aprobar, aplicar y verificar que el hallazgo cerró.'
            ],
            videoCanal: 'Ver el canal completo en YouTube',
            familyAria: 'Oktanet, Oktavia y Argos',
            familyEyebrow: 'Una plataforma, un asistente, un equipo que lo implementa',
            familyTitle: 'Tres frentes para que la red haga lo que dice su estándar.',
            familyNames: ['Oktavia', 'Argos', 'Servicios profesionales'],
            familyRoles: ['La plataforma', 'El asistente', 'La implementación'],
            familyBodies: [
                'Descubre, audita, corrige y verifica sobre Cisco, Fortinet y Juniper. Cada ejecución deja artefacto descargable y cada cambio pasa por una persona.',
                'ChatOps integrado en todas las pantallas de Oktavia. Responde con datos de la red y declara si consume IA antes de que pulses.',
                'Onboarding de datos, discovery controlado, línea base de intención y alta de servicios nuevos. La red queda operando, no sólo licenciada.'
            ],
            familyLogoAlts: ['Logo de Oktavia', 'Logo de Argos', 'Logo de Oktanet'],
            familyMore: 'Ver más',
            argosAria: 'Argos, el ChatOps de red',
            argosEyebrow: 'Argos · ChatOps de red',
            argosTitle: 'Se le pregunta en lenguaje natural y responde con datos de tu red.',
            argosIntro: 'Dos principios lo separan de un asistente genérico. Cada respuesta declara si consumió el modelo de IA o si se resolvió de forma determinista, así que el costo es visible antes de pulsar. Y ninguna acción que toque la red ocurre sin que una persona la apruebe.',
            argosLogoAlt: 'Logo de Argos',
            argosTitles: ['Entender', 'Investigar', 'Configurar', 'Cerrar el ciclo'],
            argosBodies: [
                'Estado de la red, cumplimiento, qué atender primero y el diagnóstico de un equipo o un sitio, sin abrir otra pantalla.',
                'El camino entre dos direcciones IP con ida y regreso, la correlación de fallas contra la configuración y los equipos que no responden.',
                'Se describe el servicio en lenguaje natural o se pega la configuración, y Argos la propone como intención declarada para que la edites antes de aplicar.',
                'Auditar, ver el cumplimiento, llevarlo al Gemelo Digital, aprobar y verificar. Cada paso es un botón, no una frase que haya que teclear.'
            ],
            argosNote: 'La mayoría de lo que hace Argos no consume el modelo: son consultas y cálculos sobre datos ya recolectados, con resultado reproducible. El modelo entra cuando hay que redactar, priorizar o interpretar lenguaje libre, y nunca inventa hallazgos: trabaja con los que el cálculo produjo.',
            proAria: 'Servicios profesionales de Oktanet',
            proEyebrow: 'Servicios profesionales',
            proTitle: 'La implementación llave en mano, no sólo la licencia.',
            proIntro: 'Una plataforma de automatización no sirve si nadie carga el inventario, declara la intención y ajusta las reglas a cómo opera la red de verdad. Ese trabajo lo hacemos nosotros, contigo, hasta que tu equipo lo recorre solo.',
            proLogoAlt: 'Logo de Oktanet',
            proTitles: [
                'Onboarding de datos',
                'Discovery controlado',
                'Revisión de intención',
                'Validación y ajuste',
                'Alta de servicios nuevos',
                'Operación asistida'
            ],
            proBodies: [
                'Recibimos tu inventario, homologamos nombres, roles, sitios, plataformas y modelos, y lo cargamos con el formato que la plataforma espera.',
                'Validamos alcanzabilidad, ejecutamos el descubrimiento por lotes, recolectamos respaldos y normalizamos el inventario observado.',
                'Revisamos el estándar que ya tienes, lo declaramos como intención por alcance y activamos las verificaciones de cumplimiento que corresponden.',
                'Corremos la auditoría completa, revisamos los tableros contigo y ajustamos reglas y excepciones hasta que el resultado refleje tu operación.',
                'Diseñamos e implementamos servicios sobre la plataforma: túneles entre sitios, publicación de redes, DHCP por VLAN, cada uno con su rollback.',
                'Acompañamos las primeras remediaciones y el ciclo completo hasta que tu equipo lo recorre solo, con las ventanas y aprobadores que ya usas.'
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
            showcaseTitle: 'Una sola fuente de verdad, y una intención declarada sobre ella.',
            showcaseIntro: 'El descubrimiento de red construye el inventario y la topología, que son la fuente de verdad. Sobre ella se declara la intención: lo que cada equipo debería tener configurado.',
            showcaseCaptions: [
                'El configurador: la herramienta de intención, siempre disponible para crear o editar un servicio a mano.',
                'Inventario técnico consolidado, con trazabilidad de software, hardware y metadatos. Lo produce el descubrimiento.',
                'Topología física y plano de control, con vistas de enrutamiento (BGP/OSPF) para analizar el impacto de un cambio.'
            ],
            showcaseNotaAntes: 'El camino habitual para declarar o editar un servicio es pedírselo a ',
            showcaseNotaEnlace: 'Argos',
            showcaseNotaDespues: ', que propone el cambio conversando. El configurador sigue ahí para cuando prefieras hacerlo a mano.',
            featureFocusEyebrow: 'Capacidades destacadas',
            featureFocusTitle: 'Lo que separa a Oktavia de una herramienta de auditoría: cerrar el ciclo, no sólo señalarlo.',
            featureFocusIntro: 'Encontrar un problema no sirve si corregirlo sigue siendo manual, y aplicar un cambio a ciegas no sirve si nadie verifica que quedó bien. El mismo ciclo corrige desviaciones y da de alta servicios nuevos.',
            featureFocusTitles: [
                'Ciclo cerrado de remediación verificada',
                'Argos: ChatOps con el costo de la IA a la vista',
                'Seguridad de red con la evidencia a la vista'
            ],
            featureFocusBodies: [
                'Auditar, proponer contra la intención declarada, revisar el diff en el Gemelo Digital, aprobar, aplicar con la primitiva segura del fabricante y volver a auditar para confirmar que cerró.',
                'La mayoría de las consultas no consumen el modelo: son cálculos reproducibles sobre datos ya recolectados. Cada acción lleva su marca antes de pulsarla.',
                'Puntaje por perímetro, gestión, identidades y segmentación, calculado sobre la configuración real. Cada hallazgo trae la línea que lo sustenta y su corrección en la sintaxis del fabricante.'
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
                'Acceso controlado y datos en casa',
                'Dos licencias'
            ],
            aboutCardBodies: [
                'Cada fabricante se integra con adaptador de descubrimiento, normalizador, reglas de cumplimiento y plantillas Jinja.',
                'Prioriza remediación supervisada con aprobación, evitando automatizaciones opacas y no auditables.',
                'Se despliega en tu infraestructura, el acceso entra por tu proveedor de identidad con Okta y segundo factor, y las credenciales van cifradas en reposo.',
                'Oktavia Pro incluye la plataforma completa. La telemetría continua y la orquestación de eventos se licencian aparte por su perfil de consumo.'
            ],
            licensingAria: 'Licenciamiento Oktavia',
            licensingEyebrow: 'Licenciamiento',
            licensingTitle: 'Dos licencias',
            licensingIntro: 'Oktavia Pro es la plataforma completa. La telemetría continua y el motor de eventos se licencian aparte porque almacenan series de tiempo y corren un evaluador permanente, y no toda red los necesita desde el día uno.',
            licensingPlanLabels: ['Licencia principal', 'Licencia adicional'],
            licensingPlanTitles: ['Oktavia Pro', 'Telemetría y Orquestación de Eventos'],
            licensingPlanBodies: [
                'La plataforma completa. Todo lo necesario para descubrir la red, verificar que cumpla el estándar, corregir lo que no cumple y dar de alta servicios nuevos, con aprobación humana en cada cambio.',
                'Se licencia aparte porque almacena series de tiempo y corre un evaluador permanente: tiene otro perfil de consumo. No toda red la necesita desde el primer día, y la que la necesita la suma cuando quiere.'
            ],
            licensingPlanItems: [
                [
                    {
                        module: 'Auditoría del estado de red',
                        description: ' Inventario, conectividad, configuración y cumplimiento en una sola operación.'
                    },
                    {
                        module: 'Inventario de red',
                        description: ' Multifabricante, con filtros por sitio, rol, plataforma, modelo y metadatos.'
                    },
                    {
                        module: 'Topología y trazado de rutas',
                        description: ' Vistas física y de plano de control, y el camino real entre dos direcciones IP.'
                    },
                    {
                        module: 'Cumplimiento de configuración',
                        description: ' Reglas editables por sitio, rol o dispositivo, con severidad y evidencia.'
                    },
                    {
                        module: 'Configuración deseada por alcance',
                        description: ' Desde plantillas y variables, con precedencia por sitio, modelo, rol y equipo.'
                    },
                    {
                        module: 'Ciclo cerrado de remediación',
                        description: ' Proponer, revisar el diff, aprobar, aplicar y verificar que el hallazgo cerró.'
                    },
                    {
                        module: 'Alta de servicios nuevos',
                        description: ' Túneles, publicación de redes y DHCP, cada uno con su rollback.'
                    },
                    {
                        module: 'Argos, ChatOps de red',
                        description: ' El asistente completo, con la marca de qué consume IA y qué no.'
                    },
                    {
                        module: 'Seguridad de red',
                        description: ' Perímetro, gestión, identidades y segmentación, con evidencia por hallazgo.'
                    },
                    {
                        module: 'Inventario de servicios',
                        description: ' Qué hay configurado en cada equipo y cuánto está declarado como intención.'
                    },
                    {
                        module: 'Análisis de políticas de firewall',
                        description: ' Qué política decide un flujo en cada salto, con su NAT y su registro.'
                    },
                    {
                        module: 'Gemelo digital',
                        description: ' Configuración deseada contra activa, y el diff que se aprueba antes de aplicar.'
                    },
                    {
                        module: 'Respaldos de configuración',
                        description: ' Consulta, comparación y descarga por dispositivo y por fecha.'
                    },
                    {
                        module: 'Inteligencia IP (IPAM)',
                        description: ' Subredes, solapamientos y la ubicación de una IP hasta el puerto de acceso.'
                    },
                    {
                        module: 'Reportes avanzados',
                        description: ' Salud, riesgo, desvíos, capacidad y puertos, listos para auditoría.'
                    },
                    {
                        module: 'Provisioning y gestión de sitios',
                        description: ' Tipos de sitio, sitios y roles definidos antes del primer descubrimiento.'
                    },
                    {
                        module: 'Operaciones y auditorías programadas',
                        description: ' Ejecución y programación, con historial de trabajos y artefactos.'
                    },
                    {
                        module: 'FinOps',
                        description: ' Retorno de inversión de la automatización y análisis de ahorro operativo.'
                    },
                    {
                        module: 'Gestión multi-tenant',
                        description: ' Multi-organización, usuarios y separación de datos por cliente.'
                    }
                ],
                [
                    {
                        module: 'Telemetría en tiempo real',
                        description: ' CPU, memoria e interfaces como series de tiempo, con umbrales y tendencias.'
                    },
                    {
                        module: 'Dashboards y compatibilidad con Grafana',
                        description: ' Tableros propios, y la base de métricas como fuente directa de Grafana.'
                    },
                    {
                        module: 'Motor de automatización de eventos',
                        description: ' Reglas que reaccionan solas ante caídas de BGP u OSPF y umbrales de CPU.'
                    }
                ]
            ],
            resourcesAria: 'Recursos y documentación de Oktavia',
            resourcesEyebrow: 'Recursos',
            resourcesTitle: 'Documentación abierta para evaluar Oktavia sin pedir permiso.',
            resourcesIntro: 'El documento reúne módulos, cobertura por fabricante, integraciones, licenciamiento y tiempos de implementación, y se puede leer en línea o descargar en PDF.',
            resourceCardTitle: 'Información de Oktavia',
            resourceCardBody: 'Documento comercial y técnico de la plataforma: los quince módulos con su alcance, las siete categorías de valor, cobertura y acceso por fabricante, integraciones con el ecosistema, el modelo de dos licencias, casos de uso y el proceso de implementación con sus tiempos estimados.',
            resourceCardMeta: 'Documento de plataforma · PDF en español e inglés · Actualizado en 2026',
            resourceActions: ['Ver en línea', 'PDF en español', 'PDF in English', 'Ver toda la documentación'],
            resourceOnlineHref: 'docs/oktavia.html',
            documentPdfHref: 'docs/oktavia-es.pdf',
            contactEyebrow: 'Conversemos',
            contactTitle: 'Evalúa Oktavia en un entorno controlado y orientado a resultados.',
            contactBody: 'Comparte tu contexto técnico para diseñar un inicio rápido de descubrimiento, cumplimiento y generación de configuraciones en tu entorno actual.',
            officeTitle: 'Oficina principal',
            officeLines: ['Torre de Oficinas, Downtown Reforma', 'Ciudad de México'],
            formLabels: ['Nombre completo', 'Correo electrónico', 'Empresa', '¿Qué deseas resolver?'],
            submitButton: 'Enviar solicitud',
            footerTagline: 'Oktanet: tu red bajo control.',
            copyright: 'Todos los derechos reservados.',
            heroImageAlt: 'Centro de automatización de red de Oktavia con el cumplimiento global y la actividad reciente',
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
            featureFocusImageAlts: [
                'Gemelo Digital de Oktavia con un cambio propuesto y sus botones de aprobar y ejecutar',
                'Argos, el asistente de red de Oktavia, con sus acciones marcadas según consuman IA o no',
                'Postura de seguridad de red en Oktavia, con puntaje por dominio y hallazgos por equipo'
            ],
            footerLogoAlt: 'Símbolo de Oktanet'
        },
        en: {
            htmlLang: 'en',
            title: 'Oktanet · Multi-vendor network automation',
            metaDescription: 'Oktanet delivers professional network automation services: Oktavia as the platform and Argos as the assistant. It finds the deviation, proposes the change, applies it with approval, and confirms the finding closed.',
            brandAria: 'Back to top',
            navAria: 'Main',
            navToggleOpen: 'Open menu',
            navToggleClose: 'Close menu',
            navLinks: ['Oktavia', 'Argos', 'Services', 'Methodology', 'Use Cases', 'Licensing', 'Resources'],
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
            heroTitle: 'your network under control.',
            heroTitleBrand: 'Oktanet:',
            heroBody: 'Professional network automation services. We bring your multi-vendor network to a declared, verifiable, and fixable standard, with Oktavia as the platform and Argos as the assistant. Design, implementation, and operation, turnkey.',
            heroActions: ['Request a Demo', 'Read the information', 'Download the PDF'],
            heroPoints: [
                {
                    label: 'Discover and audit.',
                    text: ' Inventory, topology, and compliance across the whole network in minutes, without reviewing a single device by hand.'
                },
                {
                    label: 'Fix and verify.',
                    text: ' It proposes the change, applies it only with your approval, and audits again to confirm the problem closed.'
                },
                {
                    label: 'Security with evidence.',
                    text: ' The posture of your firewalls and switches, with the configuration line backing every finding.'
                },
                {
                    label: 'Ask in plain language.',
                    text: ' Argos answers with your own network data, and tells you before you click whether the answer consumes AI.'
                }
            ],
            trustLabel: 'Multi-vendor in production, and more vendors are integrated per project:',
            platformEyebrow: 'Oktavia · The platform',
            platformTitle: 'Oktavia: automation engine, web UI, and ChatOps for continuous-control network operations.',
            platformBody: 'Oktavia unifies multi-vendor discovery, compliance by site, role, or device, desired configuration, network security, and verified remediation in one console. Argos, the ChatOps assistant, spans every module and states for each action whether it consumes the AI model or resolves deterministically.',
            platformChips: [
                'Closed loop with approval',
                'ChatOps with AI cost in plain sight',
                'Versioned artifacts',
                'Multi-tenant',
                'REST API with API key'
            ],
            videoAria: 'Oktavia on video',
            videoEyebrow: 'Oktavia on video',
            videoTitle: 'See the platform working, without asking for a demo.',
            videoIntro: 'Short walkthroughs of each module, recorded on the real platform. The player only loads when you click, so passing through here does not track you. Videos are in Spanish.',
            videoTitulo: 'Oktavia video',
            videoTitulos: [
                'Your network under control',
                'The automation center',
                'Network discovery',
                'The inventory',
                'From visibility to compliance',
                'Digital Twin: detect and remediate'
            ],
            videoCuerpos: [
                'The commercial walkthrough of the platform, in two minutes.',
                'The main dashboard: compliance, reachable devices, and recent activity.',
                'How the source of truth is built from the devices you already have.',
                'Devices, sites, roles, and platforms, with filters and export.',
                'The audit: what failed, at what severity, and which configuration lines are missing.',
                'The closed loop: propose, approve, apply, and verify the finding closed.'
            ],
            videoCanal: 'Browse the full channel on YouTube',
            familyAria: 'Oktanet, Oktavia and Argos',
            familyEyebrow: 'One platform, one assistant, one team that implements it',
            familyTitle: 'Three fronts so the network does what its standard says.',
            familyNames: ['Oktavia', 'Argos', 'Professional services'],
            familyRoles: ['The platform', 'The assistant', 'The implementation'],
            familyBodies: [
                'It discovers, audits, fixes, and verifies across Cisco, Fortinet, and Juniper. Every run leaves a downloadable artifact and every change goes through a person.',
                'ChatOps embedded in every Oktavia screen. It answers with network data and states whether it consumes AI before you click.',
                'Data onboarding, controlled discovery, intent baseline, and new service rollout. The network ends up running, not just licensed.'
            ],
            familyLogoAlts: ['Oktavia logo', 'Argos logo', 'Oktanet logo'],
            familyMore: 'See more',
            argosAria: 'Argos, the network ChatOps',
            argosEyebrow: 'Argos · network ChatOps',
            argosTitle: 'You ask in plain language and it answers with your own network data.',
            argosIntro: 'Two principles separate it from a generic assistant. Every answer states whether it consumed the AI model or resolved deterministically, so the cost is visible before you click. And no action that touches the network happens without a person approving it.',
            argosLogoAlt: 'Argos logo',
            argosTitles: ['Understand', 'Investigate', 'Configure', 'Close the loop'],
            argosBodies: [
                'Network state, compliance, what to address first, and the diagnosis of a device or a site, without opening another screen.',
                'The path between two IP addresses forward and back, the correlation of failures against configuration, and the devices that do not answer.',
                'Describe the service in plain language or paste the configuration, and Argos proposes it as declared intent for you to edit before applying.',
                'Audit, read the compliance result, take it to the Digital Twin, approve, and verify. Each step is a button, not a sentence you have to type.'
            ],
            argosNote: 'Most of what Argos does never touches the model: they are queries and calculations over already collected data, with reproducible results. The model steps in when something has to be written, prioritized, or interpreted from free text, and it never invents findings: it works with the ones the calculation produced.',
            proAria: 'Oktanet professional services',
            proEyebrow: 'Professional services',
            proTitle: 'Turnkey implementation, not just the license.',
            proIntro: 'An automation platform is worthless if nobody loads the inventory, declares the intent, and tunes the rules to how the network actually runs. We do that work, with you, until your team walks it on its own.',
            proLogoAlt: 'Oktanet logo',
            proTitles: [
                'Data onboarding',
                'Controlled discovery',
                'Intent review',
                'Validation and tuning',
                'New service rollout',
                'Assisted operation'
            ],
            proBodies: [
                'We take your inventory, normalize names, roles, sites, platforms, and models, and load it in the format the platform expects.',
                'We validate reachability, run discovery in batches, collect backups, and normalize the observed inventory.',
                'We review the standard you already have, declare it as intent per scope, and enable the compliance checks that apply.',
                'We run the full audit, review the dashboards with you, and tune rules and exceptions until the result reflects your operation.',
                'We design and implement services on the platform: tunnels between sites, network advertisement, DHCP per VLAN, each with its rollback.',
                'We walk the first remediations and the full cycle with you until your team does it alone, with the windows and approvers you already use.'
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
            showcaseTitle: 'One source of truth, and a declared intent on top of it.',
            showcaseIntro: 'Network discovery builds the inventory and the topology, which are the source of truth. Intent is declared on top of it: what each device should have configured.',
            showcaseCaptions: [
                'The configurator: the intent tool, always available to create or edit a service by hand.',
                'Consolidated technical inventory, with software, hardware, and metadata traceability. Discovery produces it.',
                'Physical and control-plane topology, with routing views (BGP/OSPF) to analyze the impact of a change.'
            ],
            showcaseNotaAntes: 'The usual path to declare or edit a service is to ask ',
            showcaseNotaEnlace: 'Argos',
            showcaseNotaDespues: ', which proposes the change by conversation. The configurator is still there for when you prefer to do it by hand.',
            featureFocusEyebrow: 'Highlighted capabilities',
            featureFocusTitle: 'What separates Oktavia from an audit tool: closing the loop, not just pointing at it.',
            featureFocusIntro: 'Finding a problem is worthless if fixing it stays manual, and applying a change blind is worthless if nobody verifies it landed right. The same cycle fixes deviations and rolls out new services.',
            featureFocusTitles: [
                'Verified closed-loop remediation',
                'Argos: ChatOps with the AI cost in plain sight',
                'Network security with the evidence in plain sight'
            ],
            featureFocusBodies: [
                'Audit, propose against declared intent, review the diff in the Digital Twin, approve, apply with the vendor safe primitive, and audit again to confirm it closed.',
                'Most queries never touch the model: they are reproducible calculations over data already collected. Every action carries its mark before you click it.',
                'A score for perimeter, management, identities, and segmentation, computed on the real configuration. Every finding carries the line that backs it and its fix in the vendor own syntax.'
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
                'Controlled access, data stays home',
                'Two licenses'
            ],
            aboutCardBodies: [
                'Each vendor is integrated through a discovery adapter, normalizer, compliance rule set, and Jinja templates.',
                'It prioritizes supervised remediation with approvals, avoiding opaque and non-auditable automation.',
                'It deploys on your own infrastructure, access goes through your identity provider with Okta and a second factor, and credentials are encrypted at rest.',
                'Oktavia Pro includes the complete platform. Continuous telemetry and event orchestration are licensed separately because of their consumption profile.'
            ],
            licensingAria: 'Oktavia licensing',
            licensingEyebrow: 'Licensing',
            licensingTitle: 'Two licenses',
            licensingIntro: 'Oktavia Pro is the complete platform. Continuous telemetry and the event engine are licensed separately because they store time series and run a permanent evaluator, and not every network needs them on day one.',
            licensingPlanLabels: ['Main license', 'Add-on license'],
            licensingPlanTitles: ['Oktavia Pro', 'Telemetry and Event Orchestration'],
            licensingPlanBodies: [
                'The complete platform. Everything needed to discover the network, verify it meets the standard, fix what does not, and roll out new services, with human approval on every change.',
                'Licensed separately because it stores time series and runs a permanent evaluator: a different consumption profile. Not every network needs it on day one, and the ones that do can add it whenever they want.'
            ],
            licensingPlanItems: [
                [
                    {
                        module: 'Network state audit',
                        description: ' Inventory, connectivity, configuration, and compliance in a single operation.'
                    },
                    {
                        module: 'Network inventory',
                        description: ' Multi-vendor, with filters by site, role, platform, model, and metadata.'
                    },
                    {
                        module: 'Topology and path tracing',
                        description: ' Physical and control-plane views, and the live path between two IP addresses.'
                    },
                    {
                        module: 'Configuration compliance',
                        description: ' Rules editable by site, role, or device, with severity and evidence.'
                    },
                    {
                        module: 'Scoped desired configuration',
                        description: ' From templates and variables, with precedence by site, model, role, and device.'
                    },
                    {
                        module: 'Closed-loop remediation',
                        description: ' Propose, review the diff, approve, apply, and verify the finding closed.'
                    },
                    {
                        module: 'New service rollout',
                        description: ' Tunnels, network advertisement, and DHCP, each with its rollback.'
                    },
                    {
                        module: 'Argos, network ChatOps',
                        description: ' The complete assistant, with the mark for what consumes AI and what does not.'
                    },
                    {
                        module: 'Network security',
                        description: ' Perimeter, management, identities, and segmentation, with evidence per finding.'
                    },
                    {
                        module: 'Service inventory',
                        description: ' What is configured on each device and how much is declared as intent.'
                    },
                    {
                        module: 'Firewall policy analysis',
                        description: ' Which policy decides a flow at each hop, with its NAT and its logging.'
                    },
                    {
                        module: 'Digital Twin',
                        description: ' Desired against live configuration, and the diff approved before applying.'
                    },
                    {
                        module: 'Configuration backups',
                        description: ' Lookup, comparison, and download by device and by date.'
                    },
                    {
                        module: 'IP Intelligence (IPAM)',
                        description: ' Subnets, overlaps, and the location of an IP down to the access port.'
                    },
                    {
                        module: 'Advanced reports',
                        description: ' Health, risk, drift, capacity, and ports, ready for audit.'
                    },
                    {
                        module: 'Provisioning and site management',
                        description: ' Site types, sites, and roles defined before the first discovery run.'
                    },
                    {
                        module: 'Operations and scheduled audits',
                        description: ' Running and scheduling, with job history and artifacts.'
                    },
                    {
                        module: 'FinOps',
                        description: ' Automation return on investment and operational savings analysis.'
                    },
                    {
                        module: 'Multi-tenant management',
                        description: ' Multi-organization, users, and per-customer data separation.'
                    }
                ],
                [
                    {
                        module: 'Real-time telemetry',
                        description: ' CPU, memory, and interfaces as time series, with thresholds and trends.'
                    },
                    {
                        module: 'Dashboards and Grafana compatibility',
                        description: ' Native dashboards, and the metrics store as a direct Grafana datasource.'
                    },
                    {
                        module: 'Event automation engine',
                        description: ' Rules that react on their own to BGP or OSPF drops and CPU thresholds.'
                    }
                ]
            ],
            resourcesAria: 'Oktavia resources and documentation',
            resourcesEyebrow: 'Resources',
            resourcesTitle: 'Open documentation, so evaluating Oktavia never requires asking permission.',
            resourcesIntro: 'The document gathers modules, per-vendor coverage, integrations, licensing, and implementation timelines, and can be read online or downloaded as a PDF.',
            resourceCardTitle: 'Oktavia platform information',
            resourceCardBody: 'Commercial and technical document for the platform: the fifteen modules and their scope, the seven value categories, coverage and access method per vendor, ecosystem integrations, the two-license model, use cases, and the implementation process with estimated timelines.',
            resourceCardMeta: 'Platform document · PDF in Spanish and English · Updated 2026',
            resourceActions: ['Read online', 'PDF en español', 'PDF in English', 'Browse all documentation'],
            resourceOnlineHref: 'docs/oktavia-en.html',
            documentPdfHref: 'docs/oktavia-en.pdf',
            contactEyebrow: 'Let\'s talk',
            contactTitle: 'Evaluate Oktavia in a controlled, outcome-driven setup.',
            contactBody: 'Share your technical context to design a quickstart for discovery, compliance, and config generation in your current environment.',
            officeTitle: 'Head Office',
            officeLines: ['Office Tower, Downtown Reforma', 'Mexico City'],
            formLabels: ['Full name', 'Email', 'Company', 'What do you need to solve?'],
            submitButton: 'Send Request',
            footerTagline: 'Oktanet: your network under control.',
            copyright: 'All rights reserved.',
            heroImageAlt: 'Oktavia network automation center showing global compliance and recent activity',
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
            featureFocusImageAlts: [
                'Oktavia Digital Twin showing a proposed change with its approve and execute buttons',
                'Argos, the Oktavia network assistant, with each action marked by whether it consumes AI',
                'Oktavia network security posture, with a score per domain and findings per device'
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

        // El titular lleva el nombre en su propia linea: se arma por DOM porque
        // textContent no admite el salto.
        const titular = document.querySelector('.hero-copy h1');

        if (titular && typeof copy.heroTitleBrand === 'string') {
            const nombre = document.createElement('span');
            nombre.className = 'hero-brandline';
            nombre.textContent = copy.heroTitleBrand;
            titular.textContent = '';
            titular.appendChild(nombre);
            titular.appendChild(document.createTextNode(' ' + copy.heroTitle));
        }
        setText(document.querySelector('.hero-copy > p'), copy.heroBody);
        setTextList(document.querySelectorAll('.hero-actions a'), copy.heroActions);
        renderHeroPoints(copy);

        setText(document.querySelector('.trust-grid > p'), copy.trustLabel);

        setText(document.querySelector('.platform-copy .eyebrow'), copy.platformEyebrow);
        setText(document.querySelector('.platform-copy h2'), copy.platformTitle);
        setText(document.querySelector('.platform-copy > p:not(.eyebrow)'), copy.platformBody);
        setTextList(document.querySelectorAll('.chip-list span'), copy.platformChips);

        if (familySectionEl) {
            familySectionEl.setAttribute('aria-label', copy.familyAria);
        }

        setText(document.querySelector('.family-section .eyebrow'), copy.familyEyebrow);
        setText(document.querySelector('.family-section h2'), copy.familyTitle);
        setTextList(document.querySelectorAll('.family-card h3'), copy.familyNames);
        setTextList(document.querySelectorAll('.family-role'), copy.familyRoles);
        setTextList(document.querySelectorAll('.family-card p:not(.family-role)'), copy.familyBodies);
        setAltList(document.querySelectorAll('.family-logo img'), copy.familyLogoAlts);

        setTextList(document.querySelectorAll('.family-ir'), [copy.familyMore, copy.familyMore, copy.familyMore]);

        if (argosSectionEl) {
            argosSectionEl.setAttribute('aria-label', copy.argosAria);
        }

        setText(document.querySelector('.argos-section .eyebrow'), copy.argosEyebrow);
        setText(document.querySelector('.argos-section h2'), copy.argosTitle);
        setText(document.querySelector('.argos-section .section-intro'), copy.argosIntro);
        setTextList(document.querySelectorAll('.argos-card h3'), copy.argosTitles);
        setTextList(document.querySelectorAll('.argos-card p'), copy.argosBodies);
        setText(document.querySelector('.argos-nota'), copy.argosNote);
        setAltList(document.querySelectorAll('.argos-section .section-mark img'), [copy.argosLogoAlt]);

        if (proSectionEl) {
            proSectionEl.setAttribute('aria-label', copy.proAria);
        }

        setText(document.querySelector('.pro-section .eyebrow'), copy.proEyebrow);
        setText(document.querySelector('.pro-section h2'), copy.proTitle);
        setText(document.querySelector('.pro-section .section-intro'), copy.proIntro);
        setTextList(document.querySelectorAll('.pro-card h3'), copy.proTitles);
        setTextList(document.querySelectorAll('.pro-card p'), copy.proBodies);
        setAltList(document.querySelectorAll('.pro-section .section-mark img'), [copy.proLogoAlt]);

        if (videoSectionEl) {
            videoSectionEl.setAttribute('aria-label', copy.videoAria);
        }

        setText(document.querySelector('.video-section .eyebrow'), copy.videoEyebrow);
        setText(document.querySelector('.video-section h2'), copy.videoTitle);
        setText(document.querySelector('.video-section .section-intro'), copy.videoIntro);
        setTextList(document.querySelectorAll('.video-item h3'), copy.videoTitulos);
        setTextList(document.querySelectorAll('.video-item p'), copy.videoCuerpos);
        setText(document.querySelector('.video-canal a'), copy.videoCanal);

        setText(document.querySelector('.services-section .eyebrow'), copy.servicesEyebrow);
        setText(document.querySelector('.services-section h2'), copy.servicesTitle);
        setTextList(document.querySelectorAll('.services-grid .service-card h3'), copy.serviceTitles);
        setTextList(document.querySelectorAll('.services-grid .service-card p'), copy.serviceBodies);

        setText(document.querySelector('.showcase-section h2'), copy.showcaseTitle);
        setText(document.querySelector('.showcase-section .section-intro'), copy.showcaseIntro);
        setTextList(document.querySelectorAll('.showcase-grid figcaption'), copy.showcaseCaptions);

        // La nota lleva un enlace en medio: se arma por DOM para no perderlo.
        const notaGaleria = document.querySelector('.showcase-nota');

        if (notaGaleria && typeof copy.showcaseNotaAntes === 'string') {
            const enlace = document.createElement('a');
            enlace.href = '#argos';
            enlace.textContent = copy.showcaseNotaEnlace;
            notaGaleria.textContent = copy.showcaseNotaAntes;
            notaGaleria.appendChild(enlace);
            notaGaleria.appendChild(document.createTextNode(copy.showcaseNotaDespues));
        }

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
        setTextList(document.querySelectorAll('.licensing-plan-body'), copy.licensingPlanBodies);
        renderLicensingPlans(copy);

        setText(document.querySelector('.resources-section .eyebrow'), copy.resourcesEyebrow);
        setText(document.querySelector('.resources-section h2'), copy.resourcesTitle);
        setText(document.querySelector('.resources-section .section-intro'), copy.resourcesIntro);
        setText(document.querySelector('.resource-card h3'), copy.resourceCardTitle);
        setText(document.querySelector('.resource-card .resource-body > p'), copy.resourceCardBody);
        setText(document.querySelector('.resource-meta'), copy.resourceCardMeta);
        setTextList(document.querySelectorAll('.resource-actions a'), copy.resourceActions);

        // El documento existe en dos idiomas: cada enlace apunta al que toca.
        [['[data-doc-online]', copy.resourceOnlineHref],
         ['[data-doc-pdf]', copy.documentPdfHref]].forEach(function (par) {
            if (typeof par[1] !== 'string') {
                return;
            }

            document.querySelectorAll(par[0]).forEach(function (enlace) {
                enlace.setAttribute('href', par[1]);
            });
        });

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
        setAltList(document.querySelectorAll('.feature-focus-shot img'), copy.featureFocusImageAlts);
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

    // El reproductor de YouTube, y con el su rastreo, solo se carga cuando
    // alguien pulsa la caratula. Hasta entonces la pagina no habla con Google.
    document.querySelectorAll('.video-caratula').forEach(function (caratula) {
        caratula.addEventListener('click', function () {
            const identificador = caratula.dataset.video;

            if (!identificador) {
                return;
            }

            const copia = translations[document.documentElement.lang] || translations.es;
            const titulo = caratula.closest('.video-item').querySelector('h3');
            const marco = document.createElement('iframe');

            marco.className = 'video-iframe';
            marco.src = 'https://www.youtube-nocookie.com/embed/' + identificador + '?autoplay=1&rel=0';
            marco.title = titulo ? titulo.textContent : copia.videoTitulo;
            marco.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture';
            marco.allowFullscreen = true;
            marco.referrerPolicy = 'strict-origin-when-cross-origin';

            caratula.replaceWith(marco);
        });
    });

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
        '.licensing-copy, .licensing-plan, ' +
        '.contact-copy, .contact-form, .footer-brand, .footer-links'
    );

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
