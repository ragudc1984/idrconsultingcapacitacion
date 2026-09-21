# Tasks

## 1. Modelo de datos y estado

- [x] 1.1 Definir el tipo `Task` (id, title) en `src/types.ts` y verificar que `npm run build` compila sin errores
- [x] 1.2 Añadir el estado de la lista de tareas (`useState<Task[]>`) en el componente contenedor y verificar que `npm run build` compila sin errores

## 2. Crear tarea

- [x] 2.1 Implementar un componente de formulario (`TaskForm`) con input controlado y botón de envío que agregue una tarea al estado al enviarse, y verificar manualmente con `npm run dev` que escribir un título y enviar lo agrega a la lista
- [x] 2.2 Rechazar títulos vacíos o solo espacios (trim antes de validar) sin crear la tarea, y verificar manualmente con `npm run dev` que enviar el formulario vacío no agrega ningún elemento

## 3. Listar tareas

- [x] 3.1 Implementar un componente de lista (`TaskList`) que renderice las tareas en el orden en que fueron creadas, y verificar manualmente con `npm run dev` creando 3 tareas y confirmando que aparecen en ese mismo orden
- [x] 3.2 Mostrar un mensaje de estado vacío cuando no existan tareas, y verificar manualmente con `npm run dev` que ese mensaje aparece al cargar la app antes de crear ninguna tarea

## 4. Integración

- [x] 4.1 Integrar `TaskForm` y `TaskList` en `src/App.tsx` con estilos Tailwind consistentes con el resto de la app, y verificar que `npm run build` compila sin errores
- [x] 4.2 Verificar manualmente el flujo completo (crear varias tareas y confirmar que se listan correctamente) ejecutando `npm run dev`
