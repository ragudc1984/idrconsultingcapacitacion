# Tasks

> La instalación se hizo antes de registrar el cambio, a pedido explícito (ver
> `design.md` - Decisions 5). Las tareas quedan sin marcar: apply las verifica
> con evidencia en lugar de heredar un "hecho" que nadie comprobó aquí.

## 1. Dependencia

- [x] 1.1 Instalar `playwright` como `devDependency` con `npm i -D playwright`, y verificar que aparece en `devDependencies` de `package.json` y **no** en `dependencies`
- [x] 1.2 Descargar únicamente Chromium con `npx playwright install chromium`, y verificar que `require('playwright').chromium.launch()` abre y cierra un navegador sin error
- [x] 1.3 Verificar que `@playwright/test` **no** quedó instalado y que no existe ningún script `test` en `package.json`, conforme al Non-Goal de no crear una suite

## 2. El bundle no cambia

- [x] 2.1 Ejecutar `npm run build` y verificar que los tamaños de `dist/assets/*.js` y `*.css` son idénticos a los del build anterior a la instalación (236.43 kB y 17.22 kB), confirmando que la dependencia no entra en producción
- [x] 2.2 Verificar que `npx oxlint` y `npx tsc -b --force` siguen pasando sin salida

## 3. Documentación

- [x] 3.1 En `CLAUDE.md`, actualizar la sección de comandos: hoy afirma que la verificación del repo es build + lint + comprobación manual, sin mencionar la herramienta. Dejar claro que **no** hay `npm test` ni suite, y que los scripts de verificación son efímeros y no se versionan. Verificar releyendo la sección que no queda ninguna afirmación contradictoria
- [x] 3.2 En `PRODUCT.md`, añadir la herramienta al contexto operativo junto a los comandos existentes, y verificar que no se presenta como una suite de tests
- [x] 3.3 Verificar con `grep` que ni `CLAUDE.md` ni `PRODUCT.md` afirman que el proyecto tiene tests automatizados

## 4. Comprobación de utilidad

- [x] 4.1 Escribir un script efímero dentro del proyecto que abra la aplicación, cree una tarea y devuelva la trayectoria del `transform` de la fila, verificar que reproduce el resultado ya conocido (`6px` descendiendo hasta `0`), y **borrarlo al terminar**
- [x] 4.2 Verificar que el directorio del proyecto no conserva ningún script de verificación ni carpeta `e2e/` tras la comprobación anterior
