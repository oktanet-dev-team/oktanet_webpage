/* Catálogo de la Documentación de Oktavia.

   Aquí se da de alta cada documento UNA vez: título, resumen, palabras clave
   y estado. De este archivo salen el buscador, las tarjetas de la portada,
   el árbol de la barra lateral y el paginador. El CONTENIDO de cada documento
   vive en el HTML de su página (docs/oktavia-docs-<seccion>.html), en una
   <section class="doc-section"> cuyo id es el `id` del documento.

   Las tablas de la Referencia de datos sí viven aquí, porque son datos y no
   prosa: una fila por campo, con las mismas seis columnas en todas.

   Estado de un documento: sin `status` = publicado; 'soon' = Próximamente;
   'prep' = En preparación (existe la página pero el contenido es parcial).

   Fuente de los hechos: el componente de interfaz (UI / Source of Truth) y el
   motor de automatización (Engine) de Oktavia. Nada de aquí es un dato de
   cliente ni un detalle interno de despliegue. */
window.OKTAVIA_DOCS = (function () {
    const sections = [
        {
            id: 'inicio',
            title: 'Inicio',
            kind: 'Orientación',
            icon: 'home',
            page: 'oktavia-docs-inicio.html',
            summary: 'Qué es Oktavia, cómo está armada y el camino más corto hasta la primera auditoría.',
            keywords: ['oktavia', 'nae', 'plataforma', 'empezar'],
            docs: [
                { id: 'que-es-oktavia', title: 'Qué es Oktavia', summary: 'La plataforma, sus dos componentes y el ciclo cerrado que la define.', keywords: ['nae', 'ciclo cerrado', 'automatización', 'multivendor'] },
                { id: 'arquitectura-general', title: 'Arquitectura general', summary: 'Interfaz, motor, base de datos, series de tiempo, recolector y lo que comparten.', keywords: ['componentes', 'contenedores'] },
                { id: 'quickstart', title: 'Quickstart', summary: 'De cero a la primera auditoría con Docker Compose, en once pasos.', keywords: ['inicio rápido', 'primera auditoría', 'docker compose', 'instalar'] },
                { id: 'glosario', title: 'Glosario', summary: 'Los términos que aparecen en toda la documentación, con la definición que usa la plataforma.', keywords: ['términos', 'definiciones', 'sot', 'intended', 'drift', 'tenant'] }
            ]
        },
        {
            id: 'introduccion',
            title: 'Introducción',
            kind: 'Conceptos',
            icon: 'school',
            page: 'oktavia-docs-introduccion.html',
            summary: 'Los conceptos que conviene tener claros antes de operar: intención, observado, tenant, job y artefacto.',
            keywords: ['conceptos', 'fundamentos'],
            docs: [
                { id: 'conceptos-clave', title: 'Conceptos clave', summary: 'Intención, observado, drift, fuente de verdad, job, artefacto y carril por fabricante.', keywords: ['intended', 'observed', 'drift', 'sot', 'job', 'artefacto', 'vendor lane'] },
                { id: 'ui-vs-engine', title: 'UI vs Engine', summary: 'Qué resuelve cada componente, qué comparten y por qué deben instalarse juntos.', keywords: ['componente de interfaz', 'motor de automatización', 'responsabilidades'] },
                { id: 'flujo-end-to-end', title: 'Flujo de punta a punta', summary: 'Auditar, ingerir, revisar, proponer, aprobar, aplicar y verificar: el ciclo completo paso a paso.', keywords: ['ciclo cerrado', 'auditoría', 'ingesta', 'gemelo', 'aprobación'] },
                { id: 'multi-tenant', title: 'Multi-tenant', summary: 'Organizaciones, membresías, almacenamiento por organización y cómo el Engine resuelve el inventario de cada una.', keywords: ['organización', 'tenant', 'organization_slug', 'organization_id', 'membresía'] },
                { id: 'seguridad-credenciales', title: 'Seguridad y credenciales', summary: 'Autenticación de usuarios y entre componentes, bóveda cifrada, lista blanca de acceso y auditoría.', keywords: ['vault', 'bóveda', 'fernet', 'api key', 'oidc', 'okta', 'allowlist'] }
            ]
        },
        {
            id: 'instalacion',
            title: 'Guías de instalación',
            kind: 'Guía de instalación',
            icon: 'deployed_code',
            page: 'oktavia-docs-instalacion.html',
            summary: 'Levantar la plataforma en una máquina de trabajo o en un servidor, configurarla y resolver los tropiezos típicos.',
            keywords: ['instalar', 'despliegue', 'docker'],
            docs: [
                { id: 'instalacion-local', title: 'Instalación local', summary: 'Prerrequisitos, instalación conjunta de los dos componentes y arranque sin contenedores para desarrollo.', keywords: ['prerrequisitos', 'desarrollo'] },
                { id: 'docker-compose', title: 'Docker Compose', summary: 'Los procesos de cada componente, el orden de arranque y el punto de control obligatorio.', keywords: ['docker compose', 'contenedores', 'postgresql', 'influxdb', 'telegraf'] },
                { id: 'variables-entorno', title: 'Variables de entorno', summary: 'Las variables que hay que fijar antes del primer arranque y las tres parejas que deben coincidir.', keywords: ['.env', 'api key', 'token', 'fernet', 'secretos', 'tres parejas'] },
                { id: 'vault-credenciales', title: 'Bóveda de credenciales', summary: 'Cómo se dan de alta las credenciales de los equipos, cómo viajan al Engine y cómo migrar desde un .env.', keywords: ['vault', 'credenciales', 'ssh', 'snmp', 'token fortigate', 'migrar credenciales'] },
                { id: 'troubleshooting', title: 'Troubleshooting', summary: 'Síntomas frecuentes de instalación con su causa y su corrección.', keywords: ['errores', 'fallas', 'intended.json', 'credenciales', 'cifrado'] }
            ]
        },
        {
            id: 'operacion',
            title: 'Guías operativas',
            kind: 'Guía operativa',
            icon: 'build',
            page: 'oktavia-docs-operacion.html',
            summary: 'Cómo se usa cada módulo en el día a día: qué necesita, qué hace y qué deja como resultado.',
            keywords: ['operar', 'módulos', 'día a día'],
            docs: [
                { id: 'inventario', title: 'Inventario', summary: 'Cargar equipos por CSV, darlos de alta a mano, sincronizar con el Engine y exportar.', keywords: ['csv', 'importar', 'exportar', 'devices.csv', 'sot', 'cargar inventario'] },
                { id: 'discovery', title: 'Discovery', summary: 'Qué recolecta el Engine de cada equipo, por qué método y dónde queda el snapshot.', keywords: ['ssh', 'netconf', 'api', 'snapshot', 'normalizado'] },
                { id: 'auditorias', title: 'Auditorías', summary: 'Lanzar una auditoría completa o parcial, seguir el job y revisar sus artefactos.', keywords: ['primera auditoría', 'run_all', 'compliance_dry', 'job', 'artefactos', 'scope'] },
                { id: 'compliance', title: 'Compliance', summary: 'Reglas de configuración y de estado, puntajes, clases de no cumplimiento y diff contra la intención.', keywords: ['cumplimiento', 'reglas', 'checks', 'score', 'severidad', 'diff'] },
                { id: 'config-generator', title: 'Config Generator', summary: 'Declarar la intención por alcances, generar la configuración deseada y activar sus checks.', keywords: ['configurador', 'service_vars', 'intended config', 'jinja', 'render', 'scopes', 'catálogo'] },
                { id: 'consolas-dominio', title: 'Consolas por dominio', summary: 'Servicios por dominio: intención de config y de estado en una tabla, editable y filtrada por sitio.', keywords: ['consola', 'dominio', 'servicios', 'intención', 'campus', 'wan', 'seguridad', 'gestión'] },
                { id: 'servicios-l2-l3', title: 'Servicios de Capa 2 y Capa 3', summary: 'Mapas de la red al sitio y al equipo: adyacencias, rutas, vecinos, políticas, spanning-tree y VLAN hasta su gateway.', keywords: ['capa 2', 'capa 3', 'ospf', 'bgp', 'is-is', 'vlan', 'stp', 'topología', 'adyacencias'] },
                { id: 'analisis-ruteo', title: 'Análisis de ruteo', summary: 'Flujos desde las tablas de ruteo reales, con ida y regreso, iBGP y eBGP, y lo que encuentra cada equipo.', keywords: ['ruteo', 'flujos', 'ibgp', 'ebgp', 'asn', 'asimetría', 'path analysis'] },
                { id: 'digital-twin', title: 'Digital Twin', summary: 'Snapshots, drift y solicitudes de cambio con vista previa, aprobación, ejecución y confirmación.', keywords: ['gemelo digital', 'cambio', 'preview', 'approve', 'execute', 'rollback', 'commit confirmed'] },
                { id: 'telemetria', title: 'Telemetría', summary: 'SNMP con Telegraf e InfluxDB, syslog, métricas del plano de control y reglas de automatización.', keywords: ['snmp', 'telegraf', 'influxdb', 'métricas', 'syslog', 'alertas', 'automatización de eventos'] },
                { id: 'scheduler', title: 'Scheduler', summary: 'Programar auditorías y otros trabajos desde la UI o desde su archivo de configuración, con ingesta automática.', keywords: ['programar', 'cron', 'daily', 'weekly', 'yaml'] },
                { id: 'argos-mcp', title: 'Argos y MCP', summary: 'El asistente de operación, sus flujos deterministas y el servidor MCP de solo lectura.', keywords: ['chatops', 'asistente', 'ia', 'mcp', 'claude', 'ollama', 'ciclos'] }
            ]
        },
        {
            id: 'referencia',
            title: 'Referencia técnica',
            kind: 'Referencia',
            icon: 'data_object',
            page: 'oktavia-docs-referencia.html',
            summary: 'APIs, variables, artefactos y formatos tal como son. Sin explicar cómo operar: para eso están las guías.',
            keywords: ['api', 'referencia', 'endpoints'],
            docs: [
                { id: 'api-engine', title: 'API del Engine', summary: 'Áreas de la API del motor: auditorías, jobs, inventario, compliance, configuración, métricas y gemelo.', keywords: ['rest', 'openapi', 'swagger', 'api reference', 'autenticación'] },
                { id: 'api-ui', title: 'API de la UI', summary: 'Áreas de la API de la UI: fuente de verdad para el Engine, ingesta, intención, reglas, gemelo y asistente.', keywords: ['fuente de verdad', 'ingesta', 'openapi', 'swagger'] },
                { id: 'campos-inventario', title: 'Campos de inventario', summary: 'Resumen de las capas del inventario y enlace a las tablas completas de la Referencia de datos.', keywords: ['campos', 'inventario', 'device_inventory', 'csv'] },
                { id: 'variables-entorno', title: 'Variables de entorno', summary: 'Tabla de las variables del Engine y de la UI, con su propósito y su valor por omisión.', keywords: ['.env', 'configuración', 'secretos', 'env'] },
                { id: 'artefactos-generados', title: 'Artefactos generados', summary: 'Qué archivo deja cada paso de un job, en qué formato y dónde.', keywords: ['json', 'csv', 'cfg', 'compliance_results.json', 'summary_by_site.json', 'topology_snapshot.json'] },
                { id: 'formatos-soportados', title: 'CSV, YAML y JSON soportados', summary: 'Todos los archivos que la plataforma importa o exporta, con sus columnas y claves.', keywords: ['csv', 'yaml', 'json', 'importar', 'exportar', 'columnas'] }
            ]
        },
        {
            id: 'datos',
            title: 'Referencia de datos',
            kind: 'Referencia de datos',
            icon: 'table_chart',
            page: 'oktavia-docs-datos.html',
            summary: 'Tablas de campos: inventario base, inventario de equipos, jobs de la API, reglas de cumplimiento y variables de servicio.',
            keywords: ['campos', 'tablas', 'modelo de datos', 'esquema'],
            docs: [
                { id: 'inventario-base', title: 'Inventario base', summary: 'Las columnas del CSV de equipos que el Engine consume.', keywords: ['devices.csv', 'name', 'hostname', 'platform', 'group', 'role', 'site_type', 'lifecycle'] },
                { id: 'device-inventory', title: 'Device Inventory', summary: 'El inventario canónico que genera el discovery y consume el Config Generator.', keywords: ['device_inventory.json', 'interfaces', 'tags', 'capabilities', 'model', 'serial_number'] },
                { id: 'api-jobs', title: 'API / Jobs', summary: 'La petición de auditoría y el detalle del job que devuelve el Engine.', keywords: ['petición de auditoría', 'detalle del job', 'scope', 'scripts', 'max_workers', 'job_id', 'status', 'artifacts'] },
                { id: 'compliance-intended', title: 'Compliance / Intended', summary: 'La estructura de intended.json y de cada regla de cumplimiento.', keywords: ['intended.json', 'checks', 'severity', 'score', 'test_type', 'targets', 'required', 'forbidden', 'expected'] },
                { id: 'service-vars', title: 'Service Vars', summary: 'Los alcances de service_vars.json y los servicios que se declaran dentro de cada uno.', keywords: ['service_vars.json', 'defaults', 'by_site', 'by_role', 'by_platform', 'by_device', 'services', 'ntp', 'snmp', 'bgp', 'ospf'] }
            ]
        },
        {
            id: 'integraciones',
            title: 'Integraciones',
            kind: 'Integración',
            icon: 'hub',
            page: 'oktavia-docs-integraciones.html',
            summary: 'Qué hace Oktavia con cada fabricante y herramienta: método de acceso, qué recolecta, qué genera y cómo aplica.',
            keywords: ['fabricantes', 'vendors', 'plataformas'],
            docs: [
                { id: 'cisco-ios', title: 'Cisco IOS / IOS-XE', summary: 'SSH, 43 servicios con plantilla y remediación CLI con diff previo.', keywords: ['cisco', 'ios', 'iosxe', 'ssh', 'cli', 'remediación'] },
                { id: 'cisco-iosxr', title: 'Cisco IOS XR', summary: 'NETCONF y YANG por el puerto 830, cumplimiento por servicio hoja por hoja y el núcleo aplicado como una transacción de red con commit confirmado.', keywords: ['cisco', 'ios xr', 'iosxr', 'xr', 'netconf', 'yang', 'carrier', 'sp', 'commit confirmed', 'proveedor de servicios'] },
                { id: 'fortigate', title: 'FortiGate', summary: 'API REST por VDOM, respaldo lógico en JSON, 16 servicios de intención y aplicación con guardas.', keywords: ['fortinet', 'fortios', 'api', 'vdom', 'token'] },
                { id: 'fortiswitch', title: 'FortiSwitch', summary: 'SSH, 12 servicios de intención y telemetría SNMP.', keywords: ['fortinet', 'fortiswitchos', 'ssh'] },
                { id: 'juniper', title: 'Juniper Junos', summary: 'NETCONF por el puerto 830, 16 servicios y aplicación con commit confirmed supervisado.', keywords: ['juniper', 'junos', 'srx', 'netconf', 'commit confirmed', 'rollback'] },
                { id: 'meraki', title: 'Meraki', summary: 'Dashboard API: discovery, intención de solo lectura, eventos push y aplicación bajo bandera.', keywords: ['cisco meraki', 'dashboard api', 'mx', 'ms', 'mr', 'webhooks', 'mv sense'] },
                { id: 'influxdb-telegraf', title: 'InfluxDB / Telegraf', summary: 'Recolección SNMP y syslog por tenant, retención, perfiles por fabricante y consulta desde la UI.', keywords: ['influxdb', 'telegraf', 'snmp', 'syslog', 'grafana'] },
                { id: 'mcp-argos', title: 'MCP / Argos', summary: 'El servidor MCP de solo lectura del Engine, sus herramientas y cómo lo consumen Argos y Claude Desktop.', keywords: ['mcp', 'model context protocol', 'claude desktop', 'tools', 'resources', 'prompts', 'evidencia'] }
            ]
        },
        {
            id: 'decisiones',
            title: 'Guías de decisión',
            kind: 'Guía de decisión',
            icon: 'alt_route',
            page: 'oktavia-docs-decisiones.html',
            summary: 'Cuando hay más de una forma de hacerlo: criterios para elegir y las consecuencias de cada opción.',
            keywords: ['decidir', 'criterios', 'mejores prácticas', 'prescriptivo'],
            docs: [
                { id: 'que-auditoria', title: 'Qué auditoría ejecutar', summary: 'Auditoría completa, en seco, un paso suelto o verificación de acceso: cuál conviene en cada situación.', keywords: ['run_all', 'compliance_dry', 'ping_ssh_check', 'discovery', 'scope'] },
                { id: 'modelar-intencion', title: 'Cómo modelar la intención', summary: 'Empezar por la línea base, declarar servicios en el alcance más amplio y dejar la excepción al final.', keywords: ['intención', 'intended', 'service_vars', 'línea base', 'catálogo'] },
                { id: 'scopes', title: 'Cuándo usar defaults, by_site, by_role, by_platform o by_device', summary: 'El orden de precedencia y una regla práctica para elegir el alcance de cada variable.', keywords: ['defaults', 'by_site', 'by_site_type', 'by_role', 'by_platform', 'by_model', 'by_tag', 'by_filter', 'by_device', 'precedencia'] },
                { id: 'clasificar-campos', title: 'Cómo clasificar campos', summary: 'Qué va al inventario, qué es intención y qué es observado. Qué se declara y qué se descubre.', keywords: ['inventario', 'intención', 'observado', 'declarado', 'descubierto', 'campos'] },
                { id: 'migrar-sot', title: 'Cómo migrar desde CSV y YAML hacia la fuente de verdad', summary: 'Pasar del inventario en archivos al inventario por tenant de la UI sin perder auditorías.', keywords: ['migración', 'csv', 'yaml', 'sot', 'organización'] },
                { id: 'evidencia-compliance', title: 'Cómo preparar evidencia para compliance', summary: 'Qué artefactos conservar, cómo exportarlos y cómo presentarlos a un auditor.', keywords: ['evidencia', 'auditoría', 'csv', 'compliance_results.json', 'exportar', 'reporte'] }
            ]
        },
        /* Lo que antes vivía en páginas sueltas (Academia, Documentación y
           Artículos) ahora es parte del portal: una sola Documentación de
           Oktavia. Estas secciones no tienen página propia: su `page` es su
           bloque en la portada, y cada documento abre su propia página
           (`href`, relativo a docs/), que lleva la misma barra lateral. */
        {
            id: 'ingenieros',
            title: 'Guías para ingenieros de red',
            kind: 'Guía',
            icon: 'hub',
            page: 'oktavia-docs.html#ingenieros',
            summary: 'Para quien diseña y mantiene la intención de la red: alcances, consolas por dominio y cómo llevar un cambio a producción.',
            keywords: ['intención', 'intent', 'ingeniero de red', 'socio', 'partner', 'alcances', 'scopes', 'service_vars', 'campus', 'wan', 'seguridad', 'configurador'],
            docs: [
                { id: 'guia-intencion', href: 'guia-intencion.html', title: 'Guía de intención para ingenieros de red', summary: 'Definir y editar la intención en cualquier dominio, desde las consolas de Servicios o el Configurador.', keywords: ['intención', 'alcances', 'json', 'consola', 'dominio', 'partners'] },
            ]
        },
        {
            id: 'academia',
            title: 'Academia',
            kind: 'Curso',
            icon: 'school',
            page: 'oktavia-docs.html#academia',
            summary: 'La ruta de aprendizaje en cinco niveles. Los dos primeros cursos son gratis y sin registro.',
            keywords: ['academia', 'curso', 'aprender', 'certificación', 'entrenamiento', 'training'],
            docs: [
                { id: 'curso-automatizacion-redes', href: 'curso-automatizacion-redes.html', title: 'Nivel 1 · Fundamentos de automatización de redes', summary: 'Gratis y sin producto: CLI, SNMP, APIs, NETCONF, RESTCONF, gNMI, YANG, Jinja2, Python, Ansible, fuente de verdad, validación y telemetría.', keywords: ['curso gratis', 'netmiko', 'napalm', 'nornir', 'ansible', 'yang', 'jinja2', 'gnmi'] },
                { id: 'curso-oktavia-fundamentos', href: 'curso-oktavia-fundamentos.html', title: 'Nivel 2 · Oktavia Fundamentos', summary: 'Gratis: el ciclo cerrado, dónde encaja Oktavia, cómo funciona, sus conceptos, Argos y la IA, y la seguridad de la plataforma.', keywords: ['curso gratis', 'ciclo cerrado', 'argos', 'ia', 'evaluación'] },
                { id: 'certificacion-asociado', title: 'Nivel 3 · Certificación Oktavia Asociado', summary: 'Instalar, poner en marcha y operar la plataforma.', keywords: ['certificación', 'asociado', 'operar'], status: 'soon' },
                { id: 'certificacion-profesional', title: 'Nivel 4 · Certificación Oktavia Profesional', summary: 'Configurar a fondo, automatizar e integrar.', keywords: ['certificación', 'profesional', 'integrar'], status: 'soon' },
                { id: 'certificacion-arquitecto', title: 'Nivel 5 · Certificación Oktavia Arquitecto', summary: 'Diseñar y entregar automatización llave en mano.', keywords: ['certificación', 'arquitecto', 'diseño'], status: 'soon' }
            ]
        },
        {
            id: 'producto',
            title: 'Ficha técnica y resumen',
            kind: 'Ficha técnica',
            icon: 'description',
            page: 'oktavia-docs.html#producto',
            summary: 'Para evaluar la plataforma: el resumen ejecutivo de dos páginas y la ficha técnica completa.',
            keywords: ['ficha técnica', 'data sheet', 'datasheet', 'resumen ejecutivo', 'pdf', 'licencias', 'evaluar'],
            docs: [
                { id: 'resumen-ejecutivo', href: 'oktavia-resumen.html', title: 'Resumen ejecutivo', summary: 'Dos páginas para decidir si Oktavia encaja: el problema que resuelve, para quién, beneficios con métricas de referencia y el modelo de licencias.', keywords: ['resumen', 'beneficios', 'licencias', 'pdf'] },
                { id: 'ficha-tecnica', href: 'oktavia.html', title: 'Ficha técnica', summary: 'Los módulos con su alcance, las categorías de capacidad, la cobertura y el método de acceso por fabricante, integraciones y requisitos.', keywords: ['data sheet', 'módulos', 'capacidades', 'fabricantes', 'requisitos', 'pdf'] },
            ]
        },
        {
            id: 'sp',
            title: 'Oktavia SP · Proveedores de servicios',
            kind: 'Proveedor de servicios',
            icon: 'cell_tower',
            page: 'oktavia-docs.html#sp',
            summary: 'Oktavia para carriers, ISP y operadores MPLS: intención por servicio de cliente, núcleo Cisco IOS XR por NETCONF y YANG, L3VPN, pseudowires EVPN-VPWS y QoS contratada.',
            keywords: ['oktavia sp', 'sp', 'carrier', 'service provider', 'proveedor de servicios', 'isp', 'mpls', 'ios xr', 'iosxr'],
            docs: [
                { id: 'oktavia-sp', href: 'oktavia-sp.html', title: 'Documentación de Oktavia SP', summary: 'Carrier / SP: intención por servicio de cliente, núcleo Cisco IOS XR por NETCONF y YANG, L3VPN, pseudowires EVPN-VPWS y QoS contratada, y el núcleo aplicado como una sola transacción de red.', keywords: ['carrier', 'sp', 'service provider', 'proveedor de servicios', 'ios xr', 'iosxr', 'netconf', 'yang', 'l3vpn', 'evpn', 'vpws', 'pseudowire', 'is-is', 'segment routing', 'ti-lfa', 'qos', 'mpls'] },
                { id: 'oktavia-sp-presentacion', href: '../oktavia-sp.html', title: 'Presentación de Oktavia SP', summary: 'La página comercial: qué resuelve a un proveedor de servicios, cómo funciona, el catálogo de servicios y cómo pedir una demostración.', keywords: ['presentación', 'demostración', 'demo', 'carrier', 'proveedor de servicios'] }
            ]
        },
        {
            id: 'articulos',
            title: 'Artículos',
            kind: 'Artículo',
            icon: 'article',
            page: 'oktavia-docs.html#articulos',
            summary: 'Tecnologías de red, explicadas: lo que usamos todos los días y por qué lo hacemos así.',
            keywords: ['blog', 'artículos', 'tecnología', 'opinión'],
            docs: [
                { id: 'ia-local-contexto-empresarial', href: '../blog/ia-local-contexto-empresarial.html', title: 'IA local con el contexto de su empresa', summary: 'Argos responde con un modelo abierto en su propio servidor, a partir de las guías de los fabricantes, el diseño de su red, su estándar y sus procedimientos: cita fuente y página, no indexa secretos y todo cambio pasa por el gemelo digital.', keywords: ['ia local', 'rag', 'argos', 'documentación', 'runbooks', 'privacidad', 'cve'], date: '16 de octubre de 2026', minutes: 10 },
                { id: 'seguridad-en-oktavia-y-argos', href: '../blog/seguridad-en-oktavia-y-argos.html', title: 'Seguridad en Oktavia y Argos', summary: 'Vulnerabilidades por versión con NVD, CISA KEV y EPSS, postura con evidencia, hardening por rol como intención y un diagnóstico que no envía configuraciones ni secretos a la IA.', keywords: ['vulnerabilidades', 'hardening', 'nvd', 'kev', 'epss', 'seguridad'], date: '11 de octubre de 2026', minutes: 10 },
                { id: 'red-de-pruebas-cml-y-sd-wan', href: '../blog/red-de-pruebas-cml-y-sd-wan.html', title: 'Probar antes de tocar producción: la red de pruebas de Oktavia', summary: 'Alta y baja de sitios y equipos ensayados en Cisco Modeling Labs, pruebas de conectividad desde la intención y el mismo ciclo en Cisco SD-WAN.', keywords: ['red de pruebas', 'cml', 'sd-wan', 'ciclo de vida', 'laboratorio'], date: '11 de octubre de 2026', minutes: 11 },
                { id: 'telemetria-y-automatizacion-de-eventos', href: '../blog/telemetria-y-automatizacion-de-eventos.html', title: 'La red se degrada semanas antes de que alguien llame', summary: 'Por qué una auditoría es una fotografía, qué agrega medir en el tiempo y cómo se escribe una regla de evento que no termina silenciada.', keywords: ['telemetría', 'eventos', 'alertas', 'snmp'], date: '17 de septiembre de 2026', minutes: 8 },
                { id: 'chatops-en-automatizacion-de-redes', href: '../blog/chatops-en-automatizacion-de-redes.html', title: 'ChatOps en redes: útil si declara lo que cuesta', summary: 'Qué es ChatOps aplicado a redes, por qué mucho de lo que se pregunta no necesita un modelo de lenguaje y qué barandillas necesita un chat que cambia configuración.', keywords: ['chatops', 'operación', 'argos', 'ia'], date: '17 de septiembre de 2026', minutes: 8 },
                { id: 'cerrar-el-ciclo-gemelo-digital', href: '../blog/cerrar-el-ciclo-gemelo-digital.html', title: 'Detectar es fácil. Cerrar el ciclo es el problema', summary: 'Por qué la corrección automática es peligrosa, qué es un gemelo digital en concreto y por qué sin verificación el ciclo no cierra.', keywords: ['gemelo digital', 'remediación', 'ciclo cerrado'], date: '17 de septiembre de 2026', minutes: 9 },
                { id: 'cumplimiento-configuracion-y-estado', href: '../blog/cumplimiento-configuracion-y-estado.html', title: 'Su configuración cumple y su red sigue rota', summary: 'La diferencia entre cumplimiento de configuración y de estado, y por qué correlacionarlos cambia lo que puede afirmar sobre su red.', keywords: ['cumplimiento', 'estado de red', 'compliance'], date: '17 de septiembre de 2026', minutes: 9 },
                { id: 'inventario-fuente-de-verdad', href: '../blog/inventario-fuente-de-verdad.html', title: 'El inventario que nadie tiene', summary: 'Por qué el inventario manual nace desactualizado, la diferencia con una fuente de verdad y por qué multivendor es donde casi todas las herramientas se rompen.', keywords: ['fuente de verdad', 'inventario', 'multivendor', 'sot'], date: '17 de septiembre de 2026', minutes: 8 }
            ]
        }
    ];

    /* Lo destacado en la portada del portal. `doc` es "seccion/documento". */
    const featured = [
        { doc: 'inicio/que-es-oktavia', icon: 'info' },
        { doc: 'inicio/quickstart', icon: 'rocket_launch' },
        { doc: 'instalacion/docker-compose', title: 'Instalación', icon: 'deployed_code', summary: 'Levantar Engine y UI con Docker Compose, con las variables y las tres parejas de secretos.' },
        { doc: 'operacion/auditorias', title: 'Primera auditoría', icon: 'fact_check', summary: 'Lanzar la primera auditoría completa, seguir el job y leer sus resultados en la UI.' },
        { doc: 'operacion/inventario', title: 'Cargar inventario', icon: 'upload_file', summary: 'Subir el CSV de equipos, revisar los que quedan sin IP de gestión y sincronizar con el Engine.' },
        { doc: 'operacion/config-generator', icon: 'tune' },
        { doc: 'referencia/api-engine', title: 'API Reference', icon: 'api' },
        { doc: 'datos/inventario-base', title: 'Campos y modelos de datos', icon: 'table_chart', summary: 'Las cinco tablas de campos: inventario, device_inventory, jobs, reglas y service_vars.' }
    ];

    /* ------------------------- Referencia de datos ------------------------
       Columnas: campo | tipo | obligatorio | scope | fuente | descripcion.
       `scope` dice dónde vive o a qué aplica el campo; `fuente`, el archivo o
       modelo que lo define. La descripción admite <code>. */
    const fieldTables = [
        {
            id: 'inventario-base',
            title: 'Inventario base',
            summary: 'Columnas del CSV de equipos (devices.csv) que el Engine convierte en su inventario interno, y que la UI acepta en su importación. Es la semilla operativa: lo que el discovery después enriquece.',
            rows: [
                { campo: 'name', tipo: 'string', obligatorio: 'Sí', scope: 'Equipo', fuente: 'CSV de equipos · inventario de la UI', descripcion: 'Nombre lógico y único del equipo dentro de la organización. Es la clave en el inventario interno del Engine, en <code>device_inventory.json</code>, en los resultados de compliance y en <code>by_device</code>.' },
                { campo: 'hostname', tipo: 'string (IP o FQDN)', obligatorio: 'Sí', scope: 'Equipo', fuente: 'CSV de equipos', descripcion: 'Dirección de gestión para SSH, NETCONF o API. La UI la copia a <code>ip_address</code> sólo si es una IP; un FQDN se resuelve en el discovery. Sin IP el equipo no es auditable.' },
                { campo: 'platform', tipo: 'enum', obligatorio: 'Sí (por omisión <code>ios</code>)', scope: 'Equipo', fuente: 'CSV de equipos · catálogo de plataformas (UI)', descripcion: 'Plataforma y driver: <code>ios</code>, <code>iosxe</code>, <code>nxos</code>, <code>junos</code>, <code>fortigate</code>, <code>fortiswitch</code>, <code>meraki</code>, <code>sdwan</code>. Elige el collector y los snippets de configuración.' },
                { campo: 'group', tipo: 'string', obligatorio: 'Práctico', scope: 'Equipo → inventario interno', fuente: 'CSV de equipos · inventario interno del Engine', descripcion: 'Grupo de conexión del inventario interno del Engine, del que el equipo hereda método de acceso y parámetros: uno por fabricante y plataforma (por ejemplo <code>cisco_ios</code>, <code>juniper_junos_netconf</code>). La fuente de verdad lo genera a partir de fabricante y plataforma.' },
                { campo: 'groups', tipo: 'lista[string]', obligatorio: 'No', scope: 'Equipo → inventario interno', fuente: 'inventario interno del Engine', descripcion: 'Forma en lista del campo anterior en el inventario interno del Engine. La fuente de verdad lo genera como <code>{vendor}_{platform}</code>.' },
                { campo: 'os', tipo: 'string', obligatorio: 'Práctico', scope: 'Equipo → discovery SSH', fuente: 'CSV de equipos · inventario interno del Engine', descripcion: 'Sistema operativo para el discovery por SSH (<code>ios</code>, <code>iosxe</code>…). Habilita los analizadores de comandos en Cisco.' },
                { campo: 'type', tipo: 'string', obligatorio: 'No', scope: 'Equipo → discovery SSH', fuente: 'CSV de equipos · inventario interno del Engine', descripcion: 'Tipo de equipo para el discovery por SSH. Vacío se interpreta como <code>router</code>.' },
                { campo: 'site', tipo: 'string', obligatorio: 'Práctico', scope: 'Equipo', fuente: 'CSV de equipos · catálogo de sitios (UI)', descripcion: 'Código del sitio. En la UI se guarda como <code>location</code>. Lo usan el alcance <code>site</code> de las auditorías, <code>by_site</code> en la intención y <code>targets.sites</code> en compliance. En Meraki es el nombre de la red.' },
                { campo: 'site_type', tipo: 'string', obligatorio: 'Práctico', scope: 'Equipo', fuente: 'CSV de equipos · catálogo de tipos de sitio (UI)', descripcion: 'Arquetipo del sitio: <code>oficina</code>, <code>data_center</code>, <code>laboratorio</code>, <code>punto_de_venta</code> (sembrados). Es el campo de mayor impacto para definir líneas base.' },
                { campo: 'role', tipo: 'string', obligatorio: 'Práctico', scope: 'Equipo', fuente: 'CSV de equipos · catálogo de roles (UI)', descripcion: 'Rol lógico del catálogo global: <code>wan_router</code>, <code>internet_router</code>, <code>cloud_router</code>, <code>core_switch</code>, <code>lan_switch</code>, <code>internet_switch</code>, <code>firewall</code>, <code>wireless_ap</code>. Selecciona plantillas y servicios y es el objetivo de las reglas.' },
                { campo: 'vendor', tipo: 'enum', obligatorio: 'Práctico', scope: 'Equipo', fuente: 'CSV de equipos · catálogo de plataformas (UI)', descripcion: 'Fabricante: <code>cisco</code>, <code>fortinet</code>, <code>juniper</code>. Alimenta <code>targets.vendors</code> y el perfil SNMP de Telegraf.' },
                { campo: 'ssh_options', tipo: 'string', obligatorio: 'No', scope: 'Equipo → discovery SSH', fuente: 'CSV de equipos · inventario interno del Engine', descripcion: 'Opciones extra del cliente SSH para el discovery, por ejemplo algoritmos antiguos en equipos viejos. Vacío se omite.' },
                { campo: 'ping_source', tipo: 'string', obligatorio: 'No', scope: 'Equipo', fuente: 'CSV de equipos · inventario de la UI', descripcion: 'Interfaz o IP de origen para el <code>ping … source</code> que ejecuta el discovery. La UI la exporta al Engine con el inventario.' },
                { campo: 'lifecycle', tipo: 'enum', obligatorio: 'No (por omisión <code>active</code>)', scope: 'Equipo', fuente: 'API del Engine · sincronización de Telegraf', descripcion: 'Ciclo de vida: <code>active</code>, <code>staged</code>, <code>decomm</code>; <code>any</code> como filtro. Sólo <code>active</code>, <code>production</code> o <code>prod</code> entran a Telegraf. Filtra generación y vista previa de configuración.' }
            ]
        },
        {
            id: 'device-inventory',
            title: 'Device Inventory',
            summary: 'Campos de device_inventory.json, el inventario canónico que construye el Engine a partir del discovery (más device_tags.json e interface_tags.json) y que consumen el Config Generator, compliance y la UI.',
            rows: [
                { campo: 'devices', tipo: 'objeto {nombre: equipo}', obligatorio: 'Sí', scope: 'Raíz', fuente: 'device_inventory.json', descripcion: 'Diccionario de equipos indexado por <code>name</code>. Cada valor contiene los campos siguientes.' },
                { campo: 'role', tipo: 'string', obligatorio: 'Sí', scope: 'Equipo', fuente: 'Engine · construcción del inventario', descripcion: 'Rol del inventario base. Selecciona la plantilla legada por rol y el filtro <code>applies_to_roles</code> de los servicios v2.' },
                { campo: 'site', tipo: 'string', obligatorio: 'Sí', scope: 'Equipo', fuente: 'Engine · construcción del inventario', descripcion: 'Sitio del equipo; el archivo también lo expone como <code>location</code>. El render acepta cualquiera de los dos para resolver <code>by_site</code>.' },
                { campo: 'platform', tipo: 'string', obligatorio: 'Sí', scope: 'Equipo', fuente: 'Engine · construcción del inventario', descripcion: 'Plataforma del inventario base. Elige el skeleton y los snippets de configuración.' },
                { campo: 'site_type', tipo: 'string', obligatorio: 'Sí', scope: 'Equipo', fuente: 'Engine · construcción del inventario', descripcion: 'Tipo de sitio. Resuelve <code>by_site_type</code> y los diseños por arquetipo.' },
                { campo: 'interfaces', tipo: 'lista[objeto]', obligatorio: 'Sí (puede ir vacía)', scope: 'Equipo', fuente: 'discovery · inventario de la UI', descripcion: 'Una entrada por interfaz: <code>name</code>, <code>enabled</code>, <code>type</code> (<code>physical</code>, <code>subinterface</code>, <code>loopback</code>, <code>vlan</code>), <code>description</code>, <code>ip_address</code>, <code>netmask</code>, <code>ip_addresses[]</code>, <code>vrf</code>, <code>switchport</code>, <code>switchport_mode</code>, <code>access_vlan</code>, <code>tagged_vlans</code>, <code>trunk_encapsulation</code>, <code>tags[]</code>.' },
                { campo: 'tags', tipo: 'lista[string]', obligatorio: 'No', scope: 'Equipo', fuente: 'device_tags.json', descripcion: 'Etiquetas libres del equipo (por ejemplo <code>Primary_router</code>). Resuelven el alcance <code>by_tag</code>. Las de interfaz salen de las reglas de <code>interface_tags.json</code> (<code>prefix</code>, <code>contains</code>, <code>custom</code>).' },
                { campo: 'vendor', tipo: 'string', obligatorio: 'Sí', scope: 'Equipo', fuente: 'Engine · construcción del inventario', descripcion: 'Fabricante del inventario base.' },
                { campo: 'model', tipo: 'string', obligatorio: 'No (observado)', scope: 'Equipo', fuente: 'discovery (facts)', descripcion: 'Modelo de hardware recolectado. Junto con <code>os_version</code> calcula las capacidades de plataforma (<code>device_caps</code>) que condicionan snippets.' },
                { campo: 'os_version', tipo: 'string', obligatorio: 'No (observado)', scope: 'Equipo', fuente: 'discovery (facts)', descripcion: 'Versión de software. Alimenta el cruce con NVD, KEV y EPSS del paso de vulnerabilidades y la norma de versión de software.' },
                { campo: 'serial_number', tipo: 'string', obligatorio: 'No (observado)', scope: 'Equipo', fuente: 'discovery (facts)', descripcion: 'Número de serie recolectado.' },
                { campo: 'mgmt_vrf_name', tipo: 'string | null', obligatorio: 'No', scope: 'Equipo', fuente: 'device_inventory.json', descripcion: 'VRF de gestión. Es el campo legado de una sola VRF; hoy las VRF se declaran en <code>services.vrf_definitions</code>.' },
                { campo: 'ip_address', tipo: 'string | null', obligatorio: 'No', scope: 'Equipo', fuente: 'discovery', descripcion: 'IP de gestión observada. Es la que Telegraf usa como objetivo SNMP.' },
                { campo: 'netmask', tipo: 'string', obligatorio: 'No', scope: 'interfaces[]', fuente: 'discovery', descripcion: 'Máscara de la dirección de cada interfaz. Vive dentro de cada entrada de <code>interfaces</code>, no en la raíz del equipo.' },
                { campo: 'domain_name', tipo: 'string', obligatorio: 'No', scope: 'Equipo', fuente: 'device_inventory.json · by_device', descripcion: 'Dominio DNS del equipo. Puede venir del running o declararse como override por equipo en la intención.' },
                { campo: 'capabilities', tipo: 'objeto {string: bool}', obligatorio: 'Sí (derivado)', scope: 'Equipo', fuente: 'Engine · capacidades por collector', descripcion: 'Foto de lo que el collector sabe hacer con el equipo. Gobierna qué pasos del pipeline corren para él. Queda congelada al construir el inventario.' },
                { campo: 'topology', tipo: 'bool', obligatorio: 'Derivado', scope: 'capabilities', fuente: 'Engine · capacidades por collector', descripcion: 'El equipo participa en el snapshot de topología (vecinos CDP/LLDP, BGP, OSPF, EIGRP, FHRP). En Meraki es <code>false</code>.' },
                { campo: 'compliance', tipo: 'bool', obligatorio: 'Derivado', scope: 'capabilities', fuente: 'Engine · capacidades por collector', descripcion: 'El equipo entra al paso de compliance. En el perfil FortiGate es <code>false</code> y se evalúa por <code>config_object_match</code> y targets explícitos.' },
                { campo: 'inventory', tipo: 'bool', obligatorio: 'Derivado', scope: 'capabilities', fuente: 'Engine · capacidades por collector', descripcion: 'El equipo se incluye al construir <code>device_inventory.json</code>.' },
                { campo: 'config_backup', tipo: 'bool', obligatorio: 'Derivado', scope: 'capabilities', fuente: 'Engine · capacidades por collector', descripcion: 'Se respalda la configuración (<code>.cfg</code> o JSON estructurado según el fabricante).' },
                { campo: 'config_render', tipo: 'bool', obligatorio: 'Derivado', scope: 'capabilities', fuente: 'Engine · capacidades por collector', descripcion: 'Se renderiza configuración deseada con plantillas. Falso en plataformas de intención solamente (Meraki, SD-WAN).' }
            ]
        },
        {
            id: 'api-jobs',
            title: 'API / Jobs',
            summary: 'Campos de la petición de auditoría que aceptan todas las operaciones de auditoría de la API del Engine, y del detalle de job que devuelve la consulta de un job.',
            rows: [
                { campo: 'scope', tipo: 'enum', obligatorio: 'No (por omisión <code>all</code>)', scope: 'Petición', fuente: 'API del Engine · petición de auditoría', descripcion: 'Alcance: <code>all</code>, <code>site</code>, <code>site_type</code>, <code>device</code>, <code>devices</code>. Decide qué campo acompañante es obligatorio.' },
                { campo: 'site', tipo: 'string | null', obligatorio: 'Si <code>scope=site</code>', scope: 'Petición', fuente: 'API del Engine · petición de auditoría', descripcion: 'Código del sitio a auditar.' },
                { campo: 'site_type', tipo: 'string | null', obligatorio: 'Si <code>scope=site_type</code>', scope: 'Petición', fuente: 'API del Engine · petición de auditoría', descripcion: 'Tipo de sitio a auditar, por ejemplo <code>oficina</code> o <code>data_center</code>.' },
                { campo: 'device', tipo: 'string | null', obligatorio: 'Si <code>scope=device</code>', scope: 'Petición', fuente: 'API del Engine · petición de auditoría', descripcion: 'Nombre de un solo equipo.' },
                { campo: 'devices', tipo: 'lista[string] | null', obligatorio: 'Si <code>scope=devices</code>', scope: 'Petición', fuente: 'API del Engine · petición de auditoría', descripcion: 'Lista de nombres de equipos.' },
                { campo: 'scripts', tipo: 'lista[string]', obligatorio: 'No', scope: 'Petición', fuente: 'API del Engine · petición de auditoría', descripcion: 'Pasos a ejecutar: <code>run_all</code>, <code>discovery</code>, <code>backup_config</code>, <code>build_inventory</code>, <code>build_topology</code>, <code>render_configs</code>, <code>compliance</code>, <code>compliance_dry</code>, <code>ping_ssh_check</code>, <code>telegraf_sync</code>, <code>latency_collect</code>, exportadores CSV y los de Meraki y SD-WAN. Vacío usa el valor por omisión del endpoint.' },
                { campo: 'max_workers', tipo: 'integer ≥ 1', obligatorio: 'No (por omisión 6)', scope: 'Petición', fuente: 'API del Engine · petición de auditoría', descripcion: 'Procesos de discovery en paralelo. El Engine puede aplicar menos y lo reporta en <code>effective_max_workers</code>.' },
                { campo: 'output_format', tipo: 'enum', obligatorio: 'No (por omisión <code>both</code>)', scope: 'Petición', fuente: 'API del Engine · petición de auditoría', descripcion: 'Formato de los exportables: <code>json</code>, <code>csv</code> o <code>both</code>.' },
                { campo: 'output_path', tipo: 'string | null', obligatorio: 'No', scope: 'Petición', fuente: 'API del Engine · petición de auditoría', descripcion: 'Directorio de exportación. Si falta, se usa el directorio de exportación configurado en el Engine.' },
                { campo: 'organization_id', tipo: 'integer | null', obligatorio: 'No', scope: 'Petición · Tenant', fuente: 'API del Engine · petición de auditoría', descripcion: 'Identificador numérico de la organización en la UI.' },
                { campo: 'organization_slug', tipo: 'string | null', obligatorio: 'No', scope: 'Petición · Tenant', fuente: 'API del Engine · petición de auditoría', descripcion: 'Slug de la organización. Sella el job, resuelve el inventario desde la fuente de verdad y guarda los artefactos en el almacenamiento de esa organización.' },
                { campo: 'lifecycle', tipo: 'string | null', obligatorio: 'No', scope: 'Petición · Filtro', fuente: 'API del Engine · petición de auditoría', descripcion: 'Filtra equipos por ciclo de vida, por ejemplo <code>active</code>.' },
                { campo: 'filter_devices_list', tipo: 'lista | null', obligatorio: 'No', scope: 'Petición · Filtro', fuente: 'API del Engine · petición de auditoría', descripcion: 'Restringe la ejecución a esta lista de equipos.' },
                { campo: 'filter_sites', tipo: 'lista | null', obligatorio: 'No', scope: 'Petición · Filtro', fuente: 'API del Engine · petición de auditoría', descripcion: 'Restringe por sitios.' },
                { campo: 'filter_roles', tipo: 'lista | null', obligatorio: 'No', scope: 'Petición · Filtro', fuente: 'API del Engine · petición de auditoría', descripcion: 'Restringe por roles.' },
                { campo: 'filter_platforms', tipo: 'lista | null', obligatorio: 'No', scope: 'Petición · Filtro', fuente: 'API del Engine · petición de auditoría', descripcion: 'Restringe por plataformas. La UI lo usa para separar el alcance cuando el tenant tiene Meraki o SD-WAN.' },
                { campo: 'job_id', tipo: 'string', obligatorio: 'Sí', scope: 'Respuesta', fuente: 'API del Engine · respuesta del job', descripcion: 'Identificador del job. Con él se consultan estado, equipos y artefactos.' },
                { campo: 'status', tipo: 'enum', obligatorio: 'Sí', scope: 'Respuesta', fuente: 'API del Engine · detalle del job', descripcion: '<code>queued</code>, <code>running</code>, <code>completed</code>, <code>completed_with_errors</code>, <code>failed</code>, <code>timeout</code>. La UI trata <code>completed_with_errors</code> como terminal exitoso con fallas por equipo.' },
                { campo: 'created_at', tipo: 'string (ISO 8601)', obligatorio: 'Sí', scope: 'Respuesta', fuente: 'API del Engine · detalle del job', descripcion: 'Momento en que el job entró a la cola.' },
                { campo: 'started_at', tipo: 'string | null', obligatorio: 'No', scope: 'Respuesta', fuente: 'API del Engine · detalle del job', descripcion: 'Momento en que el ejecutor de jobs lo tomó. Nulo mientras está en cola.' },
                { campo: 'finished_at', tipo: 'string | null', obligatorio: 'No', scope: 'Respuesta', fuente: 'API del Engine · detalle del job', descripcion: 'Momento de terminación, con éxito o no.' },
                { campo: 'artifacts', tipo: 'lista[objeto]', obligatorio: 'Sí', scope: 'Respuesta · /artifacts', fuente: 'API del Engine · artefactos del job', descripcion: 'Cada artefacto trae <code>path</code>, <code>size_bytes</code>, <code>modified_at</code> y <code>format</code> (<code>json</code>, <code>csv</code>, <code>cfg</code>). Cada uno se descarga desde el detalle del job.' },
                { campo: 'errors', tipo: 'lista[string]', obligatorio: 'No', scope: 'Respuesta', fuente: 'API del Engine · detalle del job', descripcion: 'Errores del job. El detalle por equipo está en la consulta de equipos del job y en <code>commands[]</code> con el <code>exit_code</code> de cada paso.' }
            ]
        },
        {
            id: 'compliance-intended',
            title: 'Compliance / Intended',
            summary: 'Estructura de intended.json (y su equivalente intended.yaml): el archivo de reglas que el Engine evalúa contra el snapshot normalizado y el respaldo. Por organización lo escribe la UI; no se edita a mano.',
            rows: [
                { campo: 'version', tipo: 'integer', obligatorio: 'Sí', scope: 'Raíz', fuente: 'intended.json', descripcion: 'Versión del esquema. Observada: <code>1</code>.' },
                { campo: 'metadata', tipo: 'objeto', obligatorio: 'No', scope: 'Raíz', fuente: 'intended.json', descripcion: 'Datos descriptivos del conjunto de reglas: <code>name</code>, <code>description</code>.' },
                { campo: 'owner', tipo: 'string', obligatorio: 'No', scope: 'metadata', fuente: 'intended.json', descripcion: 'Responsable del conjunto de reglas. Está previsto en el esquema; no aparece en los archivos de ejemplo del repositorio.' },
                { campo: 'checks', tipo: 'lista[objeto]', obligatorio: 'Sí', scope: 'Raíz', fuente: 'intended.json', descripcion: 'Las reglas. Cada elemento lleva los campos siguientes.' },
                { campo: 'id', tipo: 'string', obligatorio: 'Sí', scope: 'Regla', fuente: 'checks[]', descripcion: 'Identificador único. Aparece como <code>rule_id</code> en los resultados. Las reglas generadas por el Configurador siguen el patrón <code>cfg_&lt;servicio&gt;_&lt;equipo&gt;_auto</code>.' },
                { campo: 'description', tipo: 'string', obligatorio: 'No', scope: 'Regla', fuente: 'checks[]', descripcion: 'Texto que muestra la UI.' },
                { campo: 'category', tipo: 'string', obligatorio: 'No', scope: 'Regla', fuente: 'checks[]', descripcion: 'Agrupador funcional: <code>security</code>, <code>lan</code>, <code>wan</code>, <code>hardware</code>, <code>ops</code>, <code>system</code>, <code>software</code>. Genera <code>summary_by_category</code>.' },
                { campo: 'severity', tipo: 'enum', obligatorio: 'No', scope: 'Regla', fuente: 'checks[]', descripcion: 'En el Engine: <code>bajo</code>, <code>medio</code>, <code>alto</code>. La UI maneja <code>low</code>, <code>medium</code>, <code>high</code> en su modelo de reglas.' },
                { campo: 'score', tipo: 'integer', obligatorio: 'No', scope: 'Regla', fuente: 'checks[]', descripcion: 'Peso de la regla en <code>score_awarded</code> sobre <code>score_total</code>.' },
                { campo: 'type', tipo: 'enum', obligatorio: 'Sí', scope: 'Regla', fuente: 'Engine · motor de compliance', descripcion: 'Handler que evalúa: <code>config_contains</code>, <code>config_object_match</code>, <code>ssh_status</code>, <code>ping_success</code>, <code>bgp_neighbors</code>, <code>ospf_neighbors</code>, <code>eigrp_neighbors</code>, <code>routes_present</code>, <code>interfaces_up</code>, <code>interface_errors</code>, <code>ospf_interfaces_up</code>, <code>stp_root_vlans</code>, <code>cpu_utilization</code>, <code>memory_utilization</code>, <code>disk_utilization</code>, <code>trunk_vlans_set</code>, <code>vlans_present</code>, <code>software_version</code>, <code>device_model</code>, <code>sdwan_overlay</code>, entre otros. Un tipo no implementado se omite, no falla.' },
                { campo: 'test_type', tipo: 'enum', obligatorio: 'No', scope: 'Regla', fuente: 'checks[]', descripcion: '<code>config</code>, <code>network_service_state</code>, <code>hardware</code>, <code>software</code>. Separa cumplimiento de configuración del de estado; genera <code>summary_by_test_type</code>.' },
                { campo: 'service_id', tipo: 'string', obligatorio: 'No', scope: 'Regla', fuente: 'checks[] · catálogo de servicios', descripcion: 'Enlaza la regla con un servicio del Configurador (<code>ntp</code>, <code>dns</code>, <code>vty_ssh</code>, <code>ospf_auth</code>…). Así un servicio activo trae sus checks.' },
                { campo: 'path', tipo: 'string', obligatorio: 'No', scope: 'Regla', fuente: 'checks[]', descripcion: 'Ruta dentro del snapshot normalizado que evalúa el handler: <code>config.running</code>, <code>ping</code>, <code>network.ospf.authentication</code>, <code>config_model.by_vdom.root.routing.bgp</code>.' },
                { campo: 'targets', tipo: 'objeto', obligatorio: 'No', scope: 'Regla', fuente: 'checks[]', descripcion: 'Filtros de aplicabilidad. Se comparan con <code>device_info</code> del snapshot. Un <code>targets</code> vacío ya no significa «todos»: la UI exige <code>apply_to_all: true</code>.' },
                { campo: 'vendors', tipo: 'lista[string]', obligatorio: 'No', scope: 'targets', fuente: 'checks[].targets', descripcion: 'Fabricantes a los que aplica.' },
                { campo: 'platforms', tipo: 'lista[string]', obligatorio: 'No', scope: 'targets', fuente: 'checks[].targets', descripcion: 'Plataformas a las que aplica.' },
                { campo: 'roles', tipo: 'lista[string]', obligatorio: 'No', scope: 'targets', fuente: 'checks[].targets', descripcion: 'Roles a los que aplica. Hay grupos de compliance como <code>all_network_device</code> y <code>router_and_switch</code>.' },
                { campo: 'site_types', tipo: 'lista[string]', obligatorio: 'No', scope: 'targets', fuente: 'checks[].targets', descripcion: 'Tipos de sitio a los que aplica. También existe <code>sites</code> para códigos de sitio concretos.' },
                { campo: 'devices', tipo: 'lista[string]', obligatorio: 'No', scope: 'targets', fuente: 'checks[].targets', descripcion: 'Equipos concretos. Es la excepción, no la regla.' },
                { campo: 'required', tipo: 'lista[string]', obligatorio: 'Según <code>type</code>', scope: 'Regla', fuente: 'checks[]', descripcion: 'Líneas que deben existir en el running (<code>config_contains</code>). El Engine guarda nombres largos de interfaz, así que las entradas cortas se normalizan.' },
                { campo: 'forbidden', tipo: 'lista[string]', obligatorio: 'No', scope: 'Regla', fuente: 'checks[]', descripcion: 'Líneas que no deben existir.' },
                { campo: 'expected', tipo: 'objeto', obligatorio: 'Según <code>type</code>', scope: 'Regla', fuente: 'checks[] · catálogo de tipos de check', descripcion: 'Parámetros del handler: <code>neighbors[]</code>, <code>routes[]</code>, <code>interfaces[]</code>, <code>vlans[]</code>, <code>max_percent</code>, <code>max_errors</code>, <code>target</code>, <code>min_success_rate_percent</code>, <code>match_mode</code>, <code>by_device{}</code>… El esquema de cada tipo lo publica el Engine y lo muestra la UI al crear la regla.' },
                { campo: 'patterns', tipo: 'lista[string]', obligatorio: 'No', scope: 'expected', fuente: 'checks[].expected', descripcion: 'Patrones de texto que busca <code>log_errors</code> en los registros del equipo. Viven dentro de <code>expected</code>.' },
                { campo: 'remediation_type', tipo: 'enum', obligatorio: 'No', scope: 'Regla', fuente: 'checks[]', descripcion: '<code>auto</code>, <code>supervised</code>, <code>manual</code>. Indica cómo se corrige un fallo; se propaga a cada resultado.' },
                { campo: 'remediation_ticket', tipo: 'string | null', obligatorio: 'No', scope: 'Regla', fuente: 'checks[]', descripcion: 'Ticket de cambio asociado, por ejemplo <code>CHG-12345</code>, o nulo.' }
            ]
        },
        {
            id: 'service-vars',
            title: 'Service Vars',
            summary: 'Estructura de service_vars.json: los alcances en los que se declara la intención y los servicios que se configuran dentro de cada alcance. El Configurador de la UI es su editor; el Engine lo consume al renderizar. Precedencia, de menor a mayor: defaults, by_site, by_site_type, by_role, by_platform, by_model, by_tag, by_filter, by_device.',
            rows: [
                { campo: 'defaults', tipo: 'objeto', obligatorio: 'Sí', scope: 'Alcance · base', fuente: 'service_vars.json', descripcion: 'Línea base de toda la organización. Contiene <code>services</code> y overrides de nivel superior. Todo lo demás lo refina.' },
                { campo: 'by_site', tipo: 'objeto {sitio: …}', obligatorio: 'No', scope: 'Alcance', fuente: 'service_vars.json', descripcion: 'Valores por código de sitio. Lo típico: DNS y NTP locales, syslog de la región.' },
                { campo: 'by_site_type', tipo: 'objeto {tipo: …}', obligatorio: 'No', scope: 'Alcance', fuente: 'service_vars.json', descripcion: 'Valores por arquetipo de sitio (<code>oficina</code>, <code>data_center</code>…). Gana sobre <code>by_site</code>.' },
                { campo: 'by_role', tipo: 'objeto {rol: …}', obligatorio: 'No', scope: 'Alcance', fuente: 'service_vars.json', descripcion: 'Valores por rol. Lo que distingue a un router WAN de un switch de acceso.' },
                { campo: 'by_platform', tipo: 'objeto {plataforma: …}', obligatorio: 'No', scope: 'Alcance', fuente: 'service_vars.json', descripcion: 'Valores por plataforma (<code>ios</code>, <code>fortigate</code>…). Para lo que depende del sistema operativo, como banners o sintaxis.' },
                { campo: 'by_model', tipo: 'objeto {modelo: …}', obligatorio: 'No', scope: 'Alcance', fuente: 'Engine · render', descripcion: 'Valores por modelo de hardware. Existe en el render; no aparece en los archivos de ejemplo.' },
                { campo: 'by_filter', tipo: 'objeto {nombre: …}', obligatorio: 'No', scope: 'Alcance', fuente: 'service_vars.json', descripcion: 'Filtros compuestos con nombre (combinaciones de sitio, rol, plataforma…) que aplican a los equipos que los cumplen.' },
                { campo: 'by_tag', tipo: 'objeto {tag: …}', obligatorio: 'No', scope: 'Alcance', fuente: 'service_vars.json · device_tags.json', descripcion: 'Valores por etiqueta del equipo. Se aplican una por tag, en orden.' },
                { campo: 'by_device', tipo: 'objeto {equipo: …}', obligatorio: 'No', scope: 'Alcance · excepción', fuente: 'service_vars.json', descripcion: 'Valores por equipo. Es el último y gana sobre todo. Es la excepción, no la línea base; también admite overrides de nivel superior como <code>bgp_asn</code> u <code>ospf_config</code>.' },
                { campo: 'services', tipo: 'objeto {servicio: …}', obligatorio: 'Sí en <code>defaults</code>', scope: 'Dentro de cada alcance', fuente: 'service_vars.json', descripcion: 'Diccionario de servicios declarados en ese alcance. Las listas se reemplazan completas, no se concatenan: un servicio declarado en el equipo sustituye al de la plataforma.' },
                { campo: 'domain_name', tipo: 'objeto', obligatorio: 'No', scope: 'services', fuente: 'catálogo de servicios', descripcion: 'Dominio DNS (<code>ip domain name</code>): <code>domain_name</code>, <code>enabled</code>.' },
                { campo: 'dns', tipo: 'objeto', obligatorio: 'No', scope: 'services', fuente: 'catálogo de servicios', descripcion: 'Servidores de nombres: <code>enabled</code>, <code>name_servers[]</code>.' },
                { campo: 'ntp', tipo: 'objeto', obligatorio: 'No', scope: 'services', fuente: 'catálogo de servicios', descripcion: 'Servidores NTP, VRF y origen: <code>servers[]</code>, <code>vrf</code>, <code>source_interface</code>.' },
                { campo: 'clock', tipo: 'objeto', obligatorio: 'No', scope: 'services', fuente: 'catálogo de servicios', descripcion: 'Zona horaria y horario de verano: <code>timezone</code>, <code>offset</code>, <code>summer_time{enabled, name, mode}</code>.' },
                { campo: 'logging', tipo: 'objeto', obligatorio: 'No', scope: 'services', fuente: 'catálogo de servicios', descripcion: 'Destinos syslog y origen (<code>logging host</code>).' },
                { campo: 'ssh', tipo: 'objeto', obligatorio: 'No', scope: 'services', fuente: 'catálogo de servicios', descripcion: 'Versión de SSH y VRF (<code>ip ssh version</code>, <code>ip ssh vrf</code>). El servicio del catálogo se llama <code>vty_ssh</code>.' },
                { campo: 'vty', tipo: 'objeto', obligatorio: 'No', scope: 'services', fuente: 'catálogo de servicios', descripcion: 'Líneas VTY: <code>line_range</code>, <code>transport</code>, <code>vrf</code>, <code>source_interface</code>, <code>access_class_acl</code>, <code>access_class_direction</code>, <code>access_class_vrf_also</code>.' },
                { campo: 'snmp', tipo: 'objeto', obligatorio: 'No', scope: 'services', fuente: 'catálogo de servicios · sincronización de Telegraf', descripcion: 'Comunidad, modo, ACL, origen de traps, contacto y ubicación. Si está definido y habilitado, el equipo entra a la sincronización de Telegraf.' },
                { campo: 'bgp', tipo: 'objeto', obligatorio: 'No', scope: 'services', fuente: 'catálogo de servicios', descripcion: '<code>router bgp</code>: ASN, vecinos, redes y route-maps. Toma <code>bgp_asn</code>, <code>bgp_neighbors[]</code> y <code>bgp_af_networks</code> del equipo. Sólo roles de router.' },
                { campo: 'ospf', tipo: 'objeto', obligatorio: 'No', scope: 'services', fuente: 'catálogo de servicios', descripcion: '<code>router ospf</code>, interfaces pasivas y redistribución: <code>enabled</code>, <code>vrf</code>, <code>default_information_originate</code>, <code>redistribute_bgp</code>. La autenticación MD5 va en <code>ospf_auth</code>.' },
                { campo: 'eigrp', tipo: 'objeto', obligatorio: 'No', scope: 'services', fuente: 'catálogo de servicios', descripcion: '<code>router eigrp</code> en modo clásico. Se activa sólo si el equipo trae <code>as_number</code> en <code>eigrp_config</code>.' },
                { campo: 'vlan_database', tipo: 'objeto', obligatorio: 'No', scope: 'services', fuente: 'catálogo de servicios', descripcion: 'VLAN y sus nombres: <code>entries[] {id, name}</code>. Sólo roles de switch.' },
                { campo: 'interface_l3', tipo: 'objeto / lista', obligatorio: 'No', scope: 'services', fuente: 'catálogo de servicios', descripcion: 'Interfaces de capa 3, físicas y SVI: <code>interface_type</code> (<code>physical</code>, <code>virtual</code>), <code>ip_address</code>, <code>netmask</code>, <code>vrf</code>, <code>description</code>.' },
                { campo: 'interface_acl', tipo: 'objeto', obligatorio: 'No', scope: 'services', fuente: 'catálogo de servicios', descripcion: '<code>ip access-group</code> por interfaz: <code>acl_in</code>, <code>acl_out</code>. Se emite después de las ACL (<code>acl_standard</code>, <code>acl_extended</code>).' },
                { campo: 'port_hardening', tipo: 'objeto', obligatorio: 'No', scope: 'services', fuente: 'catálogo de servicios', descripcion: 'Blindaje de puertos de acceso: <code>entries[]</code> con <code>interface</code>, <code>mode</code>, <code>port_security_*</code>, <code>bpdu_guard</code>, <code>portfast</code>, <code>native_vlan</code>, <code>dtp_nonegotiate</code>, <code>storm_control_broadcast_pps</code>. Sólo switches.' }
            ]
        }
    ];

    // Los nombres de campo entran al índice del buscador del documento que
    // los contiene, para que "max_workers" lleve a la tabla correcta.
    const datos = sections.filter(function (s) { return s.id === 'datos'; })[0];
    fieldTables.forEach(function (table) {
        const doc = datos.docs.filter(function (d) { return d.id === table.id; })[0];
        if (doc) {
            doc.keywords = (doc.keywords || []).concat(table.rows.map(function (r) { return r.campo; }));
        }
    });

    return {
        homePage: 'oktavia-docs.html',
        fieldsPage: 'oktavia-docs-datos.html',
        sections: sections,
        featured: featured,
        fieldTables: fieldTables
    };
}());
