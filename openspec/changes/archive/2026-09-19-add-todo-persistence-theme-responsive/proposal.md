# Proposal

## Why

La lista de tareas funciona hoy solo en memoria (`useState`): recargar la página borra todas las tareas, la interfaz no está adaptada a pantallas móviles/tablet, y no existe forma de cambiar a modo oscuro (el CSS ya tiene clases `dark:` pero depende de la preferencia del sistema, no de una elección del usuario). Estas tres carencias limitan que la app sea usable fuera de una demo de escritorio.

## What Changes

- Se agrega **persistencia de tareas en `localStorage`**: crear, editar y eliminar tareas se guarda en el navegador; al recargar la página manualmente, las tareas existentes se restauran tal como quedaron.
- Se aplica **diseño responsive con metodología mobile-first** a toda la página: la app se ve y usa correctamente en móvil, tablet y desktop (tipografía, espaciados, ancho de las cards/formulario y layout general se adaptan por breakpoint, empezando por el estilo base para móvil).
- Se agrega un **toggle de modo oscuro/claro**: un ícono de luna (`lucide-react`) en la interfaz que, al hacer click, cambia entre modo claro y modo oscuro. Por defecto la app carga en modo claro (no se usa la preferencia del sistema operativo como default).

## Capabilities

### New Capabilities
- `app-appearance`: controla la presentación general de la app - diseño responsive mobile-first (móvil, tablet, desktop) y el toggle de modo claro/oscuro (con modo claro como valor por defecto).

### Modified Capabilities
- `todo-list`: se agrega el requisito de persistencia - las tareas creadas, editadas o eliminadas se guardan en `localStorage` y sobreviven a una recarga manual de la página.

## Impact

- Código en `src/` (lógica de lectura/escritura a `localStorage` para las tareas, componente/lógica de toggle de tema, clases responsive en `App.tsx` y en los componentes de `todo-list`).
- Sin backend ni servidor: la persistencia es exclusivamente client-side vía `localStorage` del navegador (no sincroniza entre dispositivos ni navegadores distintos).
- Reutiliza la dependencia `lucide-react` ya instalada (ícono de luna); no se agregan dependencias nuevas.
