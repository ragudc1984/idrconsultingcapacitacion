# Proposal

## Why

La animación de entrada de una tarea nueva (`task-in`) dura **480 ms** y se
dispara en la acción más frecuente de la aplicación. Una revisión de movimiento
contra el estándar de Emil Kowalski la marcó como **Block** por dos criterios
independientes: supera el presupuesto de 300 ms para elementos de interfaz, y
anima `box-shadow`, que no es una propiedad de composición y obliga a repintar en
cada fotograma durante toda la animación.

Hay además un error de dirección que nadie había notado: la fila entra con
`translateY(-6px)`, es decir deslizándose **desde arriba**, pero las tareas se
añaden al **final** de la lista. La fila aparece en el borde inferior viniendo del
lado que ocupa la fila anterior. Son seis píxeles, y son la diferencia entre
"apareció" y "llegó".

Nada de esto está hoy en un spec: `task-in` existe en el código y en `DESIGN.md`,
pero ninguna capacidad describe el movimiento de entrada. Este cambio cierra ese
hueco además de corregir la animación.

## What Changes

- **Duración de 480 ms a 200 ms**, dentro del presupuesto para interfaz.
- **Curva propia** `cubic-bezier(0.23, 1, 0.32, 1)` en lugar del `ease-out`
  incorporado, demasiado débil para una entrada deliberada.
- **Dirección invertida**: `translateY(6px)`, de modo que la fila sube al lugar
  que va a ocupar en vez de bajar desde el que ya está ocupado.
- **El halo deja de animarse como `box-shadow`.** Se conserva —es parte del
  lenguaje documentado del sistema— pero pasa a un pseudo-elemento con
  `box-shadow` fijo y `opacity` animada. El fotograma de `task-in` queda con
  `opacity` y `transform` únicamente.
- **`app-appearance` recibe un requisito nuevo** sobre la animación de entrada,
  redactado como comportamiento observable. Los valores exactos siguen viviendo
  en `DESIGN.md`, no en el spec.
- **`DESIGN.md` y `.impeccable/design.json` se actualizan**: ambos documentan hoy
  `task-in` como `480ms ease-out`.
- La alternativa bajo `prefers-reduced-motion` **no cambia**: sigue siendo un
  fundido de opacidad que conserva la señal de aparición sin movimiento.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `app-appearance`: se añade un requisito sobre la animación de entrada de una
  tarea. Hoy la capacidad cubre diseño responsive y alternancia de tema, pero no
  dice nada sobre movimiento, pese a que la aplicación lo tiene desde hace varios
  cambios. El requisito fija lo observable —que no se perciba lenta, que la fila
  llegue desde abajo, y que bajo movimiento reducido conserve la señal sin
  desplazamiento— y deja las cifras concretas en el sistema de diseño.

## Impact

- **Código afectado:** `src/index.css`, sólo el bloque de `@keyframes` y la clase
  `.animate-task-in`. Ningún componente cambia: `TaskItem` sigue aplicando la
  misma clase y escuchando `onAnimationEnd`.
- **Documentación afectada:** `DESIGN.md` (sección Components, componente de fila)
  y `.impeccable/design.json` (`extensions.motion`).
- **Comportamiento observable:** la entrada se percibe más rápida y llega desde el
  lado correcto. El halo sigue viéndose igual.
- **Riesgo sobre `onAnimationEnd`:** la limpieza de `justAddedId` depende de que
  la animación dispare `animationend`. La animación sigue existiendo y sigue
  aplicándose sobre el mismo elemento, así que el evento se conserva; hay que
  verificarlo de todos modos.
- **Dependencias:** ninguna nueva.
