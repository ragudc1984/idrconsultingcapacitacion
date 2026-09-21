# Tasks

> **Este cambio se aplica antes que `replace-localstorage-with-api-backend`**
> (ver `design.md` — Migration Plan): crea el commit inicial, el remoto y la rama
> `main` que aquel necesita.
>
> Las tareas marcadas **[manual]** exigen acceso a la cuenta `ragudc1984`
> (`ragudc514@gmail.com`) y no pueden marcarse sin ejecutarlas; si no se pueden
> ejecutar, se dejan sin marcar y se dice por qué (`PRODUCT.md` — Principio 4).

## 1. Blindar el historial antes del primer commit

> Lo que entre aquí queda en el historial aunque se borre después. Esta sección
> no es una formalidad.

- [x] 1.1 Agregar `.env` y `.env.*` (con excepción explícita para `.env.example`) al `.gitignore`, y verificar creando un `.env` de prueba con contenido falso que `git status` no lo muestra, borrándolo después
- [x] 1.2 Revisar la lista completa de rutas preparadas con `git status --porcelain` y confirmar, ruta por ruta, que ninguna es un archivo de entorno, una credencial, un directorio de dependencias ni un artefacto de construcción
- [x] 1.3 Inspeccionar el contenido de `.claude/settings.local.json` y decidir explícitamente si se versiona o se ignora, dejando la decisión registrada en el mensaje del commit inicial o en el `.gitignore` según corresponda
- [x] 1.4 Verificar con `git status --porcelain` que `node_modules/` y `dist/` no aparecen entre las rutas a commitear

## 2. Commit inicial y rama principal

- [x] 2.1 Crear el commit inicial con todo el trabajo existente y un mensaje en español que describa qué contiene el repositorio, y verificar con `git log --stat` que incluye la aplicación, `openspec/specs/`, `openspec/changes/archive/` y los tres documentos de autoridad (`PRODUCT.md`, `DESIGN.md`, `CLAUDE.md`)
- [x] 2.2 Renombrar la rama `master` a `main` y verificar con `git branch` que es la única rama y que apunta al commit inicial
- [x] 2.3 Verificar con `git status` que el árbol de trabajo queda limpio, sin archivos modificados ni sin seguimiento pendientes

## 3. Repositorio remoto

- [ ] 3.1 **[manual]** Entrar a `https://github.com/` con la cuenta `ragudc1984`, crear un repositorio **vacío** (sin README, sin `.gitignore` y sin licencia — cualquier archivo inicial obliga a un merge de historias no relacionadas en el primer push), y anotar su nombre porque determina la ruta pública de GitHub Pages
- [ ] 3.2 Configurar el remoto `origin` apuntando a ese repositorio y verificar con `git remote -v` que la dirección es la correcta
- [ ] 3.3 Empujar `main` al remoto estableciendo el seguimiento, y verificar en la web de GitHub que el repositorio muestra el commit inicial con los 101 archivos y que `main` es la rama predeterminada
- [ ] 3.4 Verificar que el repositorio remoto no contiene `node_modules/`, `dist/` ni ningún archivo de entorno, inspeccionando el árbol de archivos en la web

## 4. Puerta de verificación

- [x] 4.1 Agregar a `package.json` el script `verify` que encadene con `&&`, en orden, la instalación limpia de dependencias (`npm ci`), la construcción (`npm run build`) y el lint (`npm run lint`), y verificar que `npm run verify` ejecuta los tres pasos y termina con éxito
- [x] 4.2 Verificar que el script se detiene en el primer fallo: introducir un error de tipos deliberado, confirmar que `npm run verify` falla en la construcción, **no ejecuta el lint**, y termina con código de salida distinto de cero, y revertir el error
- [x] 4.3 Verificar el mismo comportamiento con una infracción deliberada de oxlint: `npm run verify` pasa la construcción, falla en el lint, y termina con código distinto de cero; revertir la infracción
- [x] 4.4 Verificar que `npm ci` es sensible a la discrepancia entre `package.json` y `package-lock.json` (es la razón de usarlo en vez de `npm install`), comprobando que falla si el lock no corresponde, y restaurar el estado

## 5. Documentar el flujo

- [x] 5.1 Reescribir el `README.md` sustituyendo la plantilla de Vite por: qué es el repositorio, la dirección pública de la aplicación al inicio (se completa en la tarea 6.4), la puesta en marcha desde cero, la puerta de verificación y el flujo de rama y pull request, conservando la nota sobre las reglas type-aware de oxlint
- [x] 5.2 Documentar en el `README.md`, junto al script `verify`, que sus pasos deben actualizarse en el mismo cambio que modifique el workflow de GitHub, y que `act` es la opción de mayor fidelidad para quien quiera ejecutar los workflows reales localmente
- [x] 5.3 Dejar escrito en el `README.md` que el repositorio y la aplicación publicada son públicos y que no deben cargarse datos reales
- [x] 5.4 Verificar la documentación de puesta en marcha siguiéndola desde cero en un clon limpio del repositorio, en otra carpeta, confirmando que no hace falta ningún conocimiento que no esté escrito
- [ ] 5.5 Integrar los cambios de las secciones 4 y 5 por pull request contra `main` —el primer cambio que recorre el flujo completo es el flujo mismo— y verificar que el pull request se puede abrir e integrar

## 6. Publicación

- [ ] 6.1 **[manual]** Habilitar GitHub Pages en el repositorio con origen en GitHub Actions, y verificar que la configuración queda activa
- [x] 6.2 Configurar la ruta base del sitio para que los assets carguen bajo `/<repo>/` y no en la raíz (con la base por defecto, GitHub Pages devuelve 404 en todos los assets y la página queda en blanco sin error visible), y verificar localmente con `npm run preview` que los assets cargan bajo esa ruta
- [ ] 6.3 **[manual]** Publicar la aplicación y verificar abriendo `https://ragudc1984.github.io/<repo>/` desde otro dispositivo, sin el proyecto instalado, que la lista de tareas carga y es usable
- [ ] 6.4 Escribir la dirección pública definitiva al inicio del `README.md` y verificar que el enlace abre la aplicación
- [ ] 6.5 Verificar que lo publicado refleja la rama principal: integrar un cambio visible en `main`, esperar la publicación, y confirmar que la dirección pública lo muestra

## 7. Protección de la rama principal

> Se hace al final: GitHub no ofrece como requerible una comprobación que nunca
> ha visto correr (`design.md` — Decisions).

- [ ] 7.1 **[manual]** Configurar la protección de `main` exigiendo pull request y comprobaciones en verde antes de integrar, y verificar que la configuración queda guardada
- [ ] 7.2 Verificar que el push directo queda rechazado: intentar empujar un commit directamente a `main` y confirmar que el remoto lo rechaza, dejando el intento sin efecto
- [ ] 7.3 Verificar el flujo completo de integración: crear una rama de trabajo, empujarla, abrir un pull request, esperar las comprobaciones, e integrarlo

## 8. Coincidencia entre la verificación local y la automatización

> Estas tareas requieren que exista el workflow de GitHub, que crea el cambio
> `replace-localstorage-with-api-backend`. Se ejecutan cuando ese cambio haya
> aportado `.github/workflows/ci.yml`; hasta entonces se dejan sin marcar
> (`design.md` — Migration Plan).

- [ ] 8.1 Comparar paso a paso el script `verify` con el workflow de integración continua y confirmar que ejecutan los mismos comandos, ajustando `verify` si difieren
- [ ] 8.2 Verificar la coincidencia en la práctica: abrir un pull request con un cambio que pasa `npm run verify` localmente y confirmar que la automatización remota también pasa
- [ ] 8.3 Verificar el caso contrario: abrir un pull request con un cambio que falla `npm run verify` localmente y confirmar que la automatización remota también falla, comprobando que la señal local no da falsos positivos
