# Progress

## 2026-05-26

- Se creo la estructura inicial de `.specs`.
- Se documento el analisis inicial del refactor de roles y permisos.
- Se propuso un plan por fases.
- Se creo una task list estable en orden fijo por fase.

## 2026-05-29

- Se agrego `00-definition.md` para cerrar decisiones antes de implementar.
- Se formalizo la diferencia entre documento de definicion activa y registro historico de decisiones.

## 2026-07-12

- Se aprobaron las decisiones base del modelo de usuario.
- Se cerraron los `systemRole` en `MASTER_ADMIN`, `ADMIN` y `USER`.
- Se definio que existiran roles default del sistema, permanentes e inmutables.
- Se dejo como siguiente paso cerrar la estructura exacta de `Role`.

## 2026-07-26

- Se corrigio la definicion para dejar explicitamente que `USER` no tiene rol default del sistema.
- Se cerro la estructura funcional de `Role` y de `Role.permissions`.
- Se aprobaron catalogos controlados de `modules` y `operations`, persistidos en Mongo y sembrados por scripts idempotentes.
- Se aprobo el catalogo inicial de modulos alineado a las features reales del repo.
- Se cerro la mayor parte de las reglas estructurales de visibilidad, asignacion y cambio de `systemRole`.
- Se marco formalmente como aprobada la estructura de `Role`.
- Se formalizaron las capacidades exclusivas de `MASTER_ADMIN` y su ubicacion bajo `controllers/master-admin`.
- Se aprobo JWT minimo con evolucion del `authContext` existente y endpoint dedicado para permisos efectivos.
- Se aprobo la politica de migracion legacy basada en los datos reales existentes.
- Se consolidaron y aprobaron formalmente las reglas de asignacion de roles y cambio de `systemRole`.
- Se decidió documentar el patrón permanente de pipeline en `docs/api-pipeline.md`.

## 2026-07-27

- Se decidió sacar el catálogo funcional de features y permisos fuera de `.specs` para convertirlo en documento vivo del proyecto.
- Se creó `docs/authorization/feature-permission-catalog.md` como referencia permanente en español.
- La spec actual quedó enlazada al catálogo operativo para futuras iniciativas e implementaciones.
- Se aterrizó el catálogo contra los controllers reales del repo con mapeo de endpoints, operaciones y tipo de acceso.
- Se dejaron señalados los casos especiales del estado actual, incluyendo endpoints públicos y endpoints internos sin guard activo.
- Se formalizó la norma permanente de autorización en `docs/authorization/authorization-rules.md`.
- Se cerró en la spec técnica la interfaz propuesta de `AuthorizationService`, junto con el shape objetivo del `authContext` y sus DTOs estructurales de soporte.
- Se cerró el contrato esperado de `GET /v1/auth/me/permissions` con metadata ampliada del rol y permisos efectivos en lista plana.
- Se creó `docs/frontend/roles-permissions-refactor-handoff.md` como documento vivo para dar contexto a futuras sesiones de frontend.
- Se cerró el contrato propuesto de `@RequirePermission` y `PermissionsGuard`, incluyendo su convivencia con restricciones estructurales de `MASTER_ADMIN`.
- Se documentó el runbook de migración sin interrupción, incluyendo compatibilidad temporal, seeders idempotentes, script manual con `dry-run` y validaciones previas y posteriores.
- Se aterrizó el diseño concreto del script de migración de usuarios legacy, incluyendo ubicación, comando sugerido, algoritmo, reportes y condiciones de fallo/éxito.
- La definición quedó cerrada con suficiente detalle para iniciar implementación por slices pequeños.
- Se definió la microfase técnica de `seeds` y `migrations`, incluyendo estructura de carpetas, runner base, contexto compartido y comandos sugeridos para `package.json`.
- Se implementó la primera microfase de dominio del refactor con `role.entity.ts` y los enums base `SystemRole`, `RoleScope`, `RoleStatus` y `CatalogStatus`.
- Se implementó la siguiente microfase de contratos de dominio con puertos de lectura/escritura para `Role` y puertos de lectura para `permission modules` y `permission operations`.
- Se implementó la microfase de persistencia base con los schemas Mongoose de `roles`, `permission_modules` y `permission_operations`, además de su registro en exports y `schemas.config.ts`.
- Se implementó la microfase de mappers Mongoose para `Role`, `PermissionModule` y `PermissionOperation`, manteniendo la separación entre dominio, puertos e infraestructura.
- Se implementó la microfase de repositorios Mongoose para `Role`, `PermissionModule` y `PermissionOperation`.
- Se completó el wiring de repositorios nuevos en `mongoose-repositories.config.ts`, dejando cerrada la base de persistencia del Slice 1 antes de entrar a seeds.
- Se implementó la infraestructura base de `db:seed`, incluyendo runner, contexto compartido, logger, carga validada de entorno y registro inicial de seeds por categoría.
- Se registró el script `db:seed` en `package.json`, dejando listo el siguiente slice para cargar seeds idempotentes reales de módulos, operaciones y roles base.
- Se implementó el primer seed idempotente real del catálogo con `permission-operations.seed.ts`, alineado al catálogo inicial CRUD aprobado en la documentación de autorización.
- Se implementó `permission-modules.seed.ts` con un alcance mínimo de arranque para `users` y `roles`, manteniendo el refactor enfocado primero en gestión de usuarios y roles antes de abrir el catálogo completo del sistema.
- Se implementó `system-roles.seed.ts` para crear y sincronizar `MASTER_ADMIN_DEFAULT` y `ADMIN_DEFAULT` con permisos completos sobre `users` y `roles`, manteniendo las diferencias exclusivas de `MASTER_ADMIN` como reglas estructurales fuera del catálogo de permisos.
- Se implementó `legacy-staff-role.seed.ts` para garantizar la existencia de `STAFF_LEGACY` como rol custom de `USER` con permisos vacíos, dejando listo el prerequisito de `roleId` obligatorio antes de migrar usuarios legacy.
- Se inició la ventana de compatibilidad temporal del Slice 2: `User` ahora soporta `systemRole + roleId` sin romper todavía a los consumidores legacy de `role`.
- Se ajustaron `user.entity.ts`, `user.schema.ts`, `mongoose-user.mapper.ts` y la lectura Mongoose de usuarios para persistir y leer `system_role` y `role_id` junto con el campo legacy `role` mientras termina la migración del resto del backend.
- Se propagó `systemRole` y `roleId` a DTOs, mappers y presenters de usuario y autenticación, manteniendo `role` en paralelo como campo de compatibilidad temporal para no romper contratos existentes de la API demasiado pronto.
