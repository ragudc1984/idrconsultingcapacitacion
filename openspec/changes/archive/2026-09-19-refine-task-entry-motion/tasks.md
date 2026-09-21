# Tasks

## 1. Corregir la animación

- [x] 1.1 En `src/index.css`, reescribir `@keyframes task-in` para que sólo altere `opacity` y `transform`, con `translateY(6px)` como estado inicial en lugar de `-6px`, y verificar con `grep` sobre el bloque que no queda ninguna declaración `box-shadow` dentro del keyframe
- [x] 1.2 Cambiar `.animate-task-in` a `animation: task-in 200ms cubic-bezier(0.23, 1, 0.32, 1)`, y verificar que `npm run build` compila y que el CSS construido contiene esa duración y esa curva
- [x] 1.3 Añadir `.animate-task-in::after` con `box-shadow` fijo en `var(--cyan-glow)`, `position: absolute`, `inset: 0`, `pointer-events: none` y una animación `task-glow` de 200ms que lleve la opacidad de 0 a 1 y de vuelta a 0, y verificar que `npm run build` compila
- [x] 1.4 Verificar que el bloque `@media (prefers-reduced-motion: reduce)` sigue sustituyendo la animación por `task-in-reduced` y que el pseudo-elemento no reintroduce movimiento ahí

## 2. Actualizar la documentación del sistema

- [x] 2.1 En `DESIGN.md`, actualizar la descripción de la entrada en la sección de la fila de tarea: hoy dice "480ms de `ease-out` que combinan un desplazamiento vertical de 6px, un fundido y un destello de halo", y verificar con `grep` que ya no queda ninguna mención a 480ms en el archivo
- [x] 2.2 En `.impeccable/design.json`, actualizar la entrada `task-in` de `extensions.motion` (hoy `"480ms ease-out"`) y añadir la entrada `task-glow`, y verificar que el archivo sigue siendo JSON válido
- [x] 2.3 Verificar con `grep` que ni `DESIGN.md` ni `.impeccable/design.json` conservan valores de movimiento que contradigan el CSS

## 3. Verificación funcional

- [x] 3.1 Verificar manualmente con `npm run dev` que al crear una tarea la clase `animate-task-in` desaparece de la fila al terminar la animación, lo que confirma que `onAnimationEnd` sigue disparándose y que `justAddedId` se limpia
- [x] 3.2 Verificar manualmente con `npm run dev` que crear dos tareas seguidas deja sólo la última con la animación aplicada, y que la primera no queda con estado residual pese a que ahora hay dos animaciones simultáneas por fila (la del `<li>` y la del `::after`)
- [x] 3.3 Verificar manualmente con `npm run dev` que la barra de acento cian del borde izquierdo sigue apareciendo con hover y con foco dentro de la fila, es decir que el nuevo `::after` no interfiere con ella ni captura eventos

## 4. Verificación visual y de calidad

- [x] 4.1 Verificar manualmente con `npm run dev` que la tarea nueva entra **subiendo** hacia su posición y no bajando desde la fila anterior
- [x] 4.2 Verificar manualmente con `npm run dev` que el destello del halo sigue siendo perceptible a 200ms y que la entrada no se siente cortada
- [x] 4.3 Verificar manualmente con `npm run dev`, activando movimiento reducido en el sistema operativo, que la tarea nueva aparece con un fundido sin desplazamiento y sin halo en movimiento
- [x] 4.4 Verificar que `npm run build`, `npx oxlint` y el detector de Impeccable (`impeccable detect --json src index.html`) pasan sin hallazgos
