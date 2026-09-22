# Capacitación IDR Consulting

**Aplicación publicada:** <https://ragudc1984.github.io/idrconsultingcapacitacion/>

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

Requisitos: **Node.js 20.19 o superior** (o 22.12+; lo exigen Vite y Prisma),
npm, y una base de datos **PostgreSQL**. La gratuita de [Neon](https://neon.tech)
alcanza.

El repositorio es un monorepo con npm workspaces: la web en `apps/web`, el API
en `apps/api` y el contrato compartido en `packages/shared`. Todos los comandos
se ejecutan desde la raíz, salvo la migración.

**1. Clonar e instalar**

```bash
git clone https://github.com/ragudc1984/idrconsultingcapacitacion.git
cd idrconsultingcapacitacion
npm install
```

**2. Configurar el API.** Copia `apps/api/.env.example` como `apps/api/.env` y
completa `DATABASE_URL` con la cadena de conexión de tu base. Usa la conexión
**directa** (en Neon, la que no tiene `-pooler` en el host) con
`sslmode=verify-full`. Las otras dos variables ya traen el valor de desarrollo:

| Variable | Qué es | Desarrollo |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión de PostgreSQL. **Secreta.** | La de tu base |
| `PORT` | Puerto del API | `3000` |
| `CORS_ORIGINS` | Orígenes que pueden llamar al API desde un navegador, separados por coma. Nunca `*` | `http://localhost:5173` |

**3. Crear las tablas**

```bash
cd apps/api
npx prisma migrate deploy
cd ../..
```

**4. Configurar la web.** Copia `apps/web/.env.example` como
`apps/web/.env.local`. Trae `VITE_API_URL=http://localhost:3000`, que apunta al
API local. No es secreta: termina escrita en el JavaScript servido.

**5. Arrancar**, en dos terminales:

```bash
npm run dev -w @idr/api   # API en http://localhost:3000
npm run dev               # web en http://localhost:5173
```

Los `.env` reales están en `.gitignore`: nunca se commitean. Para comprobar que
el API ve la base: `http://localhost:3000/salud` responde `{"estado":"disponible"}`.

> **En Windows, clona en una ruta corta.** Las rutas del archivo histórico de
> `openspec/` llegan a 102 caracteres, así que un destino profundo agota el
> límite de 260 de Windows y el clon falla con `Filename too long` tras haber
> descargado los objetos. Clona cerca de la raíz del disco, o habilita rutas
> largas con `git config --system core.longpaths true`.

## Comandos

```bash
npm run dev               # web (Vite)
npm run dev -w @idr/api   # API (tsx watch)
npm run build             # todos los workspaces
npm run lint              # oxlint sobre todo el repositorio
npm run verify            # la puerta de verificación completa (ver abajo)
npm run preview           # sirve localmente el build de la web
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

## Ramas: Gitflow

El repositorio sigue [Gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
con dos ramas permanentes:

| Rama | Contiene | Se publica |
|---|---|---|
| `main` | Solo versiones publicadas, cada una con su etiqueta `vX.Y.Z` | Sí, en cada integración |
| `develop` | La integración de funcionalidades. Es la rama predeterminada | No |

Y tres tipos de rama de trabajo, **con estos nombres exactos** (minúsculas,
palabras separadas por guion):

| Tipo | Nombre | Sale de | Se integra en |
|---|---|---|---|
| Funcionalidad nueva | `feature-<nombre-funcionalidad>` | `develop` | `develop` |
| Preparar una versión | `release-<X.Y.Z>` | `develop` | `main`, y de vuelta en `develop` |
| Solucionar un issue publicado | `hotfix-<nombre-issue>` | `main` | `main`, y de vuelta en `develop` |

Ejemplos: `feature-editar-tareas`, `hotfix-foco-invisible`, `release-0.2.0`. No
valen `feature/editar` (barra), `Feature-Editar` (mayúsculas) ni un nombre sin
prefijo. El job `nomenclatura` de CI **rechaza** un pull request con un nombre
inválido o con el destino equivocado (por ejemplo, una `feature-*` contra `main`).

> Atlassian advierte que Gitflow es un flujo *legacy*, desplazado por el
> desarrollo basado en trunk y difícil de combinar con CI/CD. Aquí se usa a
> propósito, para practicar un modelo con releases y hotfixes explícitos.

### Funcionalidad nueva

1. **Propuesta de OpenSpec primero.** Ningún cambio de comportamiento se escribe
   sin `proposal.md`, `design.md`, `specs/` y `tasks.md` en
   `openspec/changes/<nombre>/`.
2. `git checkout develop && git pull` y `git checkout -b feature-<nombre>`.
3. Commits en español, describiendo qué cambió.
4. `npm run verify` en verde.
5. Pull request contra `develop`, e integrar **solo** con las comprobaciones en
   verde.

### Release

1. `git checkout develop && git pull` y `git checkout -b release-X.Y.Z`.
2. Fijar `"version": "X.Y.Z"` en `package.json`. En la rama de release solo entran
   correcciones y preparación de la versión, nunca funcionalidades nuevas.
3. Pull request contra `main`. Al integrarlo, `deploy` publica la versión.
4. Etiquetar el commit de integración y empujar la etiqueta:
   `git checkout main && git pull && git tag vX.Y.Z && git push origin vX.Y.Z`.
5. **Pull request de la misma rama contra `develop`.** Si se omite, `develop`
   pierde lo que ya se publicó.

### Hotfix

1. `git checkout main && git pull` y `git checkout -b hotfix-<nombre-issue>`.
2. Corregir y subir el parche en `package.json` (de `0.1.0` a `0.1.1`).
3. Pull request contra `main`, etiqueta `vX.Y.Z` y pull request de vuelta contra
   `develop`, igual que en una release.

**No se empuja directamente a `main` ni a `develop`**: las dos están protegidas,
exigen las comprobaciones `verificar` y `nomenclatura`, y el remoto rechaza el
push. Hasta un arreglo de una línea pasa por pull request, y es intencional.

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
