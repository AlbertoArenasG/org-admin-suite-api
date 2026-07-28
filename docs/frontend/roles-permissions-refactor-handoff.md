# Handoff Frontend: Refactor De Roles Y Permisos

## Propósito

Este documento existe para dar contexto rápido a futuras sesiones de frontend sobre el refactor de roles y permisos de la API.

No es una spec histórica. Es un documento vivo de integración entre backend y frontend.

## Estado

- iniciativa: `roles-permissions-refactor`
- estado actual: `in_progress`
- última actualización: `2026-07-28`

## Objetivo Del Refactor

La API dejará atrás el modelo legacy basado en `User.role` como enum fijo y migrará a un modelo con:

- `systemRole`
- `roleId`
- roles custom persistidos
- permisos por `module + operation`

## Cambios De Modelo Que Frontend Debe Conocer

### Antes

- el usuario autenticado dependía conceptualmente de `role`
- varios flujos asumían enums legacy como `MASTER_ADMIN`, `ADMIN`, `STAFF`, `CUSTOMER`
- la autorización estaba acoplada a roles hardcodeados

### Después

- todo usuario tendrá:
  - `systemRole`
  - `roleId`
- los únicos `systemRole` serán:
  - `MASTER_ADMIN`
  - `ADMIN`
  - `USER`
- `MASTER_ADMIN` y `ADMIN` usan roles default del sistema
- `USER` siempre usa un rol custom
- los permisos efectivos se resolverán por `roleId`

## Nuevos Endpoints Esperados

### `GET /v1/auth/me/permissions`

Estado:

- `implemented`

Propósito:

- devolver el `systemRole` actual del usuario autenticado
- devolver metadata del rol resuelto
- devolver permisos efectivos en lista plana

Response esperada:

```json
{
  "success_message": "DEFAULT",
  "data": {
    "system_role": "ADMIN",
    "role": {
      "id": "role_123",
      "code": "ADMIN_DEFAULT",
      "name": "Administrador",
      "scope": "ADMIN",
      "is_system": true,
      "is_default": true,
      "is_immutable": true,
      "status": "ACTIVE"
    },
    "permissions": [
      { "module": "USERS", "operation": "READ" },
      { "module": "USERS", "operation": "UPDATE" }
    ]
  },
  "status_code": 200
}
```

Notas:

- la respuesta sigue el patrón estándar con `ApiResponseBuilder`
- la lista de permisos será plana, no agrupada por módulo
- durante la compatibilidad temporal, si el usuario aún no tiene `roleId`, el backend resuelve el rol por fallback:
  - default role de `MASTER_ADMIN`
  - default role de `ADMIN`
  - `STAFF_LEGACY` para `USER`

### Endpoints de administración de roles custom

Estado:

- `in_progress`

Endpoints esperados:

- `GET /v1/roles`
- `POST /v1/roles`
- `GET /v1/roles/:roleId`
- `PATCH /v1/roles/:roleId`
- `PATCH /v1/roles/:roleId/status`
- `DELETE /v1/roles/:roleId`
- `GET /v1/roles/modules`
- `GET /v1/roles/operations`

Estado puntual:

- `GET /v1/roles` implementado
- `GET /v1/roles/:roleId` implementado
- `POST /v1/roles` implementado
- `PATCH /v1/roles/:roleId` implementado
- `PATCH /v1/roles/:roleId/status` implementado
- `DELETE /v1/roles/:roleId` implementado
- `GET /v1/roles/modules` implementado
- `GET /v1/roles/operations` implementado

Detalles de integración:

- `PATCH /v1/roles/:roleId` devuelve el rol actualizado con el mismo shape de detalle de `GET /v1/roles/:roleId`
- `PATCH /v1/roles/:roleId/status` acepta `status_id` con `ACTIVE` o `INACTIVE`
- `DELETE /v1/roles/:roleId` realiza borrado lógico y responde con `data: null`
- `GET /v1/roles/modules` ya responde desde el catálogo en código
- `GET /v1/roles/operations` ya responde desde el catálogo en código
- el backend bloquea por ahora cualquier mutación ordinaria sobre roles del sistema o roles inmutables
- el backend también bloquea borrar un rol si todavía existen usuarios vinculados a ese `roleId`

Cambio de diseño aprobado:

- el catálogo técnico de permisos ya no debe considerarse fuente de verdad en Mongo
- la fuente de verdad objetivo será un catálogo en código
- los `code` técnicos serán en mayúsculas
- los nombres visibles deben resolverse por i18n usando `nameKey`

Shape objetivo conceptual:

```json
{
  "module_code": "USERS",
  "module_name": "Usuarios",
  "module_name_key": "AUTHORIZATION.MODULE.USERS"
}
```

Respuesta actual esperada para módulos:

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

Respuesta actual esperada para operaciones:

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

## Scripts Operativos Nuevos

### Migración legacy de usuarios

Estado:

- `implemented`
- `not executed yet`

Comandos disponibles:

```bash
npm run db:migrate:users-system-role:dry-run
npm run db:migrate:users-system-role:apply
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

## Endpoints Existentes Que Cambiarán De Sentido

### `GET /v1/users/roles`

Estado actual:

- existe hoy en el backend
- ya consulta roles asignables desde la colección `roles`
- devuelve metadata real del rol asignable

Cambio esperado:

- el nombre del endpoint sigue siendo legacy
- el contrato ya no devuelve solo enums fijos
- más adelante podría renombrarse o reemplazarse por un endpoint más explícito

Response actual aproximada:

```json
{
  "success_message": "DEFAULT",
  "data": [
    {
      "role_id": "role_123",
      "role_code": "ADMIN_DEFAULT",
      "role_name": "Administrador",
      "role_scope": "ADMIN",
      "is_system": true,
      "is_default": true
    },
    {
      "role_id": "role_456",
      "role_code": "STAFF_LEGACY",
      "role_name": "Staff Legacy",
      "role_scope": "USER",
      "is_system": false,
      "is_default": false
    }
  ],
  "status_code": 200
}
```

### `POST /v1/users`

Cambio esperado:

- dejará de depender de `role` legacy
- deberá trabajar con `systemRole` y `roleId`

### `PATCH /v1/users/:userId`

Cambio esperado:

- deberá soportar transición estructural de usuario
- promoción, degradación y reasignación de rol quedarán sujetas al nuevo modelo

## Endpoints Legacy O Zonas A Revisar

Estas áreas existen hoy y deben tratarse como sensibles durante la migración:

- `GET /v1/users/roles`
- flows que todavía devuelven o aceptan roles legacy en contratos temporales
- flows que todavía persisten invitaciones con `role` legacy
- puntos donde `roleId` sigue quedando temporalmente en `null`

## Reglas De Interpretación Del Modelo

- `systemRole` no reemplaza permisos; define jerarquía estructural
- `roleId` y sus permisos resuelven acciones ordinarias de negocio
- `MASTER_ADMIN` representa soporte/plataforma, no negocio ordinario
- `ADMIN` representa administración de negocio
- `USER` es una categoría amplia cuyo comportamiento depende del rol custom asignado

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

Este documento debe actualizarse conforme cambie cualquiera de estas cosas:

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
