# Proposal

## Why

El proyecto no tiene forma automatizada de verificar lo que se ve. `npm run build`
y `oxlint` comprueban que el código compila y está limpio, pero ninguna
herramienta confirma que la interfaz se renderiza como debe. Todo lo visual
depende hoy de que una persona abra el navegador y mire.

Eso tuvo un costo concreto: durante varios cambios seguidos, decisiones de
contraste, objetivos táctiles, layout responsive y movimiento se enviaron
verificadas **sólo por cálculo**, y sus tareas de comprobación manual quedaron
pendientes hasta que alguien pudo mirarlas.

El cambio `refine-task-entry-motion` demostró el valor de cerrar ese hueco. Con
Playwright se midió la trayectoria real de la animación fotograma a fotograma
(`6px → 3.98 → 2.39 → 1.35 → 0.74 → 0`), se contaron los eventos `animationend`,
se comprobó que el pseudo-elemento nuevo no capturaba clics y se confirmó que
bajo movimiento reducido el halo no se anima. Nada de eso es verificable leyendo
código.

## What Changes

- Se agrega **`playwright` como `devDependency`**, junto con el navegador
  Chromium que descarga en la caché del usuario.
- Queda disponible como herramienta de verificación visual y de interacción para
  las tareas de comprobación manual de futuros cambios.
- **No se agrega un runner de tests ni una suite.** Ver Non-Goals en `design.md`.
- `CLAUDE.md` y `PRODUCT.md` se actualizan para que futuras sesiones sepan que
  existe y cuándo usarla: hoy `CLAUDE.md` afirma que la verificación del repo es
  build + lint + comprobación manual en el navegador.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

Ninguna. Playwright no altera ningún comportamiento observable de la aplicación:
no entra en el bundle, no toca `src/`, y la lista de tareas se comporta
exactamente igual con o sin él. Es herramienta de desarrollo, así que este cambio
declara `skip_specs: true` siguiendo el mismo criterio que
`limit-tailwind-content-sources`, en lugar de inventar un requisito de producto
para satisfacer la validación.

## Impact

- **`package.json`:** una `devDependency` nueva. El bundle de producción no
  cambia: 236.43 kB de JS y 17.22 kB de CSS, idénticos antes y después.
- **Fuera del repositorio:** Chromium queda en la caché del usuario
  (`~/AppData/Local/ms-playwright`, ~130 MB). Es compartida entre proyectos y no
  se versiona.
- **Documentación:** `CLAUDE.md` describe hoy la verificación del repo sin
  mencionar esta herramienta; `PRODUCT.md` lista las restricciones vinculantes
  del contexto operativo.
- **Nota de procedencia:** la instalación se hizo antes de registrar este cambio,
  a pedido explícito. Ver `design.md`.
