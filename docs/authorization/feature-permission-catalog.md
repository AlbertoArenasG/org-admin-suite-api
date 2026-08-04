# Catalogo De Features Y Permisos

## Proposito

Este documento define el catalogo vivo de features existentes de la API y su relacion con:

- modulos de permisos
- operaciones permitidas
- fronteras exclusivas de `MASTER_ADMIN`

No es una spec historica. Es una referencia operativa permanente del proyecto y puede evolucionar cuando cambien los endpoints, modulos o reglas de autorizacion.

Complemento normativo:

- las reglas permanentes de diseño de autorización viven en [authorization-rules.md](/Users/alberto/projects/icsacv/org-admin-suite-api/docs/authorization/authorization-rules.md:1)

## Reglas De Uso

- este catalogo solo debe incluir features ya existentes en el repo
- no debe incluir features futuras o especulativas
- los modulos aqui definidos deben alinearse con el catálogo fuente de verdad en código
- las operaciones aqui definidas deben alinearse con el catálogo fuente de verdad en código
- toda feature exclusiva de `MASTER_ADMIN` debe vivir bajo `src/internal/infra/api/controllers/master-admin`
- los endpoints `auth`, `health` y `public/*` no forman parte del catalogo de permisos internos de negocio
- este documento describe el catálogo funcional general; no pretende listar por defecto utilidades técnicas o de soporte exclusivas de `MASTER_ADMIN`

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

## Modulos Actuales

Los modulos actuales del sistema son:

- `users`
- `roles`
- `customers`
- `providers`
- `service_entries`
- `service_entry_surveys`
- `files`
- `service_packages`
- `user_registration_invitations`

## Criterio De Mapeo

- el modulo representa la capacidad funcional de negocio
- la operacion representa la accion autorizable
- un mismo modulo puede tener varios endpoints asociados a una misma operacion
- si un endpoint es estructural y reservado a plataforma, debe marcarse como exclusivo de `MASTER_ADMIN`
- si un endpoint hoy existe pero su permiso fino aun no se ha migrado al nuevo modelo, debe seguir apareciendo aqui para no perder trazabilidad

## Catalogo Funcional Inicial Mapeado A Controllers Reales

### `users`

Controller actual:

- `src/internal/infra/api/controllers/user/user.controller.ts`

Endpoints actuales:

- `POST /v1/users`
  - operacion: `CREATE`
  - acceso actual: autenticado
  - nota: crea usuario ordinario, protegido por `PermissionsGuard` con `users.CREATE`
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
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: protegido por `users.READ`; hoy resuelve roles asignables desde la colección `roles`, devolviendo metadata real del rol en lugar de una lista fija de enums legacy
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

- ver usuarios `MASTER_ADMIN` es exclusivo de `MASTER_ADMIN`
- crear usuarios `MASTER_ADMIN` es exclusivo de `MASTER_ADMIN`
- promover hacia `MASTER_ADMIN` o degradar desde `MASTER_ADMIN` es exclusivo de `MASTER_ADMIN`
- `ADMIN` puede crear `USER` y `ADMIN`
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
  - operacion: `UPDATE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `roles.UPDATE`; activa o desactiva roles custom
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
- `GET /v1/customers/:customerId`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `customers.READ`
- `PATCH /v1/customers/:customerId`
  - operacion: `UPDATE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `customers.UPDATE`
- `DELETE /v1/customers/:customerId`
  - operacion: `DELETE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `customers.DELETE`

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
- `PATCH /v1/providers/:providerId`
  - operacion: `UPDATE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `providers.UPDATE`
- `DELETE /v1/providers/:providerId`
  - operacion: `DELETE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `providers.DELETE`

### `service_entries`

Controller actual:

- `src/internal/infra/api/controllers/service-entry/service-entry.controller.ts`

Endpoints actuales:

- `POST /v1/services/service-entry`
  - operacion: `CREATE`
  - acceso actual: autenticado
  - nota: protegido por `PermissionsGuard` con `service_entries.CREATE`
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

Controller actual:

- `src/internal/infra/api/controllers/file/file.controller.ts`

Endpoints actuales:

- `POST /v1/files`
  - operacion: `CREATE`
  - acceso actual: autenticado
  - nota: subida interna de archivos, protegido por `PermissionsGuard` con `files.CREATE`
- `POST /v1/files/public`
  - operacion: fuera del catalogo interno
  - acceso actual: publico
  - nota: no se modela como permiso de backoffice
- `GET /v1/files/:fileId`
  - operacion: `READ`
  - acceso actual: autenticado
  - nota: consulta de metadata, protegido por `PermissionsGuard` con `files.READ`
- `GET /v1/files/:fileId/download`
  - operacion: `READ`
  - acceso actual: actualmente sin guard activo
  - nota: sigue temporalmente fuera del guard centralizado; candidato a futura operacion especial como `DOWNLOAD`

Nota:

- si en el futuro se formaliza una operacion especial como `DOWNLOAD`, este modulo debera actualizar su mapeo

### `service_packages`

Controller actual:

- `src/internal/infra/api/controllers/service-package/service-package.controller.ts`

Endpoints actuales:

- `POST /v1/service-packages/uploads`
  - operacion: `CREATE`
  - acceso actual: actualmente sin `JwtAuthGuard`
  - nota: ingesta de paquete; requiere definicion posterior de politica final
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
- `master-admin/user` y `master-admin/user-registration-invitations` siguen una frontera estructural separada con `MasterScopeGuard`, pero ya conviven con `PermissionsGuard` para declarar el permiso funcional del endpoint
- `GET /v1/files/:fileId/download` hoy no tiene guard activo
- `POST /v1/service-packages/uploads` hoy no tiene `JwtAuthGuard`
- el modulo `roles` aun no tiene controllers reales; su implementacion forma parte de este refactor

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
