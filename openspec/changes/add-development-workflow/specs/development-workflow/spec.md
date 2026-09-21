# Spec Delta

## Purpose

Define el ciclo que recorre cada cambio desde el código escrito hasta la versión
publicada: qué se verifica y en qué orden antes de empujar, cómo se registra e
integra el trabajo en la rama principal, y dónde queda visible el resultado para
cualquiera del equipo.

## ADDED Requirements

### Requirement: Todo el trabajo queda registrado en un commit
El repositorio SHALL tener un historial de commits que contenga todo el trabajo
existente, incluido el corpus completo de `openspec/`. Ningún cambio SHALL quedar
sin commitear al terminar una sesión de trabajo. Un commit SHALL corresponder a
una unidad de trabajo comprensible por sí sola, y su mensaje SHALL describir qué
cambió, en español.

#### Scenario: El historial contiene el trabajo existente
- **WHEN** se inspecciona el historial del repositorio
- **THEN** existe al menos un commit que contiene la aplicación, los specs y el archivo histórico de OpenSpec

#### Scenario: No queda trabajo sin commitear
- **WHEN** se termina una sesión de trabajo y se consulta el estado del repositorio
- **THEN** no hay archivos modificados ni sin seguimiento pendientes de commitear, salvo los excluidos deliberadamente

### Requirement: El historial no contiene secretos ni artefactos generados
El repositorio SHALL excluir del seguimiento los archivos de entorno, las
credenciales, los directorios de dependencias y los artefactos de construcción.
Esa exclusión SHALL estar en efecto **antes** del primer commit, dado que lo que
entra en el historial permanece en él aunque se borre después.

#### Scenario: Revisión previa al commit inicial
- **WHEN** se prepara el commit inicial y se revisa la lista de rutas incluidas
- **THEN** no aparece ningún archivo de entorno, credencial, directorio de dependencias ni artefacto de construcción

#### Scenario: Un archivo de entorno no se puede commitear por accidente
- **WHEN** existe un archivo de entorno con valores reales en el directorio de trabajo
- **THEN** el repositorio lo ignora y no aparece como pendiente de commitear

### Requirement: Puerta de verificación local antes de empujar
Antes de empujar trabajo al repositorio remoto, la persona SHALL ejecutar, en
este orden: la construcción del proyecto, la verificación de lint, y la
reproducción local de los pasos que ejecuta la automatización de integración
continua. Cuando un paso falle, la persona SHALL corregir la causa y volver a
ejecutar ese paso antes de continuar al siguiente. NO SHALL empujarse trabajo con
cualquiera de esos pasos en estado fallido.

#### Scenario: Los tres pasos pasan
- **WHEN** la persona ejecuta la construcción, el lint y la reproducción local del pipeline, y los tres terminan sin errores
- **THEN** el trabajo puede empujarse al repositorio remoto

#### Scenario: Falla la construcción
- **WHEN** la construcción falla
- **THEN** la persona corrige los errores y vuelve a ejecutar la construcción antes de ejecutar el lint, y no empuja el trabajo hasta que la construcción pase

#### Scenario: Falla el lint
- **WHEN** la construcción pasa pero el lint reporta errores
- **THEN** la persona corrige las infracciones y vuelve a ejecutar el lint, y no empuja el trabajo hasta que el lint pase

#### Scenario: Falla la reproducción local del pipeline
- **WHEN** la construcción y el lint pasan pero la reproducción local del pipeline falla
- **THEN** la persona corrige la causa y no empuja el trabajo hasta que la reproducción local pase

### Requirement: Un solo comando ejecuta la puerta de verificación
El proyecto SHALL exponer un comando único que ejecute la puerta de verificación
completa en el orden establecido. El comando SHALL detenerse en el primer paso
que falle, en lugar de seguir ejecutando los siguientes, y SHALL terminar con un
código de salida que distinga el éxito del fallo. La salida SHALL indicar qué
paso falló.

#### Scenario: Verificación completa exitosa
- **WHEN** se ejecuta el comando de verificación sobre un repositorio en buen estado
- **THEN** los tres pasos se ejecutan en orden y el comando termina con éxito

#### Scenario: El comando se detiene en el primer fallo
- **WHEN** se ejecuta el comando de verificación y la construcción falla
- **THEN** el comando no ejecuta el lint ni la reproducción del pipeline, termina con un código de fallo, e indica que falló la construcción

### Requirement: La reproducción local ejecuta los mismos pasos que la automatización
La reproducción local del pipeline SHALL ejecutar los mismos pasos que la
automatización de integración continua ejecuta en el repositorio remoto. Cuando
esos pasos cambien en la automatización, la reproducción local SHALL actualizarse
en el mismo cambio, de modo que un resultado local exitoso siga siendo evidencia
de que la automatización remota va a pasar.

#### Scenario: Coincidencia entre local y remoto
- **WHEN** la reproducción local del pipeline pasa y el trabajo se empuja
- **THEN** la automatización remota ejecuta los mismos pasos y también pasa

#### Scenario: Se agrega un paso a la automatización
- **WHEN** se modifica la automatización de integración continua para agregar o quitar un paso
- **THEN** la reproducción local se actualiza en el mismo cambio para reflejar esos pasos

### Requirement: El trabajo llega a la rama principal por pull request
Todo cambio SHALL integrarse en la rama principal mediante un pull request desde
una rama de trabajo, y NO SHALL empujarse directamente a la rama principal. El
pull request SHALL integrarse únicamente cuando sus comprobaciones automáticas
estén en verde. La rama principal SHALL llamarse `main`.

#### Scenario: Integración por pull request
- **WHEN** una persona termina un cambio verificado localmente
- **THEN** lo empuja a una rama de trabajo, abre un pull request contra `main`, y lo integra solo cuando las comprobaciones están en verde

#### Scenario: Push directo rechazado
- **WHEN** una persona intenta empujar un commit directamente a `main`
- **THEN** el repositorio remoto rechaza el push

### Requirement: La aplicación está publicada y su dirección es localizable
La aplicación SHALL estar accesible públicamente en internet, sin que quien la
abra necesite instalar nada ni ejecutar comandos. La dirección pública SHALL
estar escrita en el repositorio, de modo que cualquier integrante del equipo la
encuentre sin preguntar. La versión publicada SHALL corresponder al último cambio
integrado en la rama principal.

#### Scenario: La aplicación es accesible desde internet
- **WHEN** una persona abre la dirección pública desde un navegador, en un dispositivo donde el proyecto no está instalado
- **THEN** la lista de tareas carga y es usable

#### Scenario: La dirección está documentada
- **WHEN** alguien busca dónde ver la aplicación publicada
- **THEN** encuentra la dirección pública escrita en el repositorio

#### Scenario: Lo publicado refleja la rama principal
- **WHEN** se integra un cambio visible en la rama principal y termina la publicación
- **THEN** la dirección pública muestra ese cambio

### Requirement: El proyecto se puede poner en marcha siguiendo el repositorio
El repositorio SHALL documentar los pasos para instalar, verificar y ejecutar el
proyecto desde cero, incluidas las variables de entorno requeridas. Una persona
que clone el repositorio SHALL poder ponerlo en marcha siguiendo únicamente esa
documentación, sin recurrir a conocimiento no escrito.

#### Scenario: Puesta en marcha desde cero
- **WHEN** una persona clona el repositorio en una máquina limpia y sigue la documentación
- **THEN** logra instalar las dependencias, ejecutar la puerta de verificación y levantar la aplicación, sin necesitar información que no esté escrita
