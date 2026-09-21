# Proposal

## Why

La lista de tareas actual (capacidad `todo-list`) solo permite crear y listar tareas. Para que sea utilizable en un flujo real de gestión de tareas, el usuario necesita poder corregir el título de una tarea y eliminar las que ya no aplican, sin recargar la página. Además, la presentación actual (una lista simple de texto) se ve básica y se quiere modernizar visualmente.

## What Changes

- Se agrega la opción de **eliminar tarea**: cada tarea listada muestra un ícono de papelera (`lucide-react`); al hacer click se elimina esa tarea del estado y la interfaz se actualiza de inmediato (sin recargar el navegador).
- Se agrega la opción de **editar el título de una tarea**: cada tarea listada muestra un ícono de lápiz (`lucide-react`); al hacer click, el título se vuelve editable in-place; al perder el foco (click afuera) o al presionar `Enter` se guarda el nuevo título y la interfaz se actualiza de inmediato. Un título editado que quede vacío o solo espacios en blanco no se guarda (se conserva el título anterior), consistente con la regla ya existente de "Crear tarea".
- Se rediseña la presentación de "Listar tareas": en lugar de una lista de texto plana, cada tarea se muestra como una **card individual** (fila con borde suave, esquinas redondeadas y sombra sutil al pasar el mouse/foco), con el título a la izquierda y los íconos de editar/eliminar a la derecha. Se mantiene el estado vacío ya existente.
- Se agrega la dependencia `lucide-react` para los íconos de papelera y lápiz.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `todo-list`: se agregan los requisitos "Eliminar tarea" y "Editar tarea", y se actualiza el requisito "Listar tareas" para reflejar la nueva presentación en cards con acciones de editar/eliminar.

## Impact

- Código en `src/` (nuevo ícono/acciones en `TaskList`, nuevo componente o lógica para edición in-place, nuevas funciones `handleDeleteTask` / `handleUpdateTask` en el contenedor de estado).
- Nueva dependencia de producción: `lucide-react` (íconos).
- Sigue sin haber backend/API ni persistencia: el estado permanece en memoria del cliente (`useState`), por lo que "actualizar de inmediato sin recargar" ya es el comportamiento natural de React; no se requiere sincronización con servidor.
