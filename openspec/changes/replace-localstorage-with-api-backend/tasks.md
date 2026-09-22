# Tasks

> Las fases siguen el orden del Migration Plan de `design.md`: cada una deja el
> repositorio en un estado verificable. Las tareas marcadas **[manual]** exigen
> acceso a cuentas externas con las credenciales de `ragudc1984` y no pueden
> marcarse sin ejecutarlas; si no se pueden ejecutar, se dejan sin marcar y se
> dice por qué (`PRODUCT.md` — Principio 4).

## 1. Reorganizar el repositorio a workspaces (sin cambiar comportamiento)

- [x] 1.1 Convertir el `package.json` de la raíz en manifiesto de workspaces (`workspaces: ["apps/*", "packages/*"]`, `private: true`), moviendo las dependencias y los scripts actuales a `apps/web/package.json`, y verificar que `npm install` desde la raíz termina sin errores y genera un único `package-lock.json`
  > Mismos 111 paquetes con las mismas versiones resueltas que el lock anterior. `oxlint` y `playwright` quedan en la raíz; el resto, en `apps/web`.
- [x] 1.2 Mover `src/`, `index.html`, `public/`, `vite.config.ts` y los `tsconfig*.json` a `apps/web/`, ajustando las rutas relativas de los `tsconfig` y de `vite.config.ts`, y verificar que `npm run build -w apps/web` compila sin errores
  > El build de `apps/web` es idéntico byte a byte al anterior: mismos hashes (`index-w5iJ4cxp.css`, `index-C1DMje6B.js`). Para no romper la publicación, `deploy.yml` pasa a subir `apps/web/dist` en el mismo cambio.
- [x] 1.3 Reescribir las directivas `@source` de `apps/web/src/index.css` para las rutas nuevas, y verificar con `grep -F '.bg-\[var\(--bg\)\]' apps/web/dist/assets/*.css` que la clase sigue presente en el CSS construido (con `-F`, no regex: los selectores van escapados — `CLAUDE.md` — Gotchas)
  > No hizo falta reescribirlas: `@source` es relativa a `index.css`, y `src/` e `index.html` se movieron juntos. Verificado igual: la clase está presente y los 108 selectores del CSS coinciden con la línea base.
- [x] 1.4 Añadir scripts de raíz `build`, `lint` y `dev` que deleguen en los workspaces, y verificar que `npm run build` y `npx oxlint` desde la raíz terminan sin errores
- [x] 1.5 Verificar manualmente con `npm run dev` que la aplicación se ve y funciona exactamente igual que antes de mover nada: crear, completar, editar y eliminar una tarea, alternar el tema, y recargar la página conservando las tareas (todavía vía `localStorage`)
  > Verificada con un script efímero de Playwright contra `npm run dev` lanzado desde la raíz: crear, completar, editar, eliminar, alternar el tema y recargar; las tareas se conservan en `todo-list:tasks`, el tema no se recuerda y no hay errores en consola.
- [x] 1.6 Verificar manualmente a ~375px y a ~1280px de ancho que el layout no cambió respecto al estado previo, confirmando que ninguna clase de Tailwind se perdió al mover los archivos
  > Capturas a 375 px y 1280 px, en tema claro y oscuro, idénticas byte a byte a una línea base tomada antes de mover nada, sin scroll horizontal.

## 2. Paquete compartido de tipos y validación

- [x] 2.1 Crear `packages/shared` con su `package.json` y `tsconfig.json`, exportando el tipo `Task` (`id`, `title`, `done`) movido desde `apps/web/src/types.ts`, y verificar que `npm run build` desde la raíz compila con el tipo resuelto desde el paquete
  > `@idr/shared` exporta su TypeScript sin compilar (`exports: ./src/index.ts`): Vite lo empaqueta y tsx lo ejecutará en el API, así que no hay orden de build entre workspaces, y su `build` solo comprueba tipos. Comprobado que `Task` se resuelve de verdad y no como `any`: asignar `id: 1` da `TS2322`.
- [x] 2.2 Añadir `zod` a `packages/shared` y exportar `MAX_TITLE_LENGTH = 200` junto al esquema de validación de título (no vacío tras recortar espacios, máximo 200 caracteres) y a los esquemas de creación y actualización de tarea, y verificar que `npm run build` compila
  > `Task` se deriva del esquema con `z.infer`. Probados con tsx 16 casos: vacío, solo espacios, ausente, no texto, 200 y 201 caracteres, recorte antes de medir, `id` del cliente descartado, actualización parcial y vacía. Todos dan lo esperado, con mensajes en español.
- [x] 2.3 Sustituir en `apps/web` los usos de `MAX_TITLE_LENGTH` y del tipo `Task` por los del paquete compartido, y verificar que `npm run build` y `npx oxlint` pasan y que la app sigue funcionando con `npm run dev`
  > Verificada con Playwright contra `npm run dev`: el recorrido completo pasa, los dos campos siguen limitados a 200 caracteres y no hay errores en consola. El CSS construido no cambió (17.228 bytes).

## 3. API: esqueleto y base de datos

- [x] 3.1 Crear `apps/api` con `express`, `cors`, `zod`, `tsx` y TypeScript, un servidor mínimo que escuche en el puerto de `PORT` (con valor por defecto para desarrollo), y verificar que `npm run dev -w apps/api` arranca y responde
  > Express 5 con `tsx watch`; `crearApp()` separada de `server.ts`. Responde 200 en el puerto 3000 por defecto y respeta `PORT` (probado con 3999).
- [x] 3.2 Añadir `.env.example` con `DATABASE_URL`, `PORT` y `CORS_ORIGINS`, confirmar que `.env` está en `.gitignore`, y verificar con `git status` que ningún archivo `.env` real aparece como rastreado
  > `apps/api/.env.example` documenta las tres variables. Comprobado con `git check-ignore` que `apps/api/.env` y `.env.local` quedan ignorados y que `.env.example` se versiona.
- [x] 3.3 Instalar Prisma en `apps/api` y definir el modelo `Task` (`id` uuid generado por la base de datos, `title`, `done` con valor por defecto `false`, `createdAt`), y verificar que `npx prisma validate` pasa
  > Prisma 7.10.0, fijado a propósito: la etiqueta `latest` de `prisma` en npm apunta a una RC 8.0. El `id` usa `dbgenerated("gen_random_uuid()")` para que lo genere PostgreSQL y no el cliente. La URL vive en `prisma.config.ts`, cargada con `process.loadEnvFile()` en vez de `dotenv`. El cliente generado queda fuera de Git y de oxlint, y el `build` del API lo genera antes de comprobar tipos. `prisma init` también instaló 213 archivos de skills para agentes en `apps/api/`; se borraron.
- [x] 3.4 **[manual]** Aprovisionar una base de datos PostgreSQL gestionada (Neon) bajo la cuenta `ragudc514@gmail.com`, poner su cadena de conexión en el `.env` local, y verificar la conexión ejecutando `npx prisma migrate dev --name init` y comprobando que la tabla existe con `npx prisma studio`
  > La base de Neon se creó con la cuenta `robertoagudeloc@gmail.com`, no con `ragudc514@gmail.com` como decía la tarea (proyecto `old-surf-56962488`, rama `production`, región us-east-2). La cadena directa (sin pooler) se obtuvo con el CLI de Neon y se escribió en `apps/api/.env` sin imprimirla. Se usa `sslmode=verify-full` porque el driver `pg` avisa que `require` perderá la verificación del certificado. `migrate dev --name init` se aplicó, y en vez de `prisma studio` la tabla se comprobó consultando `information_schema`: columnas, tipos y valores por defecto coinciden con el esquema. De los pasos genéricos del asistente de Neon se omitieron, por decisión del equipo, `neon skills`, `neon mcp`, `neon.ts` y `neon deploy`: el API se publica en Render.
- [x] 3.5 Confirmar que el directorio `prisma/migrations/` queda versionado en el repositorio, y verificar con `git status` que el archivo de migración aparece para commit (las migraciones son artefactos del repo, no del entorno — `design.md`)
  > `prisma/migrations/20260922015027_init/` y `migration_lock.toml` aparecen para commit y no están ignorados.

## 4. API: operaciones sobre tareas

> Cubre la capacidad `task-api`. Cada tarea se verifica contra los escenarios del
> spec con peticiones reales (`curl` o el cliente HTTP del editor).

- [x] 4.1 Implementar el middleware de manejo de errores con forma uniforme (código y mensaje en español) y los códigos HTTP 400 / 404 / 500, y verificar que una ruta inexistente y un cuerpo JSON malformado devuelven esa forma y no una traza de error
  > Forma `{ error: { codigo, mensaje } }`. Verificado con curl: una ruta inexistente da 404 `NO_ENCONTRADO`, un JSON malformado da 400 y un cuerpo de más de 100 KB da 400, todos sin traza. Un error inesperado se registra en el servidor y responde 500 con un mensaje genérico; ese camino se ejercita en la 4.6.
- [x] 4.2 Implementar la lectura de la lista de tareas ordenada por `createdAt` ascendente con `id` como desempate, y verificar que devuelve éxito y una colección vacía cuando no hay tareas, y las tareas en orden de creación cuando las hay
  > Verificado con peticiones reales contra Neon: la colección vacía da 200 y `[]`, y la lista sale en orden de creación.
- [x] 4.3 Implementar la creación de tarea con validación del esquema compartido, `id` asignado por la base de datos y `done` en `false`, y verificar los cuatro escenarios del spec: creación exitosa devuelve código de recurso creado, título vacío o solo espacios devuelve 400 sin almacenar, título de más de 200 caracteres devuelve 400, y un `id` enviado por el cliente se ignora
  > Los cuatro escenarios verificados contra Neon. Además: se recortan espacios, se acepta exactamente 200 caracteres, se rechaza un título ausente o que no es texto, se ignoran `id` y `done` del cliente, y los rechazos no almacenan nada.
- [x] 4.4 Implementar la actualización parcial de tarea (título, `done`, o ambos; el campo ausente conserva su valor), y verificar los cuatro escenarios del spec, incluido que actualizar un `id` inexistente devuelve 404 sin crear nada
  > Los cuatro escenarios verificados. Además: un id que no es UUID da 404 (no 500), y editar no altera el orden.
- [x] 4.5 Implementar la eliminación de tarea, y verificar que tras eliminar con éxito la tarea no aparece en una lectura posterior, y que eliminar un `id` inexistente devuelve 404
  > Verificado: 204, la tarea no aparece en la lectura siguiente, y eliminarla otra vez da 404.
- [x] 4.6 Implementar la operación de comprobación de disponibilidad que verifique el acceso al almacenamiento, y verificar que responde con éxito con la base de datos accesible y con error al apuntar `DATABASE_URL` a una base inalcanzable
  > `GET /salud` ejecuta `SELECT 1`. Con Neon da 200 `disponible`; con `DATABASE_URL` hacia una base inalcanzable da 500 con un mensaje claro, y el detalle técnico queda solo en el registro del servidor.
- [x] 4.7 Configurar CORS con lista blanca leída de `CORS_ORIGINS` (nunca comodín), y verificar que una petición con un `Origin` declarado recibe la cabecera de autorización y una con un `Origin` no declarado no la recibe
  > Verificado con curl: los orígenes declarados reciben `Access-Control-Allow-Origin`, también en el preflight de `PATCH`. Uno no declarado no la recibe, incluido `localhost:5174`. Las peticiones sin `Origin` siguen funcionando. `CORS_ORIGINS="*"` impide arrancar el servidor.
- [x] 4.8 Verificar que las tareas sobreviven al reinicio del servicio: crear varias tareas, detener y volver a arrancar `npm run dev -w apps/api`, y comprobar que la lectura devuelve las mismas tareas en el mismo orden
  > Con 5 tareas creadas: se detuvo el API (sin respuesta) y se arrancó de nuevo, y la lista es idéntica byte a byte, con el mismo contenido, orden y estado.
- [x] 4.9 Verificar que `npm run build` y `npx oxlint` pasan sobre `apps/api` desde la raíz
  > `npm run build` (genera el cliente de Prisma y comprueba tipos) y `npx oxlint` pasan desde la raíz, con 17 archivos revisados y ninguno generado.

## 5. Conectar la aplicación web al API

> Cubre el delta de `todo-list`. Aquí cambia el comportamiento observable.

- [x] 5.1 Crear el cliente HTTP en `apps/web/src/api.ts` con las cinco operaciones, leyendo la dirección base de `VITE_API_URL`, traduciendo las respuestas de error a un error con el mensaje del servidor, y verificar que `npm run build` compila; añadir `.env.local` apuntando al servicio local y confirmar que está en `.gitignore`
  > `apps/web/src/api.ts` traduce las respuestas de error al mensaje del servidor y distingue la falta de conexión. `VITE_API_URL` está tipada en `vite-env.d.ts`. `apps/web/.env.local` queda ignorado por Git, y `apps/web/.env.example` documenta la variable.
- [x] 5.2 Sustituir el estado `Task[]` de `App.tsx` por la unión discriminada de tres formas (cargando, error, lista) y cargar las tareas del API al montar, y verificar que `npm run build` compila y que al abrir la app con el API corriendo se muestran las tareas almacenadas
  > Verificado con Playwright contra el API real: al abrir, se muestran las tareas almacenadas.
- [x] 5.3 Convertir `commitTasks` en asíncrono conservando su rol de único punto de escritura —ejecuta la operación contra el API y solo con la respuesta exitosa fija el estado y emite el anuncio—, y verificar que no queda ninguna llamada al API fuera de esa función (`grep` sobre `apps/web/src`)
  > `grep`: las cuatro escrituras (`crearTarea`, `actualizarTarea` ×2, `eliminarTarea`) se ejecutan dentro del argumento `ejecutar` de `commitTasks`, y `fetch` solo aparece en `api.ts`. La única llamada al API fuera de `commitTasks` es `listarTareas`, la lectura inicial, que no escribe. Una ref registra las acciones en curso para bloquear el doble click dentro del mismo ciclo de render.
- [x] 5.4 Conectar crear, completar, editar y eliminar a sus operaciones del API, y verificar manualmente con `npm run dev` que cada una se refleja de inmediato sin recargar la página y que tras recargar manualmente el cambio sigue ahí
  > Verificado con Playwright contra el API real: crear, completar, editar y eliminar se reflejan sin recargar y se confirman en el API; tras recargar, todo sigue igual. Además, un segundo navegador aislado ve las mismas tareas en el mismo orden.
- [x] 5.5 Eliminar `apps/web/src/storage.ts` junto con `createTaskId()`, y verificar con `grep -r localStorage apps/web/src` que no queda ninguna referencia, y en el navegador que la aplicación no escribe nada bajo la clave `todo-list:tasks`
  > `grep -r localStorage apps/web/src` no da resultados. En el navegador, `localStorage` y `sessionStorage` quedan vacíos después de todas las acciones.
- [x] 5.6 Implementar el estado de carga inicial con su anuncio por la región `aria-live` existente, y verificar los cuatro escenarios del spec: carga en curso no muestra el estado vacío, carga terminada con tareas muestra la lista, carga terminada sin tareas muestra el estado vacío, y una espera prolongada (simulada con throttling en DevTools) mantiene el estado de carga sin degradar a error
  > Los cuatro escenarios, verificados. La espera larga se simuló con una respuesta retrasada 6 s mediante `page.route`, y no con el throttling de DevTools, para que sea reproducible. A los 4 s aparece una línea que explica que el servicio puede tardar en despertar, sin error ni lista vacía. La región `aria-live` registró `Cargando tareas…` y luego `Tareas cargadas: 2 tareas.`. El arranque de la carga se difiere a una microtarea para que el anuncio cambie con la región ya en el DOM.
- [x] 5.7 Implementar el estado de fallo de carga con su control de reintentar, y verificar los tres escenarios del spec deteniendo el API: aparece el mensaje de error y no el estado vacío, el reintento con el API arriba muestra la lista, y el reintento con el API abajo conserva el error y el control
  > Los tres escenarios, verificados con el API detenido de verdad y vuelto a arrancar. Durante el reintento, el error se mantiene en pantalla (sin parpadeo) y el botón queda en `aria-disabled` y `aria-busy`. Si el reintento funciona, el foco pasa al campo de alta.
- [x] 5.8 Implementar el manejo de fallo al guardar un cambio —mensaje de error, lista conservando el estado real del servidor, y anuncio que no afirma que la acción se realizó—, y verificar los cuatro escenarios del spec deteniendo el API y probando crear, completar, editar y eliminar
  > Los cuatro escenarios, verificados con el API detenido. La lista queda exactamente como está en el servidor, el anuncio empieza por «No se pudo…» y nunca afirma la acción, y al crear el texto se conserva en el campo. Un error 500 del servidor muestra su mensaje.
- [x] 5.9 Implementar el registro de acciones en curso por `id` de tarea con indicación visual y bloqueo de la misma acción, y verificar los tres escenarios del spec: el control indica la acción en curso, un doble click rápido ejecuta la acción una sola vez, y el resto de la interfaz (incluido el control de tema) sigue usable durante la espera
  > Map de acciones en curso por id. La fila afectada deja sus tres controles en `aria-disabled`, y el que disparó la acción cambia su ícono por `LoaderCircle` y se marca `aria-busy`. Verificado con respuestas retrasadas: un doble click en completar hace 1 PATCH, y doble click + Enter en agregar hace 1 POST. El tema y las otras filas siguen usables.
- [x] 5.10 Verificar por cálculo el contraste de todo color nuevo introducido por los estados de carga y error, en tema claro y oscuro, contra el piso de `PRODUCT.md` (texto ≥ 4.5:1, indicadores y controles ≥ 3:1), confirmando que todos salen de tokens de `index.css` y no hay ningún color literal en los componentes
  > Sin colores nuevos: todo sale de tokens existentes. Calculados en claro y oscuro los 9 pares que usan los estados nuevos; el peor caso es 5.03:1 en texto y en indicadores, así que todos superan el piso. `grep` de hexadecimales, `rgb()` y `hsl()` en los componentes: ninguno.
- [x] 5.11 Verificar el recorrido completo por teclado de la interfaz nueva: el control de reintentar es alcanzable y activable, un control deshabilitado por acción en curso conserva su nombre accesible y no se pierde el foco, y el foco nunca cae al `<body>`
  > Verificado con teclado: Reintentar se alcanza con Tab (4 pulsaciones) y se activa con Enter. Un control en curso conserva el foco y su nombre, y se aplica una sola vez aunque se pulse Enter de nuevo. Tras editar o borrar, el foco va al lápiz o al campo de alta. Nunca cae al `<body>`.
- [x] 5.12 Verificar bajo `prefers-reduced-motion` que cualquier indicador de acción en curso conserva la señal de estado con una alternativa, sin `animation: none` (`CLAUDE.md` — Accesibilidad)
  > Sin animación en bucle: el presupuesto de 300 ms de `DESIGN.md` descarta un indicador que gire. La señal (ícono en curso, `aria-busy` y cursor `progress`) es idéntica con `reduce` y con `no-preference`, verificado con `emulateMedia`. No se agregó ningún `animation: none`.
- [x] 5.13 Verificar manualmente a ~375px, ~768px y ~1280px de ancho que los mensajes de carga y error no producen scroll horizontal ni desplazan los controles fuera de las cards
  > Verificado con Playwright a 375, 768 y 1280 px en tres estados (carga larga, error de carga y error al guardar): sin scroll horizontal y con los controles dentro de su fila, también con un título largo. Las capturas se revisaron a ojo. El CSS creció de 17,22 a 17,66 kB solo por las clases agregadas (`aria-disabled:*` y `gap-1`).

## 6. Sincronizar las tres autoridades con la arquitectura nueva

- [x] 6.1 Actualizar `PRODUCT.md`: sustituir la restricción vinculante "Sin backend" por la arquitectura nueva y sus restricciones reales (lista única sin cuentas, accesible por quien tenga la dirección, sin datos reales), y actualizar la lista de capacidades confirmadas y los comandos de Operating Context
  > «Sin backend» pasa a la restricción «Una sola lista, sin cuentas», que describe la arquitectura, y se agregan «Sin datos reales» y «La interfaz espera al servidor». También se actualizan el usuario simulado, las capacidades, los comandos de workspaces y «No existe despliegue», que ya era falso desde la publicación en GitHub Pages.
- [x] 6.2 Actualizar `CLAUDE.md`: comandos de workspaces, la sección de arquitectura (el dueño único del estado ahora escribe contra el API, no contra `localStorage`), la estructura de carpetas y las rutas `@source` de Tailwind, y verificar que ninguna instrucción del archivo describe código que ya no existe
  > Comandos de workspaces y variables de entorno, tres workspaces, `commitTasks` asíncrono contra el API, la lista como unión de tres formas, `aria-disabled` en lugar de `disabled`, rutas nuevas de Tailwind y los gotchas nuevos: procesos huérfanos de `tsx watch` y Vite, y cliente de Prisma generado. `grep` confirma que no queda ninguna mención a `localStorage`, `storage.ts`, `createTaskId` ni rutas `src/` viejas. `DESIGN.md` también quedó desfasado (aviso de almacenamiento, seis controles), pero no forma parte de esta tarea; se reporta al equipo.
- [x] 6.3 Añadir al `README.md` las instrucciones de puesta en marcha local: variables de entorno requeridas, `npm install`, migración de base de datos y arranque de ambos workspaces, y verificar siguiéndolas desde cero en una copia limpia del repositorio
  > Verificada siguiendo solo el README en un clon limpio, en otra carpeta. El primer intento falló: el API no arrancaba (`ERR_MODULE_NOT_FOUND`) porque en un clon no existe el cliente de Prisma generado. Se corrigió con `predev: prisma generate` en el API. Con ese arreglo, el clon instala, migra, arranca los dos servidores, y la web carga, crea una tarea y la conserva tras recargar.

## 7. Publicar en remoto

- [x] 7.1 Verificar que sigue vigente el repositorio remoto creado por `add-development-workflow` (`ragudc1984/idrconsultingcapacitacion`, rama principal `main`) y que muestra el historial completo
  > `ragudc1984/idrconsultingcapacitacion`, público. Por Gitflow, la rama predeterminada es `develop`, no `main`. El historial completo empieza en el commit inicial `6cf507b`.
- [ ] 7.2 **[manual]** Crear el servicio web del API en Render conectado al repositorio, configurar `DATABASE_URL` (rama `production` de Neon), `PORT` y `CORS_ORIGINS` como variables del servicio, el comando de build `npm ci && npm run build -w @idr/api && npx -w @idr/api prisma migrate deploy` (el pre-deploy es de pago; ver `design.md`), el de arranque `npm run start -w @idr/api`, la ruta de salud `/salud` y el auto-deploy apagado, y verificar que la comprobación de disponibilidad responde con éxito en la URL pública
- [x] 7.3 Trasladar a `apps/web` la configuración de `base` que creó `add-development-workflow` en `vite.config.ts` (`/idrconsultingcapacitacion/`, sobrescribible con `VITE_BASE`, aplicada en build y preview), y verificar con `npm run preview` que los assets cargan bajo esa ruta base
  > Ya se había trasladado en la fase 1, al mover `vite.config.ts`. Verificado con `npm run preview` desde la raíz: la página y los assets responden 200 bajo `/idrconsultingcapacitacion/`, y `VITE_BASE=/otra-ruta/` la sobrescribe sin tocar el código. En Git Bash hace falta `MSYS_NO_PATHCONV=1`, porque si no convierte `/otra-ruta/` en una ruta de Windows.
- [x] 7.4 Verificar que GitHub Pages sigue habilitado con origen en GitHub Actions (lo habilitó `add-development-workflow`)
  > `gh api repos/.../pages`: `build_type=workflow`, en `https://ragudc1984.github.io/idrconsultingcapacitacion/`.
- [ ] 7.5 **[manual]** Verificar el sistema publicado de punta a punta desde otro dispositivo: crear, completar, editar y eliminar una tarea contra el API remoto, recargar y confirmar que los cambios siguen ahí
- [ ] 7.6 **[manual]** Verificar el escenario de servicio suspendido: dejar el API dormir por inactividad, abrir la web publicada, y confirmar que el estado de carga se mantiene comprensible durante toda la espera sin mostrar error ni lista vacía

## 8. Integración continua

> Cubre la capacidad `continuous-delivery`.

- [ ] 8.1 Extender `.github/workflows/ci.yml` (creado en versión mínima por `add-development-workflow`) para que instale dependencias con caché y ejecute lint y build de todos los workspaces, actualizando el script `verify` en el mismo cambio, y verificar que el archivo es YAML válido
- [ ] 8.2 Verificar el escenario de cambio exitoso: abrir un pull request con un cambio que pasa lint y compila, y confirmar que la ejecución se reporta exitosa en el pull request
- [ ] 8.3 Verificar el escenario de compilación rota: abrir un pull request con un error de tipos deliberado, confirmar que la ejecución falla indicando qué comprobación falló, y revertir el error
- [ ] 8.4 Verificar el escenario de violación de lint: abrir un pull request con una infracción deliberada de oxlint, confirmar que la ejecución falla, y revertir la infracción

## 9. Entrega continua

- [ ] 9.1 Extender `.github/workflows/deploy.yml` (creado en versión mínima por `add-development-workflow`, que ya repite lint y build y publica en Pages) para que construya `apps/web` con `VITE_API_URL` apuntando al API publicado, publique el resultado en GitHub Pages, y dispare el deploy hook de Render para el API, y verificar que el archivo es YAML válido
- [ ] 9.2 **[manual]** Registrar el deploy hook de Render y la dirección pública del API como secreto y variable del repositorio respectivamente, y verificar que ningún valor aparece en archivos versionados con `git grep` sobre las cadenas involucradas
- [ ] 9.3 Verificar el escenario de publicación exitosa: integrar un cambio visible en la rama principal y confirmar que la web publicada y el API reflejan ese cambio sin que nadie ejecute nada manualmente
- [ ] 9.4 Verificar el escenario de que no se publica lo que no compila: integrar un cambio que rompe la compilación, confirmar que no se publicó nada y que la versión publicada anteriormente sigue accesible, y revertir
- [ ] 9.5 Verificar el escenario de migración aplicada antes de servir: integrar un cambio que incluya una migración de esquema y confirmar en los registros de Render que la migración se aplicó durante el build, antes de que la versión nueva atendiera solicitudes
- [ ] 9.6 Verificar que los registros de la primera ejecución de publicación no imprimen el valor de ningún secreto
- [ ] 9.7 **[manual]** Revisar la protección de la rama principal que configuró `add-development-workflow` para que exija las comprobaciones de integración continua ampliadas antes de integrar, y verificar el escenario del spec intentando integrar un pull request con comprobaciones fallidas y confirmando que GitHub lo impide

## 10. Verificación final del cambio

- [ ] 10.1 Verificar el flujo completo contra el sistema publicado: abrir la web desde dos navegadores distintos, crear tareas en uno, recargar en el otro, y confirmar que ambos ven las mismas tareas con el mismo contenido y orden
- [ ] 10.2 Confirmar que el tema sigue cargando siempre en claro y sin recordarse entre recargas, verificando que la arquitectura nueva no reabrió ese non-goal
- [ ] 10.3 Verificar que `npm run build` y `npx oxlint` pasan desde la raíz sobre el repositorio completo
- [ ] 10.4 Revisar que el tamaño del CSS construido no creció de forma inesperada respecto al estado previo; si creció sin haber tocado estilos, buscar palabras como "visible" o "blur" escritas en comentarios de archivos escaneados por Tailwind (`CLAUDE.md` — Gotchas)
