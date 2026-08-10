# Definition

## Purpose

Esta iniciativa existe para diseñar una capability reutilizable de contactos y grupos de destinatarios que pueda ser consumida por múltiples módulos futuros sin duplicar captura de información ni forzar refactors cuando aparezcan nuevos canales de comunicación.

Regla de trabajo:

- no arrancar implementación estructural mientras existan decisiones críticas en estado `pending`
- tu tomas la decisión final
- aquí solo se registran contexto, opciones, recomendación e impacto

## Overall Status

- Initiative: `contacts-and-recipient-groups`
- Definition status: `in_progress`
- Implementation ready: `no`

---

## Decision 01. Nomenclatura y frontera de los dos submódulos base

### Context

El problema ya no es solo agrupar correos para notificaciones.

Lo que viene es una capability reutilizable donde:

- varios módulos futuros necesitarán reutilizar personas o contactos configurables
- esos contactos podrán ser usuarios internos de la aplicación o contactos externos
- más adelante ese mismo catálogo podría servir no solo para destinatarios, sino también como agenda, directorio o libreta de contactos reutilizable
- además existirá una necesidad operativa de agrupar esos contactos para usarlos en ciertos flujos de envío o notificación

Si todo se modela únicamente como `recipient-groups`, el catálogo base queda demasiado atado a un solo caso de uso y pierde valor para otros escenarios futuros.

### Options

1. Llamar `recipients` al catálogo base y `recipient-groups` al módulo agrupador
2. Llamar `contacts` al catálogo base y `recipient-groups` al módulo agrupador
3. Diseñar un único módulo de `recipient-groups` con destinatarios embebidos sin catálogo base reutilizable

### Recommendation

Opción 2.

`contacts` deja el catálogo base con una semántica más amplia y reusable.

`recipient-groups` sigue siendo un nombre correcto para el segundo submódulo porque su propósito sí está ligado a agrupar contactos para usarlos como destinatarios en ciertos flujos operativos.

### Implications

- `contacts` se diseña como catálogo general y reusable
- `recipient-groups` se diseña como módulo consumidor de `contacts`
- se evita amarrar todo el modelo base al único caso de uso actual de notificaciones
- más adelante `contacts` podrá reutilizarse en agenda, directorio o referencias externas sin renombrar el dominio

### Decision Final

Se aprueba separar la iniciativa en dos submódulos:

- `contacts` como catálogo base general y reutilizable
- `recipient-groups` como módulo agrupador que consume `contacts`

`contacts` no se modelará como una capability exclusiva de destinatarios.

Su diseño deberá dejar abierta la puerta a otros usos futuros del catálogo, como agenda o directorio de contactos.

### Status

approved

---

## Decision 02. Modelo multicanal desde v1

### Context

Hoy el único canal operativo previsto es `EMAIL`, pero ya existe una expectativa razonable de que más adelante aparezcan otros como `WHATSAPP`, `SMS` o notificaciones push.

La intención no es construir hoy adaptadores ni infraestructura real para esos canales futuros, pero sí dejar el modelo listo para agregarlos sin refactor estructural.

También hay que decidir si los canales viven:

- solo en el grupo
- solo en el contacto
- o en ambos niveles con responsabilidades distintas

### Options

1. Diseñar `v1` exclusivamente para email y posponer cualquier estructura multicanal
2. Diseñar `v1` ya como modelo multicanal, con catálogo de canales desde el inicio, aunque solo `EMAIL` esté habilitado
3. Diseñar grupos monocal y abrir una segunda iniciativa futura para generalizar canales

### Recommendation

Opción 2.

### Implications

- desde `v1` existirá noción de catálogo o listado de canales
- hoy solo `EMAIL` estará habilitado operativamente
- `recipient-groups` definirá qué canales están habilitados para cada grupo
- `contacts` concentrará la identidad reusable del contacto
- cada `contact` guardará sus address values por canal
- el uso efectivo deberá resolverse como intersección entre canales habilitados del grupo y canales disponibles en el contacto

### Decision Final

Se aprueba que `v1` nazca ya como modelo multicanal.

Desde el inicio existirá catálogo de canales, aunque por ahora el único canal habilitado operativamente sea `EMAIL`.

La distribución de responsabilidades queda así:

- `recipient-groups` define los canales habilitados del grupo
- `contacts` guarda la identidad reusable del contacto
- cada `contact` guarda sus address values por canal

El uso efectivo de un contacto dentro de un grupo se resolverá por la intersección entre:

- canales habilitados del grupo
- canales disponibles en el contacto

### Status

approved

---

## Decision 03. Reutilización de contactos contra destinatarios embebidos

### Context

Ya existe una preocupación operativa válida:

- un mismo contacto externo podría pertenecer a varios grupos
- un usuario de negocio notará rápido la fricción si tiene que volver a capturar a la misma persona dentro de múltiples grupos
- además se quiere soportar sugerencias o asociación con usuarios internos cuando ya existan en la plataforma

Esto obliga a decidir si los grupos:

- embeben destinatarios propios
- o referencian entidades reutilizables del catálogo `contacts`

### Options

1. Embebidos por grupo, sin catálogo reusable
2. Catálogo reusable de `contacts` y grupos referenciando contactos
3. Modelo híbrido con contactos reutilizables y excepciones embebidas desde `v1`

### Recommendation

Opción 2.

### Implications

- probablemente existirá relación muchos-a-muchos entre `contacts` y `recipient-groups`
- la UX podrá evolucionar hacia autocomplete, búsqueda y alta rápida de contactos externos
- se evita duplicación de captura y mantenimiento

### Decision Final

Se aprueba que `recipient-groups` consuma `contacts` reutilizables como modelo base.

Los grupos no serán dueños primarios de la identidad del destinatario ni capturarán destinatarios embebidos como diseño principal.

La relación objetivo entre `contacts` y `recipient-groups` se asume desde ahora como reusable y preparada para que un mismo contacto pueda pertenecer a múltiples grupos.

### Status

approved

---

## Decision 04. Relación entre usuarios internos y contacts

### Context

`contacts` será un catálogo base reutilizable y no una pieza opcional del sistema.

Ya quedó aprobado que un `contact` puede representar:

- un usuario interno de la aplicación
- un contacto externo no ligado a un usuario interno

Esto obliga a decidir si los usuarios internos:

- generan automáticamente su registro correspondiente en `contacts`
- o si la relación queda opcional/manual

### Options

1. No generar `contact` automáticamente para usuarios internos
2. Generar automáticamente un `contact` correspondiente cada vez que se crea un usuario interno
3. Generar `contact` solo para ciertos tipos de usuario o bajo acciones manuales

### Recommendation

Opción 2.

### Implications

- `contacts` se vuelve un catálogo base real y consistente
- los usuarios internos podrán aparecer desde el inicio como contactos reutilizables
- habrá que definir sincronización mínima entre `user` y `contact` en campos compartidos
- el diseño deberá distinguir claramente contactos vinculados a `user` y contactos externos
- habrá que contemplar migración o seed inicial para materializar como `contacts` a los usuarios que ya existen en la aplicación

### Decision Final

Se aprueba que un usuario interno genere automáticamente su registro correspondiente en `contacts`.

`contacts` deberá soportar desde `v1` tanto contactos vinculados a usuarios internos como contactos externos independientes.

Para los usuarios que ya existen antes de introducir este módulo, la iniciativa deberá contemplar una estrategia explícita de migración o seed que genere sus registros correspondientes en `contacts`.

El `companyName` inicial de los contactos auto-generados a partir de usuarios internos existentes o nuevos será `ICSACV`.

### Status

approved

---

## Decision 05. Shape mínimo de contacts en v1 y preparación para crecimiento

### Context

Ya existe una expectativa fuerte de que el catálogo de contactos crecerá con el tiempo.

No solo se quiere soportar hoy emails y teléfonos para destinatarios, sino evitar refactors grandes cuando negocio pida:

- múltiples emails por contacto
- múltiples teléfonos por contacto
- múltiples celulares por contacto
- crecimiento del catálogo hacia agenda, directorio o libreta de contactos

También ya se identificó que un contacto debería poder guardar información general como:

- `name`
- `lastname`
- `companyName`

La pregunta no es solo qué captura la primera UI, sino cómo debe nacer el modelo de datos desde `v1`.

### Options

1. Modelo simple con campos únicos (`email`, `phone`, `cellPhone`) y refactor futuro cuando crezca
2. Modelo preparado desde `v1` con colecciones de datos de contacto (`emails[]`, `phones[]`, `cellPhones[]`), aunque la primera UI capture un set mínimo
3. Modelo completamente genérico de contact points sin distinguir tipo de dato desde `v1`

### Recommendation

Opción 2.

### Implications

- el modelo de datos de `contacts` nacerá preparado para multiplicidad
- la primera UI podrá seguir siendo simple sin forzar un modelo rígido
- `fullName` deberá tratarse como dato derivado, no como input independiente
- más adelante se podrá crecer sin migraciones conceptuales grandes hacia más de un email o teléfono por contacto

### Decision Final

Se aprueba que `contacts` nazca desde `v1` con modelo preparado para multiplicidad en datos de contacto.

A nivel de modelo de datos y entidad, los datos de contacto relevantes se representarán desde ahora como colecciones:

- `emails[]`
- `phones[]`
- `cellPhones[]`

El shape mínimo de `contact` en `v1` deberá contemplar al menos:

- `name`
- `lastname`
- `companyName`
- `emails[]`
- `phones[]`
- `cellPhones[]`

`fullName` se tratará como dato derivado.

La primera interfaz podrá capturar una versión mínima de estos datos, pero el modelo de dominio no nacerá limitado a valores únicos.

### Status

approved
