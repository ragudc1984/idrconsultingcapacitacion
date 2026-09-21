# Spec Delta

## ADDED Requirements

### Requirement: Persistir tareas
El sistema SHALL guardar la lista de tareas en el almacenamiento local del navegador (`localStorage`) cada vez que se cree, edite o elimine una tarea. Al cargar la página, el sistema SHALL restaurar las tareas previamente guardadas en `localStorage`, si existen, antes de mostrar la lista.

#### Scenario: Las tareas sobreviven a una recarga manual
- **WHEN** el usuario ha creado una o más tareas y recarga la página manualmente desde el navegador
- **THEN** todas las tareas creadas previamente siguen apareciendo en la lista, con el mismo contenido que tenían antes de recargar

#### Scenario: Una edición persiste tras recargar
- **WHEN** el usuario edita el título de una tarea y luego recarga la página manualmente
- **THEN** la tarea aparece con el título editado, no con el título original

#### Scenario: Una eliminación persiste tras recargar
- **WHEN** el usuario elimina una tarea y luego recarga la página manualmente
- **THEN** la tarea eliminada no vuelve a aparecer en la lista

#### Scenario: Primera carga sin tareas guardadas
- **WHEN** el usuario abre la aplicación por primera vez y no hay tareas guardadas en `localStorage`
- **THEN** la aplicación muestra el estado vacío de la lista de tareas, sin errores
