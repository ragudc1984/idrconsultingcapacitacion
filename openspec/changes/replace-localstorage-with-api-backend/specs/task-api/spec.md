# Spec Delta

## Purpose

Expone las tareas como un recurso accesible por red, de modo que la lista deje de
vivir en un solo navegador y pueda leerse y modificarse desde cualquier cliente
autorizado, conservando los datos entre reinicios del servicio.

## ADDED Requirements

### Requirement: Listar tareas almacenadas
El servicio SHALL exponer una operación de lectura que devuelva todas las tareas
almacenadas, en el orden en que fueron creadas. Cada tarea devuelta SHALL incluir
su identificador, su título y su estado de completada. Cuando no exista ninguna
tarea almacenada, el servicio SHALL devolver una colección vacía y una respuesta
de éxito, no un error.

#### Scenario: Devuelve las tareas en orden de creación
- **WHEN** un cliente solicita la lista de tareas y existen tareas almacenadas
- **THEN** el servicio responde con éxito y con todas las tareas, en el orden en que fueron creadas, cada una con identificador, título y estado de completada

#### Scenario: Colección vacía no es un error
- **WHEN** un cliente solicita la lista de tareas y no existe ninguna almacenada
- **THEN** el servicio responde con éxito y una colección vacía

### Requirement: Crear tarea
El servicio SHALL exponer una operación de creación que reciba un título y
almacene una tarea nueva. El servicio SHALL asignar el identificador de la tarea;
un identificador enviado por el cliente SHALL ser ignorado. Toda tarea creada
SHALL iniciar con estado no completada. El servicio SHALL rechazar un título
vacío, compuesto solo por espacios en blanco, ausente, que no sea texto, o de más
de 200 caracteres, respondiendo con un error de solicitud inválida y sin
almacenar nada. El servicio SHALL eliminar los espacios en blanco al inicio y al
final del título antes de almacenarlo.

#### Scenario: Creación exitosa
- **WHEN** un cliente envía una solicitud de creación con un título válido
- **THEN** el servicio almacena la tarea, responde con un código de recurso creado, y devuelve la tarea con el identificador que le asignó y estado no completada

#### Scenario: Rechaza título vacío
- **WHEN** un cliente envía una solicitud de creación con un título vacío o compuesto solo por espacios en blanco
- **THEN** el servicio responde con un error de solicitud inválida, con un mensaje que indica el motivo, y no almacena ninguna tarea

#### Scenario: Rechaza título excesivamente largo
- **WHEN** un cliente envía una solicitud de creación con un título de más de 200 caracteres
- **THEN** el servicio responde con un error de solicitud inválida y no almacena ninguna tarea

#### Scenario: El servicio asigna el identificador
- **WHEN** un cliente envía una solicitud de creación que incluye un identificador propio
- **THEN** el servicio ignora ese identificador y almacena la tarea con uno asignado por él mismo

### Requirement: Actualizar tarea
El servicio SHALL exponer una operación de actualización que permita cambiar el
título de una tarea existente, su estado de completada, o ambos. Un campo no
enviado SHALL conservar su valor actual. El servicio SHALL aplicar al título las
mismas reglas de validación que en la creación. Cuando la tarea indicada no
exista, el servicio SHALL responder con un error de recurso no encontrado y no
SHALL crear una tarea nueva.

#### Scenario: Actualizar el título
- **WHEN** un cliente envía una actualización con un título válido para una tarea existente
- **THEN** el servicio almacena el título nuevo, conserva el estado de completada, y devuelve la tarea actualizada

#### Scenario: Alternar el estado de completada
- **WHEN** un cliente envía una actualización del estado de completada de una tarea existente
- **THEN** el servicio almacena el estado nuevo, conserva el título, y devuelve la tarea actualizada

#### Scenario: Rechaza título vacío al actualizar
- **WHEN** un cliente envía una actualización con un título vacío o compuesto solo por espacios en blanco
- **THEN** el servicio responde con un error de solicitud inválida y la tarea conserva su título anterior

#### Scenario: Actualizar una tarea inexistente
- **WHEN** un cliente envía una actualización para un identificador que no corresponde a ninguna tarea almacenada
- **THEN** el servicio responde con un error de recurso no encontrado y no crea ninguna tarea

### Requirement: Eliminar tarea
El servicio SHALL exponer una operación de eliminación que borre de forma
permanente la tarea indicada. Tras una eliminación exitosa, la tarea eliminada NO
SHALL aparecer en lecturas posteriores. Cuando la tarea indicada no exista, el
servicio SHALL responder con un error de recurso no encontrado.

#### Scenario: Eliminación exitosa
- **WHEN** un cliente solicita eliminar una tarea existente
- **THEN** el servicio la borra, responde con éxito, y la tarea no aparece en una lectura posterior de la lista

#### Scenario: Eliminar una tarea inexistente
- **WHEN** un cliente solicita eliminar un identificador que no corresponde a ninguna tarea almacenada
- **THEN** el servicio responde con un error de recurso no encontrado

### Requirement: Los datos sobreviven al reinicio del servicio
El servicio SHALL almacenar las tareas de forma que sobrevivan a un reinicio o a
un nuevo despliegue del propio servicio. Reiniciar el servicio NO SHALL vaciar ni
alterar la lista de tareas almacenadas.

#### Scenario: Las tareas persisten tras reiniciar
- **WHEN** se han creado tareas, el servicio se reinicia, y un cliente solicita la lista
- **THEN** el servicio devuelve las mismas tareas que existían antes del reinicio, con el mismo contenido y el mismo orden

### Requirement: Acceso desde el origen de la aplicación web
El servicio SHALL aceptar solicitudes de lectura y escritura provenientes del
origen donde está publicada la aplicación web, incluso cuando ese origen sea
distinto al del propio servicio. El servicio NO SHALL aceptar solicitudes de
orígenes no declarados. El conjunto de orígenes permitidos SHALL ser
configurable por entorno, sin requerir un cambio de código.

#### Scenario: Solicitud desde el origen permitido
- **WHEN** la aplicación web, publicada en un origen declarado como permitido, solicita la lista de tareas
- **THEN** el navegador recibe la respuesta sin bloquearla y la aplicación puede mostrar las tareas

#### Scenario: Solicitud desde un origen no declarado
- **WHEN** una página en un origen no declarado intenta leer o modificar las tareas desde un navegador
- **THEN** el navegador bloquea la respuesta porque el servicio no autoriza ese origen

### Requirement: Comprobación de disponibilidad
El servicio SHALL exponer una operación de comprobación de estado que responda
con éxito cuando el servicio esté en funcionamiento y pueda alcanzar su
almacenamiento. Esta operación NO SHALL requerir que exista ninguna tarea.

#### Scenario: Servicio disponible
- **WHEN** se consulta el estado de un servicio en funcionamiento con su almacenamiento accesible
- **THEN** el servicio responde con éxito

#### Scenario: Almacenamiento inalcanzable
- **WHEN** se consulta el estado de un servicio cuyo almacenamiento no está accesible
- **THEN** el servicio responde con un error que lo indica, en lugar de responder con éxito
