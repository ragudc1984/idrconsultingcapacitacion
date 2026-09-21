# Tasks

## 1. Persistencia de tareas

- [x] 1.1 En `App.tsx`, leer las tareas guardadas en `localStorage` (clave `todo-list:tasks`) al inicializar el estado, con fallback a lista vacía si no existe o el JSON es inválido, y verificar que `npm run build` compila sin errores
- [x] 1.2 Guardar las tareas en `localStorage` (misma clave) cada vez que el estado `tasks` cambie (`useEffect`), y verificar manualmente con `npm run dev` que crear varias tareas y recargar la página manualmente las conserva
- [x] 1.3 Verificar manualmente con `npm run dev` que editar el título de una tarea y eliminar otra, y luego recargar la página, refleja esos cambios (no reaparece la tarea eliminada ni el título anterior)

## 2. Modo claro/oscuro

- [x] 2.1 Configurar Tailwind con estrategia de dark mode "class-based" agregando `@custom-variant dark (&:where(.dark, .dark *));` en `src/index.css`, y verificar que `npm run build` compila sin errores
- [x] 2.2 Crear un componente `ThemeToggle` con el ícono de luna (`Moon` de `lucide-react`) y agregar el estado de tema (`useState<'light' | 'dark'>`, inicializado en `'light'`) en `App.tsx`, y verificar que `npm run build` compila sin errores
- [x] 2.3 Alternar la clase `dark` en el elemento raíz (`<html>`) al hacer click en `ThemeToggle`, y verificar manualmente con `npm run dev` que el click cambia entre modo claro y oscuro de inmediato, sin recargar la página
- [x] 2.4 Verificar manualmente con `npm run dev` que la aplicación carga siempre en modo claro al abrir o recargar la página, incluso si el sistema operativo tiene configurado un tema oscuro

## 3. Diseño responsive mobile-first

- [x] 3.1 Auditar y ajustar las clases de `App.tsx`, `TaskForm`, `TaskList` y `TaskItem` para mobile-first (anchos fluidos en móvil con `max-w-*` a partir de `sm:`/`md:`, y que un título largo en `TaskItem` haga wrap en vez de empujar los íconos fuera de la card), y verificar que `npm run build` compila sin errores
- [x] 3.2 Verificar manualmente con `npm run dev` (DevTools en modo responsive, ~375px de ancho) que no hay scroll horizontal y que el formulario, la lista y el toggle de tema son legibles y usables
- [x] 3.3 Verificar manualmente con `npm run dev` (~768px de ancho) que el contenido aprovecha el ancho disponible sin cortes ni scroll horizontal
- [x] 3.4 Verificar manualmente con `npm run dev` (~1280px de ancho o más) que el contenido se muestra centrado con un ancho máximo legible, sin estirarse de borde a borde

## 4. Verificación end-to-end

- [x] 4.1 Verificar manualmente con `npm run dev` el flujo combinado: crear tareas, cambiar a modo oscuro, recargar la página manualmente, y confirmar que las tareas siguen ahí y que el tema vuelve a modo claro (comportamiento esperado, ver design.md - Non-Goals)
