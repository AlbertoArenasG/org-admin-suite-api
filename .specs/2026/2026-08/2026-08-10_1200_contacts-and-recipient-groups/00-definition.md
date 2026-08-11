# Definition

## Purpose

Esta iniciativa existe para diseñar una capability reutilizable de contactos y grupos de destinatarios que pueda ser consumida por múltiples módulos futuros sin duplicar captura de información ni forzar refactors cuando aparezcan nuevos canales de comunicación.

Convención importante para esta spec:

- cuando aquí se menciona `v1`, se habla de la primera versión funcional del módulo
- no se está hablando de una futura versión nueva del prefijo de la API
- extender el catálogo de canales en el futuro deberá poder ocurrir dentro del mismo prefijo actual `/v1`, sin implicar por sí mismo una migración a `/v2`

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

## Decision 06. Status de recipient-groups desde v1

### Context

Aunque hoy todavía no exista una lógica funcional compleja alrededor del ciclo de vida de los grupos, sí ya se sabe que el módulo nacerá como CRUD y que naturalmente existirá la necesidad de eliminar grupos.

Si `recipient-groups` nace sin `status`, es muy probable que más adelante haya que introducirlo mediante refactor en entidad, persistencia, queries, reglas de borrado y filtros.

### Options

1. No modelar `status` en `v1` y agregarlo después si negocio lo necesita
2. Modelar `status` desde `v1` con un conjunto mínimo de estados alineado al CRUD inicial
3. Modelar desde `v1` un catálogo amplio de estados aunque todavía no exista uso claro

### Recommendation

Opción 2.

### Implications

- `recipient-groups` nacerá con ciclo de vida explícito desde `v1`
- se evita refactor posterior en entidad, repositorios y filtros básicos
- el catálogo de estados se mantiene mínimo mientras no exista una necesidad funcional más rica

### Decision Final

Se aprueba que `recipient-groups` tenga `status` desde `v1`.

El conjunto inicial de estados será:

- `ACTIVE`
- `DELETED`

No se introducirán estados adicionales hasta que exista una necesidad funcional concreta.

### Status

approved

---

## Decision 07. Representación de contactos asociados en recipient-groups

### Context

Ya quedó decidido que `recipient-groups` consumirá `contacts` reutilizables.

Ahora hace falta decidir cómo se representará esa asociación en el modelo del grupo, especialmente pensando en una necesidad visual futura de orden personalizado sin querer introducir desde `v1` metadata adicional de orden o estructuras más complejas de las necesarias.

### Options

1. Guardar destinatarios embebidos con objetos propios dentro del grupo
2. Guardar `contactIds[]` como arreglo simple, preservando el orden recibido
3. Guardar objetos intermedios del tipo `{ contactId, position }` desde `v1`

### Recommendation

Opción 2.

### Implications

- `recipient-groups` mantendrá una relación simple y reusable con `contacts`
- el orden visual futuro podrá soportarse sin refactor del modelo principal
- el backend no tendrá que introducir lógica adicional de ordenamiento en `v1`
- el frontend podrá más adelante reordenar contactos y reenviar el arreglo ya ordenado

### Decision Final

Se aprueba que `recipient-groups` represente sus contactos asociados como `contactIds[]`.

El arreglo deberá:

- persistirse en el mismo orden en que se recibe
- devolverse en el mismo orden en que fue persistido

No se introducirá desde `v1` metadata adicional como:

- `index`
- `position`
- `sortOrder`

Tampoco se guardarán objetos embebidos del contacto dentro del grupo como diseño principal.

### Status

approved

---

## Decision 08. Tratamiento de `code` en recipient-groups

### Context

Dentro del shape mínimo del grupo ya se perfila la necesidad de tener:

- `name`
- `code`
- `description`
- `status`
- `enabledChannels[]`
- `contactIds[]`

Hace falta cerrar si `code`:

- lo captura manualmente el usuario
- lo puede editar
- o se comporta de forma equivalente a otros módulos donde el código técnico se deriva del nombre

### Options

1. `code` manual y editable
2. `code` autogenerado desde `name` y no editable
3. `code` inexistente en `v1`

### Recommendation

Opción 2.

### Implications

- el usuario de negocio no necesita capturar ni mantener manualmente un identificador técnico
- el grupo conserva un identificador estable útil para referencias internas o integraciones
- frontend podrá tratar `code` como dato derivado/no editable desde `v1`

### Decision Final

Se aprueba que `recipient-groups` tenga `code` desde `v1`.

`code` será:

- autogenerado a partir de `name`
- no editable manualmente

### Status

approved

---

## Decision 09. Reglas mínimas de `enabledChannels[]` y `contactIds[]` en recipient-groups

### Context

El shape mínimo de `recipient-groups` ya quedó prácticamente definido, pero hace falta cerrar sus reglas mínimas de validez.

En particular:

- si `enabledChannels[]` puede venir vacío
- si `contactIds[]` puede venir vacío
- y si los canales aceptados pueden salirse del catálogo vigente

### Options

1. Permitir arreglos vacíos y validar la completitud solo en capas superiores
2. Exigir al menos un canal, al menos un contacto y restringir canales al catálogo vigente
3. Exigir al menos un contacto, pero dejar canales opcionales hasta que existan más casos de uso

### Recommendation

Opción 2.

### Implications

- `recipient-groups` nacerá con reglas mínimas útiles desde el dominio
- se evita crear grupos vacíos o semánticamente incompletos
- backend deberá validar que `enabledChannels[]` solo contenga valores del catálogo vigente

### Decision Final

Se aprueba que `recipient-groups` exija desde `v1`:

- al menos un canal en `enabledChannels[]`
- al menos un contacto en `contactIds[]`

Además:

- `enabledChannels[]` solo podrá aceptar canales del catálogo vigente

### Status

approved

---

## Decision 10. Catálogo de canales publicado en v1

### Context

Ya quedó aprobado que:

- el modelo nacerá multicanal desde `v1`
- existirá catálogo de canales desde el inicio
- `enabledChannels[]` solo podrá aceptar canales del catálogo vigente

Hace falta cerrar cuál será el catálogo efectivamente publicado en la primera versión.

### Options

1. Publicar varios canales desde `v1` aunque aún no existan implementaciones reales
2. Publicar únicamente `EMAIL` en `v1` y agregar nuevos canales solo cuando exista necesidad real
3. Posponer el catálogo publicado hasta diseño técnico

### Recommendation

Opción 2.

### Implications

- el modelo sigue preparado para multicanal
- la primera versión operativa se mantiene acotada y coherente con el alcance real
- cualquier canal nuevo futuro deberá agregarse explícitamente al catálogo vigente antes de poder usarse en grupos o contactos

### Decision Final

Se aprueba que el catálogo de canales publicado en `v1` tenga inicialmente un solo canal habilitado:

- `EMAIL`

El diseño seguirá preparado para crecimiento multicanal, pero no se publicarán canales adicionales hasta que exista una necesidad funcional concreta.

### Status

approved

---

## Decision 11. Sincronización entre `user` y `contact`

### Context

Ya quedó aprobado que:

- todo usuario interno generará automáticamente su `contact`
- `contacts` soportará tanto contactos internos vinculados a `user` como contactos externos

Falta definir cómo se sincronizan ambos modelos para evitar ambigüedades sobre:

- qué campos del `user` alimentan automáticamente a su `contact`
- cuándo ocurre la sincronización
- y qué campos del `contact` no deben quedar bajo propiedad del `user`

### Options

1. Crear el `contact` inicial desde `user`, pero no volver a sincronizarlo
2. Sincronizar automáticamente creación y updates de campos compartidos obvios desde `user` hacia `contact`
3. Hacer sincronización bidireccional completa entre `user` y `contact`

### Recommendation

Opción 2.

### Implications

- se mantiene consistente la identidad base del contacto interno
- se evita que `user` se vuelva dueño de toda la metadata ampliada de `contact`
- habrá que definir claramente qué campos son sincronizables y cuáles no

### Decision Final

Se aprueba sincronización automática desde `user` hacia su `contact` vinculado:

- al crear el usuario
- y al actualizar sus datos base compartidos

La sincronización se limitará a campos compartidos obvios:

- `name`
- `lastname`
- `fullName` derivado
- `emails[]` a partir del email del usuario
- `cellPhones[]` a partir del celular del usuario
- `companyName = ICSACV` para contactos internos auto-generados

Regla específica de mapeo para listas:

- como `user` solo tiene un `email`, la sincronización actualizará el primer elemento correspondiente en `emails[]`
- como `user` solo tiene un `cellPhone`, la sincronización actualizará el primer elemento correspondiente en `cellPhones[]`

No se considerará a `user` como dueño de otros datos ampliados del `contact`, por ejemplo:

- otros teléfonos
- otros emails adicionales
- metadata externa o contextual del contacto

### Status

approved

---

## Decision 12. Distinción entre contactos vinculados a usuario y contactos externos

### Context

`contacts` deberá soportar desde `v1`:

- contactos vinculados a un `user`
- contactos externos sin `user`

Falta cerrar si esa distinción:

- se inferirá por la presencia de `userId`
- o si se agregará una bandera o campo explícito adicional

### Options

1. Inferir la distinción únicamente por `userId`
2. Agregar bandera adicional tipo `isUser`
3. Agregar desde `v1` una clasificación más amplia de origen o tipo de contacto

### Recommendation

Opción 1.

### Implications

- se evita duplicar fuentes de verdad
- el modelo `v1` se mantiene más simple
- si en el futuro se requiere una clasificación más rica, podrá agregarse con semántica de negocio más útil que una simple bandera

### Decision Final

Se aprueba que en `v1` la distinción entre:

- contacto vinculado a usuario
- contacto externo

se infiera únicamente por la presencia o ausencia de `userId`.

No se agregará una bandera adicional como `isUser` en `v1`.

### Status

approved

---

## Decision 13. Status de contacts desde v1

### Context

`contacts` será un catálogo reusable y con operaciones CRUD.

Aunque todavía no exista una lógica compleja de ciclo de vida, sí ya se sabe que:

- el módulo tendrá operaciones ordinarias de alta, consulta, actualización y eliminación
- no conviene dejar el borrado o ciclo de vida implícito

### Options

1. No modelar `status` en `v1` y agregarlo después si hace falta
2. Modelar `status` desde `v1` con un set mínimo alineado al CRUD inicial
3. Modelar desde `v1` un catálogo más amplio de estados sin necesidad funcional actual

### Recommendation

Opción 2.

### Implications

- `contacts` nacerá con ciclo de vida explícito desde el inicio
- se evita un refactor posterior sobre entidad, repositorios y filtros
- el set de estados se mantiene mínimo mientras no exista una necesidad funcional más rica

### Decision Final

Se aprueba que `contacts` tenga `status` desde `v1`.

El conjunto inicial de estados será:

- `ACTIVE`
- `DELETED`

No se introducirán estados adicionales hasta que exista una necesidad funcional concreta.

### Status

approved

---

## Decision 14. Naturaleza de los catálogos base del módulo

### Context

Dentro de esta iniciativa ya existe al menos un catálogo base explícito:

- catálogo de canales

Y más adelante podrían existir otros catálogos pequeños derivados del mismo módulo o capability.

Antes de pasar a análisis y diseño técnico conviene cerrar si esos catálogos:

- se persistirán en base de datos
- o vivirán en código como catálogos controlados por la aplicación

### Options

1. Persistir desde `v1` los catálogos base en base de datos
2. Mantener desde `v1` los catálogos base en código
3. Mezclar catálogos persistidos y en código desde el inicio

### Recommendation

Opción 2.

### Implications

- el catálogo de canales no dependerá de CRUD administrativo ni de seeds de configuración dinámica
- agregar un nuevo canal seguirá siendo una evolución controlada del código del sistema
- se evita introducir complejidad temprana de persistencia para catálogos pequeños y estables

### Decision Final

Se aprueba que los catálogos base de esta iniciativa vivan en código y no como catálogos persistidos.

En particular:

- el catálogo de canales vivirá en código

### Status

approved

---

## Decision 15. Contrato preliminar de endpoints para `contacts`, `recipient-groups` y catálogo de canales

### Context

La definición ya está lo suficientemente madura para aterrizar un primer contrato HTTP preliminar de `v1`.

Esto ayuda a validar:

- que `contacts` y `recipient-groups` estén bien separados
- que el catálogo de canales viva en una frontera transversal y no contaminada por un módulo específico
- y que ciertas reglas funcionales importantes queden visibles desde ahora, por ejemplo:
  - búsqueda ligera para selects/autocomplete
  - edición restringida de contactos vinculados a `user`

### Options

1. Posponer completamente la definición de endpoints hasta el diseño técnico
2. Registrar desde ahora un set preliminar de endpoints y sus restricciones más importantes
3. Definir solo CRUD genérico y dejar fuera endpoints auxiliares

### Recommendation

Opción 2.

### Implications

- la siguiente capa de análisis y diseño técnico ya podrá trabajar con un contrato base visible
- se reducen ambigüedades sobre el alcance real de `v1`
- algunas reglas funcionales importantes quedan ya amarradas antes de implementación

### Decision Final

Se aprueba como contrato preliminar de `v1` el siguiente set base de endpoints.

#### Contacts

- `GET /v1/contacts`
- `GET /v1/contacts/:contactId`
- `POST /v1/contacts`
- `PATCH /v1/contacts/:contactId`
- `DELETE /v1/contacts/:contactId`
- `GET /v1/contacts/search`

Reglas aprobadas desde definición:

- `GET /v1/contacts/search` será un endpoint de lookup/autocomplete y no se modelará como endpoint paginado
- backend podrá imponer un límite interno de resultados para proteger el lookup
- `PATCH /v1/contacts/:contactId` solo permitirá editar contactos no vinculados a `user`

#### Recipient Groups

- `GET /v1/recipient-groups`
- `GET /v1/recipient-groups/:groupId`
- `POST /v1/recipient-groups`
- `PATCH /v1/recipient-groups/:groupId`
- `DELETE /v1/recipient-groups/:groupId`

Por ahora no se aprueban endpoints especiales adicionales del grupo mientras el detalle ordinario pueda devolver la composición necesaria.

#### Catálogo de canales

- `GET /v1/communication-channels`

Razón semántica:

- se quiere mantener `contacts` agnóstico a funcionalidades o ámbitos de comunicación específicos
- el catálogo de canales se considera transversal y no propiedad exclusiva de `contacts` ni de `recipient-groups`

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
