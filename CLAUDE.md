# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es este repositorio

Un **ejercicio de capacitación en desarrollo spec-driven** para el equipo de IDR
Consulting. La lista de tareas es el vehículo; **el producto real es el proceso**.

Esa distinción decide los empates: cuando algo obliga a elegir entre mejorar la
app y mantener claro el ejercicio, gana el ejercicio. Un cambio que funciona pero
deja el spec desactualizado es un fallo, aunque la app se vea bien. Funcionalidad
añadida "porque sería útil" diluye el ejercicio — el alcance pequeño es el punto.

El idioma del proyecto, del código y de los comentarios es **español**.

## Comandos

```bash
npm run dev      # servidor de desarrollo (Vite)
npm run build    # tsc -b && vite build
npm run lint     # oxlint
npx tsc -b --force   # forzar recomprobación de tipos (usa project references)
```

**No hay runner de tests ni archivos de test.** No existe `npm test`; no lo
inventes, y no crees una suite. La verificación en este repo es: `npm run build`
+ `npx oxlint` + comprobación de lo que se ve, escrita como tareas explícitas
dentro de cada cambio de OpenSpec.

**Playwright está instalado como `devDependency`** para ejecutar esas tareas de
comprobación visual: geometría renderizada, estilos computados, trayectorias de
animación, estados de interacción y comportamiento bajo `prefers-reduced-motion`.
Hay Chromium descargado; no hay Firefox ni WebKit.

Dos reglas sobre su uso:

- **Los scripts son efímeros.** Se escriben para una verificación concreta, se
  ejecutan y se borran. No se versionan y no existe carpeta `e2e/`: un script
  guardado describe la interfaz del día que se escribió, y cuando falla meses
  después nadie sabe si el defecto está en la app o en el script.
- **Tienen que vivir dentro del proyecto** mientras se ejecutan. Un script en el
  directorio temporal falla con `ERR_MODULE_NOT_FOUND` porque no resuelve
  `node_modules`.

Ojo con los falsos negativos: la instrumentación puede fallar de forma tan
convincente como un defecto real. Ante un fallo, comprueba primero el script con
un diagnóstico acotado antes de tocar el código de la aplicación.

El `README.md` es la plantilla de Vite sin modificar. Lo único aprovechable es su
nota sobre habilitar reglas type-aware de oxlint instalando `oxlint-tsgolint`.

## Las tres autoridades

Antes de cambiar nada, sepas cuál manda sobre qué:

| Documento | Gobierna | No gobierna |
|---|---|---|
| `openspec/specs/**/spec.md` | El comportamiento observable | Cómo se implementa |
| `PRODUCT.md` | Verdad de producto, usuarios, restricciones vinculantes | Nada visual |
| `DESIGN.md` + `.impeccable/design.json` | El sistema visual: tokens, tipografía, formas, motion | Comportamiento |

Cuando el código y un spec difieren, **uno de los dos está mal y hay que decir
cuál antes de tocar nada**. No los reconcilies en silencio.

## Flujo obligatorio de OpenSpec

Todo cambio de comportamiento pasa por `openspec/changes/<nombre>/` con
`proposal.md`, `design.md`, `specs/` y `tasks.md`, antes de escribir código.

- `openspec list`, `openspec status --change "<n>"`, `openspec validate`
- Al terminar: sincronizar los deltas a `openspec/specs/` y archivar en
  `openspec/changes/archive/<YYYY-MM-DD>-<nombre>/`
- Las skills `openspec-propose`, `openspec-apply-change`, `openspec-sync-specs` y
  `openspec-archive-change` cubren cada fase

**Los non-goals de un `design.md` son decisiones, no omisiones.** Están escritos
porque alguien los descartó a propósito; reabrirlos es un cambio de spec. Ejemplo
vivo: el tema **no se recuerda entre recargas** y eso es deliberado.

**Marcar una tarea sin ejecutarla falsea el registro.** Varias tareas exigen
verificación manual en el navegador a anchos concretos; si no se pueden ejecutar,
se dejan sin marcar y se dice por qué.

## Arquitectura

### Un único dueño del estado

`src/App.tsx` posee todo el estado. Los componentes son presentacionales salvo el
estado local de edición en `TaskItem`.

La pieza a entender es **`commitTasks(next, message)`** en `App.tsx`: es el único
punto de escritura. Fija el estado, persiste en `localStorage` y emite el anuncio
para el lector de pantalla en la misma operación, de modo que estado y
almacenamiento no puedan divergir y un fallo de cuota se reporte en el momento de
la acción que lo provocó. **No añadas escrituras a `localStorage` fuera de ahí**,
ni lo vuelvas a mover a un `useEffect` — estuvo así y se quitó a propósito.

`src/storage.ts` valida cada elemento por separado al cargar: un `localStorage`
corrupto no debe producir filas sin `id` imposibles de borrar. `createTaskId()`
tiene fallback porque `crypto.randomUUID` no existe fuera de contexto seguro, que
es justo como se prueba desde el móvil por IP local.

### Tres temas, todos por tokens

`src/index.css` es la **única** fuente de color. Define custom properties en
`:root`, las remapea en `.dark` y las vuelve a remapear en `@media print`.

- **Cero colores literales en los componentes.** Todo pasa por `var(--token)`.
- El tema lo manda la app, **no el sistema operativo**: no hay ninguna consulta
  `prefers-color-scheme`, y `color-scheme` se declara desde `:root`/`.dark` para
  que scrollbars y controles sigan al toggle. Carga siempre en claro por spec.
- Los dos temas de pantalla están **compuestos por separado**. Derivar uno del
  otro sumando o restando brillo es el defecto que ya ocurrió una vez y dejó el
  botón primario a 1.96:1.

### Accesibilidad: es piso, no mejora

`PRODUCT.md` la declara vinculante. Varias decisiones parecen arbitrarias y no lo
son — una refactorización podría deshacerlas sin darse cuenta:

- El foco usa **`outline` sólido, nunca `box-shadow`**: el halo translúcido medía
  1.24:1 y `box-shadow` no se pinta en el modo de alto contraste de Windows.
- Los objetivos táctiles crecen con **`@media (pointer: coarse)`**, no por ancho
  de pantalla: hay portátiles táctiles y tabletas con teclado.
- `prefers-reduced-motion` recibe **una alternativa**, no `animation: none`. El
  `none` impedía que disparara `animationend`, del que depende limpiar el estado.
- Los campos de entrada no bajan de `1rem`: por debajo, iOS fuerza zoom al
  enfocar.
- Todo contraste se verifica **por cálculo**, no a ojo.

## Gotchas

**Tailwind v4 sin archivo de configuración.** Los tokens viven en `@theme` dentro
de `src/index.css`. Los orígenes de contenido están en lista blanca explícita:

```css
@import "tailwindcss" source(none);
@source "../index.html";
@source "./**/*.{ts,tsx}";
```

Consecuencia: **markup colocado fuera de `index.html` y `src/` no se escanea** y
sus estilos faltarán sin error. Cualquier ubicación nueva de componentes tiene que
agregar su propia directiva `@source`.

**Tailwind lee los comentarios.** El extractor no distingue prosa de markup dentro
de un archivo escaneado. Escribir la palabra "visible" o "blur" en un comentario
de un `.tsx` genera `.visible` y `.blur` en el CSS de producción. Ya pasó dos
veces. Si el CSS crece tras un cambio que no tocó estilos, es esto.

**Archivar un cambio puede fallar con EPERM en Windows** si hay un servidor de dev
vivo: su watcher mantiene un handle sobre `openspec/`. Matar el proceso de npm no
siempre mata el hijo de Vite.

**Al verificar clases de Tailwind en el CSS construido, usa `grep -F`.** Los
selectores van escapados (`.bg-\[var\(--bg\)\]`) y una expresión regular trata
`\(` como grupo, dando falsos negativos.

## Skills disponibles

`.claude/skills/` trae tres familias. Ver `.claude/skills/VENDOR.md` para la
procedencia de las de terceros y el criterio de ruteo cuando se solapan.

- **`impeccable`** — trabajo de diseño sobre *este* sistema. Lee `PRODUCT.md` y
  `DESIGN.md` y respeta sus reglas, así que manda cuando el cambio toca el
  sistema documentado.
- **`openspec-*`** — las fases del flujo obligatorio.
- **13 skills de Emil Kowalski** (MIT, vendorizadas) — punto de vista específico
  sobre motion y pulido. Son sugerencias a evaluar, no autoridad: la gramática de
  movimiento de `DESIGN.md` manda sobre cualquier recomendación genérica.
