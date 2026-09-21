# Spec Delta

## ADDED Requirements

### Requirement: Animación de entrada de una tarea nueva
El sistema SHALL señalar visualmente la aparición de una tarea recién creada con una animación de entrada. La animación SHALL desplazar la fila desde el lado por el que llega a la lista, es decir desde abajo, ya que las tareas nuevas se añaden al final. La animación SHALL completarse dentro del presupuesto de respuesta de una interfaz, sin superar los 300 ms, dado que crear una tarea es la acción más repetida de la aplicación. La animación SHALL mantenerse fluida sin provocar repintados por fotograma. Cuando el usuario ha solicitado movimiento reducido, el sistema SHALL conservar la señal de que algo acaba de aparecer, pero sin desplazamiento.

#### Scenario: La tarea nueva llega desde abajo
- **WHEN** el usuario crea una tarea y ésta se añade al final de la lista
- **THEN** la fila aparece desplazándose hacia arriba hasta su posición final, nunca descendiendo desde la fila anterior

#### Scenario: La entrada no se percibe lenta
- **WHEN** el usuario crea varias tareas seguidas
- **THEN** cada fila termina su animación de entrada en 300 ms o menos, de modo que el usuario puede escribir la siguiente sin esperar a que la anterior se asiente

#### Scenario: Movimiento reducido conserva la señal
- **WHEN** el sistema operativo del usuario tiene activada la preferencia de movimiento reducido y el usuario crea una tarea
- **THEN** la fila aparece con un cambio de opacidad, sin desplazamiento, y la aplicación sigue reconociendo que la animación terminó

#### Scenario: La entrada no degrada el rendimiento
- **WHEN** una tarea nueva entra en la lista
- **THEN** la animación no altera propiedades que obliguen al navegador a repintar en cada fotograma
