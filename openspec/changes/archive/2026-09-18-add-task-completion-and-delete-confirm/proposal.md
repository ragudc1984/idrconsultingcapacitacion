# Proposal

## Why

Hoy una tarea no tiene forma de marcarse como completada: el único estado posible es "existe" o "no existe" (eliminada). Además, el botón de papelera elimina la tarea de inmediato sin ninguna confirmación, por lo que un click accidental destruye la tarea sin posibilidad de deshacer. Se necesita (1) una forma de marcar tareas como completadas directamente en el listado y (2) un paso de confirmación antes de un borrado irreversible.

## What Changes

- Se agrega un estado `done` (completada/pendiente) a cada tarea, con valor inicial `false` al crearla.
- En cada fila de la lista, junto al ícono de lápiz (editar), se agrega un ícono de check (`Check` de `lucide-react`) que alterna el estado `done` de esa tarea al hacer click.
- Cuando una tarea está marcada como `done`, su estado se comunica visualmente (ícono de check resaltado/activo + texto tachado) — no se usa la palabra "Done" como etiqueta de texto en ningún punto de la interfaz.
- El botón de eliminar (papelera) deja de borrar la tarea de inmediato. Ahora abre un modal de confirmación con el mensaje "¿Está seguro que desea eliminar esta tarea?" y dos botones: "Cancelar" y "Aceptar".
  - "Cancelar" cierra el modal sin eliminar la tarea.
  - "Aceptar" elimina la tarea y cierra el modal.
- **BREAKING**: la forma persistida de una tarea en `localStorage` (`todo-list:tasks`) gana el campo `done`. Registros guardados por la versión anterior (sin `done`) se siguen leyendo y se tratan como `done: false` (ver design.md).

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `todo-list`: se modifica el requisito "Listar tareas" para incluir el control de completado en cada card; se agrega el nuevo requisito "Marcar tarea como completada"; se modifica el requisito "Eliminar tarea" para exigir confirmación mediante modal antes de borrar.

## Impact

- `src/types.ts`: el tipo `Task` gana el campo `done: boolean`.
- `src/App.tsx`: `loadTasks`, `handleCreateTask` y un nuevo `handleToggleDone`; estado para controlar qué tarea está pendiente de confirmación de borrado.
- `src/components/TaskItem.tsx`: nuevo ícono de check, estilos de tachado cuando `done`, ya no llama a `onDelete` directamente sino que dispara la apertura del modal.
- Nuevo componente `src/components/ConfirmDeleteModal.tsx` (o equivalente) para el modal de confirmación.
- Sin cambios de dependencias: `lucide-react` ya está instalado y ya expone el ícono `Check`.
