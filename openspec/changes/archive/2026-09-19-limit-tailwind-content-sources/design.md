# Design

## Context

Ver `proposal.md` - Why para la motivación.

Tailwind v4 no usa un array `content` en un archivo de configuración como v3:
la detección de contenido es automática y se ajusta desde el propio CSS con
`source(none)`, `@source` y `@source not`. El proyecto no tiene
`tailwind.config`, así que `src/index.css` es el único lugar donde esto se puede
expresar.

La heurística automática respeta `.gitignore` y omite binarios, pero **sí incluye
los markdown versionados**. Ahí está el problema: `openspec/` es documentación
de primera clase en este repositorio y varios `design.md` citan nombres de clase
al explicar decisiones (`text-gray-400`, `rounded-2xl`, `max-w-md`). Tailwind los
lee como si fueran markup.

## Goals / Non-Goals

**Goals:**

- Que el CSS generado deje de derivarse de archivos que no contienen markup.
  Nótese el límite: esto acota *qué archivos* se escanean, no *qué partes* de
  ellos. Ver "Alcance real" más abajo.
- Que la regla sea legible en el propio `index.css`, sin configuración externa.

**Non-Goals:**

- Optimizar el tamaño del bundle en general. La reducción de 1412 bytes es
  consecuencia de la corrección, no su objetivo; no se persiguen otros recortes.
- Cambiar la forma en que se escriben los markdown de `openspec/`. La
  documentación debe poder citar nombres de clase libremente; es la herramienta
  la que debe dejar de leerlos.
- Introducir `tailwind.config.js`.

## Decisions

**1. Lista blanca (`source(none)` + `@source`) en lugar de exclusión
(`@source not "../openspec"`).**

Ambas resuelven el síntoma actual. Se elige la lista blanca porque la exclusión
sólo tapa la fuente conocida de hoy: mañana `.claude/`, un `README.md` ampliado o
cualquier carpeta de documentación nueva volverían a filtrar clases, y el defecto
reaparecería en silencio. La lista blanca invierte el default: nada entra salvo
lo declarado, así que un origen nuevo de contaminación es imposible por
construcción. El costo es el riesgo simétrico descrito más abajo.

**2. Dos orígenes explícitos, no uno amplio.**

`@source "../index.html"` y `@source "./**/*.{ts,tsx}"` (relativos a
`src/index.css`). Se acotó también la extensión a `.ts`/`.tsx` en vez de un
comodín: el único markup del proyecto vive en componentes React, y restringir la
extensión evita volver a leer markdown si algún día se coloca uno dentro de
`src/`.

**3. Registrar el cambio después de implementarlo.**

Se reconoce que invierte el flujo que este repositorio enseña. El cambio se
aplicó mientras se verificaba otra tarea y se registró a pedido explícito
después. Se documenta aquí en vez de omitirlo porque el rastro de decisiones es
el activo del repositorio, y un cambio en el artefacto de salida sin propuesta
sería un hueco en ese rastro. Alternativa descartada: revertir y rehacerlo por el
flujo correcto, que produciría el mismo resultado con ruido adicional en el
historial.

**4. Sin delta de specs (`skip_specs: true`).**

No cambia ningún comportamiento observable. Se verificó en ambas direcciones:
ninguna de las 12 utilidades eliminadas aparece en el markup, y las clases que la
aplicación sí usa siguen generando regla en el CSS final. Inventar un requisito
de "higiene de build" sólo para que `openspec validate` pase habría metido en los
specs algo que no es comportamiento del sistema.

## Alcance real de la corrección

Enmendado tras la implementación. El objetivo se redactó como "que el CSS se
derive únicamente del markup que la aplicación realmente renderiza", y eso
**no es alcanzable** con el extractor de Tailwind. Queda registrado aquí porque
un objetivo que resultó imposible es información, no un error a esconder.

Tailwind extrae cadenas candidatas de cada archivo escaneado sin distinguir
markup de cualquier otro texto. `@source` elige archivos, no regiones dentro de
un archivo. En consecuencia:

- **Resuelto:** los markdown de `openspec/` dejaron de aportar utilidades (12
  eliminadas, −1412 bytes).
- **Resuelto después, por reformulación:** comentarios en español dentro de
  `src/*.tsx` seguían generando CSS. La palabra "visible" en `App.tsx` producía
  `.visible`, y "blur" en `TaskItem.tsx` producía `.blur` con toda la cadena de
  propiedades `--tw-*` de filtros: otros 1,25 kB. Se corrigió reescribiendo los
  comentarios, no con configuración. Es una mitigación frágil por naturaleza:
  nada impide que una palabra futura vuelva a coincidir con una utilidad.
- **No resuelto, estructural:** `.hidden{display:none}` (21 bytes) persiste.
  Proviene de `aria-hidden="true"` en siete elementos y de
  `document.body.style.overflow = 'hidden'` en el modal. Ambos son código
  correcto; el extractor parte los identificadores y no puede saber que
  `aria-hidden` no es una clase. Se acepta: contorsionar código correcto por 21
  bytes cuesta más de lo que ahorra.

## Risks / Trade-offs

- **[Un archivo con markup fuera de `index.html` y `src/` no será escaneado, y
  sus estilos faltarán sin error]** → Es el costo directo de la decisión 1: la
  lista blanca falla de forma visible (la pantalla se ve rota) y no silenciosa,
  que es el modo de fallo preferible. Mitigación: la consecuencia queda anotada
  en `proposal.md` - Impact, y el comentario en `index.css` explica el porqué
  junto a las directivas. Cualquier ubicación nueva de componentes debe añadir su
  `@source`.

- **[Verificar "no se perdió ninguna clase" es propenso a falsos negativos]** →
  Durante la verificación, dos comprobaciones dieron resultados falsos: un script
  que no manejaba los corchetes escapados de Tailwind (`.bg-\[var\(--bg\)\]`) y
  un `grep` cuyo patrón trataba `\(` como grupo de expresión regular en lugar de
  paréntesis literal. Ambos reportaron ausentes clases que estaban presentes.
  Mitigación: la tarea de verificación exige búsqueda literal (`grep -F`) sobre
  el CSS construido, no expresiones regulares.

- **[`source(none)` es sintaxis de Tailwind v4]** → No hay riesgo de
  compatibilidad hacia atrás porque el proyecto ya depende de v4
  (`tailwindcss ^4.3.3`) y v3 no se usa en ninguna parte.

## Migration Plan

No aplica: no hay datos, ni estado persistido, ni API. El cambio afecta
exclusivamente al artefacto de build.

Rollback: restaurar `@import "tailwindcss";` y borrar las dos directivas
`@source`. Vuelve la detección automática y con ella las utilidades fantasma;
nada más se ve afectado.
