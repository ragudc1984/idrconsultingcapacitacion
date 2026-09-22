# Proposal

## Why

La aplicación guarda las tareas en `localStorage`, lo que ata cada lista a un
navegador y un dispositivo. El equipo de IDR Consulting necesita practicar el
ciclo de OpenSpec sobre un cambio que atraviesa las tres capas que encuentra en
proyectos reales —interfaz, API y base de datos— y sobre un despliegue remoto
con integración y entrega continuas. La lista de tareas sigue siendo el vehículo;
lo que se ejercita ahora es un cambio de arquitectura completo y trazable a
specs.

Este cambio **reabre dos decisiones vinculantes** y lo hace de forma explícita,
no por omisión:

1. `PRODUCT.md` declara **"Sin backend"** como restricción vinculante ("Un
   navegador, un origen, un dispositivo"). Se levanta a petición del equipo.
2. `openspec/specs/todo-list/spec.md` exige persistir en `localStorage`. Ese
   requisito se reemplaza, no se complementa.

## What Changes

- **BREAKING** — Se elimina la persistencia en `localStorage`. `src/storage.ts`
  desaparece junto con la clave `todo-list:tasks`. **Las tareas guardadas hoy en
  el navegador de cualquier miembro del equipo no se migran y se pierden.** Es
  aceptable: no hay despliegue ni datos de producción (`PRODUCT.md` — Evidence
  on Hand).
- Se introduce un **API REST en Node.js** (Express + Prisma + PostgreSQL) que
  expone crear, listar, actualizar y eliminar tareas.
- La interfaz pasa a **leer y escribir contra ese API**: carga las tareas al
  montar y cada acción del usuario es una llamada HTTP. Aparecen dos estados que
  la app nunca tuvo —cargando y error de red— y deben ser accesibles como el
  resto.
- El repositorio se reorganiza como **monorepo con npm workspaces**: la app web
  se mueve a `apps/web/`, el API vive en `apps/api/`, y el tipo `Task` se
  comparte en `packages/shared/`.
- Se agrega **CI/CD con GitHub Actions**: integración continua que bloquea con
  lint y build de ambos workspaces, y entrega continua que publica la web en
  GitHub Pages y el API en Railway al integrar en la rama principal.
- Se actualiza `PRODUCT.md`: la restricción "Sin backend" se sustituye por la
  arquitectura y las restricciones nuevas (un único usuario compartido, sin
  cuentas).

**No entra en este cambio** (ver `design.md` — Non-Goals): autenticación,
cuentas, multiusuario real, sincronización en tiempo real entre pestañas,
funcionamiento offline, paginación y runner de tests automatizados.

## Capabilities

### New Capabilities

- `task-api`: el contrato observable del servicio de tareas —qué recursos
  expone, qué devuelve ante datos válidos e inválidos, y qué persiste entre
  reinicios del servidor.
- `continuous-delivery`: el comportamiento observable del pipeline —qué
  comprobaciones bloquean la integración de un cambio y qué se publica
  automáticamente al integrarlo.

### Modified Capabilities

- `todo-list`: el requisito **"Persistir tareas"** cambia de `localStorage` a
  persistencia en el servidor vía `task-api`, y se agregan los estados de carga
  inicial y de fallo de red que hoy no existen. Los requisitos de crear, listar,
  completar, editar y eliminar conservan su comportamiento visible, pero dejan de
  ser operaciones puramente locales.

## Impact

**Código afectado:**

- `src/storage.ts` — se elimina.
- `src/App.tsx` — `commitTasks` deja de escribir en `localStorage` y pasa a
  llamar al API; aparecen estados de carga y error.
- `src/types.ts` — `Task` se muda a `packages/shared/`.
- `src/`, `index.html`, `vite.config.ts`, `tsconfig*.json` — se mueven a
  `apps/web/`. **Ojo con las directivas `@source` de Tailwind en `index.css`:
  son rutas relativas en lista blanca y mover archivos las rompe en silencio,
  sin error de build** (ver `CLAUDE.md` — Gotchas).
- `package.json` raíz — pasa a ser el manifiesto de workspaces.

**Código nuevo:** `apps/api/` (Express, Prisma, esquema y migraciones),
`packages/shared/`, `.github/workflows/`.

**Dependencias nuevas:** `express`, `cors`, `@prisma/client`, `prisma`, `zod`,
`tsx`.

**Documentos que deben actualizarse en el mismo cambio:** `PRODUCT.md`
(restricción "Sin backend" y la sección de capacidades), `CLAUDE.md` (comandos,
arquitectura y la sección del dueño único del estado, que hoy describe
`commitTasks` escribiendo en `localStorage`).

**Sistemas externos nuevos:** una base de datos PostgreSQL gestionada, un
servicio web en Railway y GitHub Pages, todos bajo la cuenta `ragudc1984`. Cada
uno introduce secretos que viven en GitHub Actions y nunca en el repositorio.

**Riesgo operativo conocido** (escrito cuando el API iba a Render; ver `design.md` para el paso a Railway, que en el plan de pago no suspende el servicio): el plan gratuito de Render suspende el servicio
tras un periodo de inactividad; la primera petición después de eso puede tardar
decenas de segundos. La interfaz debe seguir siendo comprensible durante esa
espera.
