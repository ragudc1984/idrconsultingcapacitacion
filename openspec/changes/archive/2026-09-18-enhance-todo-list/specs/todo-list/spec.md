# Spec Delta

## ADDED Requirements

### Requirement: Eliminar tarea
El sistema SHALL mostrar, en cada tarea listada, un control de eliminar (ícono de papelera). Al activarlo, el sistema SHALL quitar esa tarea de la lista de inmediato, sin requerir que el usuario recargue la página manualmente.

#### Scenario: Eliminación inmediata
- **WHEN** el usuario hace click en el ícono de papelera de una tarea
- **THEN** esa tarea desaparece de la lista de inmediato, sin recargar la página

### Requirement: Editar tarea
El sistema SHALL mostrar, en cada tarea listada, un control de editar (ícono de lápiz). Al activarlo, el título de esa tarea SHALL volverse editable in-place. El sistema SHALL guardar el nuevo título cuando el usuario presione `Enter` o cuando el campo pierda el foco (click afuera), y SHALL reflejar el cambio de inmediato, sin requerir que el usuario recargue la página manualmente. Un título editado que quede vacío o compuesto solo por espacios en blanco SHALL ser rechazado, conservando el título anterior de la tarea.

#### Scenario: Guardar edición con Enter
- **WHEN** el usuario activa el modo edición de una tarea, cambia el texto del título y presiona `Enter`
- **THEN** la tarea se actualiza con el nuevo título de inmediato, sin recargar la página

#### Scenario: Guardar edición al perder el foco
- **WHEN** el usuario activa el modo edición de una tarea, cambia el texto del título y hace click fuera del campo de edición
- **THEN** la tarea se actualiza con el nuevo título de inmediato, sin recargar la página

#### Scenario: Rechaza título vacío al editar
- **WHEN** el usuario activa el modo edición de una tarea, borra el título dejándolo vacío o solo espacios en blanco, y confirma (Enter o click afuera)
- **THEN** la tarea conserva su título anterior y no se guarda un título vacío

## MODIFIED Requirements

### Requirement: Listar tareas
El sistema SHALL mostrar todas las tareas creadas en la sesión actual, en el orden en que fueron creadas, cada una como una card individual con el título y los controles de editar y eliminar. Cuando no existan tareas, el sistema SHALL mostrar un estado vacío en lugar de una lista sin elementos.

#### Scenario: Muestra las tareas creadas
- **WHEN** existe una o más tareas creadas
- **THEN** todas se muestran como cards individuales, en el orden en que fueron creadas, cada una con sus controles de editar y eliminar visibles

#### Scenario: Estado vacío
- **WHEN** no se ha creado ninguna tarea todavía
- **THEN** se muestra un mensaje de estado vacío en lugar de la lista de tareas
