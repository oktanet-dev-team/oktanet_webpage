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
  oktavia.html          Información de Oktavia (español)
  oktavia-en.html       Información de Oktavia (inglés)
  *.pdf                 Los documentos generados, versionados en el repo
script/docs_script.js   Utilidades de la documentación
style/docs_style.css    Estilos de la documentación, incluida la hoja de impresión
tools/                  Scripts de mantenimiento (no se publican)
  build_pdf.py          Genera los PDF desde las páginas HTML
  build_images.py       Recorta capturas y las exporta en WebP y PNG
  check_copy.py         Revisa que los dos idiomas de la portada calcen
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
