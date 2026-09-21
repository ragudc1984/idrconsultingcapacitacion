# Spec Delta

## Purpose

Controla cómo se presenta la aplicación al usuario: que se vea y use correctamente en cualquier tamaño de pantalla, y que el usuario pueda elegir entre modo claro y modo oscuro.

## ADDED Requirements

### Requirement: Diseño responsive mobile-first
El sistema SHALL presentar toda la interfaz de forma correcta y utilizable en pantallas de tipo móvil, tablet y desktop, siguiendo una metodología mobile-first (los estilos base están pensados para móvil, y se adaptan hacia arriba para pantallas más anchas). En ningún tamaño de pantalla SHALL aparecer scroll horizontal ni contenido cortado o superpuesto.

#### Scenario: Visualización en móvil
- **WHEN** el usuario accede a la aplicación desde una pantalla de ancho móvil (por ejemplo, 375px)
- **THEN** el formulario de crear tarea y la lista de tareas se muestran en una sola columna, legibles y sin scroll horizontal

#### Scenario: Visualización en tablet
- **WHEN** el usuario accede a la aplicación desde una pantalla de ancho tablet (por ejemplo, 768px)
- **THEN** el contenido aprovecha el ancho disponible de forma legible, sin elementos cortados ni scroll horizontal

#### Scenario: Visualización en desktop
- **WHEN** el usuario accede a la aplicación desde una pantalla de ancho desktop (por ejemplo, 1280px o más)
- **THEN** el contenido se muestra centrado con un ancho máximo legible, sin estirarse de borde a borde ni verse vacío

### Requirement: Alternar modo claro/oscuro
El sistema SHALL mostrar un control con ícono de luna que permita al usuario alternar entre modo claro y modo oscuro. Al cargar la aplicación, el modo SHALL ser claro por defecto, independientemente de la preferencia de tema del sistema operativo del usuario. Activar el control SHALL cambiar el modo visual de inmediato, sin recargar la página.

#### Scenario: Carga por defecto en modo claro
- **WHEN** el usuario abre la aplicación por primera vez (sin haber elegido un modo antes)
- **THEN** la aplicación se muestra en modo claro, sin importar si el sistema operativo del usuario tiene configurado un tema oscuro

#### Scenario: Cambiar a modo oscuro
- **WHEN** el usuario hace click en el ícono de luna estando en modo claro
- **THEN** la aplicación cambia a modo oscuro de inmediato

#### Scenario: Volver a modo claro
- **WHEN** el usuario hace click en el control de tema estando en modo oscuro
- **THEN** la aplicación cambia a modo claro de inmediato
