---
name: Capacitación IDR Consulting
description: Lista de tareas de tres temas, donde el color es luz en la oscuridad, tinta en el papel y nada en la impresión.
colors:
  bg: "#f6f7fb"
  surface: "#ffffff"
  border: "#c8cad3"
  text: "#12151c"
  text-muted: "#626b7a"
  cyan: "#0a7366"
  violet: "#6650e2"
  magenta: "#c1008d"
  bg-dark: "#090c12"
  surface-dark: "#10141d"
  border-dark: "#2e333d"
  text-dark: "#e9edf6"
  text-muted-dark: "#7c869b"
  cyan-dark: "#4ff3d9"
  violet-dark: "#9a8bff"
  magenta-dark: "#ff59db"
  paper: "#ffffff"
  ink: "#000000"
  ink-muted: "#444444"
  border-print: "#999999"
typography:
  display:
    fontFamily: "Space Grotesk, Inter, ui-sans-serif, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
rounded:
  md: "0.5rem"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.375rem"
  md: "0.75rem"
  lg: "1.5rem"
  xl: "2rem"
  shell: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.cyan}"
    textColor: "{colors.bg}"
    rounded: "{rounded.full}"
    size: "2.5rem"
  button-danger:
    backgroundColor: "{colors.magenta}"
    textColor: "{colors.bg}"
    rounded: "{rounded.full}"
    padding: "0.5rem 1rem"
  button-ghost:
    textColor: "{colors.text-muted}"
    rounded: "{rounded.full}"
    padding: "0.5rem 1rem"
  button-icon:
    textColor: "{colors.text-muted}"
    rounded: "{rounded.full}"
    padding: "0.375rem"
  button-icon-active:
    textColor: "{colors.cyan}"
    rounded: "{rounded.full}"
    padding: "0.375rem"
  input-underline:
    textColor: "{colors.text}"
    typography: "{typography.body}"
    padding: "0.5rem 0.125rem"
  surface-dialog:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "1.5rem"
    width: "24rem"
---

# Design System: Capacitación IDR Consulting

## Overview

**Creative North Star: "Tinta y Neón"**

Este sistema tiene tres temas, y **los dos de pantalla obedecen a físicas distintas**. En el tema oscuro el color es luz: tres acentos de neón encendidos sobre un negro azulado, donde el cian encabeza la jerarquía por puro brillo. En el tema claro el color es tinta: los mismos tres acentos bajan a una banda estrecha de lightness y el cian vuelve a encabezar, ahora por densidad, siendo el más oscuro de los tres. La jerarquía es idéntica; sólo cambia el medio que la expresa. El tercero, impresión, no compite: renuncia al color entero y se queda con la estructura.

Esa dualidad no es decorativa, es la lección central del sistema. El tema claro nació mal —derivado del oscuro restando brillo— y eso dejó el botón primario a 1.96:1. Componerlo desde cero, para su propio medio, fue lo que lo arregló. Cualquier trabajo futuro que trate un tema como una variante mecánica del otro repetirá el mismo defecto.

La superficie es austera y sin cajas: separadores de un píxel en lugar de tarjetas, una sola columna estrecha, y una cara de display reservada exclusivamente para el título de la página. Toda la expresión vive en tres acentos aplicados con disciplina semántica estricta y en un halo de color que sólo aparece cuando el usuario toca algo. Nada aquí se adorna; la personalidad está en la precisión.

**Key Characteristics:**
- Tres temas; los dos de pantalla compuestos por separado, nunca invertidos uno del otro
- Tres acentos con significado fijo, jamás intercambiables
- Sin tarjetas: la estructura la llevan hairlines de 1px
- Plano en reposo; el color sólo se enciende como respuesta a un estado
- Todo valor de contraste está medido, no estimado

## Colors

Una base de neutrales fríos —nunca grises puros, siempre con un sesgo azulado— sobre la que se aplican exactamente tres acentos, cada uno con un único significado en toda la aplicación.

### Primary
- **Verde Señal** (`#0a7366` claro / `#4ff3d9` oscuro): crear y completar. Es el relleno del botón de agregar, el color del check de una tarea terminada, el subrayado del campo enfocado y la barra de acento que marca la fila activa. Es el acento con más presencia del sistema: en oscuro por ser el más brillante (L 0.87 contra 0.70 y 0.73), en claro por ser el más oscuro (L 0.50 contra 0.54). En ambos casos, el más pesado.

### Secondary
- **Violeta Trabajo** (`#6650e2` claro / `#9a8bff` oscuro): editar y cambiar de tema. Acciones que modifican sin destruir. También tiñe el ícono del estado vacío y el subrayado del campo de edición en línea.

### Tertiary
- **Magenta Corte** (`#c1008d` claro / `#ff59db` oscuro): eliminar y error. El relleno del botón destructivo, el hover de la papelera, y el color de todo mensaje de validación. Que borrar y equivocarse compartan color es deliberado: son la misma familia semántica.

### Neutral
- **Lienzo** (`#f6f7fb` claro / `#090c12` oscuro): el fondo de la página. El valor oscuro es un negro azulado, no neutro.
- **Superficie** (`#ffffff` claro / `#10141d` oscuro): elevación para el diálogo. Es la única superficie elevada del sistema.
- **Hairline** (`#c8cad3` claro / `#2e333d` oscuro): separadores de fila, el divisor del encabezado y el borde punteado del estado vacío. Calibrado a ~1.5:1 contra el lienzo: presente sin convertirse en una regla pesada.
- **Texto** (`#12151c` claro / `#e9edf6` oscuro) y **Texto atenuado** (`#626b7a` claro / `#7c869b` oscuro): jerarquía de lectura. El atenuado también marca una tarea completada, junto al tachado.

### Impresión

El sistema tiene un **tercer tema**. En papel no hay lienzo oscuro, ni acentos, ni
estados: el bloque `@media print` remapea los mismos roles semánticos a tinta
sobre papel y oculta todo lo interactivo.

- **Papel** (`#ffffff`): lienzo y superficie a la vez. En papel no existe la elevación.
- **Tinta** (`#000000`): texto principal, 21:1.
- **Tinta atenuada** (`#444444`): texto secundario, 9.74:1.
- **Hairline impreso** (`#999999`): separadores de fila, 2.85:1 — más marcado que en
  pantalla porque el papel no tiene el contraste de un monitor retroiluminado.

Los tres acentos desaparecen por completo. Una tarea completada sigue
distinguiéndose por el tachado, que nunca dependió del color; es lo que hace que
ocultar el check no pierda información.

### Named Rules

**La Regla del Significado Fijo.** Cada acento tiene un único trabajo en toda la aplicación: cian crea y completa, violeta edita, magenta destruye. Un control nuevo no elige color por estética; lo hereda de lo que hace. No existe un cuarto acento.

**La Regla de la Doble Composición.** Ningún tema se deriva del otro. Un valor claro nuevo se compone contra `#f6f7fb` y se mide; un valor oscuro se compone contra `#090c12` y se mide. Restar o sumar brillo al gemelo es el error que este sistema ya cometió una vez.

**La Regla del Color Nunca Solo.** El color jamás es el único portador de significado. Cada acción tiene además ícono, posición fija en la fila y nombre accesible; una tarea completada lleva tachado además del cian. Esto es lo que hace aceptable que los tres acentos se separen poco bajo dicromacia.

**La Regla de los Tres Temas.** Claro, oscuro e impresión son tres temas, no dos
más una hoja de estilos. Un rol de color nuevo tiene que tener respuesta en los
tres, y la de impresión casi siempre es "desaparece o se vuelve tinta".

**La Regla del Número Medido.** Todo par de color se verifica por cálculo antes de entrar: texto ≥ 4.5:1, controles e indicadores ≥ 3:1, en los tres temas. El sistema actual pasa los 38 pares y además las tres simulaciones de dicromacia (peor caso 4.51:1). A ojo no cuenta.

## Typography

**Display Font:** Space Grotesk (con Inter y `ui-sans-serif` como respaldo)
**Body Font:** Inter (con `ui-sans-serif`, `system-ui` y `-apple-system` como respaldo)

**Character:** Space Grotesk aporta un carácter geométrico y ligeramente técnico que aparece una sola vez por pantalla; Inter hace todo lo demás sin llamar la atención. El contraste entre ambas es de rol, no de tamaño: la cara de display no se usa más grande, se usa más rara.

### Hierarchy
- **Display** (Space Grotesk, 600, `1.875rem` → `2.25rem` desde 640px, tracking `-0.025em`): exclusivamente el `h1` de la página.
- **Body** (Inter, 400, `1rem`, line-height 1.5): títulos de tarea, texto del diálogo y ambos campos de entrada. El mínimo de 16px es obligatorio en los inputs: por debajo, Safari en iOS fuerza zoom al enfocar y rompe el layout.
- **Label** (Inter, 400, `0.875rem`): el contador del encabezado, los mensajes de error, el contador de caracteres y el título de la tarea dentro del diálogo.

### Named Rules

**La Regla de la Voz Única.** Space Grotesk aparece una vez por pantalla, en el `h1`. Si un elemento nuevo pide la cara de display, casi siempre lo que pide en realidad es más peso o más espacio.

**La Regla de los 16 Píxeles.** Ningún campo de entrada baja de `1rem`. No es una preferencia tipográfica: es una restricción de iOS.

## Layout

Una sola columna centrada de `36rem` (`max-w-xl`) como máximo, sobre un shell que posee todo su padding para poder respetar los recortes de pantalla. El padding lateral es `max(1rem, env(safe-area-inset-left/right))` y sube a `max(1.5rem, ...)` desde `40rem`; el vertical va de `2.5rem` a `3.5rem` en el mismo punto, y baja a `1.5rem` cuando la altura no supera `34rem` en horizontal —un teléfono acostado no puede gastar un cuarto de su alto en margen.

El único breakpoint de ancho es `40rem` (640px). El sistema prefiere adaptarse por **capacidad del dispositivo** antes que por tamaño: los objetivos táctiles crecen bajo `pointer: coarse`, no bajo un ancho de pantalla, porque hay portátiles con pantalla táctil y tabletas con teclado.

El ritmo vertical se apoya en pocos pasos: `0.75rem` (`gap-3`) para agrupar controles dentro de una fila, `2rem` (`mt-8`) para separar las zonas mayores del documento, y `1.5rem`/`2rem` dentro de contenedores. Las filas de tarea usan `0.75rem` de padding vertical y `0.75rem` de sangría izquierda, que es donde vive la barra de acento.

### Named Rules

**La Regla del Puntero, No del Ancho.** Un objetivo táctil crece porque el dispositivo se toca con el dedo (`@media (pointer: coarse)` → mínimo `2.75rem`), nunca porque la pantalla sea estrecha. Con ratón la fila conserva su densidad.

**La Regla de la Columna Única.** No hay rejilla multicolumna en ningún tamaño. En escritorio el espacio sobrante es margen, no una segunda columna.

## Elevation & Depth

El sistema es **plano en reposo**. No hay sombras ambientales, ni capas tonales, ni bordes que finjan relieve: la estructura la llevan hairlines de 1px y el espacio en blanco. La profundidad aparece únicamente como respuesta a algo que el usuario hace.

Hay exactamente dos vocabularios de profundidad, y no se mezclan:

### Shadow Vocabulary
- **Halo de estado** (`box-shadow: 0 0 12px var(--*-glow)` en controles de fila, `0 0 14px` en el toggle de tema, `0 0 18px` en los botones de relleno): un halo de color sin desplazamiento, del mismo acento que el control. Aparece sólo en `:hover`. Los tokens `--*-glow` son el acento a `0.28` de alfa en claro y `0.35` en oscuro.
- **Elevación real** (`box-shadow: 0 18px 48px -12px`): exclusiva del diálogo. Tiene desplazamiento y desenfoque de verdad, porque es la única superficie que flota sobre el resto.

En impresión no hay profundidad de ningún tipo: ni halo ni sombra de diálogo. El
shell pierde todo su padding y la página queda al ancho del papel.

### Named Rules

**La Regla del Presupuesto de 300 ms.** Ninguna animación de interfaz supera los
300ms, y la entrada de una tarea vive en 200ms porque crear es la acción más
repetida de la aplicación. Lo que se ve muchas veces al día se acorta, no se
adorna. Sólo `opacity` y `transform` componen: el halo se anima por opacidad
sobre un pseudo-elemento, nunca como `box-shadow`.

**La Regla del Plano en Reposo.** Ninguna superficie lleva sombra en su estado normal. El halo es una respuesta, no una textura. Si un elemento nuevo quiere brillar sin que nadie lo haya tocado, la respuesta es no.

**La Regla del Foco Nunca Brilla.** El halo es para hover; el foco usa `outline` sólido de 2px con un token opaco. Esto no es una preferencia estética: el halo translúcido medía 1.24:1 y era invisible, y `box-shadow` no se pinta en el modo de alto contraste de Windows, donde `outline` sí. Hover sugiere, foco tiene que verse.

## Shapes

Dos radios, sin escala intermedia. **Píldora completa** (`9999px`) para todo lo que se pulsa: los seis controles interactivos, sin excepción. **Curva suave** (`0.5rem`) para lo que contiene: el diálogo, el estado vacío y el aviso de almacenamiento.

Los campos de entrada no tienen forma propia: son una línea. Un borde inferior de 1px en reposo que pasa a 2px y al color del acento al enfocar, sin caja, sin fondo, sin radio. Es el gesto más característico del sistema.

El estado vacío es el único lugar con borde punteado, y ese punteado es lo que lo distingue de una lista real.

### Named Rules

**La Regla de las Dos Formas.** Redondo si se pulsa, `0.5rem` si contiene, línea si se escribe. No hay una tercera opción; un radio nuevo es una señal de que el elemento no encontró su categoría.

**La Regla de la Ausencia de Tarjeta.** Las tareas no viven en tarjetas. Una fila se separa de la siguiente por un hairline y nada más. Envolver filas en contenedores destruiría la densidad que hace escaneable la lista.

## Components

### Buttons
- **Shape:** píldora completa (`9999px`) en los cuatro tipos.
- **Primario (agregar tarea):** círculo de `2.5rem` con relleno Verde Señal e ícono del color del lienzo. Crece a `2.75rem` bajo puntero grueso.
- **Destructivo (eliminar):** relleno Magenta Corte, texto del color del lienzo, `0.5rem 1rem` de padding.
- **Fantasma (cancelar):** sin relleno ni borde, texto atenuado que vira a Violeta Trabajo en hover.
- **De ícono (completar / editar / eliminar):** `0.375rem` de padding sobre un ícono de 18px — 30px de tinta, que crece a un área de `2.75rem` bajo puntero grueso sin que el ícono cambie de tamaño. En reposo son texto atenuado; en hover viran a su acento. El de completar es el único con estado persistente: Verde Señal cuando la tarea está hecha.
- **Hover / Focus:** hover cambia el color y enciende el halo; foco dibuja un `outline` sólido de 2px con `outline-offset: 2px` del acento correspondiente, y `Highlight` bajo `forced-colors`. Transición por defecto de 150ms.

### Cards / Containers
- **El diálogo** es el único contenedor elevado: `24rem` de ancho máximo, `0.5rem` de radio, fondo Superficie, borde hairline de 1px, `1.5rem` de padding y la sombra de elevación real. Se presenta sobre un velo `rgba(18,21,28,0.55)` en claro y `rgba(4,6,10,0.72)` en oscuro.
- **El estado vacío** comparte el radio pero invierte el tratamiento: sin relleno, borde punteado, contenido centrado y `1.5rem 2.5rem` de padding.
- **El aviso de almacenamiento** usa el mismo radio con un borde de 1px en Magenta Corte.

### Inputs / Fields
- **Estilo:** sin caja. Fondo transparente, sólo `border-bottom` de 1px en Hairline, `0.5rem 0.125rem` de padding, texto de `1rem`.
- **Foco:** el borde pasa a Verde Señal y se le suma `box-shadow: 0 1px 0 0` del mismo color, dando un subrayado opaco de 2px. El `outline` queda transparente y sólo se materializa bajo `forced-colors`.
- **Edición en línea:** misma anatomía pero con borde de 2px en Violeta Trabajo desde el inicio, porque el campo sólo existe mientras está enfocado.
- **Error:** el borde vira a Magenta Corte vía `aria-invalid`, y el mensaje aparece debajo en el mismo color.

### Fila de tarea
El componente que define el sistema. Una fila es un `flex` con `0.75rem` de separación, `0.75rem` de padding vertical, `0.75rem` de sangría izquierda y un hairline inferior. El título ocupa todo el espacio libre y envuelve con `overflow-wrap: anywhere`; los tres controles se mantienen a la derecha en orden fijo: completar, editar, eliminar.

En el borde izquierdo, una barra de `2px` en Verde Señal permanece invisible hasta que la fila recibe hover o contiene el foco, momento en el que aparece con una transición de opacidad de 200ms. Es el único indicador de "estás aquí" de toda la lista.

Una tarea recién creada entra con `task-in`: 200ms de `cubic-bezier(0.23, 1, 0.32, 1)` que combinan un fundido y un desplazamiento de 6px **hacia arriba**, porque la tarea se añade al final de la lista y tiene que llegar desde el lado que ocupa, no desde la fila anterior. El destello del halo va aparte, en `task-glow` sobre un `::after` con el `box-shadow` fijo y la opacidad animada: animar `box-shadow` obliga a repintar en cada fotograma. Bajo `prefers-reduced-motion` la entrada se sustituye por un fundido de opacidad de 200ms —no por `none`— para conservar la señal de aparición y el evento que limpia el estado, y el halo no se anima.

## Do's and Don'ts

### Do:
- **Do** componer cada tema contra su propio lienzo y medir el resultado. Texto ≥ 4.5:1, controles e indicadores ≥ 3:1, en claro, en oscuro y en papel.
- **Do** heredar el color de un control nuevo de lo que hace: cian crea o completa, violeta edita, magenta destruye.
- **Do** usar `outline` sólido para el foco, nunca `box-shadow`. Sobrevive al modo de alto contraste de Windows, donde el halo simplemente no se pinta.
- **Do** hacer crecer los objetivos táctiles con `@media (pointer: coarse)` hasta `2.75rem`, sin cambiar el tamaño del ícono.
- **Do** dar a `prefers-reduced-motion` una alternativa que conserve el cambio de estado, no un apagado global.
- **Do** acompañar todo color con ícono, posición o texto. El color nunca informa solo.
- **Do** dar a cada rol de color una respuesta en los tres temas. En impresión, casi siempre es desaparecer o volverse tinta.

### Don't:
- **Don't** derivar un tema del otro sumando o restando brillo. Es el defecto que dejó el botón primario a 1.96:1.
- **Don't** poner halo en reposo. El glow es una respuesta a hover, no una textura del mundo.
- **Don't** introducir un cuarto acento. Si un concepto nuevo pide color propio, casi siempre pertenece a una de las tres familias existentes.
- **Don't** envolver las filas de tarea en tarjetas ni anidar contenedores. El hairline es toda la estructura que la lista necesita.
- **Don't** usar Space Grotesk fuera del `h1`.
- **Don't** bajar ningún campo de entrada de `1rem`: iOS fuerza zoom al enfocar.
- **Don't** escribir colores literales en los componentes. Todo pasa por token; hoy no queda ni uno suelto.
- **Don't** redeclarar en `body` lo que el remapeo de tokens ya resuelve. El tema de impresión cambia los tokens; el resto se hereda solo.
- **Don't** animar `box-shadow`, `width`, `height` ni propiedades de posición. Sólo `opacity` y `transform` componen.
- **Don't** añadir un radio nuevo. Píldora si se pulsa, `0.5rem` si contiene, línea si se escribe.
