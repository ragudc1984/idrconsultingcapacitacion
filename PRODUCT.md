# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Audiencia real:** el equipo de IDR Consulting que está aprendiendo el flujo de
desarrollo spec-driven. Llegan a este repositorio para practicar el ciclo
completo de OpenSpec —propuesta, spec, tareas, implementación, archivo— sobre un
artefacto lo bastante pequeño como para que el proceso sea lo visible.

**Usuario simulado de la app:** una persona llevando sus propias tareas en un
solo navegador. No hay cuentas, roles ni colaboración; esta figura existe para
dar a los requisitos un sujeto concreto, no porque haya usuarios en producción.

Esa distinción es material: cuando algo obliga a elegir entre la app y la
claridad del ejercicio, gana el ejercicio.

## Product Purpose

Enseñar desarrollo spec-driven usando una lista de tareas como vehículo. El
producto que se está construyendo es el proceso; la aplicación es el material
sobre el que se practica.

Hay éxito cuando el equipo puede recorrer el ciclo de OpenSpec de punta a punta y
el código resultante sigue siendo comprobable contra sus specs. Un cambio que
funciona pero que deja el spec desactualizado es un fallo del ejercicio, aunque
la aplicación se vea bien.

## Positioning

Lo que distingue a este repositorio de cualquier tutorial de lista de tareas es
que **cada comportamiento observable se puede rastrear hasta un requisito
escrito**. Los specs no documentan el código después del hecho: lo preceden, y
las divergencias entre ambos son defectos de primera clase.

Por eso el corpus de `openspec/` —incluido el archivo histórico— es el activo
real del repositorio. La aplicación se puede reescribir; el rastro de decisiones
es lo que no se puede reponer.

## Operating Context

- Todo cambio pasa por OpenSpec: `openspec/changes/<nombre>/` con `proposal.md`,
  `design.md`, `specs/` y `tasks.md`; al terminar se archiva bajo
  `openspec/changes/archive/<fecha>-<nombre>/` y los deltas se sincronizan a
  `openspec/specs/`.
- `design.md` registra decisiones y **non-goals**, y los non-goals son
  vinculantes: cambiarlos requiere un cambio de spec, no una decisión de
  implementación.
- Las tareas incluyen pasos de verificación manual explícitos (anchos concretos,
  recargas de página). Marcarlos sin ejecutarlos rompe el ejercicio.
- Comandos: `npm run dev`, `npm run build`, `npm run lint` (oxlint).
- **Playwright** está disponible como herramienta de verificación visual para
  ejecutar las tareas de comprobación de cada cambio. No es una suite de tests:
  no hay runner, ni `npm test`, ni scripts versionados. El proyecto sigue sin
  tests automatizados, y eso es deliberado.
- El estado de los cambios no se fija aquí: `openspec list` dice cuáles están
  activos y `openspec/changes/archive/` guarda el histórico. Este archivo
  registra verdad de producto duradera, no instantáneas de avance —una línea que
  nombre el cambio del día queda obsoleta en cuanto se archiva.

## Capabilities and Constraints

**Capacidades confirmadas:** crear tareas, listarlas en orden de creación,
alternar completada/pendiente, editar el título en línea, eliminar con
confirmación explícita, persistir en `localStorage`, alternar tema claro/oscuro,
y un layout mobile-first para móvil, tablet y escritorio.

**Restricciones vinculantes** (confirmadas con el equipo; ninguna se puede
levantar sin cambiar el spec):

- **Sin backend.** Un navegador, un origen, un dispositivo. Sin cuentas, sin
  sincronización entre pestañas o equipos.
- **Accesibilidad WCAG AA.** Ver `## Accessibility & Inclusion`.
- **Solo español.** Sin internacionalización; el copy vive en los componentes.
- **OpenSpec obligatorio.** Ningún cambio de comportamiento sin propuesta, spec
  y tareas previas.

**Reglas de producto establecidas:**

- El tema carga **siempre en claro**, sin consultar la preferencia del sistema
  operativo, y **no se recuerda entre recargas**. Está registrado como non-goal
  explícito; recordarlo sería un requisito nuevo.
- Un título vacío o solo espacios se rechaza; la tarea conserva el anterior.
- Ninguna tarea se elimina sin confirmación explícita del usuario.
- Una tarea nueva nace pendiente (`done: false`).

**Glosario.** El producto dice *tarea*, *título*, *pendiente*, *completada*,
*agregar*, *editar*, *eliminar*. Los pares pendiente/completada y
agregar/editar/eliminar se usan igual en la interfaz visible, en los nombres
accesibles y en los specs. "Activa" y "Aceptar" se retiraron por inconsistentes.

## Brand Commitments

El nombre visible es **Capacitación IDR Consulting**. La voz es española,
neutra y directa: nombra la acción y su consecuencia, sin humor en momentos
destructivos ni de error.

## Evidence on Hand

- `openspec/specs/todo-list/spec.md` y `openspec/changes/archive/` — los
  requisitos y el rastro de decisiones ya acordados. Es la evidencia real del
  repositorio.
- Sin clientes, testimonios, métricas de uso, benchmarks ni datos de producción.
  No existe despliegue. Trabajos futuros no deben inventar ninguna de esas cosas
  ni presentar la app como algo en uso.

## Product Principles

1. **El spec es la fuente de verdad, no el código.** Cuando difieren, uno de los
   dos está mal y hay que decir cuál antes de tocar nada.
2. **Los non-goals son decisiones, no omisiones.** Están escritos porque alguien
   los descartó a propósito; reabrirlos es un cambio de spec.
3. **El alcance pequeño es el punto.** La app se mantiene deliberadamente
   mínima para que el proceso sea lo que se ve. Funcionalidad añadida "porque
   sería útil" diluye el ejercicio.
4. **Verificar es parte de terminar.** Una tarea con pasos de verificación
   manual no está hecha hasta ejecutarlos; marcarla antes falsea el registro.
5. **La accesibilidad es piso, no mejora.** Se construye dentro del cambio, no
   en una pasada posterior.

## Accessibility & Inclusion

WCAG 2.1 nivel AA es vinculante y debe preservarse en todo trabajo futuro:

- Contraste verificado por cálculo, no a ojo: texto ≥ 4.5:1, controles,
  iconos e indicadores de foco ≥ 3:1, en ambos temas.
- Indicador de foco visible en todo control interactivo, con `outline` real
  (sobrevive al modo de alto contraste de Windows, donde `box-shadow` no pinta).
- Recorrido completo por teclado, incluido focus trap y restauración de foco en
  el modal.
- Los cambios de la lista se anuncian por región `aria-live`.
- El color nunca es el único código: cada acción tiene además icono, posición y
  nombre accesible.
- Objetivos táctiles de 44px bajo puntero grueso, detectados por
  `pointer: coarse` y no por ancho de pantalla.
- `prefers-reduced-motion` recibe una alternativa que conserva el cambio de
  estado, no un apagado global.
