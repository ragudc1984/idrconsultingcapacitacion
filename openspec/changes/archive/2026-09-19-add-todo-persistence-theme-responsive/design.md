# Design

## Context

Ver `proposal.md` - Why. Estado actual relevante:
- Las tareas viven solo en `useState<Task[]>` en `App.tsx` (sin persistencia).
- El dark mode actual (`dark:` en las clases Tailwind de `App.tsx`, `TaskForm`, `TaskList`, `TaskItem`) depende de la estrategia por defecto de Tailwind v4, basada en `prefers-color-scheme` del sistema operativo - no hay forma de que el usuario lo controle manualmente todavía.
- El layout usa anchos fijos (`max-w-md`) sin diferenciar breakpoints; no se ha auditado en móvil/tablet.

## Goals / Non-Goals

**Goals:**
- Persistir tareas (crear/editar/eliminar) en `localStorage`, restaurándolas al cargar la página.
- Permitir alternar el tema manualmente con un ícono de luna, cargando siempre en modo claro por defecto.
- Que el layout funcione en móvil, tablet y desktop siguiendo mobile-first (estilos base para móvil, ampliados con breakpoints `sm:`/`md:`/`lg:` de Tailwind).

**Non-Goals:**
- Persistir la elección de tema entre recargas: el usuario pidió explícitamente que el modo por defecto al cargar sea claro; no pidió recordar la última elección. Cada carga de página inicia en modo claro, el usuario debe volver a alternar si quiere oscuro. Si se quiere cambiar esto en el futuro, es un cambio de spec.
- Sincronizar tareas entre pestañas/dispositivos (`localStorage` es por navegador/origen, sin backend).
- Breakpoints personalizados: se usan los breakpoints por defecto de Tailwind (`sm` 640px, `md` 768px, `lg` 1024px).

## Decisions

**Cambiar la estrategia de dark mode de Tailwind a "class-based".** Hoy `dark:` reacciona a `prefers-color-scheme` (estrategia por defecto de Tailwind v4), no a una elección del usuario. Para que el ícono de luna controle el tema manualmente, se agrega `@custom-variant dark (&:where(.dark, .dark *));` en `src/index.css`, y un componente `ThemeToggle` alterna la clase `dark` en el elemento raíz (`<html>`) según el estado. Las clases `dark:` ya existentes en los componentes no cambian - solo cambia qué dispara la variante. Alternativa considerada: mantener `prefers-color-scheme` y solo simular el toggle con un overlay - descartada porque no cumple "por defecto modo claro" de forma confiable en un sistema con tema oscuro.

**Estado del tema en `App.tsx` (no Context API).** La app es de un solo nivel de profundidad de componentes (App → TaskForm/TaskList/ThemeToggle); un `useState<'light' | 'dark'>` en `App.tsx`, inicializado siempre en `'light'`, pasado como prop a un botón `ThemeToggle`, es suficiente. No se introduce Context ni una librería de estado para esto.

**Persistencia de tareas vía `useEffect` + `localStorage`, con clave namespaced.** Se lee `localStorage.getItem('todo-list:tasks')` una vez al montar `App` (con `JSON.parse` protegido por `try/catch`, devolviendo `[]` si no existe o está corrupto), y se escribe con `JSON.stringify` en un `useEffect` cada vez que `tasks` cambia. Se usa una clave namespaced (`todo-list:tasks`) en vez de una genérica para evitar colisiones si la app crece.

**Mobile-first vía Tailwind sin refactor estructural.** Tailwind ya es mobile-first (las clases sin prefijo son la base "móvil", `sm:`/`md:`/`lg:` las amplían). El trabajo es de auditoría y ajuste de clases existentes: quitar anchos fijos que no se adapten (`max-w-md` fijo en formulario/lista se vuelve `w-full` en móvil con `max-w-*` solo a partir de `sm:`/sí aplica), revisar que `TaskItem` no desborde en pantallas angostas (el título largo debe truncarse o hacer wrap en vez de empujar los íconos fuera de la card), y que el header/toggle de tema no rompan el layout en móvil.

## Risks / Trade-offs

- [`localStorage` corrupto o modificado manualmente] → El `try/catch` al leer hace fallback a lista vacía en vez de romper la carga de la app.
- [Cambio de estrategia de dark mode] → Es un cambio de configuración de Tailwind (`@custom-variant`) que afecta a toda la app; se valida con `npm run build` y una revisión visual rápida de que los estilos `dark:` existentes se sigan viendo igual, ahora controlados por la clase en vez del sistema operativo.
- [Tema no persiste entre recargas] → Comportamiento intencional (ver Non-Goals); si en el futuro se pide recordar la preferencia, es un requisito nuevo, no un bug de esta implementación.
