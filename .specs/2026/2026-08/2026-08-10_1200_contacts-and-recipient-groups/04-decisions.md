# Decisions

## Nota

En esta spec, `v1` significa primera versión funcional del módulo, no una futura versión nueva del prefijo de la API.

Agregar canales nuevos más adelante deberá poder ocurrir dentro del mismo prefijo actual `/v1`, salvo que exista otra razón de ruptura contractual que lo justifique.

## 2026-08-10

### Decision

La iniciativa se separa en dos submódulos base:

- `contacts`
- `recipient-groups`

### Reason

El catálogo base no debe quedar amarrado únicamente al caso de uso actual de destinatarios.

`contacts` permite una semántica más amplia y reusable para agenda, directorio o referencias futuras, mientras que `recipient-groups` describe correctamente la agrupación operativa de esos contactos para flujos de notificación o envío.

### Impact

- el diseño del catálogo base se mantiene general
- los grupos quedan como capability consumidora y no como dueño de la identidad del contacto
- la iniciativa queda mejor preparada para reutilización futura

## 2026-08-10

### Decision

`v1` nace ya como modelo multicanal, aunque inicialmente solo `EMAIL` esté habilitado.

La distribución de responsabilidades queda así:

- `recipient-groups` define canales habilitados
- `contacts` guarda identidad reusable
- cada `contact` guarda sus address values por canal

### Reason

Se quiere evitar refactors estructurales cuando aparezcan nuevos canales.

Además, esta distribución permite equilibrar:

- configuración general del grupo
- reutilización del contacto
- almacenamiento correcto de los datos concretos de contacto por canal

### Impact

- existirá catálogo de canales desde `v1`
- el modelo queda listo para crecer a `WHATSAPP`, `SMS`, `PUSH` u otros canales
- el uso efectivo de canales se resuelve por intersección entre grupo y contacto

## 2026-08-10

### Decision

`recipient-groups` referenciará `contacts` reutilizables en lugar de capturar destinatarios embebidos como modelo principal.

### Reason

Se quiere evitar duplicación de captura y mantenimiento cuando un mismo contacto deba pertenecer a varios grupos.

Además, esto deja mejor preparada la UX para búsqueda, autocomplete, reutilización de usuarios internos y alta rápida de contactos externos.

### Impact

- el catálogo `contacts` se vuelve una capability base real y no un accesorio opcional
- `recipient-groups` se diseña como agrupador de referencias reutilizables
- el modelo queda preparado para relación reusable entre contactos y grupos

## 2026-08-10

### Decision

Los usuarios internos generarán automáticamente su registro correspondiente en `contacts`.

### Reason

`contacts` debe nacer como catálogo base real y consistente, no como una pieza opcional o incompleta.

Esto evita huecos donde existan usuarios internos reutilizables en negocio pero no puedan consumirse como contactos dentro del sistema.

### Impact

- `contacts` deberá soportar contactos vinculados a usuarios internos y contactos externos
- habrá que definir sincronización mínima entre `user` y `contact`
- los usuarios internos podrán reutilizarse directamente en futuros grupos y flujos
- la implementación deberá contemplar migración o seed inicial para convertir en `contacts` a los usuarios ya existentes
- los contactos auto-generados a partir de usuarios internos usarán `ICSACV` como `companyName` inicial

## 2026-08-10

### Decision

El modelo de `contacts` nacerá desde `v1` preparado para multiplicidad en datos de contacto.

### Reason

Ya existe expectativa clara de que negocio pedirá múltiples emails y múltiples teléfonos por contacto.

No se quiere aceptar un modelo rígido de valores únicos que obligue a refactors grandes después.

### Impact

- el modelo de datos y la entidad nacerán con:
  - `emails[]`
  - `phones[]`
  - `cellPhones[]`
- `companyName` formará parte del shape mínimo de `contact`
- `fullName` se tratará como derivado
- la primera UI podrá seguir siendo mínima, pero el dominio ya quedará correctamente preparado

## 2026-08-10

### Decision

`recipient-groups` tendrá `status` desde `v1`.

### Reason

Aunque hoy solo se conozca la necesidad natural de eliminar grupos, ya es suficiente para justificar un ciclo de vida explícito desde el inicio y evitar un refactor posterior.

### Impact

- el shape mínimo de `recipient-groups` ya considera `status`
- el conjunto inicial de estados será:
  - `ACTIVE`
  - `DELETED`
- no se agregarán más estados hasta que exista una necesidad funcional concreta

## 2026-08-10

### Decision

`recipient-groups` guardará sus contactos asociados como `contactIds[]`, preservando el orden recibido.

### Reason

Se quiere mantener el modelo simple desde `v1`, sin duplicar datos del contacto ni introducir metadata adicional de orden que todavía no aporta valor.

Al mismo tiempo, se quiere dejar abierta la puerta a que más adelante el frontend pueda manejar orden visual personalizado.

### Impact

- el arreglo `contactIds[]` se persistirá y devolverá en el mismo orden
- no existirá metadata adicional como `index`, `position` o `sortOrder` en `v1`
- el backend no asumirá lógica especial de ordenamiento

## 2026-08-10

### Decision

`recipient-groups` tendrá `code` desde `v1`, autogenerado a partir de `name` y no editable manualmente.

### Reason

Se quiere conservar un identificador técnico estable sin meter carga operativa innecesaria al usuario de negocio.

### Impact

- `code` forma parte del shape mínimo del grupo
- frontend podrá tratarlo como dato derivado y no editable
- backend deberá definir la misma regla de generación consistente desde `name`

## 2026-08-10

### Decision

`recipient-groups` exigirá desde `v1` al menos un canal en `enabledChannels[]` y al menos un contacto en `contactIds[]`.

### Reason

No tiene sentido permitir grupos vacíos o incompletos desde el modelo base.

### Impact

- `enabledChannels[]` no podrá venir vacío
- `contactIds[]` no podrá venir vacío
- `enabledChannels[]` solo aceptará canales del catálogo vigente

## 2026-08-11

### Decision

El catálogo de canales publicado en `v1` tendrá inicialmente un solo canal habilitado: `EMAIL`.

### Reason

Aunque el diseño ya nace multicanal, hoy el único alcance operativo real conocido es email.

### Impact

- `EMAIL` será el único canal publicable/usable en `v1`
- el modelo conserva preparación para crecimiento futuro sin publicar canales prematuros

## 2026-08-11

### Decision

Habrá sincronización automática desde `user` hacia su `contact` vinculado al crear y actualizar campos base compartidos.

### Reason

Se quiere mantener consistente la identidad base del contacto interno sin convertir a `user` en dueño de toda la metadata ampliada del contacto.

### Impact

- se sincronizarán campos base como nombre, apellido, email y celular del usuario
- `fullName` seguirá siendo derivado
- `companyName` inicial para contactos internos auto-generados seguirá siendo `ICSACV`
- como `contacts` usa listas, la sincronización actualizará el primer `email` y el primer `cellPhone` correspondientes
- metadata adicional del `contact` no quedará gobernada por `user`

## 2026-08-11

### Decision

La distinción entre contacto vinculado a usuario y contacto externo se inferirá únicamente por `userId`.

### Reason

No conviene introducir desde `v1` una bandera redundante como `isUser` si la presencia de `userId` ya resuelve la necesidad actual.

### Impact

- no habrá bandera adicional en `v1`
- `userId` será la única fuente de verdad para distinguir contactos vinculados a usuario
- una clasificación futura más rica podrá añadirse después si negocio realmente la necesita

## 2026-08-11

### Decision

`contacts` tendrá `status` desde `v1`.

### Reason

El catálogo base de contactos también nace como CRUD y no conviene dejar su ciclo de vida implícito.

### Impact

- `contacts` nacerá con `status`
- el conjunto inicial será:
  - `ACTIVE`
  - `DELETED`
- no se agregarán más estados hasta que exista necesidad funcional concreta

## 2026-08-11

### Decision

Los catálogos base de esta iniciativa vivirán en código y no como catálogos persistidos.

### Reason

No conviene introducir persistencia y administración dinámica para catálogos pequeños, estables y controlados por la propia aplicación.

### Impact

- el catálogo de canales vivirá en código
- agregar canales nuevos será una evolución controlada del sistema, no una operación administrativa runtime

## 2026-08-11

### Decision

Se aprueba un contrato preliminar de endpoints para `contacts`, `recipient-groups` y el catálogo transversal de canales.

### Reason

La definición ya permite aterrizar el alcance HTTP base de `v1` sin esperar al diseño técnico detallado.

### Impact

- el catálogo de canales se expondrá como `GET /v1/communication-channels`
- `GET /v1/contacts/search` será lookup no paginado, con límite interno controlado por backend
- `PATCH /v1/contacts/:contactId` solo permitirá editar contactos no vinculados a `user`
- `contacts` y `recipient-groups` ya quedan con su CRUD base visible desde definición
