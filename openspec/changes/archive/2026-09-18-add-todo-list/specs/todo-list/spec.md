# Spec Delta

## Purpose

Permite a un usuario registrar tareas pendientes y ver todas las tareas que ha creado durante la sesión actual.

## ADDED Requirements

### Requirement: Crear tarea
El sistema SHALL permitir al usuario crear una tarea nueva ingresando un título de texto y confirmando la creación. Un título vacío o compuesto solo por espacios en blanco SHALL ser rechazado y no SHALL generar una tarea.

#### Scenario: Creación exitosa
- **WHEN** el usuario ingresa un título no vacío y confirma la creación
- **THEN** se agrega una nueva tarea a la lista con ese título

#### Scenario: Rechaza título vacío
- **WHEN** el usuario intenta crear una tarea con el título vacío o solo espacios en blanco
- **THEN** no se crea ninguna tarea y la lista permanece sin cambios

### Requirement: Listar tareas
El sistema SHALL mostrar todas las tareas creadas en la sesión actual, en el orden en que fueron creadas. Cuando no existan tareas, el sistema SHALL mostrar un estado vacío en lugar de una lista sin elementos.

#### Scenario: Muestra las tareas creadas
- **WHEN** existe una o más tareas creadas
- **THEN** todas se muestran en la lista, en el orden en que fueron creadas

#### Scenario: Estado vacío
- **WHEN** no se ha creado ninguna tarea todavía
- **THEN** se muestra un mensaje de estado vacío en lugar de la lista de tareas
