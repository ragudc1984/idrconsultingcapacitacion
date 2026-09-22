# Design

## Context

Ver `proposal.md` — Why. Estado actual relevante:

- `src/App.tsx` posee todo el estado y escribe por un único punto,
  `commitTasks(next, message)`, que fija el estado, persiste en `localStorage` y
  emite el anuncio accesible en la misma operación. `CLAUDE.md` documenta que
  esto se movió fuera de un `useEffect` a propósito, para que estado y
  almacenamiento no puedan divergir y para que un fallo de cuota se reporte en el
  momento de la acción.
- `src/storage.ts` valida cada elemento por separado al cargar y define
  `MAX_TITLE_LENGTH = 200` y `createTaskId()`.
- Los tokens de color viven únicamente en `src/index.css`, con orígenes de
  contenido de Tailwind en lista blanca explícita (`@source "../index.html"` y
  `@source "./**/*.{ts,tsx}"`). Mover archivos rompe esas rutas **sin producir
  error de build**.
- No hay runner de tests. La verificación del repositorio es `npm run build` +
  `npx oxlint` + comprobación visual con scripts efímeros de Playwright.
- Cuenta de despliegue: GitHub `ragudc1984` (`ragudc514@gmail.com`).

Restricciones que este diseño hereda y no puede relajar: accesibilidad WCAG 2.1
AA como piso, español como único idioma, cero colores literales fuera de
`index.css`, y todo cambio de comportamiento rastreable a un spec.

## Goals / Non-Goals

**Goals:**

- Conservar `commitTasks` como **único punto de escritura**, ahora asíncrono:
  llama al servicio, y solo con la respuesta fija el estado y emite el anuncio.
  La propiedad que protegía —que estado y almacenamiento no diverjan— sigue
  siendo la razón de su existencia.
- Que el API sea un contrato pequeño y legible: cinco operaciones, validación en
  el borde, errores con forma uniforme.
- Que el pipeline sea **enseñable**: cada paso del workflow debe poder explicarse
  en una frase, sin acciones de terceros opacas.
- Que la reorganización a workspaces sea mecánica y verificable, no una
  reescritura.

**Non-Goals:**

- **Autenticación, cuentas y multiusuario.** Hay una sola lista, compartida por
  quien tenga la dirección. Es lo que `PRODUCT.md` describe como usuario
  simulado. Agregar cuentas es un cambio de spec.
- **Actualización optimista.** Se descartó a propósito: la interfaz espera la
  respuesta del servicio antes de cambiar la lista. Cuesta latencia percibida y
  la gana en que la pantalla nunca muestra algo que el servidor no tiene.
  Reabrirlo es un cambio de spec.
- **Funcionamiento offline y caché local.** Se eliminó `localStorage`; no vuelve
  por la puerta de atrás como caché.
- **Sincronización entre pestañas en tiempo real.** Dos pestañas abiertas pueden
  mostrar listas distintas hasta que una recargue. Aceptado.
- **Paginación, filtros, búsqueda y borrado suave.** El alcance pequeño es el
  punto (`PRODUCT.md` — Principio 3).
- **Runner de tests automatizados.** Sigue sin existir `npm test`. La
  verificación se escribe como tareas explícitas, igual que en todo el repo.
- **Entornos de staging y previews por pull request.** Un solo entorno publicado.
- **El tema sigue sin recordarse entre recargas.** Non-goal vigente de un cambio
  anterior; tener servidor no lo reabre.

## Decisions

**Monorepo con npm workspaces: `apps/web`, `apps/api`, `packages/shared`.** Un
solo `package-lock.json` y un solo historial, de modo que un cambio de
comportamiento siga siendo un solo commit rastreable a un spec —que es el activo
real del repositorio. Alternativa considerada: carpeta `server/` plana sin
workspace; descartada porque el tipo `Task` habría quedado duplicado a mano entre
front y API, que es exactamente la divergencia que este ejercicio enseña a
evitar. Alternativa considerada: repositorio separado para el API; descartada
porque parte la trazabilidad de OpenSpec en dos historiales.

**Al mover `src/` a `apps/web/`, reescribir las directivas `@source` en el mismo
paso.** Es el riesgo silencioso de esta reorganización: Tailwind no falla, solo
deja de generar clases, y la app se ve rota sin un solo error en consola. La
verificación es concreta: tras mover, `npm run build` y comprobar con `grep -F`
que una clase conocida sigue presente en el CSS construido —`-F` porque los
selectores van escapados y una expresión regular trataría el paréntesis escapado
como grupo (`CLAUDE.md` — Gotchas).

**`packages/shared` exporta el tipo `Task`, `MAX_TITLE_LENGTH` y el esquema de
validación de título.** La regla de "título no vacío, máximo 200 caracteres" se
escribe **una vez** y la aplican los dos lados: el front para no mandar basura,
el API porque no puede confiar en el cliente. Es la lección de diseño central de
este cambio. Se usa `zod` porque el mismo esquema sirve para validar y para
derivar el tipo.

**Express sobre Fastify.** Express es el framework con más documentación en
español y el que el equipo va a encontrar en proyectos existentes. Fastify es
mejor técnicamente, pero suma plugins y hooks como conceptos nuevos que compiten
con el foco real del ejercicio, que es OpenSpec y no el framework.

**Prisma con PostgreSQL gestionado (Neon), no SQLite.** Prisma da migraciones
versionadas —archivos en el repositorio, aplicados en el despliegue— que son
justamente lo que hace enseñable el paso de CD. SQLite se descartó porque el
disco de un plan gratuito es efímero: las tareas desaparecerían en cada
despliegue, que es la lección contraria a la que este cambio quiere dejar.

**El `id` lo genera la base de datos con `uuid`, no el cliente.** Hoy
`createTaskId()` existe con fallback porque `crypto.randomUUID` no está
disponible fuera de contexto seguro —justo el caso de probar por IP local desde
el móvil. Mover la generación al servidor elimina esa clase de problema por
completo, y de paso quita la posibilidad de que un cliente imponga un `id`.
`createTaskId()` se elimina junto con `storage.ts`.

**Orden de la lista por `createdAt` ascendente, con `id` como desempate.** El
spec exige "en el orden en que fueron creadas". Dos tareas creadas en el mismo
milisegundo empatarían; el desempate estable evita que el orden baile entre
lecturas. Se agrega `createdAt` al modelo aunque no se muestre: es el campo que
sostiene el requisito.

**`commitTasks` se vuelve `async` y conserva su rol de único punto de
escritura.** Firma nueva aproximada: recibe la operación a ejecutar contra el API
y el mensaje de éxito; ejecuta, y solo si la respuesta es exitosa fija el estado
con lo que devolvió el servidor y emite el anuncio. Si falla, fija el estado de
error y emite un anuncio que dice que no se guardó. Es la misma invariante de
antes —una sola ruta por la que el estado cambia, y el anuncio nunca miente sobre
lo que pasó— trasladada de `localStorage` a la red. **No se agregan llamadas al
API fuera de ahí**, igual que hoy no se agregan escrituras a `localStorage` fuera
de ahí.

**El estado de la lista pasa de `Task[]` a un estado con tres formas: cargando,
error y lista.** Un booleano `isLoading` junto a un array vacío es representable
como "cargando y con tareas", que no existe, y es el bug que produce el parpadeo
del estado vacío antes de que lleguen los datos. Modelarlo como una unión
discriminada hace que el estado vacío no pueda renderizarse durante la carga: la
propia forma del tipo lo impide.

**Acciones en curso registradas por `id` de tarea, no con un booleano global.**
El spec exige que el resto de la interfaz siga usable y que un doble click no
duplique la acción. Un `Set<string>` de ids con operación en vuelo permite
deshabilitar exactamente el control afectado. El control deshabilitado conserva
su nombre accesible y su indicador de foco; **no se oculta ni pierde el foco**,
porque eso lo mandaría al `<body>` —el mismo problema que ya obligó a restaurar
el foco a mano tras eliminar.

**Errores con forma uniforme y códigos HTTP 400 / 404 / 500.** El cuerpo de error
lleva un código y un mensaje en español, y ese mensaje es el que se muestra. No
se inventa un catálogo de códigos: tres bastan para los casos del spec.

**CORS con lista blanca por variable de entorno, nunca un origen comodín.** El
spec lo exige y es la lección que importa: el comodín funciona en todos lados y
por eso nadie descubre lo que hace hasta que es tarde.

**La dirección del API se inyecta en build con `VITE_API_URL`.** En desarrollo,
`.env.local` apunta al servicio local; en CD, el workflow la pasa como variable
al build para GitHub Pages. Vite incrusta la variable en el bundle en tiempo de
construcción —**no es un secreto y no debe tratarse como tal**; queda pública en
el JavaScript servido, y eso está bien porque es una URL. El `DATABASE_URL` sí es
secreto y nunca toca el bundle del front.

**GitHub Pages necesita `base` en `vite.config.ts`.** El sitio se sirve bajo la
ruta del repositorio, no en la raíz, y con la `base` por defecto todos los assets
dan 404 —página en blanco sin error visible. Se configura desde una variable para
que `npm run dev` siga funcionando en la raíz.

**Dos workflows, no uno.** `ci.yml` corre en cada pull request: instala, lint,
build de ambos workspaces. `deploy.yml` corre en push a la rama principal: repite
lint y build, luego publica. Se repiten a propósito —un workflow de despliegue
que confía en que otro ya verificó es un despliegue que un día publica algo roto.
*Nota:* `add-development-workflow` crea ambos en versión mínima (un solo
proyecto, publicación solo en Pages); este cambio los extiende. Aquel cambio
adoptó además Gitflow: el trabajo de este cambio va en ramas `feature-*` hacia
`develop`, y se publica al integrar una `release-*` en `main`.

**El despliegue del API se dispara con un deploy hook de Render, y las
migraciones se ejecutan como comando de pre-deploy del propio servicio, no desde
Actions.** Ejecutarlas desde Actions exigiría exponer la cadena de conexión de la
base de datos a GitHub, ampliando la superficie de un secreto que hoy solo
necesita conocer Render.

**Rama principal protegida, ramas de feature con pull request.** Hoy el
repositorio está en `master` sin remoto. El cambio incluye crear el repositorio
remoto bajo `ragudc1984`, empujar, y renombrar la rama principal a `main`. Las
comprobaciones requeridas se configuran en la interfaz de GitHub, no en un
archivo; eso se escribe como tarea manual explícita y no se marca como hecha sin
ejecutarla.

## Risks / Trade-offs

- **[Mover `src/` rompe las rutas `@source` de Tailwind sin producir error]** →
  Es la falla más probable de todo el cambio. Mitigación: la reorganización es su
  propia sección de tareas, con verificación por `grep -F` sobre el CSS
  construido antes de escribir una sola línea de código nuevo.
- **[El plan gratuito de Render suspende el servicio por inactividad]** → La
  primera carga tras la suspensión puede tardar decenas de segundos. Mitigación:
  el spec lo contempla explícitamente —el estado de carga debe mantenerse
  comprensible durante toda la espera, sin degradar a error ni a lista vacía. Se
  verifica a propósito dejando que el servicio se duerma.
- **[Perder la instantaneidad que hoy tiene la app]** → Cada acción ahora cruza
  la red. Es el costo aceptado de descartar la actualización optimista;
  `PRODUCT.md` exige que la interfaz comunique el estado real, y una lista que
  muestra algo que el servidor no tiene lo incumple.
- **[Los datos en `localStorage` de cada miembro del equipo se pierden]** →
  Asumido y declarado en el proposal. No hay migración porque no hay datos que
  preservar: no existe despliegue.
- **[La lista es pública para quien tenga la dirección]** → Sin autenticación,
  cualquiera que conozca la URL puede crear y borrar tareas. Es aceptable para un
  ejercicio de capacitación sin datos reales, y queda escrito en `PRODUCT.md`
  como restricción, no como descuido. **No se deben poner datos reales ahí.**
- **[Un secreto filtrado en un log o en un commit]** → Mitigación: `.env` en
  `.gitignore` desde el primer commit del API, secretos solo en la configuración
  de GitHub y de Render, y una tarea explícita de revisar el registro de la
  primera ejecución de despliegue.
- **[Los estados de carga y error son interfaz nueva y pueden nacer
  inaccesibles]** → `PRODUCT.md` declara la accesibilidad como piso, no como
  pasada posterior. Mitigación: el contraste de cada color nuevo se verifica por
  cálculo dentro de las mismas tareas que lo introducen, y los anuncios pasan por
  la región `aria-live` que ya existe.
- **[El ejercicio crece más que la app]** → Este es el cambio más grande del
  repositorio y tensiona el principio de alcance pequeño. Mitigación: la lista de
  non-goals es larga a propósito. Todo lo que "sería útil" —cuentas, offline,
  filtros, tiempo real— queda fuera por escrito.

## Migration Plan

No hay migración de datos: no existe despliegue previo ni datos que preservar, y
el contenido de `localStorage` se descarta a propósito (ver proposal — What
Changes).

El orden de ejecución importa, porque cada fase deja el repositorio en un estado
verificable:

1. **Reorganizar a workspaces sin cambiar comportamiento.** Al terminar, la app
   se ve y funciona exactamente igual que antes, todavía con `localStorage`. Es
   el punto de retorno seguro.
2. **Construir el API contra una base de datos local**, verificable por separado
   con la app web sin tocar.
3. **Conectar el front al API y eliminar `localStorage`.** Aquí es donde cambia
   el comportamiento observable.
4. **Publicar**, primero el API, luego la web apuntando a él.
5. **Automatizar**: CI antes que CD, y la protección de rama al final, cuando ya
   hay comprobaciones verdes que exigir.

**Reversión:** cada fase es un commit propio. Revertir la fase 3 devuelve la app
a `localStorage` con el API ya construido pero sin usar; revertir la 1 devuelve
el repositorio a su forma actual. Como no hay datos en producción, revertir no
pierde nada.

## Open Questions

- ~~El nombre del repositorio remoto.~~ Resuelto por `add-development-workflow`:
  `idrconsultingcapacitacion`, con ruta base `/idrconsultingcapacitacion/`.
- Si el proveedor de PostgreSQL gestionado elegido (Neon) resultara no estar
  disponible para la cuenta, Supabase cubre el mismo rol sin cambiar nada del
  diseño: sigue siendo PostgreSQL detrás de un `DATABASE_URL`.
