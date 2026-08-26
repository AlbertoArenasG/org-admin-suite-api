# Customer User Relationship Management

## Status

- Definition: completed
- Technical design: completed
- Implementation: pending
- Validation: pending

## Objective

Permitir administrar relaciones existentes entre Clientes y usuarios `USER` desde el contexto de un cliente, sin requerir permisos del modulo `USERS`.

## Context

La spec `user-customer-relationship` ya implemento la entidad pivote, transacciones, validacion y sincronizacion de contactos. Actualmente esas relaciones solo se administran mediante `PATCH /v1/users/:userId`, protegido por `USERS/UPDATE`.

Un actor que administra Clientes puede necesitar consultar y modificar las relaciones de un cliente sin tener acceso administrativo general a Usuarios. A la inversa, quien administra Usuarios debe conservar el flujo existente y el catalogo auxiliar de clientes.

## Architectural Constraints

- No crear un nuevo `SystemRole`.
- No duplicar relaciones, validaciones ni sincronizacion de contactos.
- Los nuevos endpoints deben reutilizar los servicios transaccionales y semanticos existentes.
- La autorizacion debe seguir `module + operation` para auxiliares locales; no se usaran capabilities auxiliares para esta superficie contextual.
- Los controllers y casos de uso principales deben permanecer como orquestadores delgados.

---

## Decision 01. Frontera contextual y autorizacion

### Context

Se requiere consultar, asociar y desasociar usuarios desde un cliente, incluso cuando el actor no posee `USERS/READ` o `USERS/UPDATE`.

### Options

1. Reutilizar `GET/PATCH /v1/users` y exigir permisos de Usuarios.
2. Crear endpoints anidados bajo Clientes y protegerlos con permisos directos de Clientes.
3. Crear capabilities auxiliares derivadas para cada endpoint contextual.

### Recommendation

Opcion 2.

La relacion se administra en el contexto de un cliente. Son endpoints auxiliares locales del modulo `CUSTOMERS`, no lookups reutilizables entre modulos; por tanto deben usar la frontera funcional existente.

### Decision Final

Se aprueba exponer:

- `GET /v1/customers/:customerId/users` con `CUSTOMERS/READ`
- `GET /v1/customers/:customerId/available-users` con `CUSTOMERS/UPDATE`
- `POST /v1/customers/:customerId/users` con `CUSTOMERS/UPDATE`
- `DELETE /v1/customers/:customerId/users/:userId` con `CUSTOMERS/UPDATE`

Los endpoints no requieren `USERS/READ` ni `USERS/UPDATE`.

El flujo existente de Usuarios se conserva sin cambios funcionales:

- `PATCH /v1/users/:userId` con `USERS/UPDATE`
- `GET /v1/customers/options` mediante capability auxiliar derivada de `USERS`

Ambas fronteras deben converger en los mismos servicios de relaciones y sincronizacion de contactos.

### Status

approved

---

## Decision 02. Elegibilidad y visibilidad de usuarios

### Context

Los endpoints necesitan distinguir entre usuarios ya relacionados y candidatos disponibles. La relacion solo admite `USER`, pero debe definirse el tratamiento de estados inactivos y eliminados.

### Options

1. Mostrar relaciones vigentes de usuarios no eliminados; permitir asociar solo usuarios `USER` activos y no relacionados.
2. Mostrar y asociar cualquier usuario `USER` no eliminado, incluso inactivo.
3. Mostrar y asociar usuarios de cualquier system role.

### Recommendation

Opcion 1.

Un usuario inactivo puede conservar su historial y relacion visible, pero no debe convertirse en una nueva asociacion operativa. La eliminacion logica conserva datos historicos sin aparecer en una administracion activa.

### Decision Final

Se aprueba la opcion 1.

- `GET /v1/customers/:customerId/users` muestra relaciones de usuarios `USER` no eliminados, incluidos los inactivos que ya forman parte del historial del cliente.
- `GET /v1/customers/:customerId/available-users` devuelve solo usuarios `USER` activos, no eliminados y sin relaciones con ningun Cliente.
- La asociacion contextual acepta usuarios `USER` activos y no eliminados aunque ya tengan relaciones con otros Clientes; solo rechaza una relacion duplicada con el Cliente de la ruta.
- No se aceptan `ADMIN` ni `MASTER_ADMIN`.

### Status

approved

---

## Decision 03. Semantica de asociacion y desasociacion

### Context

Un usuario puede pertenecer a varios clientes. La nueva frontera de Clientes debe modificar una relacion puntual sin reemplazar de forma ciega el conjunto completo que tambien puede administrarse desde Usuarios.

### Options

1. `POST` y `DELETE` puntuales para agregar o quitar una sola relacion.
2. `PUT` con el conjunto completo de usuarios del cliente.
3. Reutilizar un `PATCH` de cliente que reciba el conjunto completo.

### Recommendation

Opcion 1.

Evita que una operacion contextual sobrescriba relaciones de otros clientes, reduce conflictos y se alinea con la UI de agregar o quitar usuarios uno a uno.

### Decision Final

Se aprueba la opcion 1.

- `POST /v1/customers/:customerId/users` recibe un usuario elegible y agrega solo esa relacion.
- `DELETE /v1/customers/:customerId/users/:userId` elimina solo esa relacion.
- Ninguna mutacion reemplaza el conjunto completo de relaciones de un cliente.
- Ambas mutaciones reutilizan la frontera transaccional y la sincronizacion de contactos existentes.

### Status

approved

---

## Decision 04. Filtros globales del listado de Usuarios

### Context

La administracion global de Usuarios necesita responder dos preguntas distintas a la consulta contextual de un Cliente: que usuarios pertenecen a un cliente concreto y que usuarios no pertenecen a ningun cliente.

### Options

1. Eliminar los filtros globales y consultar relaciones solo desde Clientes.
2. Conservar y evolucionar los filtros como una capacidad propia de Usuarios.

### Recommendation

Opcion 2.

El modulo de Usuarios necesita una vista transversal de distribucion: staff interno sin clientes y usuarios relacionados con un cliente seleccionado. Clientes responde un contexto distinto y no sustituye esa necesidad.

### Decision Final

Se aprueba conservar y evolucionar los filtros del listado global de Usuarios:

- permanecen protegidos por `USERS/READ`
- permiten consultar usuarios relacionados con un cliente seleccionado
- incorporaran una semantica explicita para usuarios sin relacion con ningun cliente
- no se resuelven mediante endpoints anidados de Clientes ni capabilities auxiliares

Los query params exactos se definiran en el diseno tecnico despues de cerrar la frontera de los endpoints contextuales de Clientes.

### Status

approved

---

## Decision 05. Frontera del listado contextual de Clientes

### Context

El detalle de Cliente necesita una tabla paginada de usuarios relacionados. Aunque el dato pertenece al recurso Usuario, su consumo actual es exclusivamente contextual al Cliente y no equivale a una opcion reutilizable para selects.

### Options

1. Endpoint auxiliar local de Clientes con `CUSTOMERS/READ`.
2. Endpoint protegido por una capability auxiliar de Usuarios derivada para Clientes y futuros modulos.
3. Reutilizar el listado global de Usuarios.

### Recommendation

Opcion 1.

El endpoint entrega una tabla paginada administrativa para el detalle de Cliente. No existe un consumidor transversal actual y anticipar una capability para este contrato concreto mezclaria una futura necesidad de opciones con una lectura contextual distinta.

### Decision Final

Se aprueba que `GET /v1/customers/:customerId/users` sea un endpoint auxiliar local:

- usa `CUSTOMERS/READ`
- no requiere `USERS/READ`
- no usa capability auxiliar
- sirve exclusivamente al contexto administrativo de un Cliente
- no sustituye los filtros globales del modulo Usuarios

Una futura lectura compacta de opciones para usuarios asociados se decidira como contrato y capability independientes cuando tenga un consumidor concreto.

### Status

approved

---

## Decision 06. Lookup de candidatos para asociacion

### Context

El detalle de Cliente necesita paginar usuarios relacionados. La futura interfaz de asociacion necesitara encontrar candidatos sin descargar todos los usuarios activos del sistema.

### Options

1. Listado relacionado paginado y candidatos mediante busqueda acotada.
2. Ambas lecturas no paginadas.
3. Reutilizar el listado administrativo global de Usuarios.

### Recommendation

Opcion 1.

Mantiene el detalle de Cliente escalable y evita usar una lectura administrativa global o transferir listas completas para un selector.

### Decision Final

Se aprueba que `GET /v1/customers/:customerId/available-users` sea un endpoint auxiliar local:

- usa `CUSTOMERS/UPDATE`
- devuelve solo usuarios `USER` activos, no eliminados y sin relaciones con ningun Cliente
- existe para soportar la asociacion contextual
- no usa capability auxiliar

Su proposito es distinto de una futura opcion reutilizable de usuarios ya asociados a un cliente.

### Status

approved

---

## Decision 07. Capability futura de opciones por cliente

### Context

Un modulo futuro de servicios necesitara seleccionar contactos que sean usuarios asociados a un cliente. Esa necesidad requerira una lectura compacta reutilizable, distinta de la tabla paginada de relaciones y del lookup de candidatos para asociacion.

### Options

1. Crear ahora la capability y endpoint de opciones sin consumidor actual.
2. Registrar la extension prevista y crear capability, endpoint y derivaciones cuando exista el primer consumidor.

### Recommendation

Opcion 2.

Una capability sin endpoint consumidor agrega catalogo, derivaciones y seed sin valor operativo. La decision de frontera queda clara sin anticipar un contrato que todavia no tiene UI ni requisitos exactos.

### Decision Final

Se aprueba la opcion 2.

Esta spec no crea capability ni endpoint de opciones sin un consumidor configurado. Deja documentada la extension: una futura lectura compacta de usuarios asociados a un cliente sera capability auxiliar reutilizable, con contrato, derivaciones y seed definidos en la spec de su primer modulo consumidor.

### Status

approved

---

## Decision 08. Contrato de filtros globales de Usuarios

### Context

La combinacion actual `customer_id + has_customer_relationship` sirve para relacion respecto a un cliente concreto, pero no expresa usuarios sin relacion con ningun cliente. El listado global de Usuarios necesita ambas consultas sin introducir pares de parametros ambiguos.

### Options

1. Conservar el par actual y agregar otra variante booleana para usuarios sin clientes.
2. Reemplazarlo por `customer_id` para usuarios relacionados con ese cliente y un filtro explicito de usuarios sin clientes, mutuamente excluyentes.
3. Separar las consultas en endpoints nuevos fuera del listado global de Usuarios.

### Recommendation

Opcion 2.

El ID de cliente ya expresa la relacion positiva. Un filtro semantico separado para ausencia total de relaciones evita sobrecargar `has_customer_relationship` y mantiene el listado global como una sola frontera de consulta.

### Decision Final

Se aprueba la opcion 2.

`GET /v1/users` conserva su frontera `USERS/READ` y acepta filtros mutuamente excluyentes:

- `customer_id=:customerId`: devuelve usuarios relacionados con ese Cliente.
- `customer_relationship=UNASSIGNED`: devuelve usuarios sin ninguna relacion con Clientes.
- sin esos filtros: conserva el listado global normal.
- enviar ambos parametros devuelve `400 Bad Request`.

Se retira `has_customer_relationship`; no se conserva compatibilidad temporal para el parametro anterior.

### Status

approved

---

## Decision 09. Ciclo de vida del Cliente en endpoints contextuales

### Context

Los endpoints anidados requieren definir si un Cliente inactivo puede conservar y mostrar sus relaciones, y si todavia permite mutaciones. Los Clientes eliminados logicamente no deben exponerse como un contexto operativo.

### Options

1. Permitir lecturas para Clientes `ACTIVE` e `INACTIVE`; permitir mutaciones solo para `ACTIVE`; ocultar Clientes eliminados.
2. Permitir lecturas y mutaciones para todo Cliente no eliminado, incluido `INACTIVE`.
3. Restringir todas las rutas contextuales exclusivamente a Clientes `ACTIVE`.

### Recommendation

Opcion 1.

Un Cliente inactivo puede requerir consulta historica de su equipo, pero no deberia recibir nuevas asociaciones ni modificaciones operativas. Un Cliente eliminado deja de ser un contexto valido para estas rutas.

### Decision Final

Se aprueba la opcion 1.

- `GET /v1/customers/:customerId/users` puede consultar Clientes `ACTIVE` e `INACTIVE` no eliminados.
- `GET /v1/customers/:customerId/available-users`, `POST` y `DELETE` solo operan sobre Clientes `ACTIVE` no eliminados.
- Un Cliente eliminado logicamente no es un contexto valido para ninguna ruta contextual.

### Status

approved

---

## Decision 10. Semantica ante relaciones inexistentes o repetidas

### Context

Las mutaciones puntuales deben definir respuestas estables cuando se intenta asociar un usuario que ya pertenece al Cliente o desasociar uno que no pertenece a el. Estas condiciones pueden ocurrir por acciones repetidas, concurrencia o una interfaz desactualizada.

### Options

1. Tratar ambas situaciones como idempotentes y responder exitosamente sin modificar datos.
2. Rechazar ambas como conflicto de estado con `409 Conflict`.
3. Ignorar solo la asociacion repetida y rechazar la desasociacion inexistente.

### Recommendation

Opcion 2.

La interfaz debe recibir una senal explicita de que su estado ya no coincide con el servidor. Evita ocultar fallos de integracion y permite refrescar la tabla o candidatos con un mensaje concreto.

### Decision Final

Se aprueba la opcion 2.

- Asociar un usuario ya relacionado con el Cliente devuelve `409 Conflict`.
- Desasociar un usuario sin relacion con el Cliente devuelve `409 Conflict`.
- Ninguna de esas solicitudes modifica relaciones ni contactos.
- La respuesta debe permitir que frontend refresque su estado contextual.

### Status

approved

---

## Decision 11. Contratos de consulta contextual

### Context

El detalle de Cliente necesita una tabla de usuarios relacionados y un selector de candidatos. Ambas lecturas deben ser acotadas, consistentes con los patrones de paginacion de la API y no descargar todos los usuarios.

### Options

1. Ambas lecturas paginadas, con busqueda por nombre/correo y ordenamiento controlado por la API.
2. Solo el listado relacionado paginado; candidatos sin paginar.
3. Reutilizar el contrato generico de `GET /v1/users` sin contratos contextuales propios.

### Recommendation

Opcion 1.

Aunque el selector normalmente contiene menos elementos, debe mantenerse acotado para escalar. Cada endpoint puede exponer solo los filtros y ordenamientos pertinentes a su proposito.

### Decision Final

Se ajusta la decision: el listado relacionado permanece paginado; el lookup de candidatos no se pagina.

- `GET /v1/customers/:customerId/users` acepta `page`, `limit` y `search` por nombre/correo; conserva el contrato de tabla y sus ordenamientos administrativos.
- `GET /v1/customers/:customerId/available-users` devuelve la lista compacta completa de candidatos, sin `page` ni `limit`, para el selector contextual.
- Los ordenamientos exactos y DTOs se fijaran en el diseno tecnico conforme a los patrones existentes.
- Ninguno reutiliza ni amplia el contrato generico de `GET /v1/users`.

### Status

approved

---

## Decision 12. Forma de respuesta de las lecturas contextuales

### Context

El listado relacionado se mostrara como tabla administrativa en el detalle de Cliente, mientras que los candidatos se consumiran para elegir una asociacion. Ambos necesitan identidad suficiente, pero no necesariamente la misma carga de datos.

### Options

1. Reutilizar el presenter administrativo localizado de Usuarios para ambas lecturas.
2. Usar presenter administrativo para relaciones y un presenter compacto de candidato para disponibles.
3. Devolver entidades de dominio sin presenters especificos.

### Recommendation

Opcion 2.

La tabla requiere rol, estado y datos administrativos localizados; el selector solo requiere identificar y distinguir usuarios elegibles. Mantiene respuestas claras sin acoplar el lookup a una tabla completa.

### Decision Final

Se aprueba la opcion 2.

- `GET /v1/customers/:customerId/users` usa el presenter administrativo localizado de Usuarios, incluyendo los campos requeridos por la tabla, como rol y estado con sus copys localizados.
- `GET /v1/customers/:customerId/available-users` usa un presenter compacto de candidato, con identidad y datos suficientes para distinguir y seleccionar al usuario elegible.
- Ninguna respuesta expone entidades de dominio ni detalles internos de la relacion pivote.

### Status

approved

---

## Decision 13. Respuesta de mutaciones contextuales

### Context

La asociacion y desasociacion se ejecutan desde una interfaz contextual. Debe definirse si las mutaciones retornan el usuario actualizado, un detalle de la relacion o una confirmacion sin cuerpo.

### Options

1. `POST` retorna el usuario asociado con presenter administrativo; `DELETE` retorna `204 No Content`.
2. Ambas mutaciones retornan `204 No Content`.
3. Ambas retornan una representacion de la entidad pivote.

### Recommendation

Opcion 1.

El alta puede actualizar optimistamente la tabla sin solicitar de inmediato el mismo registro; la eliminacion no necesita cuerpo. No se filtra el modelo pivote fuera de la capa de aplicacion.

### Decision Final

Se aprueba la opcion 1.

- `POST /v1/customers/:customerId/users` responde `201 Created` con el presenter administrativo localizado del usuario asociado.
- `DELETE /v1/customers/:customerId/users/:userId` responde `204 No Content`.
- Las respuestas no exponen la entidad pivote.

### Status

approved

---

## Decision 14. Alcance de `customer_relationship=UNASSIGNED`

### Context

Solo usuarios `USER` pueden tener relaciones con Clientes. Sin embargo, el filtro sin relacion puede ser util para identificar el staff interno completo, que tambien puede incluir `ADMIN`. Los `MASTER_ADMIN` pertenecen a la frontera de plataforma y no forman parte de la administracion de negocio.

### Options

1. Incluir en `UNASSIGNED` todo usuario visible de negocio sin relaciones: `USER` y `ADMIN`; excluir `MASTER_ADMIN` conforme al alcance actual.
2. Limitar `UNASSIGNED` exclusivamente a usuarios `USER` sin relaciones.
3. Incluir todos los system roles, incluso `MASTER_ADMIN`.

### Recommendation

Opcion 1.

Representa correctamente al staff de negocio: los `ADMIN` no pueden asociarse a un Cliente, pero deben poder encontrarse como usuarios internos. Mantiene a `MASTER_ADMIN` fuera de la superficie administrativa de back office.

### Decision Final

Se aprueba la opcion 1.

- `customer_relationship=UNASSIGNED` incluye usuarios `USER` y `ADMIN` visibles en back office que no tienen relaciones con Clientes.
- `MASTER_ADMIN` permanece fuera del listado administrativo de negocio, conforme al alcance actual.
- `customer_id` solo puede devolver `USER`, porque es el unico system role que admite relaciones con Clientes.

### Status

approved

---

## Decision 15. Consistencia de relaciones al editar Usuarios

### Context

`PATCH /v1/users/:userId` ya puede reemplazar el conjunto de Clientes de un usuario. Las rutas contextuales nuevas solo permiten mutar relaciones en Clientes `ACTIVE`; debe evitarse que ambos flujos acepten criterios incompatibles.

### Options

1. Permitir conservar relaciones preexistentes con Clientes `INACTIVE`, pero impedir crear nuevas relaciones con ellos desde cualquier frontera; centralizar la regla en el servicio compartido.
2. Mantener sin cambios la semantica de `PATCH /v1/users/:userId` y aplicar la restriccion solo a las rutas contextuales.
3. Rechazar cualquier actualizacion de usuario que conserve una relacion con Cliente `INACTIVE`.

### Recommendation

Opcion 1.

Conserva historial valido sin permitir nuevas asociaciones operativas a Clientes inactivos. La comparacion entre relaciones existentes y solicitadas pertenece al servicio compartido, no a controllers ni casos de uso orquestadores.

### Decision Final

Se aprueba la opcion 1.

- Una relacion existente con Cliente `INACTIVE` puede conservarse al editar un Usuario.
- No se pueden crear relaciones nuevas con Clientes `INACTIVE` desde `PATCH /v1/users/:userId` ni desde las rutas contextuales de Clientes.
- La validacion compara el estado previo y el conjunto solicitado dentro del servicio compartido.
- Controllers y casos de uso solo orquestan la operacion; no replican la regla.

### Status

approved

---

## Decision 16. Eliminacion logica de Clientes y relaciones existentes

### Context

Un Cliente eliminado logicamente deja de ser un contexto operativo, pero puede haber relaciones pivote y `company_names` materializados en Contactos. Debe definirse si se eliminan relaciones, se conservan para historial, y como se refleja el dato derivado.

### Options

1. Conservar relaciones para historial; excluir Clientes eliminados de `company_names` y resincronizar Contactos afectados. Si el Cliente se restaura, sus relaciones vuelven a participar en la sincronizacion.
2. Eliminar fisicamente todas las relaciones al eliminar el Cliente.
3. Conservar relaciones y tambien mantener el nombre del Cliente eliminado en Contactos.

### Recommendation

Opcion 1.

Preserva integridad historica y permite una restauracion coherente, sin seguir mostrando a un Contacto como integrante de una entidad eliminada. La sincronizacion debe ser un servicio aislado y transaccional segun los patrones existentes.

### Decision Final

Se aprueba la opcion 1.

- La eliminacion logica de un Cliente conserva sus relaciones `User-Customer` como historial.
- El Cliente eliminado se excluye de `company_names` de los Contactos de usuarios relacionados.
- Los Contactos afectados se resincronizan mediante el servicio aislado correspondiente; si no quedan nombres aplicables, el arreglo queda vacio.
- Si el Cliente se restaura, sus relaciones existentes vuelven a participar en la resincronizacion.

### Status

approved

---

## Decision 17. Excepcion de dominio para conflictos de relacion

### Context

Se aprobo responder `409 Conflict` cuando una relacion ya existe o no existe. El modelo actual solo mapea `EntityAlreadyExistsException` a `409`, pero esa excepcion no representa correctamente una desasociacion inexistente.

### Options

1. Crear una excepcion de dominio generica para conflictos de estado, con codigos especificos de relacion `User-Customer` y mapeo HTTP `409`.
2. Reutilizar `EntityAlreadyExistsException` para ambos escenarios.
3. Usar `InvalidValueException` y responder `400 Bad Request`.

### Recommendation

Opcion 1.

Mantiene semantica correcta para alta duplicada y baja inexistente, conserva errores localizables y permite reutilizar la clase si aparecen otros conflictos de estado reales.

### Decision Final

Se aprueba la opcion 1.

Se crea una excepcion de dominio generica para conflictos de estado, mapeada a `409 Conflict`, con codigos localizables especificos para:

- relacion `User-Customer` ya existente
- relacion `User-Customer` inexistente

No se reutiliza `EntityAlreadyExistsException` para una desasociacion inexistente.

### Status

approved

---

## Decision 18. Mapeo de rechazos contextuales

### Context

Las rutas contextuales pueden recibir un Cliente o Usuario inexistente, eliminado, inactivo o no elegible. La API debe conservar semantica uniforme y no convertir todos esos casos en el mismo error generico.

### Options

1. Reutilizar excepciones existentes: `404` para recursos inexistentes o eliminados; `400` para recursos no elegibles o inactivos; `409` solo para conflicto de relacion.
2. Crear codigos `409` para toda condicion de inactividad o elegibilidad.
3. Responder `404` para toda condicion no operable.

### Recommendation

Opcion 1.

Conserva los patrones actuales de la API: ausencia real es `404`, entrada no valida respecto a reglas de negocio es `400`, y conflicto de estado de la relacion es `409`. Todos los codigos siguen siendo localizables.

### Decision Final

Se aprueba la opcion 1.

- Cliente o Usuario inexistente, o eliminado logicamente: `404 Not Found` mediante las excepciones de entidad existentes.
- Cliente inactivo usado para una mutacion, o Usuario no elegible para asociacion: `400 Bad Request` mediante `InvalidValueException` con detalles localizables.
- Relacion duplicada o inexistente: `409 Conflict` mediante la nueva excepcion de conflicto de estado.

### Status

approved

---

## Decision 19. Alcance del lookup y de la asociacion contextual

### Context

El caso habitual de negocio asocia cada usuario a un solo Cliente, pero el modelo conserva soporte muchos a muchos para excepciones reales. El selector contextual debe mantenerse simple sin cerrar la capacidad de asociar multiples Clientes.

### Decision Final

Se aprueba separar lookup y mutacion:

- `GET /v1/customers/:customerId/available-users` muestra solamente usuarios sin relaciones con ningun Cliente.
- `POST /v1/customers/:customerId/users` no exige que el usuario este globalmente sin relaciones; permite asociarlo a otro Cliente si es `USER`, activo y no eliminado.
- Solo se rechaza una relacion ya existente con el mismo Cliente mediante `409 Conflict`.
- El flujo excepcional y explicito para administrar multiples Clientes permanece en Usuarios.

### Status

approved
