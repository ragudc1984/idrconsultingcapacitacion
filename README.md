# Capacitación IDR Consulting

**Aplicación publicada:** _(pendiente — se completa al publicar en GitHub Pages)_

Ejercicio de capacitación en **desarrollo spec-driven** para el equipo de IDR
Consulting. La lista de tareas es el vehículo; el producto real es el proceso.

Cada comportamiento visible de la aplicación se puede rastrear hasta un requisito
escrito en `openspec/specs/`. Los specs no documentan el código después del
hecho: lo preceden. Cuando el código y un spec difieren, uno de los dos está mal
y hay que decir cuál antes de tocar nada.

> **Este repositorio y la aplicación publicada son públicos.** Cualquiera con la
> dirección puede abrir la app, y la lista de tareas no tiene cuentas ni
> autenticación. **No cargues datos reales**: ni datos de clientes, ni
> información interna, ni nada que no puedas publicar en internet.

## Dónde está cada cosa

| Documento | Gobierna |
|---|---|
| `openspec/specs/**/spec.md` | El comportamiento observable |
| `PRODUCT.md` | Verdad de producto, usuarios, restricciones vinculantes |
| `DESIGN.md` + `.impeccable/design.json` | El sistema visual: tokens, tipografía, formas, motion |
| `CLAUDE.md` | Cómo se trabaja en este repositorio |

`openspec/changes/archive/` guarda el rastro de decisiones de cada cambio ya
aplicado. Es el activo real del repositorio: la aplicación se puede reescribir,
ese rastro no se puede reponer.

## Puesta en marcha

Requisitos: **Node.js 20.19 o superior** (o 22.12+; lo exige Vite) y npm.

```bash
git clone https://github.com/ragudc1984/idrconsultingcapacitacion.git
cd idrconsultingcapacitacion
npm install
npm run dev
```

`npm run dev` levanta el servidor de desarrollo de Vite e imprime la dirección
local. No hacen falta variables de entorno: la aplicación guarda las tareas en el
`localStorage` del navegador y no habla con ningún servicio externo.

> **En Windows, clona en una ruta corta.** Las rutas del archivo histórico de
> `openspec/` llegan a 102 caracteres, así que un destino profundo agota el
> límite de 260 de Windows y el clon falla con `Filename too long` tras haber
> descargado los objetos. Clona cerca de la raíz del disco, o habilita rutas
> largas con `git config --system core.longpaths true`.

## Comandos

```bash
npm run dev       # servidor de desarrollo (Vite)
npm run build     # tsc -b && vite build
npm run lint      # oxlint
npm run verify    # la puerta de verificación completa (ver abajo)
npm run preview   # sirve localmente lo que produjo el build
```

**No hay runner de tests y es deliberado.** No existe `npm test`. La verificación
de este repositorio es `build` + `lint` + comprobación de lo que se ve, escrita
como tareas explícitas dentro de cada cambio de OpenSpec.

## La puerta de verificación

Antes de empujar cualquier trabajo, ejecuta:

```bash
npm run verify
```

Encadena, **en este orden y deteniéndose en el primer fallo**:

1. `npm ci` — instalación limpia. Se usa en vez de `npm install` porque falla si
   `package.json` y `package-lock.json` discrepan, que es justo el error que
   aparece en CI y no en la máquina de quien ya tenía las dependencias
   instaladas.
2. `npm run build` — compilación de tipos y construcción.
3. `npm run lint` — oxlint.

El orden importa: un error de tipos vuelve ruido a las quejas de lint. Si un paso
falla, corrígelo y vuelve a ejecutar antes de seguir. **No se empuja con un paso
en rojo.**

> **`npm ci` borra y reinstala `node_modules`, así que no puede correr con el
> servidor de desarrollo vivo.** En Windows falla con `EPERM` al intentar borrar
> un binding nativo que el proceso de Vite tiene cargado. Detén el servidor antes
> de ejecutar `verify`. Matar el proceso de npm no siempre mata al hijo de Vite:
> comprueba que no queda ninguno vivo.

Durante el trabajo normal usa `npm run build` y `npm run lint` directamente;
`verify` es la puerta de antes de empujar, no de cada guardado.

> **Si modificas el workflow de GitHub Actions, actualiza `verify` en el mismo
> cambio.** `verify` replica los pasos del CI a mano; si se desincronizan, un
> `verify` en verde deja de ser evidencia de un CI en verde y la señal deja de
> servir. Quien quiera la reproducción más fiel puede ejecutar los workflows
> reales en contenedores con [`act`](https://github.com/nektos/act), a costa de
> necesitar Docker.

## Cómo llega un cambio a `main`

1. **Propuesta de OpenSpec primero.** Ningún cambio de comportamiento se escribe
   sin `proposal.md`, `design.md`, `specs/` y `tasks.md` en
   `openspec/changes/<nombre>/`.
2. Rama de trabajo a partir de `main`.
3. Commits en español, describiendo qué cambió.
4. `npm run verify` en verde.
5. Pull request contra `main`.
6. Merge **solo** con las comprobaciones en verde.

**No se empuja directamente a `main`**: la rama está protegida y el remoto
rechaza el push. Hasta un arreglo de una línea pasa por pull request — es
intencional.

Al terminar un cambio se sincronizan sus deltas a `openspec/specs/` y se archiva
en `openspec/changes/archive/<YYYY-MM-DD>-<nombre>/`.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · oxlint

Tailwind v4 se configura **sin archivo de configuración**: los tokens viven en
`@theme` dentro de `src/index.css`, y los orígenes de contenido están en lista
blanca explícita con directivas `@source`. Markup colocado fuera de `index.html`
y `src/` no se escanea, y sus estilos faltarán **sin producir ningún error**.
Cualquier ubicación nueva de componentes tiene que agregar su propia `@source`.

Ver `CLAUDE.md` para el resto de las trampas conocidas.

## Ampliar la configuración de oxlint

Se pueden habilitar reglas type-aware instalando `oxlint-tsgolint` y editando
`.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

Ver la [documentación de reglas de Oxlint](https://oxc.rs/docs/guide/usage/linter/rules)
para la lista completa de reglas y categorías.
