# Design

## Context

Ver `proposal.md` - Why para la motivación.

La animación vive entera en `src/index.css`: dos bloques `@keyframes` y la clase
`.animate-task-in`. `TaskItem` sólo aplica la clase cuando la tarea es la recién
creada y escucha `onAnimationEnd` para limpiar `justAddedId` en `App.tsx`. Ese
acoplamiento es la única restricción real del cambio: **la animación tiene que
seguir existiendo y seguir disparando `animationend` sobre el mismo elemento**, o
el estado queda colgado.

El estado actual:

```css
@keyframes task-in {
  0%   { opacity: 0; transform: translateY(-6px); box-shadow: 0 0 0 transparent; }
  45%  { box-shadow: 0 0 16px var(--cyan-glow); }
  100% { opacity: 1; transform: translateY(0); box-shadow: 0 0 0 transparent; }
}
.animate-task-in { animation: task-in 480ms ease-out; }
```

## Goals / Non-Goals

**Goals:**

- Que la entrada quepa en el presupuesto de interfaz sin perder legibilidad.
- Que la fila llegue desde el lado correcto.
- Que la animación use sólo propiedades de composición.
- Que el halo sobreviva: es lenguaje del sistema, no decoración.

**Non-Goals:**

- Añadir una animación de salida. Hoy una tarea eliminada desaparece de
  inmediato, y eso es correcto: la acción es deliberada y ya está mediada por un
  diálogo de confirmación. El estándar pide asimetría entre acción deliberada y
  respuesta del sistema, y la asimetría actual ya la cumple.
- Tocar el resto del movimiento del proyecto: la barra de acento de la fila, las
  transiciones de hover y foco. Esta revisión fue sobre `task-in`.
- Convertir la animación en transición o resorte. Ver decisión 3.
- Cambiar la alternativa de `prefers-reduced-motion`. Funciona y el estándar la
  cita como ejemplo de lo que hay que hacer.

## Decisions

**1. 200 ms con `cubic-bezier(0.23, 1, 0.32, 1)`.**

El estándar fija <300 ms para interfaz y no tiene fila para "entrada de elemento
de lista"; la más cercana es "dropdowns, selects: 150–250 ms". Se elige 200 ms,
el centro de ese rango, porque crear una tarea está en la banda de frecuencia que
el estándar manda reducir drásticamente.

La curva deja de ser el `ease-out` incorporado. El estándar es explícito en que
las curvas nativas son demasiado débiles para una entrada deliberada, y
`cubic-bezier(0.23, 1, 0.32, 1)` es el valor que su propio catálogo define como
ease-out fuerte para interfaz. Alternativa descartada: un resorte, que aquí no
aporta —no hay gesto que interrumpir— y traería una dependencia o código nuevo.

**2. `translateY(6px)`, no `-6px`.**

Las tareas se añaden al final de la lista (`App.tsx`, `[...tasks, nueva]`), así
que la fila nueva aparece abajo. Entrar desde arriba la hace venir del lugar que
ocupa la fila anterior. Se invierte el signo: sube a su posición.

Se conserva la magnitud de 6 px. El estándar advierte contra desplazamientos
grandes en elementos frecuentes, y 6 px ya está en el extremo discreto.

**3. El halo pasa a un pseudo-elemento; la animación sigue siendo `@keyframes`.**

`box-shadow` no compone: animarlo obliga a repintar en cada fotograma. El halo se
conserva por decisión del usuario —`DESIGN.md` lo documenta como el lenguaje de
respuesta a estado del sistema— pero se mueve a `.animate-task-in::after` con el
`box-shadow` declarado una vez y la `opacity` animada, que sí compone.

Sobre mantener `@keyframes` en lugar de pasar a transiciones con
`@starting-style`: el estándar prefiere transiciones para lo que se dispara
rápido, porque los keyframes reinician desde cero al interrumpirse. Aquí no
aplica — **cada fila es un elemento distinto que se anima una sola vez**, no un
elemento reutilizado que reciba disparos sucesivos. Cambiar a transiciones además
rompería `onAnimationEnd`, que es de lo que depende la limpieza de estado.
Alternativa descartada por resolver un problema que este caso no tiene.

**4. El spec acota, `DESIGN.md` especifica.**

El requisito nuevo dice "no supera los 300 ms" y "llega desde abajo": límites
observables y verificables. Los 200 ms, la curva y los 6 px viven en `DESIGN.md`.
Así, afinar la animación dentro del presupuesto no exige un cambio de spec, pero
salirse de él sí.

## Risks / Trade-offs

- **[`onAnimationEnd` deja de dispararse y `justAddedId` queda colgado]** → Es el
  único riesgo funcional. La animación sigue aplicándose sobre el `<li>`, que es
  el elemento que escucha, así que el evento se conserva. El pseudo-elemento
  tiene su propia animación y **también** emite `animationend`, que burbujea: si
  ambas duran 200 ms el manejador podría ejecutarse dos veces. Mitigación: el
  manejador es idempotente (pone `justAddedId` en `null`), pero la tarea de
  verificación lo comprueba explícitamente.

- **[El halo se percibe distinto al cambiar de 480 ms a 200 ms]** → El destello
  ahora sube y baja en la mitad de tiempo. Es intencional, pero es un cambio
  perceptible sobre la firma visual del producto; por eso la verificación es
  ocular y no sólo numérica.

- **[`::after` sobre un `<li>` que ya usa `position: relative`]** → La fila ya
  tiene un `<span>` absoluto para la barra de acento. Añadir un `::after` también
  absoluto es compatible, pero hay que confirmar que no interfiere con el hover
  de la barra ni captura eventos: se declara `pointer-events: none`.

## Migration Plan

No aplica: no hay datos ni estado persistido. Es CSS.

Rollback: restaurar el bloque `@keyframes task-in` y la duración anteriores, y
borrar la regla del pseudo-elemento.
