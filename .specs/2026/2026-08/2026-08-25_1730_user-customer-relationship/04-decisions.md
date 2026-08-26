# Decisions

## Decision 01. Eligible User Scope

No se agregará un `SystemRole` nuevo. La relación `UserCustomerRelationship` será opcional y aplicará exclusivamente a usuarios con `systemRole: USER` dentro del scope `APPLICATION`.

`ADMIN` y `MASTER_ADMIN` quedan fuera. El rol custom mantiene la responsabilidad de definir qué módulos y operaciones puede usar el usuario; la relación con clientes no concede permisos y no sustituye las futuras reglas de alcance de datos que algún módulo pueda requerir.

## Decision 02. Relationship Persistence Model

Se creará la entidad pivote `UserCustomerRelationship`, con su propia colección de persistencia. En esta entrega solo representará la relación N:M mediante los identificadores de dominio `userId` y `customerId`; no tendrá atributos de negocio adicionales.

La colección permitirá consultar usuarios por cliente sin arrays duplicados en `User` o `Customer`. Implementará unicidad compuesta de `userId` y `customerId`, además de índices apropiados para ambas direcciones de consulta.

La invitación conservará temporalmente los `customerIds` seleccionados. Al consumirse y crear el usuario, el flujo creará los registros pivote correspondientes. Campos como puesto, estado particular, notas, fechas adicionales o permisos por cliente quedan fuera hasta que exista un requerimiento concreto.

## Decision 03. Integrity And Lifecycle

Al crear una invitación, cada `customerId` seleccionado debe existir y tener estado `ACTIVE`. IDs inexistentes, duplicados o clientes no activos serán rechazados antes de persistir la invitación.

La invitación conserva la selección validada como un compromiso administrativo. Al consumirse, el registro creará todas las relaciones `UserCustomerRelationship` almacenadas, incluso si algún cliente pasó posteriormente a `INACTIVE` o `DELETED`. No habrá una revalidación durante el consumo que bloquee el registro o descarte relaciones.

Los clientes que cambien de estado no eliminarán ni mutarán automáticamente relaciones existentes. Los módulos futuros que expongan datos acotados por cliente deberán aplicar sus propias reglas de elegibilidad al consultar recursos activos.

## Decision 04. Invitation Contract And Administrative Representation

La creación de invitaciones `APPLICATION` aceptará el campo opcional `customer_ids: string[]` exclusivamente como entrada técnica. El caso de uso normalizará IDs duplicados y persistirá la selección validada; si el campo se omite, representará una selección vacía.

Las respuestas administrativas que representen el detalle de una invitación no expondrán IDs como texto de presentación. El nuevo endpoint administrativo `GET /v1/user-registration-invitations/:invitationId` incluirá una colección `customers` con resúmenes legibles:

```ts
customers: Array<{
  customerId: string;
  companyName: string;
  status: CustomerStatus;
}>;
```

El listado administrativo y las respuestas de creación, reenvío y revocación se mantendrán ligeros y no incluirán clientes asociados. El modelo de persistencia conservará IDs para materializar la relación, mientras que el presenter de detalle resolverá los clientes para ofrecer un contrato apto para frontend.

## Decision 05. Administration After Registration

`PATCH /v1/users/:userId`, protegido por la operación existente `users/UPDATE`, aceptará `customer_ids` como un campo opcional para reemplazar atómicamente el conjunto completo de relaciones del usuario objetivo.

No se agregarán endpoints específicos para crear o eliminar relaciones individuales. Si `customer_ids` se omite, la edición no modifica las relaciones; si se proporciona como un arreglo vacío, elimina todas las relaciones del usuario. La misma validación de IDs existentes y clientes `ACTIVE` se aplicará a una edición explícita.

La asignación o reemplazo explícito mediante esta operación aplica solo cuando el usuario objetivo tiene `systemRole: USER`. Los usuarios `ADMIN` y `MASTER_ADMIN` no pueden recibir relaciones nuevas mediante este campo. Si un usuario existente cambia posteriormente de `USER` a `ADMIN`, conserva las relaciones ya materializadas; los módulos futuros decidirán si las consideran para su alcance de datos.

## Decision 06. Effective Relationship Reads

No se crearán endpoints anidados bajo `Customer`. El recurso existente `GET /v1/users` incorporará filtros opcionales:

```text
customer_id=:customerId
has_customer_relationship=true|false
```

`has_customer_relationship` será válido solo junto con `customer_id` y filtrará exclusivamente usuarios `USER`:

- `true`: usuarios relacionados con el cliente indicado.
- `false`: usuarios que no tienen relación con el cliente indicado, aunque estén relacionados con otros clientes.

Sin esos parámetros, el listado conservará su comportamiento vigente y no incluirá clientes asociados. `GET /v1/users/:userId` incluirá `customers` como resúmenes legibles. `GET /v1/users/me` tampoco los expondrá por ahora, hasta que una vista concreta lo requiera. Todas estas lecturas reutilizan `users/READ`; no agregan operaciones de autorización.

## Decision 07. Invitation Continuity And Boundaries

Reenviar una invitación conserva sin cambios los `customerIds` originalmente validados; el reenvío solo rota el token y registra el intento de entrega. Revocar una invitación no crea ni modifica relaciones, porque aún no existe el usuario.

Las invitaciones históricas que no tengan clientes se normalizarán como una selección vacía, sin migración masiva. La frontera pública de consulta y consumo no expondrá los clientes ni sus IDs: los conservará internamente para materializarlos al completar el registro.

La frontera `MASTER` no aceptará ni procesará `customer_ids`, porque las relaciones usuario-cliente solo aplican a `USER` dentro de `APPLICATION`.

## Decision 08. Atomicity And Transaction Boundary

La materialización de una invitación y el reemplazo explícito de relaciones de un usuario serán atómicos. La infraestructura de MongoDB ejecutará transacciones para evitar estados parciales.

Al consumir una invitación, la creación de `User`, la sincronización de su `Contact`, la creación de todas las relaciones `UserCustomerRelationship` y el consumo de la invitación formarán una sola unidad atómica. El mismo criterio se aplicará a invitaciones `MASTER`, aunque no materialicen relaciones con clientes, para mantener una estrategia uniforme de finalización.

Al editar `customer_ids` de un usuario, el reemplazo completo de sus relaciones también será una sola unidad atómica.

Los casos de uso no conocerán sesiones, `ObjectId`, APIs de Mongoose ni detalles de MongoDB. La transacción concreta quedará completamente encapsulada en infraestructura detrás de un puerto definido en el diseño técnico.

## Decision 09. Relationship Retention On User Lifecycle Changes

Las relaciones `UserCustomerRelationship` se conservarán cuando un usuario cambie de `USER` a `ADMIN` y cuando sea eliminado lógicamente. No habrá eliminación en cascada ni mutación automática de las relaciones.

Los listados operativos de usuarios mantendrán la exclusión vigente de usuarios con estado `DELETED`. Si un usuario eliminado se restaura en el futuro, sus relaciones con clientes permanecerán disponibles sin necesidad de reconstruirlas.

## Decision 10. Authorization And Error Semantics

No se agregarán permisos ni guards nuevos. Asociar clientes al crear una invitación reutiliza el permiso existente para crear invitaciones; reemplazar relaciones en un usuario reutiliza `users/UPDATE`; y consultar usuarios filtrados por cliente reutiliza `users/READ`. El frontend conservará el acceso de lectura a clientes que ya requiera para obtener opciones seleccionables.

La autorización administrativa no tendrá alcance condicionado por cliente: quien pueda crear invitaciones o editar usuarios podrá seleccionar cualquier cliente activo.

La semántica de errores será la siguiente:

- `customer_ids` mal formado o con valores duplicados: `400 InvalidValue`.
- Algún cliente inexistente: `404 CUSTOMER`.
- Algún cliente inactivo: `400 InvalidValue`.
- Intentar asignar `customer_ids` a `ADMIN` o `MASTER_ADMIN`: `400 InvalidValue`.
- Usar `has_customer_relationship` sin `customer_id`: validación DTO con `400`.

En el filtro administrativo de usuarios, un `customer_id` inexistente no se tratará como error: la combinación válida de filtros devolverá una lista vacía. El filtro representa pertenencia a una relación, no una lectura o validación administrativa del recurso `Customer`.

## Decision 11. Lightweight Lists And Relationship Detail Reads

Los listados de usuarios e invitaciones no cargarán ni devolverán los clientes relacionados. Los filtros de `GET /v1/users` por `customer_id` y `has_customer_relationship` solo condicionan el conjunto de usuarios, sin añadir detalles de clientes a cada fila.

`GET /v1/users/:userId` será la representación administrativa de detalle para consultar los clientes de un usuario. Se agregará `GET /v1/user-registration-invitations/:invitationId` como representación administrativa de detalle para consultar una invitación y sus clientes seleccionados. Este endpoint reutilizará la operación existente `user-registration-invitations/READ`.

La resolución de resúmenes de clientes se limitará a esas representaciones de detalle y se implementará sin filtros o datos de MongoDB expuestos fuera de infraestructura. El diseño técnico definirá la estrategia de consulta eficiente siguiendo los puertos y adaptadores existentes.

## Decision 12. Deleted Customer Representation

Los detalles administrativos de usuarios e invitaciones conservarán visibles las relaciones cuyo cliente haya pasado a `DELETED`. Cada resumen incluirá el último `companyName` disponible y el estado actual del cliente, para que la relación no parezca perdida ni se confunda con una selección vacía. El presenter expondrá además el nombre localizado del estado conforme al patrón de la API.

## Decision 13. Compatibility And Validation Scope

Las invitaciones históricas que no tengan `customer_ids` se normalizarán como una selección vacía, sin migración. Los usuarios existentes sin relaciones devolverán `customers: []` únicamente en su detalle. Los flujos `MASTER` y los contratos actuales de listados no cambiarán, salvo la incorporación del nuevo detalle administrativo de invitación.

Esta entrega no incluirá pruebas automatizadas. La validación manual en Postman cubrirá creación con cero, uno y varios clientes activos; rechazo de IDs inexistentes, inactivos o duplicados; reenvío; consumo; reemplazo, vaciado y omisión de `customer_ids`; filtros de usuarios; detalles; visibilidad de clientes eliminados; y rechazo de asociaciones en fronteras o roles no aplicables.

## Decision 14. Contact Company Names And Migration Scope

`Contact.companyName` se reemplazará por `Contact.companyNames: string[]` en el dominio, contratos, persistencia, mappers, búsquedas y usos que corresponda. Los contactos manuales podrán conservar una lista vacía o tener uno o más nombres de empresa.

Para un contacto vinculado a un `User`, `companyNames` será información sincronizada por el sistema. Contendrá los nombres de sus clientes relacionados; al consumirse una invitación sin clientes seleccionados, el contacto inicial recibirá `['ICSACV']`. Un vaciado administrativo explícito de relaciones conservará la regla específica de `[]` definida para esa operación. La sincronización reemplazará por completo el listado derivado para evitar nombres obsoletos.

La entrega incluirá una migración mecánica, ejecutada antes de desplegar relaciones usuario-cliente: cada contacto existente convertirá su `company_name` actual en `company_names: [company_name]` o en `company_names: []` si el valor actual es nulo o vacío. La migración eliminará el campo legado `company_name`.

El seed `contacts-from-users` se actualizará al nuevo modelo para persistir `company_names`; no conservará acoplamientos a un único `company_name`.

## Decision 15. User Contact Synchronization Events

El contacto vinculado a un usuario se resincronizará dentro de la misma transacción únicamente cuando cambie su conjunto de relaciones con clientes:

- Al consumir una invitación, después de crear las relaciones, el contacto recibirá los nombres de los clientes seleccionados. Si la invitación no tiene clientes, recibirá `['ICSACV']`.
- Al reemplazar explícitamente `customer_ids` de un usuario, el contacto recibirá los nombres del conjunto resultante. Si la operación elimina la última relación, recibirá `[]`; no se sustituirá por `ICSACV`.
- Al eliminar lógicamente un usuario, se conservará su `companyNames` y su contacto seguirá el comportamiento vigente de marcado lógico como eliminado.

No se agregarán eventos o listeners independientes en esta entrega. Los casos de uso que crean o reemplazan relaciones invocarán la sincronización dentro de su unidad atómica. Las actualizaciones ordinarias de datos de usuario no modificarán `companyNames`.

## Decision 16. Derived Contact Company Names

Cuando un contacto tenga `userId`, su `companyNames` será administrado exclusivamente por la sincronización de relaciones usuario-cliente. `PATCH /v1/contacts/:contactId` rechazará un intento explícito de modificar `company_names` en esos contactos, pero conservará la edición vigente de los demás campos permitidos.

## Decision 17. Customer Name Change Synchronization

Al actualizar el nombre de un cliente, el sistema resincronizará los `companyNames` de los contactos vinculados a usuarios que tengan una relación con ese cliente. No se agregará endpoint, evento público ni listener independiente.

La implementación se aislará en servicios compartidos de responsabilidad acotada. Los casos de uso de invitaciones, usuarios y clientes solo los orquestarán; no incorporarán lógica de resolución, reemplazo o propagación de nombres de empresa.

## Decision 18. Atomic Customer Name Propagation

Cuando cambie `companyName` de un `Customer`, la actualización del cliente y la resincronización de los contactos afectados formarán una sola unidad atómica. Si la propagación falla, tampoco se persistirá el nuevo nombre del cliente; así no habrá contactos con nombres obsoletos respecto al recurso administrativo.

El caso de uso seguirá sin conocer sesiones, `ObjectId` ni APIs de Mongoose. La frontera transaccional y sus detalles permanecerán encapsulados en infraestructura detrás del puerto acordado.

## Decision 19. Shared Batch Synchronization Composition

La resolución y actualización de `companyNames` derivados se separará en servicios compartidos de responsabilidad acotada:

- Un resolver de nombres de empresa por usuarios, que recibe uno o varios IDs de usuario y determina los nombres vigentes de sus clientes relacionados.
- Un sincronizador de contactos de usuario, que aplica esos nombres a los contactos vinculados.
- Un sincronizador orientado a cliente, que identifica los usuarios afectados por un cliente y delega en los dos servicios anteriores.

Los casos de uso de invitaciones y usuarios usarán la resolución y sincronización por usuario. El caso de uso de actualización de cliente usará el sincronizador orientado a cliente dentro de su unidad atómica.

Las operaciones se resolverán por conjuntos de IDs para evitar consultas repetitivas por usuario. Los puertos manejarán IDs de dominio; la agrupación de consultas y actualizaciones por lote seguirá siendo responsabilidad de infraestructura.

## Decision 20. Batch Repository Contracts

El puerto de lectura de `UserCustomerRelationship` permitirá consultar relaciones por uno o varios usuarios y consultar los usuarios relacionados con un cliente. El puerto de lectura de clientes incorporará la lectura por varios IDs ya definida.

El puerto de escritura de contactos expondrá una operación semántica para reemplazar `companyNames` de varios contactos identificados por `userId`. Cada entrada contendrá únicamente el ID de usuario y su listado normalizado de nombres.

El resolver devolverá una colección determinista de `{ userId, companyNames }`; cuando un usuario no tenga relaciones, devolverá `companyNames: []`. El fallback `['ICSACV']` permanecerá como una regla explícita y exclusiva del consumo de invitaciones sin clientes seleccionados. El reemplazo administrativo vacío conservará `[]`.

## Decision 21. Derived Company-Name Order

Los `companyNames` derivados se ordenarán ascendentemente por nombre de cliente y, cuando dos clientes compartan el mismo nombre, por su ID. El orden estable evita diferencias técnicas o escrituras innecesarias causadas únicamente por el orden de las relaciones persistidas.

## Decision 22. Manual Validation Scope

La entrega no incluirá pruebas automatizadas. La validación manual en Postman y base de datos cubrirá:

- La migración de `company_name` a `company_names`.
- Invitaciones con cero, uno y varios clientes, además de IDs inválidos, inactivos y duplicados.
- Detalles administrativos de invitaciones y usuarios con clientes, estado y nombre localizado.
- Consumo, reenvío y revocación de invitaciones.
- Reemplazo, vaciado y omisión de `customer_ids` al editar usuarios.
- Filtros de usuarios relacionados y no relacionados, incluido un ID de cliente inexistente.
- Sincronización de contactos al consumir invitaciones, reemplazar relaciones y renombrar clientes.
- Rechazo de edición manual de `company_names` en contactos vinculados a usuarios.
- Conservación de relaciones ante promoción de rol y eliminación lógica de usuarios.
- Límites de `APPLICATION`, `USER` y `MASTER`.

## Decision 23. Reusable Customer Options

`GET /v1/customers` conserva su propósito administrativo paginado y su protección directa con `CUSTOMERS/READ`; no se reutilizará para controles de selección de otros módulos.

Se agregará `GET /v1/customers/options`, sin paginación, que devuelve únicamente clientes `ACTIVE`, ordenados ascendentemente por `companyName` y por ID. Su respuesta mínima será `{ customer_id, company_name }` y no expondrá perfil fiscal, datos de acceso público, auditoría ni otros detalles administrativos.

Este endpoint se protegerá con `JwtAuthGuard` y `AuxiliaryCapabilitiesGuard` mediante la capability `{ module: CUSTOMERS, capability: READ_OPTIONS }`. Backend la derivará para `USER_REGISTRATION_INVITATIONS` y `USERS`; frontend no verá ni administrará esa capability.

Los roles existentes deben recalcular sus capabilities derivadas antes de consumir el endpoint. El seed existente de roles reconciliará `MASTER_ADMIN_DEFAULT`, `ADMIN_DEFAULT` y todo rol persistido con `is_system: false`, sin depender de nombres particulares. La reconciliación actualiza únicamente `auxiliary_capabilities` cuando difiere de la derivación vigente y no modifica `updatedAt` ni `updatedBy` de ningún rol.
