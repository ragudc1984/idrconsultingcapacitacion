# Design

## Context

Ver `proposal.md` — Why. Estado verificado del repositorio al escribir esto:

- Rama `master`, **cero commits**, sin remoto configurado. 101 rutas preparadas
  en el área de staging.
- Scripts de `package.json`: `dev`, `build` (`tsc -b && vite build`), `lint`
  (`oxlint`), `preview`. No existe `flb`, ni `test`, ni `verify`.
- `.gitignore` es el de la plantilla de Vite: cubre `node_modules`, `dist`,
  `*.local` y logs. **No menciona `.env`.**
- `README.md` es la plantilla de Vite sin modificar. Lo único aprovechable es su
  nota sobre reglas type-aware de oxlint.
- Ni `gh` (CLI de GitHub) ni `act` están instalados en esta máquina.
  *Corrección al aplicar:* `gh` sí estaba instalado y autenticado como
  `ragudc1984`; `act` no. No cambia ninguna decisión (ver Decisions).
- No hay directorio `.github/`; la automatización que este flujo reproduce
  localmente todavía no existe —la crea el cambio
  `replace-localstorage-with-api-backend`.

Restricción heredada que condiciona todo el diseño: **no hay runner de tests y no
se va a crear uno** (`CLAUDE.md`). La verificación del repositorio es build +
lint + comprobación de lo que se ve. Este cambio no introduce tests; formaliza el
orden y la obligatoriedad de lo que ya existe.

## Goals / Non-Goals

**Goals:**

- Que el historial del repositorio exista y contenga el corpus de `openspec/`,
  que es el activo real y hoy vive en un solo disco.
- Que la puerta de verificación sea **un comando**, no una lista que alguien tiene
  que recordar en orden.
- Que la reproducción local del CI use lo que ya está instalado, sin agregar
  prerrequisitos de instalación al equipo.
- Que el flujo quepa en el `README.md` y se entienda leyéndolo una vez.

**Non-Goals:**

- **Dominio propio y subdominio.** GitHub Pages sirve bajo una ruta
  (`ragudc1984.github.io/<repo>`). Un subdominio exigiría comprar un dominio y
  configurar DNS; se descartó por costo. Reabrirlo es un cambio de spec.
- **Push directo a `main`.** Descartado: contradice la rama protegida de
  `continuous-delivery`.
- **Formateador automático (Prettier o similar).** El repositorio no tiene
  ninguno y oxlint ya cubre lo que importa. Agregarlo reformatearía 101 archivos
  en el primer commit y enterraría el contenido real bajo ruido de formato.
- **Hooks de pre-commit.** Un hook que corre el build en cada commit hace el
  commit lento y empuja a la gente a saltárselo con `--no-verify`. La puerta es
  antes de empujar, no antes de commitear.
- **Convención obligatoria de mensajes de commit** (conventional commits) y
  **versionado semántico.** Reglas nuevas que aprender, sin beneficio en un
  proyecto sin releases publicados.
- **Entornos de staging, previews por pull request y despliegues manuales.**
- **Runner de tests.** Sigue sin existir `npm test` y este cambio no lo crea.

## Decisions

**La reproducción local del CI es un script npm que encadena los mismos pasos, no
`act`.** `act` ejecuta los workflows de GitHub de verdad, en contenedores, y sería
la reproducción más fiel. Se descartó porque no está instalado y exige Docker
corriendo en cada máquina del equipo —un prerrequisito nuevo para un ejercicio
cuyo punto no es Docker. El script `verify` corre `npm ci`, `npm run build` y
`npm run lint`, que son exactamente los pasos que el workflow va a ejecutar.
Queda anotado en el `README.md` que `act` es la opción de mayor fidelidad para
quien quiera ir más lejos.

**El costo de esa decisión, dicho en claro:** un script que replica los pasos a
mano puede desincronizarse del workflow. Por eso el spec exige actualizar la
reproducción local **en el mismo cambio** que toca la automatización, y el
`README.md` lo dice al lado del script. Es una obligación humana, no una garantía
técnica; una garantía técnica costaba Docker.

**`verify` usa `npm ci`, no `npm install`.** `npm ci` instala exactamente lo que
dice el `package-lock.json` y falla si el lock y el `package.json` discrepan —que
es justo el fallo que aparece en CI y no en la máquina de quien ya tenía las
dependencias instaladas. Descubrirlo localmente es el punto entero del script.

**Los pasos se encadenan con `&&`, y el script se declara con el orden explícito
en su nombre de tarea.** `&&` detiene la cadena en el primer fallo y propaga el
código de salida, que es lo que el spec exige. No se usa `;` ni se agrupan los
pasos en paralelo: el orden build → lint → pipeline importa porque un error de
tipos hace que las quejas de lint sean ruido.

**`npm run flb` se implementa como `npm run lint`.** El pedido nombraba un script
que no existe en el repositorio. Se interpretó como el lint que ya se usa, en
lugar de inventar un comando nuevo. **No se crea un alias `flb`**: un segundo
nombre para el mismo comando es una cosa más que explicar, y el equipo ya tiene
`lint` en `CLAUDE.md`.

**El commit inicial es uno solo, con todo el trabajo existente.** La alternativa
—reconstruir un historial plausible con varios commits temáticos— se descartó:
sería un historial inventado, y este repositorio existe para enseñar que el
rastro de decisiones es real. El rastro real de las decisiones ya está en
`openspec/changes/archive/`; el historial de git empieza hoy y lo dice.

**Antes del commit inicial se revisa la lista de 101 rutas, una por una, y se
agrega `.env*` al `.gitignore`.** Hoy `.gitignore` no lo menciona y el cambio de
backend va a introducir archivos de entorno con la cadena de conexión de la base
de datos. Agregarlo **antes** del primer commit es gratis; agregarlo después de
haber commiteado un secreto exige reescribir el historial. También se revisa
`.claude/settings.local.json`, que por convención es configuración local: se
decide explícitamente si entra o se ignora, en lugar de que entre por inercia.

**La rama se renombra a `main` antes de crear el remoto, no después.** Empujar
`master` y renombrar en GitHub deja la rama vieja como predeterminada y obliga a
corregir la configuración del repositorio remoto. Renombrar primero evita el
paso.

**El repositorio remoto se crea desde la web, no con `gh`.** El pedido describe
entrar a `https://github.com/`, y crear un repositorio público es una acción de la
persona dueña de la cuenta. (La justificación original —que `gh` no estaba
instalado— resultó falsa al aplicar; la decisión se mantuvo por el otro motivo.) Se crea **vacío** —sin
README, sin `.gitignore`, sin licencia— porque cualquier archivo inicial en el
remoto obliga a un merge con historias no relacionadas en el primer push.
*Al aplicar:* el repositorio se creó con el README autogenerado (solo el título).
Se resolvió con `git push --force-with-lease` atado a ese commit, no con un merge:
nadie lo había clonado y el README no tenía contenido, así que sobrescribirlo no
perdía nada y dejaba el historial como estaba planeado.

**El `README.md` se reescribe, no se amplía.** Hoy es la plantilla de Vite y
describe un proyecto genérico. Pasa a contener: qué es el repositorio, la
dirección pública de la aplicación arriba del todo, la puesta en marcha, la
puerta de verificación, y el flujo de rama y pull request. La nota sobre reglas
type-aware de oxlint se conserva porque es lo único aprovechable de la
plantilla.

**Los workflows de GitHub se crean en este cambio, en versión mínima.** Tres
requisitos de esta capacidad —la publicación, la protección de rama con
comprobaciones en verde y la coincidencia entre lo local y lo remoto— no se
pueden cumplir sin automatización, y esperar a `replace-localstorage-with-api-backend`
obligaba a aplicar un backend entero antes de poder publicar una lista de tareas
estática. `ci.yml` ejecuta exactamente los pasos de `verify`; `deploy.yml` los
repite y solo entonces publica `dist/` en Pages, sin API ni Render. El spec
completo de la automatización sigue siendo `continuous-delivery`, y aquel cambio
extiende estos archivos en lugar de crearlos.

**La protección de rama se configura al final, después del primer pull request
verde.** Exigir una comprobación que todavía no se ha ejecutado nunca deja el
repositorio en un estado donde nada se puede integrar: GitHub no ofrece como
requerible una comprobación que no ha visto correr.

## Risks / Trade-offs

- **[Un secreto entra en el commit inicial y queda en el historial para
  siempre]** → Es el riesgo de mayor consecuencia y el menos reversible.
  Mitigación: `.gitignore` ampliado y revisión explícita de las 101 rutas **antes**
  del commit, como tareas propias y numeradas, no como un paso mental.
- **[El script `verify` se desincroniza del workflow de GitHub]** → Un `verify`
  verde deja de ser evidencia de un CI verde y la gente deja de confiar en él.
  Mitigación: el spec obliga a actualizarlo en el mismo cambio que toca la
  automatización, y el `README.md` lo dice junto al script. Sin Docker no hay
  garantía técnica, y eso está asumido.
- **[La puerta de verificación se vuelve lenta y la gente la evita]** → `npm ci`
  borra y reinstala `node_modules` en cada ejecución. Mitigación: la puerta es
  antes de empujar, no antes de cada commit; durante el trabajo normal se usan
  `npm run build` y `npm run lint` directamente.
- **[La protección de rama bloquea al único desarrollador]** → Con la rama
  protegida, ni el propietario puede empujar a `main`. Es intencional —es la
  lección— pero significa que hasta un arreglo de una línea necesita un pull
  request. Aceptado.
- **[La aplicación publicada es pública para cualquiera]** → El repositorio y el
  sitio son accesibles por internet. Sin datos reales no hay riesgo; con datos
  reales sí. Queda escrito en el `README.md`.
- **[Este cambio y `replace-localstorage-with-api-backend` se pisan]** → Ambos
  crean el repositorio remoto y hablan de la rama protegida. Mitigación: ver
  Migration Plan —este cambio se aplica primero y el otro hereda el remoto ya
  creado.

## Migration Plan

**Orden respecto al otro cambio activo:** este cambio se aplica **antes** de
`replace-localstorage-with-api-backend`. Crea el commit inicial, el remoto y la
rama `main`, que son prerrequisitos de las fases 7 a 9 de aquel. Aplicarlo
después dejaría tareas duplicadas entre ambos.

**Dependencia en el otro sentido, y cómo se resolvió:** la versión anterior de
este plan dejaba la publicación, la protección de rama y la coincidencia
local-remoto esperando a los workflows de `replace-localstorage-with-api-backend`.
Al aplicar se decidió crearlos aquí en versión mínima (ver Decisions); aquel
cambio pasa a extenderlos —workspaces en `ci.yml`, `VITE_API_URL` y el deploy
hook de Render en `deploy.yml`— y a ampliar la protección de rama existente.

**Secuencia:**

1. Blindar `.gitignore` y revisar qué entra al historial.
2. Commit inicial en `master`, renombrar a `main`.
3. Crear el remoto vacío en GitHub y empujar.
4. Agregar el script `verify` y reescribir el `README.md`, por pull request —el
   primer cambio que recorre el flujo completo es el flujo mismo.
5. Habilitar GitHub Pages y configurar la ruta base; crear `ci.yml` y
   `deploy.yml` por pull request, y publicar.
6. Proteger `main`, una vez que hay una comprobación verde que exigir.

**Reversión:** hasta el paso 3 todo es local y se deshace borrando `.git`. A
partir del 3 el historial es público; revertir es un commit de reversión, no un
reescrito. El paso 6 se deshace desde la configuración del repositorio.

## Open Questions

Ambas resueltas al aplicar:

- ~~El nombre del repositorio remoto.~~ Es `idrconsultingcapacitacion`; la
  dirección pública será `https://ragudc1984.github.io/idrconsultingcapacitacion/`
  y la ruta base del build es `/idrconsultingcapacitacion/`.
- ~~Si `.claude/settings.local.json` se versiona.~~ No se versiona: contiene
  rutas absolutas de una máquina concreta. La decisión está en el mensaje del
  commit inicial.
