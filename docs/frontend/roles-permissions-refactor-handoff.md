# Handoff Frontend: Refactor De Roles Y Permisos

## Propósito

Este documento da contexto de integración para frontend sobre el refactor de roles y permisos de la API.

La fuente de verdad de este documento es el backend implementado al `2026-07-28`.

No es una spec histórica. Es un documento vivo de integración.

## Estado

- iniciativa: `roles-permissions-refactor`
- estado actual: `in_progress`
- última actualización: `2026-07-28`

## Objetivo Del Refactor

La API está migrando del modelo legacy basado en `User.role` como enum fijo hacia un modelo con:

- `systemRole`
- `roleId`
- roles custom persistidos
- permisos por `module + operation`

## Modelo Actual Que Frontend Debe Asumir

### Invariantes

- todo usuario persiste:
  - `system_role`
  - `role_id`
- los únicos `system_role` válidos son:
  - `MASTER_ADMIN`
  - `ADMIN`
  - `USER`
- `system_role` define jerarquía estructural
- `role_id` resuelve el rol efectivo y, por tanto, los permisos ordinarios de negocio

### Relación Entre `system_role` Y `role_id`

- `MASTER_ADMIN` usa un rol default de scope `MASTER_ADMIN`
- `ADMIN` usa un rol default de scope `ADMIN`
- `USER` usa un rol de scope `USER`

### Regla Importante De Integración

Hay que separar estas tres cosas:

- payload de entrada
- estado persistido
- payload de salida

No significan lo mismo.

#### Payload de entrada

En requests de creación e invitación:

- si `system_role = USER`, `role_id` es obligatorio
- si `system_role = ADMIN`, `role_id` no debe enviarse y el backend lo trata como `null`

En el scope normal de aplicación, `MASTER_ADMIN` no es un valor aceptado por `POST /v1/users` ni por `POST /v1/user-registration-invitations`.

#### Estado persistido

Después de creación, migración o actualización válida, el usuario queda persistido con `role_id` resuelto.

Para usuarios del sistema, el backend trabaja con roles default:

- `MASTER_ADMIN_DEFAULT`
- `ADMIN_DEFAULT`

#### Payload de salida

En responses modernas de usuarios y auth, la API expone como fuente principal:

- `system_role`
- `role_id`

## Contratos HTTP Ya Migrados

## `POST /v1/users`

Estado:

- `implemented`

Permiso requerido:

- `USERS/CREATE`

Request vigente:

```json
{
  "name": "Ana",
  "lastname": "Lopez",
  "email": "ana@example.com",
  "password": "secret123",
  "cell_phone": {
    "country_code": "+52",
    "number": "5512345678"
  },
  "system_role": "USER",
  "role_id": "STAFF_LEGACY"
}
```

Reglas:

- `system_role` solo acepta `ADMIN` o `USER`
- `role_id` es obligatorio solo cuando `system_role = USER`
- si `system_role = ADMIN`, el backend persiste el rol default de administración

Ejemplo de request para `ADMIN`:

```json
{
  "name": "Luis",
  "lastname": "Perez",
  "email": "luis@example.com",
  "password": "secret123",
  "system_role": "ADMIN"
}
```

Response vigente:

```json
{
  "success_message": "USER.CREATED",
  "data": {
    "id": "USR_123",
    "name": "Luis",
    "lastname": "Perez",
    "email": "luis@example.com",
    "system_role": "ADMIN",
    "role_id": "ADMIN_DEFAULT",
    "role_name": "Administrador",
    "status": "ACTIVE",
    "status_name": "Activo",
    "cell_phone": {
      "country_code": null,
      "number": null
    },
    "created_at": "2026-07-28T00:00:00.000Z"
  },
  "status_code": 201
}
```

## `PATCH /v1/users/:userId`

Estado:

- `implemented`

Permiso requerido:

- `USERS/UPDATE`

Request vigente:

```json
{
  "name": "Ana",
  "lastname": "Lopez",
  "email": "ana@example.com",
  "cell_phone": {
    "country_code": "+52",
    "number": "5512345678"
  },
  "system_role": "USER",
  "role_id": "ANALYST_MX",
  "status_id": "ACTIVE"
}
```

Reglas:

- todos los campos son opcionales
- `system_role` acepta `MASTER_ADMIN`, `ADMIN` o `USER`
- `role_id` puede enviarse cuando se quiera reasignar el rol
- si se cambia a `USER`, debe quedar un `role_id` válido de scope `USER`
- un usuario no puede auto-cambiarse `system_role`, `role_id` ni `status`
- el backend valida jerarquía estructural antes de permitir promoción, degradación o reasignación

Response vigente:

```json
{
  "success_message": "USER.UPDATED",
  "data": {
    "id": "USR_123",
    "name": "Ana",
    "lastname": "Lopez",
    "email": "ana@example.com",
    "system_role": "USER",
    "role_id": "ANALYST_MX",
    "status": "ACTIVE",
    "status_name": "Activo",
    "cell_phone": {
      "country_code": "+52",
      "number": "5512345678"
    },
    "created_at": "2026-07-28T00:00:00.000Z"
  },
  "status_code": 200
}
```

## `POST /v1/user-registration-invitations`

Estado:

- `implemented`

Permiso requerido:

- `USER_REGISTRATION_INVITATIONS/CREATE`

Request vigente:

```json
{
  "email": "ana@example.com",
  "name": "Ana",
  "lastname": "Lopez",
  "cell_phone": {
    "country_code": "+52",
    "number": "5512345678"
  },
  "system_role": "USER",
  "role_id": "STAFF_LEGACY"
}
```

Reglas:

- `system_role` solo acepta `ADMIN` o `USER`
- `role_id` es obligatorio solo cuando `system_role = USER`
- si `system_role = ADMIN`, el backend resuelve la invitación con el rol default de administración

Response vigente:

```json
{
  "success_message": "USER_REGISTRATION_INVITATION.CREATED",
  "data": {
    "invitation_id": "INV_123",
    "scope": "APPLICATION",
    "type": "NEW_USER",
    "status": "PENDING",
    "email": "ana@example.com",
    "system_role": "USER",
    "role_id": "STAFF_LEGACY",
    "invited_by_user_id": "USR_999",
    "user_data": {
      "name": "Ana",
      "lastname": "Lopez",
      "cell_phone": {
        "country_code": "+52",
        "number": "5512345678"
      }
    },
    "consumed_at": null,
    "created_at": "2026-07-28T00:00:00.000Z",
    "updated_at": "2026-07-28T00:00:00.000Z"
  },
  "status_code": 201
}
```

## Contratos De Respuesta Modernos

### `POST /v1/auth/login`

Estado:

- `implemented`

Response vigente:

```json
{
  "success_message": "DEFAULT",
  "data": {
    "access_token": "jwt",
    "user": {
      "id": "USR_123",
      "name": "Luis",
      "lastname": "Perez",
      "email": "luis@example.com",
      "system_role": "ADMIN",
      "role_id": "ADMIN_DEFAULT",
      "status": "ACTIVE",
      "cell_phone": {
        "country_code": null,
        "number": null
      }
    }
  },
  "status_code": 200
}
```

Notas:

- `role` y `role_name` ya no forman parte de la respuesta de login

### `GET /v1/users/me`

Estado:

- `implemented`

Autorización:

- solo JWT

Response vigente:

```json
{
  "success_message": "DEFAULT",
  "data": {
    "id": "USR_123",
    "name": "Luis",
    "lastname": "Perez",
    "email": "luis@example.com",
    "system_role": "ADMIN",
    "role_id": "ADMIN_DEFAULT",
    "status": "ACTIVE",
    "status_name": "Activo",
    "cell_phone": {
      "country_code": null,
      "number": null
    },
    "created_at": "2026-07-28T00:00:00.000Z"
  },
  "status_code": 200
}
```

### `GET /v1/users`

Estado:

- `implemented`

Permiso requerido:

- `USERS/READ`

Query params soportados:

- `page`
- `limit`
- `search`
- `sort[].field`
  - `name`
  - `lastname`
  - `email`
  - `status`
  - `system_role`
  - `created_at`
- `sort[].direction`
  - `asc`
  - `desc`

Response vigente por item:

```json
{
  "id": "USR_123",
  "name": "Ana",
  "lastname": "Lopez",
  "email": "ana@example.com",
  "system_role": "USER",
  "role_id": "STAFF_LEGACY",
  "role_name": "Staff Legacy",
  "status": "ACTIVE",
  "status_name": "Activo",
  "cell_phone": {
    "country_code": null,
    "number": null
  },
  "created_at": "2026-07-28T00:00:00.000Z"
}
```

Notas:

- el listado ya no usa `role` ni `role_name` como contrato principal
- el listado ya no acepta `role` como sort field; el valor canónico es `system_role`
- `role_name` se expone como metadata descriptiva asociada al `role_id` efectivo del usuario
- la paginación sigue el formato estándar de `ApiResponseBuilder`

### `GET /v1/users/:userId`

Estado:

- `implemented`

Permiso requerido:

- `USERS/READ`

Response vigente:

- mismo shape que `GET /v1/users/me`

## Endpoints Self-Service Del Usuario Autenticado

Estado actual:

- `GET /v1/users/me` requiere solo autenticación JWT
- `PATCH /v1/users/me` requiere solo autenticación JWT

Notas:

- estos endpoints no deben interpretarse como permisos de backoffice sobre `USERS`
- un usuario autenticado puede consultar su propio perfil aunque no tenga `USERS/READ`
- un usuario autenticado puede actualizar su propio perfil aunque no tenga `USERS/UPDATE`
- `USERS/*` sigue aplicando para operaciones sobre terceros o administración general de usuarios

## Nuevo Endpoint De Permisos

### `GET /v1/auth/me/permissions`

Estado:

- `implemented`

Propósito:

- devolver el `system_role` actual del usuario autenticado
- devolver metadata del rol resuelto
- devolver módulos efectivos agregados
- devolver permisos efectivos en lista plana

Response vigente:

```json
{
  "success_message": "DEFAULT",
  "data": {
    "system_role": "ADMIN",
    "role": {
      "id": "ADMIN_DEFAULT",
      "code": "ADMIN_DEFAULT",
      "name": "Administrador",
      "scope": "ADMIN",
      "is_system": true,
      "is_default": true,
      "is_immutable": true,
      "status": "ACTIVE"
    },
    "modules": [
      {
        "code": "USERS",
        "name": "Usuarios",
        "name_key": "AUTHORIZATION.MODULE.USERS"
      },
      {
        "code": "ROLES",
        "name": "Roles",
        "name_key": "AUTHORIZATION.MODULE.ROLES"
      }
    ],
    "permissions": [
      {
        "module": "USERS",
        "module_name": "Usuarios",
        "module_name_key": "AUTHORIZATION.MODULE.USERS",
        "operation": "READ",
        "operation_name": "Leer",
        "operation_name_key": "AUTHORIZATION.OPERATION.READ"
      },
      {
        "module": "USERS",
        "module_name": "Usuarios",
        "module_name_key": "AUTHORIZATION.MODULE.USERS",
        "operation": "UPDATE",
        "operation_name": "Actualizar",
        "operation_name_key": "AUTHORIZATION.OPERATION.UPDATE"
      }
    ]
  },
  "status_code": 200
}
```

Notas:

- `modules` se deriva desde los permisos efectivos
- la lista de permisos es plana
- `module` y `operation` deben tratarse como valores canónicos en mayúsculas
- `name` se resuelve en backend según `x-user-lang`
- `name_key` viaja para trazabilidad técnica del catálogo

## Endpoints De Administración De Roles Custom

Estado:

- `implemented`

Endpoints:

- `GET /v1/roles`
- `POST /v1/roles`
- `GET /v1/roles/:roleId`
- `PATCH /v1/roles/:roleId`
- `PATCH /v1/roles/:roleId/status`
- `DELETE /v1/roles/:roleId`
- `GET /v1/roles/modules`
- `GET /v1/roles/operations`

### `GET /v1/roles`

Permiso requerido:

- `ROLES/READ`

Query params soportados:

- `page`
- `limit`
- `search`
- `scope`
- `status`
- `is_system`
- `sort[][field|direction]`

Sorts permitidos:

- `name`
- `code`
- `status`
- `created_at`

Notas:

- si el actor no es `MASTER_ADMIN`, el backend excluye roles de scope `MASTER_ADMIN`
- si no se envía `status`, el backend excluye `DELETED`

Shape de item:

```json
{
  "role_id": "ANALYST_MX",
  "name": "Analista MX",
  "code": "ANALYST_MX",
  "scope": "USER",
  "is_system": false,
  "is_immutable": false,
  "is_default": false,
  "status_id": "ACTIVE",
  "permissions": [
    {
      "module": "USERS",
      "operation": "READ"
    }
  ],
  "created_by": {
    "user_id": "USR_1",
    "name": "Ana",
    "email": "ana@example.com"
  },
  "updated_by": null,
  "created_at": "2026-07-28T00:00:00.000Z",
  "updated_at": null
}
```

### `POST /v1/roles`

Permiso requerido:

- `ROLES/CREATE`

Request vigente:

```json
{
  "name": "Analista MX",
  "permissions": [
    {
      "module": "USERS",
      "operation": "READ"
    },
    {
      "module": "CUSTOMERS",
      "operation": "UPDATE"
    }
  ]
}
```

Notas:

- el backend define internamente `scope = USER`
- el backend genera internamente el `code`
- no se envía `code`, `scope`, `is_system` ni `is_default` desde frontend

Response:

- mismo shape que `GET /v1/roles/:roleId`

### `PATCH /v1/roles/:roleId`

Permiso requerido:

- `ROLES/UPDATE`

Request vigente:

```json
{
  "permissions": [
    {
      "module": "USERS",
      "operation": "READ"
    }
  ]
}
```

Notas:

- actualiza únicamente permisos
- devuelve el rol actualizado con el mismo shape de detalle
- el backend bloquea mutaciones ordinarias sobre roles del sistema, roles default o roles inmutables

### `PATCH /v1/roles/:roleId/status`

Permiso requerido:

- `ROLES/UPDATE`

Request vigente:

```json
{
  "status_id": "INACTIVE"
}
```

Notas:

- solo acepta `ACTIVE` o `INACTIVE`
- devuelve el rol actualizado con el mismo shape de detalle

### `DELETE /v1/roles/:roleId`

Permiso requerido:

- `ROLES/DELETE`

Notas:

- realiza borrado lógico
- responde con `data: null`
- el backend bloquea el borrado si todavía existen usuarios vinculados a ese `role_id`

### `GET /v1/roles/modules`

Permiso requerido:

- `ROLES/READ`

Response vigente:

```json
{
  "success_message": "DEFAULT",
  "data": [
    {
      "module_id": "USERS",
      "module_code": "USERS",
      "module_name": "Usuarios",
      "module_name_key": "AUTHORIZATION.MODULE.USERS",
      "status_id": "ACTIVE",
      "is_system": true
    }
  ],
  "status_code": 200
}
```

### `GET /v1/roles/operations`

Permiso requerido:

- `ROLES/READ`

Response vigente:

```json
{
  "success_message": "DEFAULT",
  "data": [
    {
      "operation_id": "CREATE",
      "operation_code": "CREATE",
      "operation_name": "Crear",
      "operation_name_key": "AUTHORIZATION.OPERATION.CREATE",
      "status_id": "ACTIVE",
      "is_system": true
    }
  ],
  "status_code": 200
}
```

## `GET /v1/users/roles`

Estado:

- `implemented`

Permiso requerido:

- `USERS/READ`

Propósito:

- devolver roles asignables para alta, edición o invitación de usuarios

Comportamiento actual:

- si el actor es `MASTER_ADMIN`, devuelve:
  - default role de `MASTER_ADMIN`
  - default role de `ADMIN`
  - roles custom de scope `USER`
- si el actor es `ADMIN`, devuelve:
  - default role de `ADMIN`
  - roles custom de scope `USER`
- si el actor es `USER`, devuelve solo roles custom de scope `USER`

Response vigente:

```json
{
  "success_message": "DEFAULT",
  "data": [
    {
      "role_id": "ADMIN_DEFAULT",
      "role_code": "ADMIN_DEFAULT",
      "role_name": "Administrador",
      "system_role": "ADMIN",
      "role_scope": "ADMIN",
      "is_system": true,
      "is_default": true
    },
    {
      "role_id": "STAFF_LEGACY",
      "role_code": "STAFF_LEGACY",
      "role_name": "Staff Legacy",
      "system_role": "USER",
      "role_scope": "USER",
      "is_system": false,
      "is_default": false
    }
  ],
  "status_code": 200
}
```

Notas:

- `role_id` debe tratarse como identificador canónico del rol
- `system_role` viene explícito para que frontend pueda distinguir directamente opciones estructurales especiales como `MASTER_ADMIN_DEFAULT` y `ADMIN_DEFAULT` al construir selects o reglas de UI
- `role_scope` se mantiene como metadata del rol y hoy coincide con `system_role` en este endpoint
- el contrato esperado hacia consumidores debe asumir `role_id == code`

## Compatibilidad Temporal Y Zonas Legacy

Estas zonas siguen en transición y no deben interpretarse como contrato final limpio:

- los scripts manuales de migración se conservan como artefactos históricos/operativos y no como parte del runtime ordinario

Regla práctica:

- para usuarios autenticados, listado de usuarios y detalle de usuarios, frontend debe tratar `system_role` y `role_id` como contrato principal
- `role_name` debe considerarse metadata auxiliar y descriptiva donde aparezca

## Scripts Operativos Nuevos

### Migración legacy de usuarios

Estado:

- `implemented`
- ejecución manual disponible por comando

Comandos disponibles:

```bash
npm run db:migrate:users-system-role:dry-run
npm run db:migrate:users-system-role:apply
npm run db:migrate:role-ids-to-code:dry-run
npm run db:migrate:role-ids-to-code:apply
```

Comportamiento:

- `dry-run` no escribe nada en la base
- `apply` solo migra usuarios pendientes que todavía no tienen `system_role` o `role_id`
- el script bloquea si detecta usuarios legacy con `CUSTOMER` o `MASTER_STAFF`
- el script exige la existencia previa de:
  - `MASTER_ADMIN_DEFAULT`
  - `ADMIN_DEFAULT`
  - `STAFF_LEGACY`

Reglas de mapeo:

- `MASTER_ADMIN` legacy -> `system_role=MASTER_ADMIN` + `role_id=MASTER_ADMIN_DEFAULT`
- `ADMIN` legacy -> `system_role=ADMIN` + `role_id=ADMIN_DEFAULT`
- `STAFF` legacy -> `system_role=USER` + `role_id=STAFF_LEGACY`

### Migración de identidad canónica de roles

Estado:

- `implemented`
- ejecución manual disponible por comando

Propósito:

- convertir la identidad técnica de los roles para que `role_id` sea igual a `code`
- alinear también `users.role_id` con ese formato canónico

Notas:

- el contrato de integración debe asumir como objetivo estable:
  - `role_id == code`

## Reglas De Interpretación Del Modelo

- `systemRole` no reemplaza permisos; define jerarquía estructural
- `roleId` y sus permisos resuelven acciones ordinarias de negocio
- `MASTER_ADMIN` representa soporte/plataforma
- `ADMIN` representa administración de negocio
- `USER` representa una categoría amplia cuyo comportamiento depende del rol asignado

## Documentos De Referencia Para Otra Sesión

- catálogo funcional y permisos:
  - [feature-permission-catalog.md](/Users/alberto/projects/icsacv/org-admin-suite-api/docs/authorization/feature-permission-catalog.md:1)
- reglas de autorización:
  - [authorization-rules.md](/Users/alberto/projects/icsacv/org-admin-suite-api/docs/authorization/authorization-rules.md:1)
- pipeline general de la API:
  - [api-pipeline.md](/Users/alberto/projects/icsacv/org-admin-suite-api/docs/api-pipeline.md:1)
- spec del refactor actual:
  - [06-technical-design.md](/Users/alberto/projects/icsacv/org-admin-suite-api/.specs/2026/2026-05/2026-05-26_1940_roles-permissions-refactor/06-technical-design.md:1)

## Regla De Mantenimiento

Este documento debe actualizarse cuando cambie cualquiera de estas cosas:

- endpoints agregados
- endpoints modificados
- endpoints eliminados o reemplazados
- payloads de request
- payloads de response
- semántica de integración relevante para consumidores de la API

## Restricción De Este Documento

Este documento:

- sí debe describir cambios de backend
- sí debe documentar endpoints, contratos, ejemplos de request y response y notas de integración
- no debe sugerir qué construir, cambiar o renderizar en frontend
- no debe asumir la arquitectura interna del frontend
