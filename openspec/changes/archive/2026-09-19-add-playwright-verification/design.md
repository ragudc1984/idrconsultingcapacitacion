# Design

## Context

Ver `proposal.md` - Why para la motivación.

El proyecto tiene dos comprobaciones automatizadas —`npm run build` (que incluye
`tsc -b`) y `npx oxlint`— y ninguna que abra la aplicación. `CLAUDE.md` lo dice
explícitamente: *"No hay runner de tests ni archivos de test"*, y define la
verificación del repo como build + lint + comprobación manual en el navegador.

Las tareas de verificación manual de cada cambio de OpenSpec son el mecanismo que
cubre ese hueco, y funcionan: obligan a mirar. Pero dependen de que haya una
persona disponible con el navegador delante, y eso hizo que tareas de varios
cambios quedaran abiertas durante días.

## Goals / Non-Goals

**Goals:**

- Poder verificar de forma automatizada lo que hasta ahora sólo se podía calcular
  o mirar: geometría renderizada, estilos computados, trayectorias de animación,
  estados de interacción y comportamiento bajo preferencias del sistema.
- Que futuras sesiones sepan que la herramienta existe, sin tener que
  redescubrirla.

**Non-Goals:**

- **No se crea una suite de tests ni un runner.** No se agrega `npm test`, no se
  añaden archivos `*.spec.ts`, y `@playwright/test` queda fuera a propósito: se
  instala sólo `playwright`, la librería de automatización. El principio 3 de
  `PRODUCT.md` dice que el alcance pequeño es el punto, y una suite de tests para
  una lista de tareas de cinco componentes es exactamente lo que ese principio
  descarta.
- **No se sustituyen las tareas de verificación manual.** Siguen siendo el
  contrato de cada cambio. Playwright es una forma de ejecutarlas, no un permiso
  para dejar de escribirlas.
- No se versiona el navegador ni se añade a CI: no hay CI en este proyecto.

## Decisions

**1. `playwright` y no `@playwright/test`.**

El paquete de test trae runner, configuración, reporteros y una estructura de
carpetas. Aquí no se quiere una suite: se quiere poder abrir la aplicación,
medirla y cerrarla desde un script efímero. `playwright` solo da exactamente eso
con una dependencia menos. Alternativa descartada: `@playwright/test`, que
empujaría hacia una suite que el proyecto decidió no tener.

**2. Sólo Chromium.**

`npx playwright install chromium` en lugar del conjunto completo. La aplicación no
tiene código específico de navegador y descargar Firefox y WebKit triplicaría el
peso de la caché sin aportar nada hoy. Si algún día aparece un defecto específico
de Safari, instalar WebKit es un comando.

**3. Scripts de verificación efímeros, no versionados.**

Los scripts que usan Playwright se escriben para una verificación concreta, se
ejecutan y se borran. Tienen que vivir dentro del proyecto para resolver
`node_modules` —un script en el directorio temporal falla con
`ERR_MODULE_NOT_FOUND`— pero no se commitean.

La razón es que un script guardado envejece: describe la interfaz que existía el
día que se escribió, y cuando falla meses después nadie sabe si el defecto está
en la aplicación o en el script. Las tareas de verificación de cada cambio ya
documentan *qué* comprobar; el *cómo* se reescribe cada vez. Alternativa
descartada: una carpeta `e2e/` versionada, que es el primer paso hacia la suite
que el Non-Goal descarta.

**4. Sin delta de specs (`skip_specs: true`).**

Playwright no entra en el bundle, no toca `src/` y no cambia nada de lo que el
usuario ve. Mismo criterio que `limit-tailwind-content-sources`.

**5. Registrar el cambio después de instalar.**

Igual que en `limit-tailwind-content-sources`, invierte el flujo que este
repositorio enseña. La instalación se hizo a pedido explícito y el registro se
pidió a continuación. Se documenta en vez de omitirse, porque una dependencia
nueva sin propuesta sería un hueco en el rastro.

## Risks / Trade-offs

- **[Verificar con Playwright puede dar falsos negativos tan convincentes como
  un defecto real]** → Ya ocurrió. Al verificar el movimiento reducido, un script
  reportó que el halo llegaba a opacidad 1.00; el defecto estaba en el script, que
  medía `getComputedStyle(el, '::after')` **después** de que la clase se quitara,
  y un pseudo-elemento inexistente devuelve el valor inicial de la propiedad.
  Mitigación: ante un fallo, comprobar primero la instrumentación con un
  diagnóstico acotado antes de tocar el código de la aplicación.

- **[La herramienta invita a ampliarse a una suite]** → El Non-Goal es explícito
  y la decisión 1 lo refuerza al elegir el paquete sin runner. Reabrirlo es un
  cambio de spec.

- **[~130 MB de Chromium en la máquina de cada persona]** → Vive en una caché
  compartida entre proyectos, no en el repositorio. Se libera con
  `npx playwright uninstall --all`.

## Migration Plan

No aplica: es una dependencia de desarrollo.

Rollback: `npm uninstall playwright`. El bundle de producción no se ve afectado
en ningún momento, con o sin la dependencia.
