# Diseño Técnico

## Contrato HTTP objetivo

```text
GET /v1/roles/options
Authorization: Bearer JWT
Guards: JwtAuthGuard, AuxiliaryCapabilitiesGuard
Capability: ROLES / READ_OPTIONS
```

No acepta query params y no tiene paginación. Responde el envelope estándar:

```json
{
  "success": true,
  "success_message": "...",
  "data": [
    {
      "role_id": "...",
      "role_code": "...",
      "role_name": "...",
      "system_role": "USER",
      "role_scope": "USER",
      "is_system": false,
      "is_default": false
    }
  ]
}
```

No incluye `pagination`. JWT inválido o ausente mantiene el `401` estándar;
una capability ausente mantiene el `403` estándar de autorización.

## Flujo

1. `JwtAuthGuard` construye el contexto autenticado.
2. `AuxiliaryCapabilitiesGuard` verifica `ROLES/READ_OPTIONS` contra el rol
   persistido del actor.
3. `GetAssignableRolesUseCase` filtra roles con `actorSystemRole`.
4. `RolePresenter.toOptionsResponse(...)` serializa el contrato sin
   paginación.
5. Las rutas legacy usan los pasos 3 y 4, pero conservan sus guards y
   permisos funcionales durante la compatibilidad temporal.

## Matriz de resultado

| Actor | Opciones |
| --- | --- |
| `MASTER_ADMIN` | default `MASTER_ADMIN`, default `ADMIN`, custom `USER` |
| `ADMIN` | default `ADMIN`, custom `USER` |
| `USER` | custom `USER` |

La capability no cambia esta matriz. La ruta nueva declara acceso reutilizable;
el caso de uso aplica la regla estructural de asignación.

## Registro de Artefactos

| Artefacto | Tipo | Ubicación | Responsabilidad | Dependencias | Estado |
| --- | --- | --- | --- | --- | --- |
| `GetAssignableRolesDto`, `AssignableRoleViewDto`, `GetAssignableRolesResultDto` | DTOs de aplicación | `src/internal/application/dto/role/role.dto.ts` | Representar la entrada por `actorSystemRole` y la salida no paginada de opciones asignables. | `SystemRole`, `RoleScope`. | modify |
| `GetAssignableRolesUseCase` | caso de uso | `src/internal/application/use-cases/role/get-assignable-roles.use-case.ts` | Resolver la matriz de roles asignables según jerarquía estructural. | `IRoleReadRepository`, `Role`, `RoleScope`, DTOs role. | new |
| export de caso de uso | barrel | `src/internal/application/use-cases/role/index.ts` | Hacer inyectable el caso de uso desde el registro global. | `GetAssignableRolesUseCase`. | modify |
| export de DTOs | barrel | `src/internal/application/dto/role/index.ts` | Exponer los DTOs de opciones desde el módulo `ROLES`. | `role.dto.ts`. | modify |
| `GetAssignableRolesQuery`, `GetAssignableRolesHandler` | query y handler CQRS | `src/internal/infra/cqrs/queries/role/get-assignable-roles.query.ts` | Adaptar el bus CQRS al caso de uso dueño. | DTOs role, `GetAssignableRolesUseCase`, `BaseQueryHandler`. | new |
| export CQRS role | barrel | `src/internal/infra/cqrs/queries/role/index.ts` | Exportar la query de opciones bajo `ROLES`. | query nueva. | modify |
| export CQRS global | barrel | `src/internal/infra/cqrs/queries/index.ts` | Reexportar el módulo role actualizado. | `queries/role`. | reuse |
| registro CQRS | composición Nest | `src/modules/global-cqrs.module.ts` | Registrar `GetAssignableRolesHandler` y retirar `GetUserRolesHandler`. | handlers CQRS. | modify |
| `RolePresenter.toOptionsResponse` | presenter HTTP | `src/internal/infra/api/presenters/role/role.presenter.ts` | Serializar opciones con el contrato existente de roles asignables. | resultado de opciones. | modify |
| `RoleController.options` | endpoint HTTP | `src/internal/infra/api/controllers/role/role.controller.ts` | Exponer `GET /v1/roles/options` antes de `:roleId`. | `QueryBus`, query nueva, `RolePresenter`, `JwtAuthGuard`, `AuxiliaryCapabilitiesGuard`, decorator auxiliar. | modify |
| `UserController.roles`, `UserController.creationRoles` | endpoints legacy | `src/internal/infra/api/controllers/user/user.controller.ts` | Mantener paths, guards y contratos existentes mientras delegan en la query de `ROLES`. | query nueva, `RolePresenter`. | modify |
| `UserRolePresenter` | presenter legacy eliminado | `src/internal/infra/api/presenters/user/user-role.presenter.ts` | Dejar de duplicar serialización de opciones fuera del módulo dueño. | Ninguna; reemplazado por `RolePresenter`. | modify |
| `GetUserRolesDto`, `UserRoleViewDto`, `GetUserRolesResultDto` | DTOs legacy eliminados | `src/internal/application/dto/user/get-user-roles.dto.ts` | Retirar el contrato interno user-owned sustituido por DTOs de `ROLES`. | Ninguna. | modify |
| `GetUserRolesUseCase` | caso de uso legacy eliminado | `src/internal/application/use-cases/user/get-user-roles.use-case.ts` | Retirar lógica duplicada trasladada al dominio dueño. | Ninguna. | modify |
| `GetUserRolesQuery`, `GetUserRolesHandler` | query legacy eliminada | `src/internal/infra/cqrs/queries/user/get-user-roles.query.ts` | Retirar adapter CQRS user-owned. | Ninguna. | modify |
| exports user afectados | barrels | `src/internal/application/dto/user/index.ts`, `src/internal/application/use-cases/user/index.ts`, `src/internal/infra/cqrs/queries/user/index.ts`, `src/internal/infra/api/presenters/user/index.ts` | Retirar exports legacy eliminados. | Artefactos legacy. | modify |
| `ROLES/READ_OPTIONS` | capability auxiliar de catálogo | `src/internal/application/services/authz/auxiliary-capabilities/auxiliary-capabilities.catalog.ts` | Declarar el lookup reutilizable dueño de roles. | catálogo authz. | modify |
| derivación de `ROLES/READ_OPTIONS` | reglas de derivación | `src/internal/application/services/authz/auxiliary-capabilities/auxiliary-capabilities-derivation.catalog.ts` | Otorgar la capability a roles con módulos directos `USERS` o `USER_REGISTRATION_INVITATIONS`. | catálogo de capabilities, módulos de autorización. | modify |
| `AuxiliaryCapabilitiesService`, guard y decorator | autorización reutilizada | `src/internal/application/services/authz/auxiliary-capabilities/auxiliary-capabilities.service.ts`, `src/internal/infra/api/guards/auxiliary-capabilities.guard.ts`, `src/common/decorators/auxiliary-capabilities.decorator.ts` | Validar catálogo, derivar y exigir la capability. | Rol persistido y metadata HTTP. | reuse |
| `systemRolesSeed` | seed existente | `src/internal/infra/persistence/mongoose/seeds/roles/system-roles.seed.ts` | Reconciliar roles default y custom desde el catálogo actualizado. | `deriveAuxiliaryCapabilitiesFromPermissions`. | reuse |
| `npm run db:seed:roles` | comando de datos ejecutado por usuario | `package.json` | Aplicar la reconciliación existente tras desplegar catálogo y derivaciones. | seed de roles, Mongo del entorno. | reuse |
| esquema, entidad y mapper `Role` | persistencia | `src/internal/domain/entities/role.entity.ts`, `src/internal/infra/persistence/mongoose/schemas/role/role.schema.ts`, `src/internal/infra/persistence/mongoose/mappers/role/mongoose-role.mapper.ts` | Persistir capabilities ya soportadas. | campo existente `auxiliary_capabilities`. | reuse |
| migración de base de datos | persistencia y datos | no aplica | No cambia esquema ni requiere backfill nuevo: el seed existente reconcilia el campo persistido. | seed de roles. | not_applicable |
| pruebas unitarias | verificación | no aplica | Fuera de alcance por política vigente solicitada por la persona usuaria. | validación manual y estática. | not_applicable |
| documentación backend | documentación viva | `docs/authorization/auxiliary-capabilities-mapping.md`, `docs/authorization/authorization-rules.md`, `docs/authorization/feature-permission-catalog.md`, `docs/technical-debt/user-role-assignment-options/role-options-capability-inconsistency.md` | Registrar capability, endpoint, transición legacy y resolución backend. | contrato implementado. | modify |

## Compatibilidad y retiro diferido

Las rutas legacy se mantienen en `UserController` sin cambio de path, payload ni
guard durante la migración de frontend. La limpieza futura retirará:

- `GET /v1/users/roles`
- `GET /v1/users/creation-roles`

Solo puede comenzar después de que todos los consumidores frontend usen
`GET /v1/roles/options`. Esa migración y el retiro se trabajarán en una spec
posterior; no son parte de esta implementación backend.

## Validación

- `npm run build`.
- `npx eslint "{src,apps,libs,test}/**/*.ts"` sin `--fix`.
- `git diff --check`.
- Validación manual con actores `MASTER_ADMIN`, `ADMIN` y `USER`, comprobando
  la matriz, ausencia de paginación y `403` sin capability.
- Después del despliegue de catálogo, la persona usuaria ejecuta
  `npm run db:seed:roles` y confirma el reporte de reconciliación.

No se crean ni ejecutan pruebas unitarias o e2e mientras la persona usuaria no
lo solicite explícitamente.
