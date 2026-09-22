# development-workflow Specification

## Purpose

Define el ciclo que recorre cada cambio desde el código escrito hasta la versión
publicada: qué se verifica y en qué orden antes de empujar, cómo se registra el
trabajo, cómo se nombran e integran las ramas siguiendo Gitflow, cómo se
etiqueta cada versión, y dónde queda visible el resultado para cualquiera del
equipo.

## Requirements

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
de que la automatización remota va a pasar. La validación de la nomenclatura de
ramas queda fuera de la reproducción local, porque depende de los datos del pull
request (rama de origen y rama de destino), que no existen en la máquina.

#### Scenario: Coincidencia entre local y remoto
- **WHEN** la reproducción local del pipeline pasa y el trabajo se empuja
- **THEN** la automatización remota ejecuta los mismos pasos y también pasa

#### Scenario: Se agrega un paso a la automatización
- **WHEN** se modifica la automatización de integración continua para agregar o quitar un paso
- **THEN** la reproducción local se actualiza en el mismo cambio para reflejar esos pasos

### Requirement: El trabajo se integra siguiendo Gitflow
El repositorio SHALL tener dos ramas permanentes: `main`, que contiene únicamente
versiones publicadas, y `develop`, donde se integran las funcionalidades. Toda
integración en `main` o en `develop` SHALL hacerse mediante un pull request cuyas
comprobaciones automáticas estén en verde, y NO SHALL empujarse directamente a
ninguna de las dos. Una funcionalidad SHALL partir de `develop` e integrarse en
`develop`, y NO SHALL integrarse directamente en `main`. Una release SHALL partir
de `develop`, integrarse en `main` y después integrarse de vuelta en `develop`.
Un hotfix SHALL partir de `main`, integrarse en `main` y después integrarse de
vuelta en `develop`.

#### Scenario: Nueva funcionalidad
- **WHEN** una persona termina una funcionalidad verificada localmente
- **THEN** la empuja en una rama `feature-*` creada desde `develop`, abre un pull request contra `develop`, y lo integra solo cuando las comprobaciones están en verde

#### Scenario: Release
- **WHEN** `develop` reúne las funcionalidades de la siguiente versión
- **THEN** se crea una rama `release-*` desde `develop`, se integra por pull request en `main`, y después se integra de vuelta en `develop`

#### Scenario: Hotfix
- **WHEN** se detecta un defecto en la versión publicada
- **THEN** se corrige en una rama `hotfix-*` creada desde `main`, se integra por pull request en `main`, y después se integra de vuelta en `develop`

#### Scenario: Push directo rechazado
- **WHEN** una persona intenta empujar un commit directamente a `main` o a `develop`
- **THEN** el repositorio remoto rechaza el push

### Requirement: Nomenclatura de ramas
Las ramas de trabajo SHALL nombrarse según su tipo: `feature-<nombre-funcionalidad>`
para una funcionalidad nueva, `hotfix-<nombre-issue>` para corregir un defecto de
la versión publicada, y `release-<X.Y.Z>` para preparar una versión. El nombre
SHALL escribirse en minúsculas, con las palabras separadas por guiones. La
automatización SHALL rechazar un pull request cuya rama no respete esta
nomenclatura o cuya rama de destino no corresponda a su tipo: `feature-*` solo
hacia `develop`; `release-*` y `hotfix-*` hacia `main` o de vuelta hacia
`develop`.

#### Scenario: Nombre válido
- **WHEN** se abre un pull request desde `feature-editar-tareas` contra `develop`
- **THEN** la validación de nomenclatura pasa

#### Scenario: Nombre inválido
- **WHEN** se abre un pull request desde una rama que no empieza por `feature-`, `hotfix-` ni `release-`, o que usa mayúsculas o barras
- **THEN** la validación de nomenclatura falla e indica el formato esperado

#### Scenario: Destino incorrecto
- **WHEN** se abre un pull request desde una rama `feature-*` contra `main`
- **THEN** la validación de nomenclatura falla

### Requirement: Cada versión publicada está etiquetada
Cada integración en `main` SHALL etiquetarse con su número de versión en la forma
`vX.Y.Z`, siguiendo versionado semántico: una release incrementa la versión menor
o la mayor, y un hotfix incrementa el parche. La versión declarada en
`package.json` SHALL coincidir con la de la etiqueta.

#### Scenario: Release etiquetada
- **WHEN** se integra la rama `release-0.1.0` en `main`
- **THEN** el commit resultante en `main` lleva la etiqueta `v0.1.0` y `package.json` declara la versión `0.1.0`

#### Scenario: Hotfix incrementa el parche
- **WHEN** se integra un hotfix en `main` cuando la última versión es `v0.1.0`
- **THEN** el commit resultante en `main` lleva la etiqueta `v0.1.1`

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
