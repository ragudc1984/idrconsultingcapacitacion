# Tasks

## 1. Modelo de datos y persistencia

- [x] 1.1 Agregar el campo `done: boolean` al tipo `Task` en `src/types.ts`; verificar que `npx tsc -b` compila sin errores
- [x] 1.2 Actualizar `loadTasks` en `src/App.tsx` para rellenar `done: false` en registros leídos de `localStorage` que no tengan ese campo (compatibilidad con datos guardados por la versión anterior); verificar sembrando manualmente en `localStorage` un registro `{ id, title }` sin `done` y confirmando que la app lo carga como tarea pendiente sin errores en consola
- [x] 1.3 Actualizar `handleCreateTask` en `src/App.tsx` para crear cada tarea nueva con `done: false`; verificar en el navegador que una tarea recién creada aparece sin marcar como completada

## 2. Marcar tarea como completada

- [x] 2.1 Agregar `handleToggleDone(id)` en `src/App.tsx` que invierte el valor de `done` de la tarea con ese `id`, y pasarlo a través de `TaskList` hasta `TaskItem`; verificar que alternar una tarea persiste tras recargar la página (se guarda en `localStorage`)
- [x] 2.2 En `src/components/TaskItem.tsx`, agregar un botón con el ícono `Check` de `lucide-react` ubicado a la izquierda del ícono de lápiz (`Pencil`), que llama a `onToggleDone(task.id)`; darle el mismo patrón de estilos hover/focus con glow que ya usan editar y eliminar; verificar visualmente en modo claro y oscuro que el botón responde a hover/foco con su glow
- [x] 2.3 Aplicar el tratamiento visual de "completada" en `TaskItem.tsx`: cuando `task.done` sea `true`, el título SHALL mostrarse tachado (`line-through`) y en color atenuado, y el ícono `Check` SHALL mostrarse en su estado activo (color `--cyan`) en vez de su estado neutro; verificar alternando una tarea en el navegador que el tachado y el color del ícono cambian, y confirmar que la palabra "Done" no aparece como texto en ningún punto de la interfaz

## 3. Confirmación de borrado

- [x] 3.1 Agregar estado `pendingDeleteId: string | null` en `src/App.tsx` junto con `handleRequestDelete(id)` (lo asigna), `handleCancelDelete()` (lo limpia) y `handleConfirmDelete()` (elimina la tarea con ese id reutilizando la lógica actual de `handleDeleteTask` y limpia el estado); verificar que hacer click en la papelera ya no borra la tarea de inmediato
- [x] 3.2 Crear `src/components/ConfirmDeleteModal.tsx`: componente de presentación con props `onCancel`/`onConfirm`, mensaje "¿Está seguro que desea eliminar esta tarea?" y botones "Cancelar"/"Aceptar"; overlay con fondo semitransparente, panel con `role="dialog"` y `aria-modal="true"`, cierre al presionar `Escape` o al hacer click en el fondo (equivalente a "Cancelar"), foco inicial en "Aceptar", y estilo del botón "Aceptar" usando el acento `--magenta` ya asociado a la acción de eliminar; verificar que el componente compila y que el foco inicial cae en "Aceptar" al montarse
- [x] 3.3 En `TaskItem.tsx`, cambiar el botón de papelera para que llame a `onRequestDelete(task.id)` en vez de `onDelete(task.id)` directamente; propagar el nuevo callback desde `TaskList`; verificar que ya no existe ninguna ruta que borre una tarea sin pasar por el modal
- [x] 3.4 Montar `ConfirmDeleteModal` una sola vez en `src/App.tsx`, visible cuando `pendingDeleteId !== null`, conectado a `handleCancelDelete`/`handleConfirmDelete`; verificar el flujo completo en el navegador: click en papelera abre el modal → "Cancelar" cierra el modal y la tarea sigue en la lista → click en papelera nuevamente → "Aceptar" elimina la tarea y cierra el modal

## 4. Verificación final

- [x] 4.1 Ejecutar `npx tsc -b` y confirmar que no hay errores de tipos
- [x] 4.2 Probar manualmente en el navegador (modo claro y oscuro, ancho de escritorio y ancho móvil ~375px) los escenarios de `specs/todo-list/spec.md`: tarea nueva inicia pendiente, marcar/desmarcar completada, abrir el modal de eliminar, cancelar conserva la tarea, aceptar elimina la tarea; confirmar además que editar tareas in-place sigue funcionando sin regresiones
