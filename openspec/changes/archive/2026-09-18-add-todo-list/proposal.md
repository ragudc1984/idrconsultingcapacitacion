# Proposal

## Why

El proyecto (React + TypeScript + Tailwind v4, scaffolded pero sin funcionalidad) necesita una primera feature funcional para la capacitación: una lista de tareas simple. El alcance se limita intencionalmente a crear y listar tareas, sin edición, eliminación ni marcado de completado, para mantener el ejercicio acotado.

## What Changes

- Se agrega un formulario para crear una tarea nueva a partir de un texto (título).
- Se agrega una lista que muestra todas las tareas creadas, en orden de creación.
- El estado de las tareas vive únicamente en memoria del lado del cliente (React state); no hay persistencia en `localStorage` ni backend/API, ya que el proyecto no tiene una capa de datos hoy.
- No se incluyen: edición de tareas, eliminación, marcado como completada, ni filtros/búsqueda — quedan fuera de alcance por decisión explícita del usuario.

## Capabilities

### New Capabilities
- `todo-list`: crear tareas (título) y listar las tareas creadas en la sesión actual.

### Modified Capabilities
(ninguna — el proyecto no tiene capacidades existentes)

## Impact

- Código nuevo dentro de `src/` (componente(s) de UI para el formulario y la lista, y el estado asociado).
- Sin cambios en dependencias: se usa React state nativo, sin librerías nuevas de manejo de estado ni de persistencia.
- Sin impacto en backend/API porque no existen en el proyecto.
