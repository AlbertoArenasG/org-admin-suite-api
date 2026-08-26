# Catalogo De Features Y Permisos

## Proposito

Este documento define el catalogo vivo de features existentes de la API y su relacion con:

- modulos de permisos
- operaciones permitidas
- fronteras exclusivas de `MASTER_ADMIN`

No es una spec historica. Es una referencia operativa permanente del proyecto y puede evolucionar cuando cambien los endpoints, modulos o reglas de autorizacion.

Complemento normativo:

- las reglas permanentes de diseño de autorización viven en [authorization-rules.md](/Users/alberto/projects/icsacv/org-admin-suite-api/docs/authorization/authorization-rules.md:1)
- las capabilities auxiliares reutilizables viven en un catálogo separado y se documentan en [auxiliary-capabilities-mapping.md](/Users/alberto/projects/icsacv/org-admin-suite-api/docs/authorization/auxiliary-capabilities-mapping.md:1)

## Reglas De Uso

- este catalogo solo debe incluir features ya existentes en el repo
- no debe incluir features futuras o especulativas
- los modulos aqui definidos deben alinearse con el catálogo fuente de verdad en código
- las operaciones aqui definidas deben alinearse con el catálogo fuente de verdad en código
- toda feature exclusiva de `MASTER_ADMIN` debe vivir bajo `src/internal/infra/api/controllers/master-admin`
- los endpoints `auth`, `health` y `public/*` no forman parte del catalogo de permisos internos de negocio
- este documento describe el catálogo funcional general; no pretende listar por defecto utilidades técnicas o de soporte exclusivas de `MASTER_ADMIN`
- las capabilities auxiliares no son módulos funcionales ni operaciones editables en el CRUD de roles; su catálogo y derivación pertenecen a backend

## Fuente De Verdad Del Catálogo

El catálogo técnico de permisos del sistema debe vivir en código, no en Mongo.

Reglas:

- los `module_code` deben estar en mayúsculas
- los `operation_code` deben estar en mayúsculas
- cada módulo debe definir sus operaciones válidas
- los nombres visibles no deben hardcodearse en español
- el catálogo debe exponer `nameKey` para resolverse por i18n

Ejemplo conceptual:

```ts
AUTHORIZATION_CATALOG.USERS = {
  code: 'USERS',
  nameKey: 'AUTHORIZATION.MODULE.USERS',
  operations: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
}
```

Estado actual:

- la API ya resuelve `GET /v1/roles/modules` desde catálogo en código, incluyendo las operaciones válidas por módulo
- `permission_modules` y `permission_operations` ya no forman parte del runtime de la aplicación

Frontera complementaria:

- las capacidades exclusivas de `MASTER_ADMIN` no deben agregarse automáticamente como módulos del catálogo
- primero debe evaluarse si son capacidades funcionales del producto o herramientas técnicas de plataforma/soporte
- si son técnicas o de soporte, deben vivir bajo `controllers/master-admin` y protegerse por la frontera estructural de `MASTER_ADMIN`

Runbook operativo:

- si agregas un nuevo módulo o cambias las operaciones válidas de uno existente, actualiza primero el catálogo en código
- después corre `npm run db:seed`
- ese seed sincroniza de forma idempotente los permisos completos de `MASTER_ADMIN_DEFAULT` y `ADMIN_DEFAULT`
- los roles custom no se alteran automáticamente

## Operaciones Base

Operaciones controladas aprobadas para la primera etapa:

- `CREATE`
- `READ`
- `UPDATE`
- `DELETE`

Este documento puede mapear endpoints concretos a una de esas operaciones, aunque el endpoint no sea literalmente CRUD.

Nota:

- un módulo puede crecer con operaciones no CRUD cuando una capacidad auxiliar tenga sensibilidad o gobierno propio

## Modulos Actuales

Los modulos actuales del sistema son:

- `users`
- `roles`
- `customers`
- `providers`
- `service_entries`
- `service_entry_surveys`
- `service_packages`
- `user_registration_invitations`
- `contacts`
- `recipient_groups`
- `expiration_status_policies`
- `expiration_notification_policies`
- `internal_asset_maintenance_records`

Nota:

- `files` deja de considerarse modulo funcional de negocio y pasa a tratarse como capability transversal de infraestructura consumida por otros módulos

## Criterio De Mapeo

- el modulo representa la capacidad funcional de negocio
- la operacion representa la accion autorizable
- un mismo modulo puede tener varios endpoints asociados a una misma operacion
- un endpoint auxiliar local se asocia a la combinación `module + operation` de su módulo consumidor
- un endpoint auxiliar reutilizable se asocia a una capability auxiliar y no debe forzarse dentro de una operación funcional existente
- si un endpoint es estructural y reservado a plataforma, debe marcarse como exclusivo de `MASTER_ADMIN`
- si un endpoint hoy existe pero su permiso fino aun no se ha migrado al nuevo modelo, debe seguir apareciendo aqui para no perder trazabilidad

## Catalogo Funcional Inicial Mapeado A Controllers Reales

### `users`

Controller actual:

- `src/internal/infra/api/controllers/user/user.controller.ts`

Endpoints actuales:

- `PATCH /v1/users/me`
  - operacion: `UPDATE`
  - acceso actual: autenticado
  - nota: actualizacion del propio perfil, protegida solo por autenticacion JWT
- `GET /v1/users/me`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: consulta del propio perfil, protegida solo por autenticacion JWT
- `GET /v1/users`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: listado general de usuarios, protegido por `users.READ`
- `GET /v1/users/roles`
  - operacion: `CREATE`
  - acceso actual: autenticado
  - nota: protegido por `user_registration_invitations.CREATE`; hoy resuelve roles asignables desde la colección `roles`, devolviendo metadata real del rol en lugar de una lista fija de enums legacy
- `GET /v1/users/:userId`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: detalle de usuario, protegido por `users.READ`
- `PATCH /v1/users/:userId`
  - operacion: `UPDATE`
  - acceso actual: autenticado
  - nota: incluye potencial cambio estructural de usuario en el refactor, protegido por `users.UPDATE`
- `DELETE /v1/users/:userId`
  - operacion: `DELETE`
  - acceso actual: autenticado
  - nota: elimina usuario, protegido por `users.DELETE`

Notas:

- `POST /v1/users` ya no forma parte del scope normal ni del catálogo funcional de negocio; la creación funcional de usuarios en aplicación vive en el flujo de invitaciones
- el alta directa de usuarios queda reservada a `POST /v1/master-admin/users` bajo frontera estructural `MASTER_ADMIN`
- ver usuarios `MASTER_ADMIN` es exclusivo de `MASTER_ADMIN`
- crear usuarios `MASTER_ADMIN` es exclusivo de `MASTER_ADMIN`
- promover hacia `MASTER_ADMIN` o degradar desde `MASTER_ADMIN` es exclusivo de `MASTER_ADMIN`
- `ADMIN` puede promover `USER -> ADMIN`
- `ADMIN` puede degradar `ADMIN -> USER`

### `roles`

Estado actual:

- existe ya un controller inicial para administracion de roles custom
- el modulo `roles` sigue en construcción incremental dentro de este refactor

Endpoints actuales:

- `GET /v1/roles`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `roles.READ`; devuelve colección real de roles desde Mongo
- `GET /v1/roles/:roleId`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `roles.READ`; devuelve detalle de rol real desde Mongo
- `POST /v1/roles`
  - operacion: `CREATE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `roles.CREATE`; crea roles custom con `scope = USER`
- `PATCH /v1/roles/:roleId`
  - operacion: `UPDATE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `roles.UPDATE`; reemplaza permisos del rol custom
- `PATCH /v1/roles/:roleId/status`
  - operacion: `ACTIVATE`
  - acceso actual: autenticado
  - nota: hoy sigue protegido por `roles.UPDATE`, pero el modelo objetivo del catálogo lo reclasifica como operación explícita de activación/inactivación
- `DELETE /v1/roles/:roleId`
  - operacion: `DELETE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `roles.DELETE`; hace soft delete solo si el rol no tiene usuarios vinculados
- `GET /v1/roles/modules`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `roles.READ`; devuelve el catálogo activo de módulos autorizables con sus operaciones válidas anidadas

Notas:

- este modulo incluye solo administracion de roles custom en el flujo ordinario
- `GET /v1/roles/modules` funciona como catálogo auxiliar absorbido por `ROLES/READ`
- `PATCH /v1/roles/:roleId/status` debe evolucionar a `ROLES/ACTIVATE`
- ver el rol del sistema `MASTER_ADMIN` es exclusivo de `MASTER_ADMIN`
- modificar roles del sistema inmutables es exclusivo de `MASTER_ADMIN`
- `ADMIN` puede ver el rol del sistema `ADMIN`, pero bloqueado

### `customers`

Controller actual:

- `src/internal/infra/api/controllers/customer/customer.controller.ts`

Endpoints actuales:

- `POST /v1/customers`
  - operacion: `CREATE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `customers.CREATE`
- `GET /v1/customers`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `customers.READ`
- `GET /v1/customers/options`
  - capability auxiliar: `CUSTOMERS/READ_OPTIONS`
  - acceso actual: autenticado
  - nota: protegido por `AuxiliaryCapabilitiesGuard`; catálogo no paginado de clientes `ACTIVE` para selección reutilizable
- `GET /v1/customers/:customerId`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `customers.READ`
- `GET /v1/customers/:customerId/public-access`
  - operacion: `READ_PUBLIC_ACCESS`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `customers.READ_PUBLIC_ACCESS`; expone `public_access_url` y `public_access_token` fuera del `READ` general del customer
- `PATCH /v1/customers/:customerId`
  - operacion: `UPDATE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `customers.UPDATE`
- `DELETE /v1/customers/:customerId`
  - operacion: `DELETE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `customers.DELETE`

Frontera complementaria:

- los endpoints públicos por token de customer fiscal profile viven fuera del catálogo autenticado de permisos
- ese flujo pertenece al mismo dominio funcional, pero no al modelo de autorización por usuario autenticado con rol

Decisión de evolución aprobada:

- `CUSTOMERS/READ` debe seguir cubriendo listado y detalle ordinario del customer
- `GET /v1/customers/options` permanece separado del `READ` administrativo y usa `CUSTOMERS/READ_OPTIONS` derivada por backend
- `public_access_url` y `public_access_token` no permanecen dentro del payload ordinario de `GET /v1/customers` ni `GET /v1/customers/:customerId`
- esos dos campos salen por el endpoint autenticado dedicado `GET /v1/customers/:customerId/public-access`
- esa capacidad quedó modelada como operación explícita `READ_PUBLIC_ACCESS`

### `providers`

Controller actual:

- `src/internal/infra/api/controllers/provider/provider.controller.ts`

Endpoints actuales:

- `POST /v1/providers`
  - operacion: `CREATE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `providers.CREATE`
- `GET /v1/providers`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `providers.READ`
- `GET /v1/providers/:providerId`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `providers.READ`
- `GET /v1/providers/:providerId/public-access`
  - operacion: `READ_PUBLIC_ACCESS`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `providers.READ_PUBLIC_ACCESS`; expone `public_access_url` y `public_access_token` fuera del `READ` general del provider
- `PATCH /v1/providers/:providerId`
  - operacion: `UPDATE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `providers.UPDATE`
- `DELETE /v1/providers/:providerId`
  - operacion: `DELETE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `providers.DELETE`

Frontera complementaria:

- los endpoints públicos por token de provider profile viven fuera del catálogo autenticado de permisos
- ese flujo pertenece al mismo dominio funcional, pero no al modelo de autorización por usuario autenticado con rol

Decisión de evolución aprobada:

- `PROVIDERS/READ` debe seguir cubriendo listado y detalle ordinario del provider
- `public_access_url` y `public_access_token` no permanecen dentro del payload ordinario de `GET /v1/providers` ni `GET /v1/providers/:providerId`
- esos dos campos salen por el endpoint autenticado dedicado `GET /v1/providers/:providerId/public-access`
- esa capacidad quedó modelada como operación explícita `READ_PUBLIC_ACCESS`

### `service_entries`

Controller actual:

- `src/internal/infra/api/controllers/service-entry/service-entry.controller.ts`

Endpoints actuales:

- `POST /v1/services/service-entry`
  - operacion: `CREATE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `service_entries.CREATE`; como cleanup aprobado de contrato, la respuesta de creación debe dejar de devolver `public_access_token` porque el acceso público ya se distribuye por correo
- `GET /v1/services/service-entry`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `service_entries.READ`
- `GET /v1/services/service-entry/categories`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: catalogo interno de categorias, protegido por `service_entries.READ`
- `GET /v1/services/service-entry/:serviceEntryId`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `service_entries.READ`
- `PATCH /v1/services/service-entry/:serviceEntryId`
  - operacion: `UPDATE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `service_entries.UPDATE`
- `DELETE /v1/services/service-entry/:serviceEntryId`
  - operacion: `DELETE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `service_entries.DELETE`

Nota de alcance aprobada:

- `service_entries` no replica el problema de `CUSTOMERS` y `PROVIDERS` en el `READ` ordinario, porque listado y detalle no exponen hoy `public_access_token` ni `public_access_url`
- no se aprueba por ahora una nueva operación explícita `READ_PUBLIC_ACCESS` para este módulo
- sí se aprueba como cleanup retirar `public_access_token` de la respuesta de `POST /v1/services/service-entry`

### `service_entry_surveys`

Controllers actuales:

- `src/internal/infra/api/controllers/service-entry/service-entry.controller.ts`
- `src/internal/infra/api/controllers/public/service-entry-survey.controller.ts`

Endpoints actuales:

- `GET /v1/services/service-entry/surveys/stats`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: estadisticas de encuestas, protegido por `service_entry_surveys.READ`
- `GET /v1/services/service-entry/surveys`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: listado de respuestas de encuestas, protegido por `service_entry_surveys.READ`
- `POST /v1/public/service-entry/:token/survey`
  - operacion: fuera del catalogo interno
  - acceso actual: publico por token
  - nota: no se modela como permiso de backoffice; pertenece a capa publica

### `files`

Estado funcional aprobado:

- `files` ya no debe tratarse como módulo funcional de negocio dentro del catálogo general de permisos
- su uso actual es transversal y está absorbido por dominios como `service_entries`, `customers` y `providers`
- no existe hoy una UI de backoffice dedicada a administración de archivos como capacidad autónoma

Controllers actuales:

- `src/internal/infra/api/controllers/file/file.controller.ts`

Endpoints existentes:

- `POST /v1/files`
  - estado: capability transversal
  - nota: upload autenticado consumido implícitamente por otros módulos; en el modelo objetivo conserva `JwtAuthGuard` y pierde `PermissionsGuard`
- `POST /v1/files/public`
  - estado: fuera del catálogo interno
  - nota: upload público consumido por flujos públicos tokenizados
- `GET /v1/files/:fileId`
  - estado: capability transversal
  - nota: metadata técnica de archivo, sin UI funcional propia; en el modelo objetivo conserva `JwtAuthGuard` y pierde `PermissionsGuard`
- `GET /v1/files/:fileId/download`
  - estado: capability transversal
  - nota: descarga compartida entre contextos públicos y autenticados; por ahora no se modifica ni se endurece con guard en esta spec

Decisión de esta spec:

- retirar `FILES` del catálogo funcional de módulos y permisos
- retirar `FILES/*` del modelo de permisos y los `PermissionsGuard` asociados a endpoints de `files`
- mantener `JwtAuthGuard` en los endpoints de `files` que hoy ya son autenticados
- no tocar por ahora el endpoint de descarga sin guard
- mantener las descargas y uploads como capabilities transversales sin gobierno por módulo funcional

### `service_packages`

Controller actual:

- `src/internal/infra/api/controllers/service-package/service-package.controller.ts`

Endpoints actuales:

- `POST /v1/service-packages/uploads`
  - operacion: fuera del catalogo de backoffice
  - acceso actual: sin `JwtAuthGuard`
  - nota: capability operativa externa consumida por `pwa-recoleccion`; se mantiene fuera del catálogo autenticado mientras ese flujo siga dependiendo de operación offline
- `GET /v1/service-packages/records`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `service_packages.READ`
- `GET /v1/service-packages/records/:recordId`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `service_packages.READ`
- `DELETE /v1/service-packages/records/:recordId`
  - operacion: `DELETE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `service_packages.DELETE`

Decisión de esta spec:

- `service_packages` se mantiene como módulo funcional de negocio para consulta y eliminación de records
- `POST /v1/service-packages/uploads` no se modela por ahora como operación `CREATE` de backoffice
- ese endpoint se mantiene fuera del catálogo autenticado mientras la creación real siga ocurriendo desde `pwa-recoleccion` sin flujo de autenticación

### `user_registration_invitations`

Controllers actuales:

- `src/internal/infra/api/controllers/user-registration-invitation/user-registration-invitation.controller.ts`
- `src/internal/infra/api/controllers/master-admin/user-registration-invitation/master-user-registration-invitation.controller.ts`
- `src/internal/infra/api/controllers/public/user-registration-invitation.controller.ts`

Endpoints actuales de backoffice:

- `POST /v1/user-registration-invitations`
  - operacion: `CREATE`
  - acceso actual: autenticado
  - nota: invitacion ordinaria de aplicacion, protegida por `PermissionsGuard` con `user_registration_invitations.CREATE`
- `GET /v1/user-registration-invitations`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: lista exclusivamente invitaciones de scope `APPLICATION`, incluidas las historicas consumidas o revocadas
- `GET /v1/user-registration-invitations/:invitationId`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: detalle administrativo exclusivo de invitaciones `APPLICATION`, con sus clientes seleccionados
- `POST /v1/user-registration-invitations/:invitationId/resend`
  - operacion: `RESEND`
  - acceso actual: autenticado
  - nota: rota el token y reenvia solo invitaciones `APPLICATION` pendientes
- `POST /v1/user-registration-invitations/:invitationId/revoke`
  - operacion: `REVOKE`
  - acceso actual: autenticado
  - nota: revoca solo invitaciones `APPLICATION` pendientes; no elimina historial
- `POST /v1/master-admin/user-registration-invitations`
  - operacion: `CREATE`
  - acceso actual: exclusivo de `MASTER_ADMIN`
  - nota: invitacion para capa `master-admin`, protegida por `PermissionsGuard` con `user_registration_invitations.CREATE` y por la frontera estructural `MasterScopeGuard`

Endpoints publicos por token:

- `GET /v1/user-registration-invitations/:token`
  - operacion: fuera del catalogo interno
  - acceso actual: publico por token
- `POST /v1/user-registration-invitations/:token/complete-registration`
  - operacion: fuera del catalogo interno
  - acceso actual: publico por token
  - nota: rechaza tokens de invitaciones consumidas o revocadas

### `contacts`

Controller actual:

- `src/internal/infra/api/controllers/contact/contact.controller.ts`

Endpoints actuales:

- `POST /v1/contacts`
  - operacion: `CREATE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `contacts.CREATE`; crea solo contactos externos
- `GET /v1/contacts`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `contacts.READ`; listado administrativo paginado
- `GET /v1/contacts/search`
  - frontera: capability auxiliar `CONTACTS/SEARCH`
  - acceso actual: autenticado
  - nota: protegido por `AuxiliaryCapabilitiesGuard`; lookup reutilizable no paginado que devuelve solo contactos `ACTIVE`
- `GET /v1/contacts/:contactId`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `contacts.READ`; detalle completo con auditoría enriquecida
- `PATCH /v1/contacts/:contactId`
  - operacion: `UPDATE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `contacts.UPDATE`; solo permite editar contactos externos
- `DELETE /v1/contacts/:contactId`
  - operacion: `DELETE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `contacts.DELETE`; hace borrado lógico y rechaza contactos ligados a `user`

Notas:

- los contactos ligados a `user` se gobiernan por sincronización runtime y no por edición manual
- `contacts` queda como catálogo funcional reusable de negocio

### `recipient_groups`

Controller actual:

- `src/internal/infra/api/controllers/recipient-group/recipient-group.controller.ts`

Endpoints actuales:

- `POST /v1/recipient-groups`
  - operacion: `CREATE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `recipient_groups.CREATE`
- `GET /v1/recipient-groups`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `recipient_groups.READ`; listado administrativo paginado
- `GET /v1/recipient-groups/:recipientGroupId`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `recipient_groups.READ`; devuelve el grupo con contactos expandidos en orden persistido
- `PATCH /v1/recipient-groups/:recipientGroupId`
  - operacion: `UPDATE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `recipient_groups.UPDATE`; regenera `code` cuando cambia `name`
- `DELETE /v1/recipient-groups/:recipientGroupId`
  - operacion: `DELETE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `recipient_groups.DELETE`; hace borrado lógico

Capability auxiliar relacionada:

- `GET /v1/communication-channels`
  - frontera: capability auxiliar `COMMUNICATION_CHANNELS/READ_OPTIONS`
  - acceso actual: autenticado
  - nota: protegido por `AuxiliaryCapabilitiesGuard`; catálogo reutilizable de opciones, hoy publica solo `EMAIL`

### `expiration_status_policies`

Controller actual:

- `src/internal/infra/api/controllers/expiration-status-policy/expiration-status-policy.controller.ts`

Endpoints actuales:

- `POST /v1/expiration-status-policies`
  - operacion: `CREATE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `expiration_status_policies.CREATE`
- `GET /v1/expiration-status-policies`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `expiration_status_policies.READ`; listado administrativo paginado
- `GET /v1/expiration-status-policies/catalog`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: catálogo local protegido por `expiration_status_policies.READ`; expone estados y shape base para construir políticas visuales
- `GET /v1/expiration-status-policies/options`
  - frontera: capability auxiliar `EXPIRATION_STATUS_POLICIES/READ_OPTIONS`
  - acceso actual: autenticado
  - nota: protegido por `AuxiliaryCapabilitiesGuard`; devuelve opciones reutilizables para selects
- `GET /v1/expiration-status-policies/:expirationStatusPolicyId`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `expiration_status_policies.READ`; devuelve detalle completo de la política
- `PATCH /v1/expiration-status-policies/:expirationStatusPolicyId`
  - operacion: `UPDATE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `expiration_status_policies.UPDATE`; actualiza nombre, estado y reglas
- `DELETE /v1/expiration-status-policies/:expirationStatusPolicyId`
  - operacion: `DELETE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `expiration_status_policies.DELETE`; hace borrado lógico

### `expiration_notification_policies`

Controller actual:

- `src/internal/infra/api/controllers/expiration-notification-policy/expiration-notification-policy.controller.ts`

Endpoints actuales:

- `POST /v1/expiration-notification-policies`
  - operacion: `CREATE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `expiration_notification_policies.CREATE`
- `GET /v1/expiration-notification-policies`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `expiration_notification_policies.READ`; listado administrativo paginado
- `GET /v1/expiration-notification-policies/catalog`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: catálogo local protegido por `expiration_notification_policies.READ`; expone estados y enums necesarios para construir políticas de notificación
- `GET /v1/expiration-notification-policies/options`
  - frontera: capability auxiliar `EXPIRATION_NOTIFICATION_POLICIES/READ_OPTIONS`
  - acceso actual: autenticado
  - nota: protegido por `AuxiliaryCapabilitiesGuard`; devuelve opciones reutilizables para selects
- `GET /v1/expiration-notification-policies/:expirationNotificationPolicyId`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `expiration_notification_policies.READ`; devuelve detalle completo de la política
- `PATCH /v1/expiration-notification-policies/:expirationNotificationPolicyId`
  - operacion: `UPDATE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `expiration_notification_policies.UPDATE`; actualiza nombre, estado y reglas
- `DELETE /v1/expiration-notification-policies/:expirationNotificationPolicyId`
  - operacion: `DELETE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `expiration_notification_policies.DELETE`; hace borrado lógico

### `internal_asset_maintenance_records`

Controller actual:

- `src/internal/infra/api/controllers/internal-asset-maintenance-record/internal-asset-maintenance-record.controller.ts`

Endpoints actuales:

- `POST /v1/internal-asset-maintenance-records`
  - operacion: `CREATE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `internal_asset_maintenance_records.CREATE`
- `GET /v1/internal-asset-maintenance-records`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `internal_asset_maintenance_records.READ`; listado administrativo paginado con filtros por tipo, status y envío a proveedor
- `GET /v1/internal-asset-maintenance-records/catalog`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: catálogo auxiliar absorbido por `internal_asset_maintenance_records.READ`; expone tipos, statuses y estados visuales derivados del sistema
- `GET /v1/internal-asset-maintenance-records/:recordId`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `internal_asset_maintenance_records.READ`; devuelve detalle del registro con materializaciones y `provider_follow_up`
- `PATCH /v1/internal-asset-maintenance-records/:recordId`
  - operacion: `UPDATE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `internal_asset_maintenance_records.UPDATE`; actualiza datos del registro, proveedor, políticas y configuraciones de seguimiento
- `POST /v1/internal-asset-maintenance-records/:recordId/provider-follow-up/send`
  - operacion: `UPDATE`
  - acceso actual: autenticado
  - nota: acción manual absorbida por `internal_asset_maintenance_records.UPDATE`; dispara el correo de seguimiento al proveedor usando la configuración vigente del registro
- `DELETE /v1/internal-asset-maintenance-records/:recordId`
  - operacion: `DELETE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `internal_asset_maintenance_records.DELETE`; hace borrado lógico

## Features Publicas Existentes Fuera Del Catalogo Interno

Las siguientes features existen en el repo, pero no se incluyen dentro del catalogo de permisos internos porque operan como endpoints publicos o de autenticacion:

- `POST /v1/auth/login`
- `POST /v1/auth/password-reset/request`
- `POST /v1/auth/password-reset/confirm`
- `GET /v1/public/service-entry/:token`
- `POST /v1/public/service-entry/:token/survey`
- `GET /v1/public/provider-profiles/:token`
- `POST /v1/public/provider-profiles/:token/submit`
- `GET /v1/public/customer-fiscal-profiles/:token`
- `POST /v1/public/customer-fiscal-profiles/:token/submit`
- `POST /v1/files/public`
- `GET /v1/user-registration-invitations/:token`
- `POST /v1/user-registration-invitations/:token/complete-registration`

## Observaciones Del Estado Actual

- `customer.controller`, `provider.controller`, `service-entry.controller`, `user.controller` y las invitaciones internas ya fueron migrados al patrón con `PermissionsGuard`
- `contacts`, `recipient_groups`, `expiration_status_policies`, `expiration_notification_policies` e `internal_asset_maintenance_records` ya siguen el patrón con `PermissionsGuard`
- `master-admin/user` y `master-admin/user-registration-invitations` siguen una frontera estructural separada con `MasterScopeGuard`, pero ya conviven con `PermissionsGuard` para declarar el permiso funcional del endpoint
- `GET /v1/files/:fileId/download` hoy no tiene guard activo
- `POST /v1/service-packages/uploads` hoy no tiene `JwtAuthGuard`
- el modulo `roles` ya cuenta con controllers reales y operaciones propias por módulo

## Catalogo De Capacidades Exclusivas De `MASTER_ADMIN`

Las siguientes capacidades existentes o explicitamente aprobadas pertenecen a la capa de plataforma y no al negocio ordinario:

- ver usuarios `MASTER_ADMIN`
- ver detalle de usuarios `MASTER_ADMIN`
- crear usuarios `MASTER_ADMIN`
- promover cualquier usuario a `MASTER_ADMIN`
- degradar usuarios `MASTER_ADMIN`
- cambiar `systemRole` hacia o desde `MASTER_ADMIN`
- ver el rol del sistema `MASTER_ADMIN`
- modificar roles del sistema inmutables
- modificar roles default del sistema
- administrar catalogos controlados del sistema:
  - `modules`
  - `operations`

## Notas De Evolucion

- cuando una feature nueva se implemente, primero debe decidirse si pertenece a este catalogo
- si una feature requiere una operacion distinta de CRUD, primero debe agregarse al catalogo controlado de operaciones y luego reflejarse aqui
- este documento debe mantenerse alineado con la implementacion real del backend y con los catálogos persistidos
