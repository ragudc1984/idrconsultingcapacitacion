# Proposal

## Why

El repositorio no tiene ni un solo commit. Todo el trabajo —la app, los specs, el
archivo histórico de OpenSpec, las skills— está en el área de preparación de una
rama `master` sin remoto. El activo real del repositorio, que según `PRODUCT.md`
es el rastro de decisiones en `openspec/`, existe hoy únicamente en un disco
duro: no hay historial, no hay copia remota, y nada de esto es visible para el
equipo de IDR Consulting que tiene que aprender el flujo.

Falta además la mitad práctica del ejercicio. El equipo sabe proponer un cambio y
escribir sus specs, pero no hay nada escrito sobre **qué hace una persona entre
terminar de escribir código y ver ese código funcionando en producción**: qué
verifica, en qué orden, cómo llega su trabajo a la rama principal, y cómo
comprueba que no va a romper la automatización antes de empujar. Eso se aprende
hoy por imitación, que es exactamente lo que este repositorio existe para
reemplazar.

## What Changes

- Se introduce la capacidad **`development-workflow`**: el ciclo obligatorio que
  recorre cada cambio desde el código escrito hasta la versión publicada.
- **Todo cambio se registra en un commit.** Ningún trabajo queda sin commitear al
  terminar una sesión.
- **Se establece una puerta de verificación local antes de empujar**, en orden
  fijo: `npm run build`, luego `npm run lint`, luego la reproducción local de los
  pasos que ejecuta la automatización de GitHub. Cada fallo se corrige antes de
  pasar al siguiente paso; no se empuja con un paso en rojo.
- **Se agrega un script `verify`** que encadena esos pasos, para que el orden no
  dependa de que alguien lo recuerde.
- **Se crea el repositorio remoto** bajo la cuenta `ragudc1984` desde
  `https://github.com/`, se hace el commit inicial de todo el trabajo existente,
  y la rama principal pasa a llamarse `main`.
- **Cada cambio llega a `main` por pull request**, no por push directo: rama de
  trabajo, pull request, comprobaciones en verde, merge.
- **La aplicación queda publicada y accesible** en la dirección pública de GitHub
  Pages de la cuenta, y esa dirección queda escrita en el repositorio para que
  cualquiera la encuentre sin preguntar.

**Aclaraciones sobre el pedido original**, verificadas contra el repositorio:

- `npm run flb` no existe como script; se interpreta como `npm run lint`
  (oxlint), que es la verificación de lint que el repositorio ya usa.
- `git init` ya está ejecutado: el repositorio existe, en la rama `master`, con
  101 rutas preparadas y ningún commit. Lo que falta es el commit inicial, el
  remoto y el renombre de la rama.
- GitHub Pages sirve el sitio bajo `ragudc1984.github.io/<repo>`, que es una
  **ruta**, no un subdominio. Un subdominio propio exigiría comprar un dominio y
  configurar DNS; se descartó por costo para un ejercicio de capacitación.
- El push directo a `main` se descartó: contradice la rama protegida que exige la
  capacidad `continuous-delivery` del cambio
  `replace-localstorage-with-api-backend`. El commit por cada cambio se conserva;
  lo que cambia es que llega a `main` por merge y no por push.

**No entra en este cambio** (ver `design.md` — Non-Goals): dominio propio,
formateador automático, hooks de pre-commit, convención obligatoria de mensajes
de commit, versionado semántico, entornos de staging y runner de tests.

## Capabilities

### New Capabilities

- `development-workflow`: el ciclo observable que recorre un cambio desde el
  código escrito hasta la versión publicada —qué se verifica y en qué orden antes
  de empujar, cómo se registra e integra el trabajo, y dónde queda visible el
  resultado.

### Modified Capabilities

Ninguna. La capacidad `continuous-delivery` del cambio
`replace-localstorage-with-api-backend` gobierna lo que ejecuta la **automatización
de GitHub**; `development-workflow` gobierna lo que hace una **persona en su
máquina** antes de empujar. Se refieren a las mismas comprobaciones a propósito
—esa duplicación es la que permite descubrir un fallo antes de abrir un pull
request— pero ninguna de las dos modifica los requisitos de la otra.

## Impact

**Código y configuración afectados:**

- `package.json` — se agrega el script `verify`.
- `README.md` — hoy es la plantilla de Vite sin modificar. Pasa a documentar el
  flujo de trabajo, los comandos de verificación y la dirección pública de la
  aplicación.
- `.gitignore` — se revisa antes del commit inicial para confirmar que nada
  sensible entra al historial.

**Sistemas externos:** un repositorio en GitHub bajo `ragudc1984`
(`ragudc514@gmail.com`) con GitHub Pages habilitado y la rama principal
protegida.

**Relación con el otro cambio activo:** este cambio crea el repositorio remoto,
el commit inicial y la rama `main` protegida, que son prerrequisitos de las fases
7 a 9 de `replace-localstorage-with-api-backend`. **Conviene aplicarlo primero.**
Si se aplicara después, las tareas de creación del remoto quedarían duplicadas
entre ambos cambios.

**Riesgo operativo conocido:** el commit inicial abarca 101 rutas, incluidas
`.claude/settings.local.json` y el directorio completo de skills vendorizadas. Lo
que entre en ese commit queda en el historial aunque se borre después, así que la
revisión previa no es una formalidad.
