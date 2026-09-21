# Design

## Context

La app es un cliente React + TypeScript + Tailwind v4 sin backend; el estado de tareas vive en `App.tsx` (`useState<Task[]>`) y se pasa a `TaskList`/`TaskForm` por props. Ver `proposal.md` - Why para la motivación. Esta iteración agrega edición y borrado, más un nuevo componente visual por tarea, y la dependencia `lucide-react` para íconos.

## Goals / Non-Goals

**Goals:**
- Eliminar y editar una tarea con actualización visual inmediata (ya es el comportamiento natural de `useState` + re-render; no hay red de por medio).
- Presentar cada tarea como una card individual, con una estética "2026": mucho whitespace, bordes suaves, esquinas muy redondeadas (`rounded-2xl`), sombra sutil, transiciones cortas, buen soporte dark mode.
- Que los controles de editar/eliminar sean utilizables también en touch (no solo hover), para no introducir una regresión de accesibilidad.

**Non-Goals:**
- Confirmación o "deshacer" al eliminar (no se pidió; ver Riesgos).
- Cancelar la edición con `Escape` (no se pidió; el usuario solo especificó Enter y click afuera). Si se agrega, es un cambio de spec, no de este design.
- Persistencia (localStorage/backend) - sigue fuera de alcance, como en el cambio anterior.
- Vista de tabla - se descarta explícitamente (ver Decisiones).

## Decisions

**Cards en lugar de tabla.** Para una lista de un solo campo (título) + 2 acciones, una tabla implica estructura tabular (columnas, filas densas) que no aporta nada aquí y se siente "admin/dashboard". Una lista de cards individuales (fila con borde, `rounded-2xl`, sombra sutil al hover/focus) es el patrón dominante en apps de productividad modernas (Linear, Todoist, Notion) y escala mejor a mobile sin scroll horizontal. Alternativa considerada: tabla con columnas Título/Acciones - descartada por exceso de estructura para el caso de uso.

**`lucide-react` para íconos.** Pedido explícitamente por el usuario. Es tree-shakeable (cada ícono es un import individual, no bundlea el set completo) y es el set de íconos más usado junto a Tailwind en 2025-2026.

**Acciones (editar/eliminar) siempre visibles, no solo on-hover.** Mostrar los íconos solo en `:hover` es común en desktop pero no funciona en touch (no hay hover persistente) y es una barrera de descubribilidad. Se muestran siempre, con opacidad/color reducidos respecto al texto principal (p. ej. `text-gray-400`), y con estado `hover`/`focus-visible` más marcado para dar feedback. Alternativa: revelar con hover y fallback con focus - descartada por complejidad extra sin beneficio claro dado el alcance.

**Edición in-place con estado local por tarea.** Cada card de tarea maneja su propio estado `isEditing` + valor en edición (borrador) en el propio componente de la card; solo al confirmar (Enter o blur) llama a un callback `onUpdate(id, newTitle)` que sube el cambio al estado central en `App.tsx`. Esto evita levantar el estado de edición al padre y mantiene `TaskList`/`App` simples. Para esto se extrae un componente `TaskItem` (una card) desde `TaskList`, que hoy solo hace `map` sobre `<li>`.

**Validación de título vacío al editar reutiliza la regla de "Crear tarea".** Un título vacío/solo espacios al confirmar la edición no se guarda: se descarta el borrador y la card vuelve a mostrar el título anterior (no se entra en un estado de error bloqueante, ya que no se pidió).

**Eliminar es inmediato, sin confirmación.** El usuario pidió explícitamente "se tiene que eliminar la tarea inmediatamente" - no se agrega un modal de confirmación ni "deshacer" porque no se pidió y añadiría alcance no solicitado.

## Risks / Trade-offs

- [Eliminar sin confirmación] → Un click accidental en la papelera borra la tarea sin forma de recuperarla (no hay persistencia de todas formas). Mitigación: ninguna en este alcance; si se vuelve un problema real, es una mejora futura (confirmación o undo), no parte de este cambio.
- [Sin persistencia] → Editar/eliminar sigue viviendo solo en memoria: un refresco del navegador pierde todo el estado (igual que hoy con crear/listar). No es una regresión, es el mismo comportamiento ya aceptado.
- [Nueva dependencia `lucide-react`] → Aumenta el bundle en un ícono más el runtime del paquete. Es una librería pequeña y ampliamente usada; impacto aceptable para este alcance.
