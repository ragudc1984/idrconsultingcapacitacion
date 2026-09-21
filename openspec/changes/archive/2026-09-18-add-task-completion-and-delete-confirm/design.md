# Design

## Context

Ver `proposal.md` - Why. Estado actual relevante:
- `Task` (`src/types.ts`) solo tiene `{ id: string; title: string }`.
- Las tareas se persisten en `localStorage` bajo la clave `todo-list:tasks` (`src/App.tsx`, `loadTasks`/`useEffect`).
- `TaskItem.tsx` ya renderiza dos botones-ícono (`Pencil`, `Trash2`) con estilos de glow neón consistentes (`hover:shadow-[0_0_12px_var(--violet-glow)]`, etc.) definidos como variables CSS en `src/index.css` (`--cyan`, `--magenta`, `--violet`).
- `Trash2` llama a `onDelete(task.id)` directamente desde `TaskItem`, sin paso intermedio.

## Goals / Non-Goals

**Goals:**
- Persistir y alternar un estado `done` por tarea, iniciando siempre en `false`.
- Comunicar el estado `done` solo con ícono + estilo de texto, nunca con la palabra "Done" como texto visible.
- Interponer una confirmación explícita (modal) entre el click en papelera y el borrado real.
- Mantener el lenguaje visual neón ya establecido (glow por color según acción) para el nuevo ícono y el modal.

**Non-Goals:**
- Sin acciones masivas (marcar todas, eliminar todas).
- Sin filtro/orden por estado completada/pendiente.
- Sin "deshacer" tras aceptar el borrado - "Aceptar" es definitivo.
- Sin sistema de migración de esquema versionado en `localStorage`; solo se rellena el campo faltante al leer.

## Decisions

**1. Modelo de datos**: `Task` gana `done: boolean`. `handleCreateTask` crea siempre `done: false`. Alternativa descartada: campo `status: 'pending' | 'done'` — un boolean es suficiente para dos estados y evita un tipo extra sin beneficio.

**2. Compatibilidad con datos ya guardados**: `loadTasks` (en `App.tsx`) normaliza cada tarea leída de `localStorage`, rellenando `done: false` cuando el campo no existe (`task.done ?? false`). Así las tareas guardadas por la versión anterior de la app siguen cargando sin error y aparecen como pendientes, sin migración explícita.

**3. Ícono y posición**: se usa `Check` de `lucide-react` (ya cubierto por la dependencia existente), colocado a la izquierda del ícono de lápiz (orden final: check → editar → eliminar). Alternativa descartada: colocarlo a la derecha de la papelera - se descarta porque agrupa peor las dos acciones "destructivas/estructurales" (editar, eliminar) separadas de la acción de estado (completar), y porque el pedido original ("al lado del ícono del lápiz") lee más naturalmente como inmediatamente adyacente.

**4. Tratamiento visual de "completada"**: cuando `done`, el título de la tarea recibe `line-through` + el color de texto atenuado (`text-[var(--text-muted)]`), y el ícono de check pasa a su estado "activo" (relleno/color `--cyan`, reutilizando el acento ya asociado a acciones de creación/positivas) en lugar de su estado neutro (`--text-muted`, igual que editar/eliminar en reposo). No se introduce un cuarto acento de color; se reutiliza `--cyan` para mantener la paleta de 3 acentos ya definida en el rediseño anterior.

**5. Modal de confirmación como componente controlado**: el estado "qué tarea está pendiente de confirmar borrado" (`pendingDeleteId: string | null`) vive en `App.tsx`, no en `TaskItem`. `TaskItem` ya no llama `onDelete(id)` directamente desde el ícono de papelera; llama `onRequestDelete(id)`, que abre el modal. El nuevo componente `ConfirmDeleteModal` es de presentación pura (mensaje, `onCancel`, `onConfirm`), montado una sola vez en `App.tsx` y visible cuando `pendingDeleteId !== null`. Alternativa descartada: modal local a cada `TaskItem` - forzaría lógica de borrado duplicada y montar/desmontar un overlay por cada fila en vez de uno solo a nivel de página.

**6. Interacción del modal**: sigue el patrón estándar de diálogo de confirmación:
   - Botón "Aceptar" con foco inicial (`autoFocus`) al abrir, ya que es la ruta menos destructiva de completar la tarea que el usuario ya inició (borrar) pero "Cancelar" es igualmente accesible por teclado (`Tab`).
   - Tecla `Escape` y click en el fondo (backdrop) equivalen a "Cancelar".
   - `role="dialog"` y `aria-modal="true"` para lectores de pantalla; el mensaje referenciado vía `aria-labelledby`.
   Estas conductas no estaban explícitas en el pedido original; se documentan aquí como la interpretación estándar de un modal de confirmación y no requieren cambiar el enunciado de los requisitos ya redactados en `specs/todo-list/spec.md`, que cubren el flujo mínimo pedido (Cancelar/Aceptar).

**7. Estilo del modal**: overlay a pantalla completa (`fixed inset-0`) con fondo semitransparente oscuro sobre el panel, y el panel mismo usando `var(--surface)`/`var(--border)` y el acento `--magenta` (mismo color que el ícono de papelera) para el botón "Aceptar", manteniendo la asociación semántica de color ya usada en el resto de la app (magenta = acción destructiva).

## Risks / Trade-offs

- [Datos antiguos en `localStorage` sin `done`] → Mitigado por el relleno por defecto en `loadTasks` (Decisión 2); no requiere que el usuario borre su `localStorage`.
- [Modal custom sin librería de accesibilidad] → Mitigado con `role="dialog"`, `aria-modal`, cierre por `Escape`/backdrop y foco inicial gestionado a mano; suficiente para el alcance de esta app pequeña, no se introduce una dependencia nueva para esto.
- [Contraste del texto tachado/atenuado en modo claro y oscuro] → Se reutilizan los tokens de color (`--text-muted`) ya validados visualmente en el rediseño anterior, en vez de definir un color nuevo sin probar.

## Migration Plan

- No hay migración de infraestructura; es un cambio de frontend puro.
- Despliegue: normal (build + deploy de la SPA). No requiere pasos manuales.
- Rollback: revertir el deploy es seguro - las tareas guardadas con el campo `done` siguen siendo JSON válido y la versión anterior de la app simplemente ignoraría ese campo extra al leer `title`/`id`.
