# Diseño Técnico

## Contrato HTTP

| Método  | Ruta                         | Autorización                                          | Respuesta                                                         |
| ------- | ---------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------- |
| `PATCH` | `/v1/users/:userId/password` | JWT + `USERS/UPDATE_PASSWORD` + jerarquía estructural | `200` con mensaje `USER.UPDATED`, sin secreto ni recurso completo |

Body:

```json
{ "password": "NuevaContraseñaSegura" }
```

`password` usa `UserPasswordPolicy.MIN_PASSWORD_LENGTH` y
`UserPasswordPolicy.ensureSecure()`.

## Flujo

1. `PermissionsGuard` exige `USERS/UPDATE_PASSWORD`.
2. El caso de uso carga al usuario; uno eliminado se trata como no encontrado.
3. Si el objetivo es distinto al actor, verifica
   `AuthorizationService.ensureCanManageTargetSystemRole(actor, target)`.
4. Valida la contraseña, genera bcrypt hash, ejecuta `user.updatePassword()` y
   persiste el usuario con el repositorio existente.
5. Invalida tokens de recuperación pendientes del objetivo, siguiendo el
   patrón actual de `ResetUserPasswordUseCase`.
6. Devuelve éxito sin serializar contraseña ni hash.

El self-target omite solo la validación jerárquica; no omite el guard de la
capability.

## Registro de Artefactos

| Artefacto                                      | Tipo                      | Ubicación                                                                                                                                                                             | Responsabilidad                                                                                                  | Dependencias                                  | Estado         |
| ---------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | -------------- |
| `UPDATE_PASSWORD`                              | operación de autorización | `src/internal/application/services/authz/authorization-operations.catalog.ts`                                                                                                         | Declarar la operación canónica permitida por el catálogo.                                                        | `AuthorizationOperationCode`.                 | modify         |
| `UPDATE_PASSWORD`                              | operación de autorización | `src/internal/application/services/authz/authorization.catalog.ts`                                                                                                                    | Registrar la capability funcional de Usuarios.                                                                   | Catálogo y seed de roles.                     | modify         |
| `systemRolesSeed`                              | seed                      | `src/internal/infra/persistence/mongoose/seeds/roles/system-roles.seed.ts`                                                                                                            | Persistir el permiso en roles de sistema existentes.                                                             | `AUTHORIZATION_CATALOG`.                      | reuse          |
| Roles custom existentes                        | datos de autorización     | seed general existente                                                                                                                                                                | Conservar permisos funcionales actuales; no aplicar backfill.                                                    | N/A.                                          | reuse          |
| `UpdateUserPasswordDto`                        | DTO de aplicación         | `src/internal/application/dto/user/update-user-password.dto.ts`                                                                                                                       | Transportar actor, objetivo y contraseña.                                                                        | `SystemRole`.                                 | new            |
| Export de DTO de aplicación                    | composición               | `src/internal/application/dto/user/index.ts`                                                                                                                                          | Exponer el DTO para el caso de uso y su composición.                                                             | `UpdateUserPasswordDto`.                      | modify         |
| `UpdateUserPasswordUseCase`                    | caso de uso               | `src/internal/application/use-cases/user/update-user-password.use-case.ts`                                                                                                            | Validar, autorizar, hashear, persistir e invalidar tokens.                                                       | Usuario, authz, reset-token write repository. | new            |
| `UpdateUserPasswordCommandAdapter` y handler   | CQRS command              | `src/internal/infra/cqrs/commands/user/update-user-password.handler.ts`                                                                                                               | Adaptar el DTO al caso de uso.                                                                                   | `UpdateUserPasswordUseCase`.                  | new            |
| `UpdateUserPasswordRequestDto`                 | request DTO               | `src/internal/infra/api/dto/user/update-user-password.request.dto.ts`                                                                                                                 | Validar body y mapear el contrato HTTP.                                                                          | Política de contraseña, DTO de aplicación.    | new            |
| Export de request DTO                          | composición               | `src/internal/infra/api/dto/user/index.ts`                                                                                                                                            | Exponer el DTO HTTP al controlador.                                                                              | `UpdateUserPasswordRequestDto`.               | modify         |
| `UserController`                               | controlador               | `src/internal/infra/api/controllers/user/user.controller.ts`                                                                                                                          | Exponer la ruta dedicada de contraseña.                                                                          | CommandBus, guard, decorador de permiso.      | modify         |
| Registro CQRS y aplicación                     | composición               | `src/internal/infra/cqrs/commands/user/index.ts`, `src/internal/application/use-cases/user/index.ts`, `src/modules/global-cqrs.module.ts`, `src/modules/global-application.module.ts` | Exportar y registrar command, handler y caso de uso.                                                             | Nest DI/CQRS.                                 | modify         |
| `UserPasswordPolicy` y `User.updatePassword()` | dominio                   | rutas existentes                                                                                                                                                                      | Reutilizar reglas de seguridad y mutación de entidad.                                                            | Ninguna nueva.                                | reuse          |
| Repositorios de usuario y reset token          | persistencia              | rutas existentes                                                                                                                                                                      | Reutilizar actualización e invalidación sin esquema nuevo, siguiendo el flujo secuencial actual de recuperación. | Ninguna transacción compartida.               | reuse          |
| Migración/backfill/índice                      | persistencia y datos      | no aplica                                                                                                                                                                             | No cambia colecciones ni datos estructurales.                                                                    | N/A.                                          | not_applicable |
| Prueba unitaria                                | verificación              | no aplica                                                                                                                                                                             | El proyecto no desarrolla pruebas unitarias salvo solicitud expresa.                                             | Política vigente.                             | not_applicable |
| Validación manual y estática                   | verificación              | spec y comandos del proyecto                                                                                                                                                          | Verificar contrato, autorización, jerarquía y seed.                                                              | Persona usuaria para seed.                    | new            |
