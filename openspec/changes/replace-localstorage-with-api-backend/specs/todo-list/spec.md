# Spec Delta

## MODIFIED Requirements

### Requirement: Persistir tareas
El sistema SHALL guardar la lista de tareas en el servicio de tareas (ver la
capacidad `task-api`) cada vez que se cree, edite, complete o elimine una tarea.
Al cargar la página, el sistema SHALL obtener las tareas del servicio antes de
mostrar la lista. El sistema NO SHALL guardar las tareas en el almacenamiento
local del navegador, y NO SHALL conservar una copia local que sobreviva al cierre
de la pestaña. En consecuencia, las tareas SHALL ser las mismas al abrir la
aplicación desde cualquier navegador o dispositivo que apunte al mismo servicio.

#### Scenario: Las tareas sobreviven a una recarga manual
- **WHEN** el usuario ha creado una o más tareas y recarga la página manualmente desde el navegador
- **THEN** todas las tareas creadas previamente siguen apareciendo en la lista, con el mismo contenido que tenían antes de recargar

#### Scenario: Una edición persiste tras recargar
- **WHEN** el usuario edita el título de una tarea y luego recarga la página manualmente
- **THEN** la tarea aparece con el título editado, no con el título original

#### Scenario: Una eliminación persiste tras recargar
- **WHEN** el usuario elimina una tarea y luego recarga la página manualmente
- **THEN** la tarea eliminada no vuelve a aparecer en la lista

#### Scenario: Un cambio de completada persiste tras recargar
- **WHEN** el usuario marca una tarea como completada y luego recarga la página manualmente
- **THEN** la tarea sigue apareciendo como completada

#### Scenario: Primera carga sin tareas guardadas
- **WHEN** el usuario abre la aplicación y el servicio no tiene ninguna tarea almacenada
- **THEN** la aplicación muestra el estado vacío de la lista de tareas, sin errores

#### Scenario: Las mismas tareas desde otro navegador
- **WHEN** el usuario ha creado tareas y abre la aplicación desde otro navegador o dispositivo que apunta al mismo servicio
- **THEN** ve las mismas tareas, con el mismo contenido y el mismo orden

#### Scenario: El navegador no conserva copia local de las tareas
- **WHEN** el usuario ha creado tareas y se inspecciona el almacenamiento local del navegador
- **THEN** no existe ninguna copia de las tareas guardada por la aplicación

## ADDED Requirements

### Requirement: Estado de carga inicial
Mientras el sistema obtiene las tareas al cargar la página, SHALL mostrar un
estado de carga explícito en lugar del estado vacío de la lista. El sistema NO
SHALL mostrar el mensaje de "no hay tareas" mientras la carga esté en curso, ya
que induce a creer que las tareas se perdieron. El estado de carga SHALL
anunciarse a las tecnologías de asistencia, y su fin también, de modo que una
persona que no ve la pantalla sepa que la lista terminó de cargar.

#### Scenario: Carga en curso
- **WHEN** el usuario abre la aplicación y las tareas todavía no han llegado del servicio
- **THEN** se muestra un estado de carga explícito, y no el mensaje de estado vacío

#### Scenario: Carga terminada con tareas
- **WHEN** las tareas llegan del servicio y hay al menos una
- **THEN** el estado de carga desaparece, la lista se muestra, y el cambio se anuncia a las tecnologías de asistencia

#### Scenario: Carga terminada sin tareas
- **WHEN** las tareas llegan del servicio y no hay ninguna
- **THEN** el estado de carga desaparece y se muestra el estado vacío de la lista

#### Scenario: Espera prolongada
- **WHEN** la carga inicial tarda más de lo habitual porque el servicio estaba suspendido por inactividad
- **THEN** el estado de carga se mantiene visible y comprensible durante toda la espera, sin mostrar un error ni una lista vacía

### Requirement: Fallo al cargar las tareas
Cuando el sistema no pueda obtener las tareas del servicio al cargar la página,
SHALL mostrar un mensaje de error que explique que no se pudieron cargar las
tareas, y SHALL ofrecer un control para reintentar la carga. El sistema NO SHALL
mostrar el estado vacío en ese caso, porque comunicaría falsamente que no existen
tareas. Al reintentar con éxito, el sistema SHALL mostrar la lista y retirar el
mensaje de error.

#### Scenario: El servicio no responde al cargar
- **WHEN** el usuario abre la aplicación y la obtención de tareas falla
- **THEN** se muestra un mensaje de error indicando que no se pudieron cargar las tareas, junto a un control para reintentar, y no se muestra el estado vacío

#### Scenario: Reintento exitoso
- **WHEN** el usuario activa el control de reintentar y la obtención de tareas tiene éxito
- **THEN** el mensaje de error desaparece y la lista de tareas se muestra

#### Scenario: Reintento fallido
- **WHEN** el usuario activa el control de reintentar y la obtención de tareas vuelve a fallar
- **THEN** el mensaje de error sigue visible y el control de reintentar sigue disponible

### Requirement: Fallo al guardar un cambio
Cuando una acción del usuario —crear, editar, completar o eliminar— no pueda
guardarse en el servicio, el sistema SHALL informarlo con un mensaje de error y
SHALL dejar la lista mostrando el estado que el servicio tiene realmente, sin
aplicar el cambio que no se guardó. El sistema NO SHALL anunciar la acción como
realizada cuando no se guardó. El mensaje de error SHALL anunciarse a las
tecnologías de asistencia.

#### Scenario: Falla la creación de una tarea
- **WHEN** el usuario confirma la creación de una tarea y la operación falla en el servicio
- **THEN** se muestra un mensaje de error, la tarea no aparece en la lista, y no se anuncia que la tarea fue agregada

#### Scenario: Falla el cambio de completada
- **WHEN** el usuario activa el control de completado de una tarea y la operación falla en el servicio
- **THEN** se muestra un mensaje de error y la tarea conserva en pantalla el estado que tenía antes

#### Scenario: Falla la eliminación
- **WHEN** el usuario confirma la eliminación de una tarea y la operación falla en el servicio
- **THEN** se muestra un mensaje de error y la tarea sigue apareciendo en la lista

#### Scenario: Falla la edición del título
- **WHEN** el usuario confirma la edición del título de una tarea y la operación falla en el servicio
- **THEN** se muestra un mensaje de error y la tarea conserva en pantalla su título anterior

### Requirement: Retroalimentación mientras una acción está en curso
Mientras una acción del usuario está siendo guardada en el servicio, el sistema
SHALL indicar visualmente que la acción está en curso, y SHALL impedir que la
misma acción se dispare otra vez sobre la misma tarea antes de que termine, para
que un doble click no produzca dos tareas ni dos eliminaciones. El sistema NO
SHALL bloquear el resto de la interfaz durante ese tiempo.

#### Scenario: Acción en curso visible
- **WHEN** el usuario confirma una acción y el sistema está esperando la respuesta del servicio
- **THEN** el control correspondiente indica que la acción está en curso

#### Scenario: Doble activación
- **WHEN** el usuario activa dos veces seguidas el mismo control antes de que la primera acción termine
- **THEN** la acción se ejecuta una sola vez

#### Scenario: El resto de la interfaz sigue usable
- **WHEN** una acción sobre una tarea está en curso
- **THEN** el usuario puede seguir interactuando con el resto de la interfaz, incluido el control de tema
