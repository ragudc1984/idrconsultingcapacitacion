# Tasks

## 1. Dependencia

- [x] 1.1 Instalar `lucide-react` como dependencia de producción y verificar que `npm run build` compila sin errores

## 2. Estado central (eliminar y editar)

- [x] 2.1 En `App.tsx`, agregar `handleDeleteTask(id)` (quita la tarea del estado por `id`) y `handleUpdateTask(id, title)` (actualiza el título de la tarea por `id`, aplicando `trim()` y descartando si queda vacío), y verificar que `npm run build` compila sin errores

## 3. Componente `TaskItem` (card + edición in-place)

- [x] 3.1 Crear `src/components/TaskItem.tsx` como card individual (`rounded-2xl`, borde suave, sombra sutil en hover/focus, soporte dark mode) recibiendo `task`, `onDelete` y `onUpdate`, y verificar que `npm run build` compila sin errores
- [x] 3.2 Agregar el ícono de papelera (`Trash2` de `lucide-react`) que llama a `onDelete(task.id)` al hacer click, y verificar manualmente con `npm run dev` que al hacer click la tarea desaparece de la lista de inmediato, sin recargar la página
- [x] 3.3 Agregar el ícono de lápiz (`Pencil` de `lucide-react`) que activa modo edición mostrando un input con el título actual, y verificar manualmente con `npm run dev` que al hacer click aparece el campo editable con el texto actual
- [x] 3.4 Guardar la edición al presionar `Enter` y al perder el foco (blur), llamando a `onUpdate(task.id, valorEditado)`, y verificar manualmente con `npm run dev` que ambos caminos (Enter y click afuera) actualizan el título en la lista de inmediato, sin recargar la página
- [x] 3.5 Rechazar el guardado cuando el título editado quede vacío o solo espacios en blanco (conservando el título anterior), y verificar manualmente con `npm run dev` que vaciar el campo y confirmar con Enter o blur no borra ni deja vacío el título mostrado

## 4. Integración de la lista

- [x] 4.1 Actualizar `TaskList` para renderizar un `TaskItem` por tarea (reemplazando el `<li>` de solo texto) en un layout de cards apiladas, pasando `onDelete` y `onUpdate`, y verificar que `npm run build` compila sin errores
- [x] 4.2 Conectar `handleDeleteTask` y `handleUpdateTask` desde `App.tsx` hasta `TaskList`, y verificar que `npm run build` compila sin errores

## 5. Verificación end-to-end

- [x] 5.1 Verificar manualmente con `npm run dev` el flujo completo: crear varias tareas, editar el título de una (con Enter y con click afuera en otra), y eliminar una tarea; confirmar que cada acción se refleja de inmediato en la interfaz sin recargar el navegador
