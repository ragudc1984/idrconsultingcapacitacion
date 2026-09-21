# Spec Delta

## ADDED Requirements

### Requirement: Marcar tarea como completada
El sistema SHALL mostrar, en cada tarea listada, un control de completado (ícono de check) ubicado junto al control de editar. Al activarlo, el sistema SHALL alternar el estado `done` de esa tarea (de pendiente a completada, o de completada a pendiente) y SHALL reflejar el cambio de inmediato, sin requerir que el usuario recargue la página manualmente. Toda tarea nueva SHALL iniciar en estado pendiente (`done: false`).

#### Scenario: Marcar tarea pendiente como completada
- **WHEN** el usuario hace click en el ícono de check de una tarea pendiente
- **THEN** esa tarea pasa a estado completada de inmediato y se refleja visualmente sin recargar la página

#### Scenario: Desmarcar tarea completada
- **WHEN** el usuario hace click en el ícono de check de una tarea ya completada
- **THEN** esa tarea vuelve a estado pendiente de inmediato y se refleja visualmente sin recargar la página

#### Scenario: Tarea nueva inicia pendiente
- **WHEN** el usuario crea una tarea nueva
- **THEN** esa tarea se agrega a la lista en estado pendiente (no completada)

## MODIFIED Requirements

### Requirement: Listar tareas
El sistema SHALL mostrar todas las tareas creadas en la sesión actual, en el orden en que fueron creadas, cada una como una card individual con el título y los controles de completar, editar y eliminar. El sistema SHALL comunicar visualmente si una tarea está completada (por ejemplo, título tachado y el control de completar en su estado activo), sin mostrar la palabra "Done" como etiqueta de texto en ningún punto de la interfaz. Cuando no existan tareas, el sistema SHALL mostrar un estado vacío en lugar de una lista sin elementos.

#### Scenario: Muestra las tareas creadas
- **WHEN** existe una o más tareas creadas
- **THEN** todas se muestran como cards individuales, en el orden en que fueron creadas, cada una con sus controles de completar, editar y eliminar visibles

#### Scenario: Estado vacío
- **WHEN** no se ha creado ninguna tarea todavía
- **THEN** se muestra un mensaje de estado vacío en lugar de la lista de tareas

#### Scenario: Tarea completada se distingue visualmente
- **WHEN** una tarea tiene su estado marcado como completada
- **THEN** la tarea se muestra con una indicación visual de completada (por ejemplo, título tachado) y sin mostrar la palabra "Done" como texto

### Requirement: Eliminar tarea
El sistema SHALL mostrar, en cada tarea listada, un control de eliminar (ícono de papelera). Al activarlo, el sistema SHALL abrir un modal de confirmación con el mensaje "¿Está seguro que desea eliminar esta tarea?" y dos botones: "Cancelar" y "Aceptar". El sistema SHALL cerrar el modal sin eliminar la tarea cuando el usuario haga click en "Cancelar". El sistema SHALL eliminar la tarea de la lista y cerrar el modal cuando el usuario haga click en "Aceptar", sin requerir que el usuario recargue la página manualmente. Ninguna tarea SHALL eliminarse sin que el usuario confirme explícitamente mediante "Aceptar".

#### Scenario: Abre modal de confirmación
- **WHEN** el usuario hace click en el ícono de papelera de una tarea
- **THEN** se muestra un modal con el mensaje "¿Está seguro que desea eliminar esta tarea?" y los botones "Cancelar" y "Aceptar", y la tarea permanece en la lista

#### Scenario: Cancelar conserva la tarea
- **WHEN** el modal de confirmación está abierto para una tarea y el usuario hace click en "Cancelar"
- **THEN** el modal se cierra y la tarea permanece en la lista sin cambios

#### Scenario: Eliminación inmediata
- **WHEN** el modal de confirmación está abierto para una tarea y el usuario hace click en "Aceptar"
- **THEN** la tarea desaparece de la lista de inmediato y el modal se cierra, sin recargar la página
