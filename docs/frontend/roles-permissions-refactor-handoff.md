# Handoff Frontend: Refactor De Roles Y Permisos

## Propósito

Este documento existe para dar contexto rápido a futuras sesiones de frontend sobre el refactor de roles y permisos de la API.

No es una spec histórica. Es un documento vivo de integración entre backend y frontend.

## Estado

- iniciativa: `roles-permissions-refactor`
- estado actual: `planned`
- última actualización: `2026-07-27`

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

- `planned`

Endpoints esperados:

- `GET /v1/roles`
- `GET /v1/roles/:roleId`
- `POST /v1/roles`
- `PATCH /v1/roles/:roleId`
- endpoint para activar o desactivar rol
- endpoints para catálogos de módulos y operaciones

Nota:

- la forma exacta de estos contratos aún no se implementa

## Endpoints Existentes Que Cambiarán De Sentido

### `GET /v1/users/roles`

Estado actual:

- existe hoy en el backend
- devuelve roles asignables del modelo legacy

Cambio esperado:

- debe migrar a lógica basada en roles del nuevo modelo
- es posible que cambie de contrato o que sea reemplazado por un endpoint más explícito

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
- controllers que hoy dependen de `ensureAuthorized()`
- flows que hoy usan `currentUser.role`
- flows que hoy usan `currentUser.isMaster`

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
