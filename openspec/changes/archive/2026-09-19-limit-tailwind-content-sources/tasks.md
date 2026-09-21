# Tasks

> La implementación llegó antes que el registro (ver `design.md` - Decisions 3),
> así que apply fue una pasada de verificación y no de edición. Las marcas del
> grupo 1 y 2 se pusieron tras comprobarlas en este cambio, no heredadas. El
> grupo 3 lo verificó el usuario en el navegador.

## 1. Acotar los orígenes de contenido

- [x] 1.1 En `src/index.css`, reemplazar `@import "tailwindcss";` por `@import "tailwindcss" source(none);` seguido de `@source "../index.html";` y `@source "./**/*.{ts,tsx}";`, y verificar que `npm run build` compila sin errores
- [x] 1.2 Dejar junto a las directivas un comentario que explique por qué la lista es explícita y que un origen nuevo de markup debe añadir su `@source`, y verificar que el comentario no contiene la secuencia `*/` dentro de una ruta con comodines (cierra el comentario CSS antes de tiempo y rompe el build)

## 2. Verificar que no se perdió nada

- [x] 2.1 Confirmar con búsqueda **literal** (`grep -F`, nunca expresión regular) sobre el CSS de `dist/assets/*.css` que siguen presentes las clases con token y con punto que la app usa: `bg-\[var\(--bg\)\]`, `bg-\[var\(--cyan\)\]`, `bg-\[var\(--magenta\)\]`, `bg-\[var\(--overlay\)\]`, `bg-\[var\(--surface\)\]`, `border-\[var\(--danger\)\]`, `border-\[var\(--ring-violet\)\]`, `shadow-\[var\(--shadow-modal\)\]`, `text-\[var\(--danger\)\]`, `text-\[var\(--violet\)\]`, `p-1\.5`, `w-0\.5`, `px-0\.5`, `mt-1\.5`
- [x] 2.2 Confirmar que ninguna de las 12 utilidades eliminadas (`text-gray-400`, `rounded-2xl`, `max-w-md`, `shadow`, `blur`, `filter`, `transform`, `sticky`, `outline`, `rounded`, `block`, `inline`, `visible`) aparece como nombre de clase en `index.html` ni en `src/**/*.tsx`
- [x] 2.3 Confirmar que las clases utilitarias de `src/index.css` definidas a mano (`focus-ring-cyan`, `focus-ring-violet`, `focus-ring-magenta`, `focus-underline`, `touch-target`, `page-shell`, `modal-shell`, `task-title`, `no-print`, `animate-task-in`) siguen presentes en el CSS construido, ya que no dependen del escaneo pero comparten archivo
- [x] 2.4 Verificar que `npx oxlint` pasa sin advertencias

## 3. Verificación visual

- [x] 3.1 Verificar manualmente con `npm run dev` que la aplicación se ve idéntica a antes del cambio en tema claro y oscuro: encabezado, formulario, filas de tarea con sus tres controles, estado vacío y modal de confirmación
- [x] 3.2 Verificar manualmente con `npm run dev` que los estados interactivos siguen pintando: hover de los controles de fila, anillo de foco al tabular por los seis controles, y la barra de acento cian al enfocar una fila
