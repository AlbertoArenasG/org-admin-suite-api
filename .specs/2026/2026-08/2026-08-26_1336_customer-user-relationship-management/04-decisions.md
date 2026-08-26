# Decisions

## Decision 01. Frontera contextual

- Estado: `approved`
- Endpoints anidados bajo `CUSTOMERS`.
- Consulta con `CUSTOMERS/READ`; administracion con `CUSTOMERS/UPDATE`.
- Sin dependencia de permisos `USERS/*`.
- Sin capabilities auxiliares nuevas.
- Reutiliza servicios transaccionales existentes.

## Decision 02. Elegibilidad y visibilidad

- Estado: `approved`
- El listado muestra relaciones de usuarios `USER` no eliminados, incluidos inactivos.
- Los candidatos disponibles son solo `USER` activos, no eliminados y sin relaciones con Clientes.
- No se admiten `ADMIN` ni `MASTER_ADMIN`.

## Decision 03. Mutaciones puntuales

- Estado: `approved`
- `POST` agrega una relacion y `DELETE` elimina una relacion concreta.
- No existe reemplazo masivo desde Clientes.
- Las mutaciones reutilizan transaccion y sincronizacion de contactos existentes.

## Decision 04. Filtros globales de Usuarios

- Estado: `approved`
- Permanecen como una capacidad propia de `USERS/READ`.
- Permiten consultar relaciones con un cliente seleccionado y usuarios sin relacion con ningun cliente.
- No reutilizan endpoints anidados de Clientes ni capabilities auxiliares.

## Decision 05. Listado contextual de Clientes

- Estado: `approved`
- `GET /v1/customers/:customerId/users` es un auxiliar local protegido por `CUSTOMERS/READ`.
- No requiere `USERS/READ` ni capability auxiliar.
- Sirve exclusivamente al detalle administrativo de un Cliente.

## Decision 06. Candidatos para asociacion

- Estado: `approved`
- `GET /v1/customers/:customerId/available-users` es auxiliar local de Clientes con `CUSTOMERS/UPDATE`.
- Devuelve usuarios `USER` activos, no eliminados y sin relaciones con Clientes.
- No usa capability auxiliar.

## Decision 07. Capability futura de opciones

- Estado: `approved`
- No se implementa capability ni endpoint sin un consumidor actual.
- La futura lectura compacta de usuarios asociados sera una capability auxiliar reutilizable definida con su primer modulo consumidor.

## Decision 08. Contrato de filtros globales de Usuarios

- Estado: `approved`
- `customer_id=:customerId` filtra usuarios relacionados con ese Cliente.
- `customer_relationship=UNASSIGNED` filtra usuarios sin relaciones con Clientes.
- Ambos parametros son mutuamente excluyentes y juntos devuelven `400 Bad Request`.
- Se elimina `has_customer_relationship` sin compatibilidad temporal.
- La frontera sigue siendo `USERS/READ`.

## Decision 09. Ciclo de vida del Cliente en rutas contextuales

- Estado: `approved`
- Clientes `ACTIVE` e `INACTIVE` no eliminados permiten consultar relaciones.
- Solo Clientes `ACTIVE` no eliminados permiten listar candidatos y mutar relaciones.
- Clientes eliminados logicamente no son un contexto valido.

## Decision 10. Relaciones inexistentes o repetidas

- Estado: `approved`
- Asociacion repetida y desasociacion inexistente devuelven `409 Conflict`.
- No modifican relaciones ni contactos.

## Decision 11. Contratos de consulta contextual

- Estado: `approved`
- El listado relacionado usa `page`, `limit` y `search` por nombre/correo.
- El lookup de candidatos no se pagina y devuelve la lista compacta completa.
- No reutilizan ni amplian el contrato generico de `GET /v1/users`.

## Decision 12. Forma de respuesta contextual

- Estado: `approved`
- La tabla usa el presenter administrativo localizado de Usuarios.
- Los candidatos usan presenter compacto de seleccion.
- No se exponen entidades de dominio ni la entidad pivote.

## Decision 13. Respuesta de mutaciones contextuales

- Estado: `approved`
- El `POST` de asociacion responde `201 Created` con presenter administrativo localizado.
- El `DELETE` responde `204 No Content`.
- No se expone la entidad pivote.

## Decision 14. Alcance de usuarios sin relacion

- Estado: `approved`
- `UNASSIGNED` incluye `USER` y `ADMIN` visibles de negocio sin relaciones.
- `MASTER_ADMIN` queda fuera del listado administrativo de negocio.
- `customer_id` solo devuelve `USER`.

## Decision 15. Consistencia al editar Usuarios

- Estado: `approved`
- Relaciones existentes con Clientes `INACTIVE` pueden conservarse.
- Ninguna frontera puede crear relaciones nuevas con Clientes `INACTIVE`.
- La regla se centraliza en el servicio compartido.

## Decision 16. Eliminacion logica de Clientes

- Estado: `approved`
- Se conservan relaciones como historial.
- Clientes eliminados se excluyen de `company_names`; Contactos afectados se resincronizan.
- Una restauracion reincorpora sus relaciones a la sincronizacion.

## Decision 17. Excepcion de conflictos de relacion

- Estado: `approved`
- Se crea excepcion de conflicto de estado mapeada a `409`.
- Incluye codigos localizables para relacion existente e inexistente.

## Decision 18. Mapeo de rechazos contextuales

- Estado: `approved`
- `404` para Cliente o Usuario inexistente/eliminado.
- `400` para inactividad o no elegibilidad.
- `409` exclusivamente para relaciones duplicadas o inexistentes.

## Decision 19. Lookup y asociacion contextual

- Estado: `approved`
- El lookup muestra solo usuarios sin relaciones con Clientes.
- El `POST` permite asociar usuarios que ya pertenecen a otros Clientes, si cumplen elegibilidad y no existe la relacion con el Cliente objetivo.
- La administracion explicita de multiples Clientes permanece en Usuarios.
