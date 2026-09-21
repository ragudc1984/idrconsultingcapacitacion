# Spec Delta

## Purpose

Define qué comprobaciones automáticas tiene que pasar un cambio antes de
integrarse y qué se publica solo al integrarlo, de modo que la rama principal
siempre sea desplegable y nadie tenga que publicar a mano desde su máquina.

## ADDED Requirements

### Requirement: Integración continua en cada propuesta de cambio
El sistema de automatización SHALL ejecutar, en cada propuesta de cambio abierta
contra la rama principal y en cada nueva versión empujada a esa propuesta, la
verificación de lint y la compilación de todos los espacios de trabajo del
repositorio. El resultado SHALL quedar visible en la propuesta de cambio. Si
cualquiera de esas comprobaciones falla, la ejecución SHALL reportarse como
fallida.

#### Scenario: Cambio que compila y pasa lint
- **WHEN** se abre una propuesta de cambio cuyo código pasa lint y compila en todos los espacios de trabajo
- **THEN** la automatización se ejecuta y reporta un resultado exitoso en la propuesta de cambio

#### Scenario: Cambio que rompe la compilación
- **WHEN** se abre una propuesta de cambio cuyo código no compila en alguno de los espacios de trabajo
- **THEN** la automatización reporta un resultado fallido en la propuesta de cambio, indicando qué comprobación falló

#### Scenario: Cambio que viola una regla de lint
- **WHEN** se abre una propuesta de cambio cuyo código incumple una regla de lint
- **THEN** la automatización reporta un resultado fallido en la propuesta de cambio

### Requirement: La rama principal está protegida por las comprobaciones
El repositorio SHALL exigir que las comprobaciones de integración continua sean
exitosas antes de permitir integrar una propuesta de cambio en la rama principal.
Una propuesta de cambio con comprobaciones fallidas o pendientes NO SHALL poder
integrarse.

#### Scenario: Integración bloqueada por comprobaciones fallidas
- **WHEN** una propuesta de cambio tiene comprobaciones de integración continua fallidas
- **THEN** el repositorio impide integrarla en la rama principal

### Requirement: Publicación automática al integrar en la rama principal
El sistema de automatización SHALL publicar la aplicación web y el servicio de
tareas cada vez que se integre un cambio en la rama principal, sin intervención
manual. La publicación SHALL ejecutarse únicamente después de que las
comprobaciones de lint y compilación hayan sido exitosas en esa misma ejecución.
Cuando la publicación falle, la ejecución SHALL reportarse como fallida y la
versión publicada anteriormente SHALL permanecer accesible.

#### Scenario: Publicación tras una integración exitosa
- **WHEN** se integra un cambio en la rama principal y las comprobaciones son exitosas
- **THEN** la automatización publica la aplicación web y el servicio de tareas, y la versión publicada refleja ese cambio sin que nadie ejecute nada manualmente

#### Scenario: No se publica lo que no compila
- **WHEN** se integra un cambio en la rama principal y la compilación falla
- **THEN** la automatización no publica nada y reporta la ejecución como fallida

#### Scenario: Un fallo de publicación no derriba lo publicado
- **WHEN** la publicación falla después de comprobaciones exitosas
- **THEN** la ejecución se reporta como fallida y la versión publicada anteriormente sigue siendo accesible

### Requirement: Las migraciones de base de datos se aplican antes de servir la versión nueva
El sistema de automatización SHALL aplicar las migraciones pendientes del
almacenamiento antes de que la versión nueva del servicio de tareas empiece a
atender solicitudes. Cuando una migración falle, el servicio NO SHALL quedar
sirviendo una versión que requiera un esquema que no existe.

#### Scenario: Despliegue con una migración pendiente
- **WHEN** se integra un cambio que incluye una migración de esquema y la publicación se ejecuta
- **THEN** la migración se aplica antes de que la versión nueva del servicio atienda solicitudes

#### Scenario: Migración fallida
- **WHEN** una migración falla durante la publicación
- **THEN** la publicación se reporta como fallida y no queda sirviendo una versión del servicio que dependa del esquema no aplicado

### Requirement: Los secretos no viven en el repositorio
Las credenciales de base de datos, las claves de despliegue y cualquier otro
secreto necesario para publicar SHALL proveerse a la automatización como secretos
configurados fuera del repositorio. Ningún secreto SHALL estar presente en los
archivos versionados, y la salida de la automatización NO SHALL imprimir sus
valores.

#### Scenario: El repositorio no contiene credenciales
- **WHEN** se inspecciona el contenido versionado del repositorio
- **THEN** no aparece ninguna credencial de base de datos ni clave de despliegue, solo referencias a secretos configurados externamente

#### Scenario: La salida de la automatización no revela secretos
- **WHEN** se revisa el registro de una ejecución de publicación
- **THEN** los valores de los secretos no aparecen en el registro

### Requirement: La aplicación web publicada apunta al servicio publicado
La dirección del servicio de tareas que usa la aplicación web SHALL determinarse
en el momento de construirla, a partir de la configuración del entorno, y NO
SHALL estar escrita de forma fija en el código. La versión publicada de la
aplicación web SHALL apuntar al servicio de tareas publicado, y la versión de
desarrollo local SHALL apuntar al servicio local.

#### Scenario: La versión publicada usa el servicio remoto
- **WHEN** un usuario abre la aplicación web publicada y crea una tarea
- **THEN** la tarea se envía al servicio de tareas publicado, no a una dirección local

#### Scenario: La versión local usa el servicio local
- **WHEN** una persona del equipo ejecuta la aplicación web en su máquina y crea una tarea
- **THEN** la tarea se envía al servicio de tareas que corre en su máquina
