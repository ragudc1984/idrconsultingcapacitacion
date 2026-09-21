# Proposal

## Why

La detección automática de contenido de Tailwind v4 escanea todo el proyecto en
busca de nombres de clase. Eso incluye los markdown de `openspec/`, donde varios
`design.md` mencionan clases **en prosa** al explicar decisiones de
implementación. Tailwind no distingue prosa de markup, así que generaba CSS para
clases que ningún componente usa y ese CSS muerto viajaba al navegador del
usuario.

Es un defecto pequeño en bytes pero incómodo en un repositorio cuyo producto es
el proceso: la documentación del proceso estaba contaminando el artefacto que el
proceso produce.

## What Changes

- `src/index.css` pasa de `@import "tailwindcss";` a
  `@import "tailwindcss" source(none);` más dos directivas `@source` explícitas
  que apuntan a `index.html` y a `src/**/*.{ts,tsx}`.
- El CSS generado deja de incluir 12 utilidades fantasma: `text-gray-400`,
  `rounded-2xl`, `max-w-md`, `shadow`, `blur`, `filter`, `transform`, `sticky`,
  `outline`, `rounded`, `block`, `inline` y `visible`. También desaparece el
  token `--color-gray-400`, que existía sólo para alimentar a `text-gray-400`.
- Sin cambios en el markup, en los componentes ni en el comportamiento.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

Ninguna. El cambio es de configuración de build y no altera ningún
comportamiento observable: se verificó que las 12 utilidades eliminadas no
aparecen en el markup y que las clases que la aplicación sí usa siguen
generando regla en el CSS final. Por eso este cambio declara `skip_specs: true`
en su `.openspec.yaml`, en lugar de inventar un requisito para satisfacer la
validación.

## Impact

- **Código afectado:** `src/index.css` (sólo las directivas de importación y
  origen, al inicio del archivo).
- **Artefacto de salida:** el CSS del build pasa de 19 713 a 18 301 bytes
  (−1412, ~7 %). Una pasada posterior encontró que comentarios dentro de
  `src/*.tsx` seguían generando utilidades y lo redujo a 17 072 bytes; queda un
  residuo estructural de 21 bytes que el extractor de Tailwind no permite
  eliminar. Ver `design.md` - Alcance real de la corrección.
- **Dependencias:** ninguna nueva. `source(none)` y `@source` son parte de
  Tailwind v4, ya presente en `package.json` (`tailwindcss ^4.3.3`).
- **Consecuencia operativa:** a partir de ahora, un archivo nuevo con markup
  fuera de `index.html` y `src/` no será escaneado. Cualquier ubicación nueva de
  componentes debe añadirse como `@source`.
- **Nota de procedencia:** la implementación ya estaba aplicada cuando se
  registró este cambio. Ver `design.md` para el detalle y la justificación de
  haberla registrado después.
