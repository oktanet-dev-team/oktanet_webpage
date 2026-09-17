# Oktanet — sitio web

Página oficial de Oktanet en [oktanet.io](https://oktanet.io), servida como sitio
estático desde GitHub Pages. No hay proceso de compilación: lo que está en el
repositorio es lo que se publica.

## Estructura

```
index.html              Portada (una sola página, con anclas por sección)
404.html                Página de error, independiente del resto de estilos
robots.txt              Permite la indexación y apunta al mapa del sitio
script/home_script.js   Copy de la portada en español e inglés, y su interacción
style/home_style.css    Estilos de la portada
docs/                   Documentación pública
  index.html            Índice de documentos (español)
  index-en.html         Índice de documentos (inglés)
  oktavia.html          Ficha técnica de Oktavia (español)
  oktavia-en.html       Ficha técnica de Oktavia (inglés)
  oktavia-resumen.html     Resumen ejecutivo, 2 páginas (español)
  oktavia-resumen-en.html  Resumen ejecutivo, 2 páginas (inglés)
  *.pdf                 Los documentos generados, versionados en el repo
script/docs_script.js   Utilidades de la documentación
style/docs_style.css    Estilos de la documentación, incluida la hoja de impresión
tools/                  Scripts de mantenimiento (no se publican)
  build_pdf.py          Genera los PDF desde las páginas HTML
  build_images.py       Recorta capturas y las exporta en WebP y PNG
  check_copy.py         Revisa que los dos idiomas de la portada calcen
  stamp_assets.py       Sella CSS y JS con el hash de su contenido (anti-caché)
  check_datos.py        Falla si un artículo lleva direcciones o nombres reales
  build_og.py           Genera la imagen que se ve al compartir el enlace
  build_videos.py       Descarga las carátulas de los vídeos de YouTube
  to_dark.py            Convirtió la paleta a oscura (histórico, no se re-ejecuta)
  og_template.html      Plantilla de esa imagen (no se publica)
```

## Dónde vive el texto

**La portada no guarda su texto en el HTML.** El HTML es el andamio y la versión
que ven los buscadores; el texto real vive en el diccionario de traducciones de
`script/home_script.js`, en dos objetos paralelos, `es` y `en`, que se aplican al
DOM **por posición**: el tercer elemento de una lista recibe el tercer texto del
arreglo.

De ahí salen las dos reglas que hay que respetar al editar la portada:

1. **Todo cambio de texto se hace en los dos idiomas.** Si una clave existe sólo
   en uno, al cambiar de idioma ese texto se queda en el del idioma anterior y
   nada falla de forma visible.
2. **Si se agrega o quita una tarjeta en el HTML, el arreglo correspondiente
   crece o se encoge igual.** Un arreglo más corto que los elementos que pinta
   deja las tarjetas sobrantes con el texto del idioma anterior.

Para no depender de acordarse:

```bash
python3 tools/check_copy.py
```

Compara las claves de ambos idiomas, los largos de cada arreglo y los conteos
contra `index.html`. Devuelve código distinto de cero si algo no calza.

**La documentación sí guarda su texto en el HTML**, un archivo por idioma. Son
documentos largos y mantener dos arreglos paralelos de cien entradas se rompe en
la primera corrección. Lo único que comparte con la portada es la preferencia de
idioma guardada en el navegador, para que volver al inicio no cambie el idioma.

## El cotizador

El formulario de `#cotizar` **recoge y califica; no calcula precio**, y eso es
una decisión de arquitectura, no una funcionalidad pendiente.

GitHub Pages sirve cualquier archivo del repositorio. Comprobado:

```
https://oktanet.io/README.md           -> 200
https://oktanet.io/tools/build_pdf.py  -> 200
```

Así que una tabla de precios en el repo sería descargable por cualquiera que
adivine la URL, y los rastreadores adivinan. No hay servidor donde esconder el
cálculo: si la cifra se muestra en pantalla, los precios viajan al navegador.

Los dos formularios del sitio postean a **Formspree**, que reenvía por correo:

```
#cotizar   -> formspree.io/f/xoevqpjw   (solicitudes comerciales)
#contacto  -> formspree.io/f/mqarwnjw   (mensajes generales)
```

**A qué dirección reenvía cada uno se configura en el panel de Formspree, no
aquí.** El campo del correo se llama `email` a propósito: es el nombre que
Formspree busca para poner el `Reply-To`, y sin eso responderle al prospecto
obliga a copiar su dirección del cuerpo del mensaje.

Ojo con el plan: el gratuito de Formspree suele topar en 50 envíos al mes.

Por eso **la lista de precios vive fuera de este repositorio**, en
`~/Documents/Oktanet/cotizador/precios.yaml`. La cifra la manda una persona.

Lo único que el navegador conoce es el catálogo `PLATAFORMAS` de
`script/home_script.js`: etiqueta e «integrada sí/no». Eso no es información
comercial y es lo que decide el aviso cuando alguien elige una plataforma que
todavía no soportamos — dicho **antes** de que llene sus datos, porque
enterarse al final se siente a que le sacaron el contacto con falsas
expectativas.

Son **dos catálogos, no uno**, porque no se licencian igual: con una
plataforma de gestión de por medio Oktavia se integra contra esa plataforma —un
punto—, y sin ella se integra contra cada equipo por su sistema operativo. La
primera pregunta decide cuál de las dos listas se muestra, y el caso mixto
muestra ambas.

**Al agregar una opción**: va en `GESTORES` o `SISTEMAS` de
`script/home_script.js`, y en `plataformas_gestion` o `sistemas_equipos` del
YAML de precios. Si sólo se agrega en uno de los dos, o el visitante la ve y no
se puede cotizar, o se puede cotizar y nadie la ve.

## El blog

Los artículos viven en `blog/`, uno por idioma, y **reusan `docs_style.css`**:
portada, secciones, tablas, botones de compartir y la hoja de impresión. Eso no
es ahorro de trabajo, es la razón por la que cada artículo también se descarga
en PDF sin escribir nada extra — un comercial puede mandarlo como adjunto en vez
de depender de que el cliente abra un enlace.

```
blog/index.html                        Índice (español)
blog/index-en.html                     Índice (inglés)
blog/<tema>.html                       Artículo (español)
blog/<tema>-en.html                    Artículo (inglés)
blog/<tema>-es.pdf, -en.pdf            Generados con build_pdf.py
```

A diferencia de la portada, el texto de un artículo **vive en el HTML**, no en el
diccionario posicional. Son textos largos y mantener arreglos paralelos se rompe
en la primera corrección; es el mismo criterio que ya se usa en `docs/`.

### Antes de publicar un artículo

```bash
python3 tools/check_datos.py     # ¿se coló una IP o un nombre real?
python3 tools/build_og.py        # imagen propia para el feed de LinkedIn
python3 tools/build_pdf.py       # el PDF del artículo
python3 tools/stamp_assets.py    # sella CSS y JS
```

**`check_datos.py` no es opcional.** Los artículos se escriben seguido y muchas
veces copiando de una sesión real de laboratorio: ahí es donde se cuela la
dirección de gestión o el nombre del equipo de un cliente, y una vez publicado ya
lo indexó un buscador. La regla es que en material público sólo se usan los
rangos reservados para documentar: `192.0.2.0/24`, `198.51.100.0/24` y
`203.0.113.0/24`.

Cada artículo necesita además su entrada en `ARTICULOS` de `build_og.py`. Sin
ella comparte la imagen genérica del sitio, y en el feed de LinkedIn una tarjeta
idéntica repetida no la abre nadie: el lector asume que ya vio ese enlace.

## Sellar los assets antes de publicar

```bash
python3 tools/stamp_assets.py
```

Reescribe `?v=<hash>` en cada referencia a un CSS o JS propio, con un hash de su
contenido. Es idempotente: si nada cambió, no toca ningún archivo.

No es cosmético. Los navegadores cachean `home_script.js` sin preguntar, y
cuando el HTML cambia y el script no, el resultado **no es "se ve viejo": es una
página rota de forma difícil de diagnosticar**, porque el diccionario se aplica
por posición. Un arreglo viejo de cuatro textos sobre siete enlaces nuevos los
reparte corridos, y aparecen etiquetas en botones a los que no pertenecen. Pasó
en local y habría pasado igual en producción con un visitante que ya conocía el
sitio.

## Regenerar los PDF

Los PDF se generan desde las páginas HTML, así que la fuente de
verdad es el HTML y no hay dos textos que mantener sincronizados. Después de
editar `docs/oktavia.html` o `docs/oktavia-en.html`:

```bash
python3 tools/build_pdf.py        # ambos idiomas
python3 tools/build_pdf.py es     # sólo uno
```

Requiere `google-chrome` en el PATH y el paquete `websocket-client`. El script
levanta su propio servidor local, imprime con la hoja de estilo de impresión de
`style/docs_style.css` y añade el pie con la numeración de páginas.

## Recortar capturas de pantalla

Las capturas salen de Oktavia a 1715 px de ancho y con partes que no aportan. La
máquina no tiene `cwebp` ni ninguna librería de imágenes, así que el recorte y la
conversión los hace Chrome, que ya está instalado para generar los PDF:

```bash
python3 tools/build_images.py [directorio_de_origen]
```

El recorte de cada imagen, en píxeles del archivo original, está en el
diccionario `ORIGENES` del script. Salen dos archivos por imagen, WebP y PNG, y
la página sirve la WebP con la PNG de respaldo. La diferencia importa: una
captura pesa unos 240 KB en PNG y 33 KB en WebP.

Los originales no se versionan en este repositorio; sólo las imágenes ya
recortadas que la página usa. Si falta alguno, el script lo dice y sigue con los
demás: lo que ya está en `img/` se conserva.

## El tema oscuro

El sitio es oscuro, sin conmutador. `tools/to_dark.py` es el script que hizo la
conversión: invierte la luminosidad de cada color conservando el tono, que en un
diseño monocromo azul produce un equivalente oscuro coherente. Queda versionado
porque documenta el criterio, **no porque haya que volver a correrlo**. Un
segundo pase volvería a invertirlo todo.

Lo que el script deja intacto, y por qué:

- Los acentos de marca, azules y cianes saturados, que ya funcionaban sobre
  oscuro.
- Las reglas de componentes que ya eran oscuros: cabecera, hero, banda de
  marcas, botón principal.
- La tira de fabricantes, porque sus logotipos son oscuros y sobre fondo oscuro
  desaparecerían. Vive en un panel claro dentro del contenedor.
- **El bloque `@media print` de la documentación.** El sitio es oscuro, el papel
  no: dentro de ese bloque se redefinen los tokens a la paleta clara, y el PDF
  sale como siempre.

Al tocar colores, conviene medir antes de dar por bueno el resultado. La
inversión no sabe si un color es texto o fondo, así que deja casos por debajo del
mínimo legible de 4.5 a 1 que a ojo pasan desapercibidos.

## Los vídeos

La portada muestra seis vídeos del canal de YouTube. El reproductor **no** se
incrusta de entrada: se pinta una carátula propia y el reproductor real sólo se
carga cuando alguien pulsa, así que pasar por la página no le entrega el
visitante a Google.

Las carátulas se sirven desde el propio sitio por la misma razón. Para
añadir o cambiar un vídeo:

1. Agrega su identificador a `VIDEOS` en `tools/build_videos.py` y corre
   `python3 tools/build_videos.py` para bajar la carátula.
2. Agrega el `<article class="video-item">` correspondiente en `index.html`,
   con ese identificador en `data-video`.
3. Agrega su título y su descripción a `videoTitulos` y `videoCuerpos`, en los
   dos idiomas.

`tools/check_copy.py` comprueba que las tres cosas tengan la misma cantidad de
entradas y que no haya identificadores repetidos.

## La imagen que se ve al compartir

Cada página declara una imagen de Open Graph, que es la que aparece cuando
alguien pega el enlace en LinkedIn, WhatsApp o Slack. Se genera desde una
plantilla, no se diseña a mano:

```bash
python3 tools/build_og.py        # ambos idiomas
```

Renderiza `tools/og_template.html` a 1200 por 630 píxeles, que es el tamaño que
esperan esas plataformas, y deja `img/og-es.png` y `img/og-en.png`. Para cambiar
el texto o el diseño se edita la plantilla y se vuelve a correr.

Los logos los recorta `tools/build_images.py`. Vienen como trazos brillantes
sobre un fondo casi negro sin transparencia: el script recupera el canal alfa
usando la luminancia, para que se puedan poner sobre cualquier superficie oscura
sin que se les vea el cuadro.

## Al agregar un documento nuevo

1. Crear `docs/<nombre>.html` y `docs/<nombre>-en.html` sobre la estructura de
   `docs/oktavia.html`.
2. Darlos de alta en `docs/index.html` y en `docs/index-en.html`.
3. Agregar sus URLs a `sitemap.xml`, con los enlaces alternos por idioma.
4. Si lleva PDF, registrarlo en el diccionario `DOCUMENTOS` de
   `tools/build_pdf.py` y generarlo.

## Qué no se publica aquí

La documentación de este sitio es pública y se escribe para que un cliente la
use en una evaluación o una licitación. **No se documenta información sensible**:
nada de datos de clientes, direcciones IP reales, credenciales, rutas internas,
detalles de despliegue de una instalación concreta ni endpoints internos de la
plataforma.
