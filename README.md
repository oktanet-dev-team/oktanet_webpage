# Oktanet — sitio web

Página oficial de Oktanet en [oktanet.io](https://oktanet.io), servida como sitio
estático desde GitHub Pages. No hay proceso de compilación: lo que está en el
repositorio es lo que se publica.

## Estructura

```
index.html              Portada (una sola página, con anclas por sección)
script/home_script.js   Copy de la portada en español e inglés, y su interacción
style/home_style.css    Estilos de la portada
docs/                   Documentación pública
  index.html            Índice de documentos (español)
  index-en.html         Índice de documentos (inglés)
  datasheet.html        Data sheet de Oktavia 2.0 (español)
  datasheet-en.html     Data sheet de Oktavia 2.0 (inglés)
  *.pdf                 Los data sheets generados, versionados en el repo
script/docs_script.js   Utilidades de la documentación
style/docs_style.css    Estilos de la documentación, incluida la hoja de impresión
tools/                  Scripts de mantenimiento (no se publican)
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

Los PDF del data sheet se generan desde las páginas HTML, así que la fuente de
verdad es el HTML y no hay dos textos que mantener sincronizados. Después de
editar `docs/datasheet.html` o `docs/datasheet-en.html`:

```bash
python3 tools/build_pdf.py        # ambos idiomas
python3 tools/build_pdf.py es     # sólo uno
```

Requiere `google-chrome` en el PATH y el paquete `websocket-client`. El script
levanta su propio servidor local, imprime con la hoja de estilo de impresión de
`style/docs_style.css` y añade el pie con la numeración de páginas.

## Al agregar un documento nuevo

1. Crear `docs/<nombre>.html` y `docs/<nombre>-en.html` sobre la estructura del
   data sheet.
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
