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
- Se implementó `system-roles.seed.ts` para crear y sincronizar `MASTER_ADMIN_DEFAULT` y `ADMIN_DEFAULT`, y después se fortaleció para derivar automáticamente todos los permisos vigentes desde el catálogo en código, persistiéndolos con `module + operation` canónicos en mayúsculas.
- Se implementó `legacy-staff-role.seed.ts` para garantizar la existencia de `STAFF_LEGACY` como rol custom de `USER` con permisos vacíos, dejando listo el prerequisito de `roleId` obligatorio antes de migrar usuarios legacy.
- Se inició la ventana de compatibilidad temporal del Slice 2: `User` ahora soporta `systemRole + roleId` sin romper todavía a los consumidores legacy de `role`.
- Se ajustaron `user.entity.ts`, `user.schema.ts`, `mongoose-user.mapper.ts` y la lectura Mongoose de usuarios para persistir y leer `system_role` y `role_id` junto con el campo legacy `role` mientras termina la migración del resto del backend.
- Se propagó `systemRole` y `roleId` a DTOs, mappers y presenters de usuario y autenticación, manteniendo `role` en paralelo como campo de compatibilidad temporal para no romper contratos existentes de la API demasiado pronto.
- Se movió la jerarquía interna de `UserRolePolicy` a `SystemRole`, reduciendo la dependencia de ranking contra roles legacy y alineando los primeros use cases de aplicación al nuevo criterio estructural.
- Se ajustaron los flujos de creación, actualización y borrado de usuarios para preferir `systemRole` en las decisiones estructurales, manteniendo compatibilidad temporal con `role` mientras el resto del pipeline termina de migrar.
- Se ajustaron invitaciones de usuario y `GetUserRoles` para aceptar `systemRole` en paralelo al `role` legacy, reduciendo otra capa de dependencia runtime al modelo anterior sin romper todavía los contratos existentes.
- Se migró el payload JWT a `sub + systemRole + roleId`, y el `JwtAuthGuard` ahora reconstruye un `authContext` compatible con el pipeline actual derivando `role` e `isMaster` desde `systemRole` mientras termina la transición del resto de controllers y guards.
- Se implementó `GET /v1/auth/me/permissions` siguiendo el pipeline CQRS del repo, resolviendo metadata del rol actual y permisos efectivos con compatibilidad temporal para usuarios que aún no tienen `roleId`.
- Se implementó la primera base reutilizable de autorización centralizada con `AuthorizationService`, `@RequirePermission(...)` y `PermissionsGuard`, y `me/permissions` quedó reutilizando esa misma resolución de permisos para no duplicar lógica.
- Se migró `customer.controller` al patrón objetivo con `JwtAuthGuard + PermissionsGuard + @RequirePermission(...)`, eliminando ahí el primer `ensureAuthorized()` real de negocio.
- Se migró `provider.controller` al mismo patrón centralizado de permisos, dejando otro controller CRUD de negocio fuera de la validación hardcodeada por roles legacy.
- Se migró `service-entry.controller` al mismo patrón centralizado, cubriendo `service_entries` y `service_entry_surveys` con permisos explícitos por endpoint y eliminando otro `ensureAuthorized()` legacy.
- Se revisó `file.controller` y se migraron sus endpoints internos de subida y metadata a `PermissionsGuard` con el módulo `files`, dejando documentado que `POST /v1/files/public` y `GET /v1/files/:fileId/download` permanecen temporalmente fuera del guard centralizado por su naturaleza pública/mixta actual.
- Se retiró `FILES` del catálogo funcional objetivo en código y documentación. `POST /v1/files` y `GET /v1/files/:fileId` quedaron únicamente con `JwtAuthGuard`, sin `PermissionsGuard` ni permisos `FILES/*`, mientras `GET /v1/files/:fileId/download` se mantiene sin guard por su uso transversal público/autenticado.
- Se revisó `service-package.controller` y se migraron los endpoints autenticados de `records` al patrón centralizado con el módulo `service_packages`. Posteriormente se cerró la definición funcional del endpoint `POST /v1/service-packages/uploads`: queda fuera del catálogo de backoffice porque hoy es consumido por `pwa-recoleccion` sin flujo de autenticación.
- Se retiró `public_access_token` de la respuesta de `POST /v1/services/service-entry`. El token sigue existiendo para construir y notificar la URL pública por correo, pero deja de formar parte del contrato HTTP de creación.
- Se aisló el acceso público sensible de `customers`: `GET /v1/customers` y `GET /v1/customers/:customerId` ya no exponen `public_access_token` ni `public_access_url`, y ahora existe `GET /v1/customers/:customerId/public-access` protegido por `CUSTOMERS/READ_PUBLIC_ACCESS`.
- Se aisló el acceso público sensible de `providers`: `GET /v1/providers` y `GET /v1/providers/:providerId` ya no exponen `public_access_token` ni `public_access_url`, y ahora existe `GET /v1/providers/:providerId/public-access` protegido por `PROVIDERS/READ_PUBLIC_ACCESS`.
- Se cerraron los pendientes residuales del tracker para `service_entries` y `files`: quedó explícito en el spec que `service_entries.READ` no requiere `READ_PUBLIC_ACCESS`, y que `GET /v1/files/:fileId/download` permanece sin guard por decisión temporal documentada, no por omisión.
- Se alineó finalmente el módulo `users` con la definición aprobada: `USERS` salió del `CREATE` de negocio, `POST /v1/users` dejó de existir en el scope normal, y el alta directa quedó reservada a `POST /v1/master-admin/users` bajo frontera estructural `MASTER_ADMIN`.
- Se revisó la frontera `master-admin/*` y se mantuvo su exclusividad con `MasterScopeGuard`, pero sus flows dejaron de propagar `currentUser.role` legacy hacia CQRS y use cases, usando `systemRole` del actor como identidad estructural.
- Se migró `user.controller` al patrón HTTP centralizado con `PermissionsGuard` y permisos explícitos del módulo `users`, manteniendo por ahora en application las validaciones estructurales y la consulta legacy de roles asignables.
- Se ajustaron los flows internos de `create user`, `delete user` y `GetUserRoles` para tomar `actorSystemRole` como contrato principal, reduciendo otra capa de dependencia runtime a `UserRole` legacy sin rediseñar todavía el request model legacy de usuarios.
- Se ajustó `update user` para que las decisiones estructurales de privilegios y cambio de autorización usen `actorSystemRole` desde controller hasta application, manteniendo todavía el request DTO legacy basado en `role_id` mientras se rediseña el payload final.
- Se ajustó `create user registration invitation` para usar `actorSystemRole` desde controller hasta use case, manteniendo por ahora el request DTO legacy que sigue enviando `role_id`.
- Se ajustó `complete invitation` para que el usuario creado desde una invitación persistida con `role` legacy también hidrate `systemRole` explícito al momento del alta, manteniendo temporalmente `roleId` en `null` mientras se rediseña el modelo final de invitaciones.
- Se ajustaron los request DTOs de `create master user` y `create master user registration invitation` para hidratar `systemRole` explícito desde `role_id`, manteniendo todavía el contrato HTTP legacy mientras el frontend no migra al payload nuevo.
- Se ajustó `GetUserById` para que la restricción sobre usuarios `MASTER_ADMIN` dependa de `actorSystemRole` en lugar de un booleano `actorIsMaster`, reduciendo otra capa de compatibilidad ad hoc en queries de usuario.
- Se ajustó el request DTO de `create user registration invitation` para hidratar `systemRole` explícito desde `role_id`, manteniendo por ahora `roleId` en `null` mientras se sigue usando el contrato legacy del endpoint.
- Se ajustó el listado de usuarios para transportar `actorSystemRole` desde controller hasta repositorio, eliminando otra dependencia a un booleano derivado como `includeMasterUsers`.
- Se revisó `update my profile` y quedó formalmente cerrado dentro del slice porque no depende de reglas estructurales de rol ni de compatibilidad `isMaster`/`role`.
- Se migró `user-registration-invitation.controller` para declarar `user_registration_invitations.CREATE` mediante `PermissionsGuard`, alineando también el backoffice de invitaciones ordinarias al patrón centralizado.
- Se ajustó `master-user-registration-invitation.controller` para combinar `PermissionsGuard` con `MasterScopeGuard`, dejando explícita la convivencia entre permiso funcional y frontera estructural `MASTER_ADMIN`.
- Se ajustó `master-admin-user.controller` al mismo patrón combinado, declarando `users.CREATE` junto con la restricción estructural de `MASTER_ADMIN`.
- Se corrigió la documentación operativa para reflejar que `customer`, `provider`, `service-entry`, `user` e invitaciones internas ya no dependen de `ensureAuthorized()`, cerrando también esa deuda técnica como tarea cumplida en el spec.
- Se reemplazó la lógica hardcodeada de `GetUserRoles` por una consulta basada en la colección `roles`, devolviendo roles asignables reales según el `actorSystemRole` y no solo enums legacy.
- Se actualizó el presenter y el handoff de frontend para reflejar el nuevo shape de `GET /v1/users/roles`, incluyendo `role_id`, `role_code`, `role_name`, `role_scope`, `is_system` e `is_default`.
- Se enriqueció `GET /v1/users/roles` para devolver también `system_role` explícito por opción asignable, manteniendo `role_scope` como metadata del rol y facilitando a frontend distinguir de forma directa los defaults especiales de `MASTER_ADMIN` y `ADMIN` frente a roles custom de `USER`.
- Se creó la base de DTOs de application para el CRUD de `roles`, incluyendo contratos de creación, edición, listado, cambio de estado, borrado y representación de permisos del rol.
- Se implementaron los request DTOs HTTP de `roles` para creación, edición, listado y cambio de estado, alineados al estilo `snake_case` y al pipeline del repo.
- Se implementó `RolePresenter` junto con los exports necesarios para presentar respuestas de detalle, colección, creación y cambio de estado del módulo `roles`.
- Se implementaron las primeras piezas CQRS de `roles` para `GET /roles`, `GET /roles/:roleId` y `POST /roles`, junto con sus use cases de aplicación y el mapper interno de `Role` hacia DTOs de vista.
- Se agregaron códigos de excepción específicos para `ROLE` no encontrado y para conflictos de unicidad por `ROLE.NAME` y `ROLE.CODE`, dejando mejor aterrizado el manejo de errores del módulo.
- Se expuso el primer controller HTTP de `roles` con `GET /v1/roles`, `GET /v1/roles/:roleId` y `POST /v1/roles`, todos bajo `JwtAuthGuard + PermissionsGuard + @RequirePermission(...)`.
- Se registraron los handlers de `roles` en el `GlobalCqrsModule` y se actualizaron los índices de controllers para dejar visible el módulo dentro del runtime de la API.
- Se actualizó el catálogo de permisos y el handoff de frontend para reflejar que el módulo `roles` ya está en estado `in_progress` con lectura y creación implementadas.
- Se completó la siguiente tanda del CRUD de `roles` con `PATCH /v1/roles/:roleId`, `PATCH /v1/roles/:roleId/status` y `DELETE /v1/roles/:roleId`, todos siguiendo el mismo pipeline CQRS y `PermissionsGuard`.
- Se agregó la regla de aplicación para impedir mutaciones ordinarias sobre roles del sistema, roles default e inmutables, reservando esas capacidades a futuros flows especiales de `MASTER_ADMIN`.
- Se agregó la validación para impedir el borrado lógico de un rol cuando todavía tiene usuarios vinculados por `roleId`.
- Se cerró el Slice 5 con `GET /v1/roles/modules` y `GET /v1/roles/operations`, exponiendo por HTTP los catálogos activos sembrados en Mongo para construir permisos de roles desde datos reales del sistema.
- Se fortaleció `AuthorizationService` como capa estructural central, agregando validaciones explícitas para jerarquía entre `MASTER_ADMIN`, `ADMIN` y `USER`, además de la consistencia entre `systemRole` y `roleId`.
- Se migraron los flows de `create user`, `create master user`, `create application invitation`, `create master invitation`, `update user` y `delete user` para depender de `AuthorizationService` en lugar de `UserRolePolicy` como mecanismo principal de autorización estructural.
- Se dejó documentada y encapsulada una compatibilidad temporal para flows legacy que todavía crean o invitan usuarios `USER` sin `roleId` explícito mientras el contrato HTTP antiguo siga vivo.
- Se implementó la infraestructura base de `migrations` con utilidades compartidas para cargar entorno, conectar a Mongo, parsear modo de ejecución y emitir logs con prefijo propio.
- Se implementó `migrate-users-to-system-role-and-role-id.ts` con modos explícitos `--dry-run` y `--apply`, manteniendo la regla de no ejecutar ninguna migración automáticamente al levantar la app.
- El script ya valida precondiciones bloqueantes, exige la existencia de `MASTER_ADMIN_DEFAULT`, `ADMIN_DEFAULT` y `STAFF_LEGACY`, detecta roles legacy inesperados como `CUSTOMER` o `MASTER_STAFF`, construye el plan de migración y verifica integridad final después de `--apply`.
- Se registraron los comandos `db:migrate:users-system-role:dry-run` y `db:migrate:users-system-role:apply` en `package.json`, dejando lista la ejecución manual controlada cuando decidas correrla sobre la base remota.
- Se revisó la decisión del catálogo técnico de permisos y se aprobó mover la fuente de verdad desde Mongo hacia código.
- Se definió como nuevo objetivo un catálogo agrupado por módulo, con `code` en mayúsculas, `nameKey` para i18n y operaciones válidas por módulo.
- Se documentó el plan de transición para migrar endpoints y validaciones desde `permission_modules` y `permission_operations` hacia el catálogo en código antes de eliminar infraestructura sobrante.
- Se implementó el catálogo en código dentro de `application/services/authz`, incluyendo módulos reales del sistema, operaciones controladas y helpers para normalizar y validar permisos.
- `GET /v1/roles/modules` y `GET /v1/roles/operations` dejaron de depender de Mongo y ahora responden desde el catálogo en código, resolviendo nombres visibles mediante i18n.
- La creación y actualización de roles custom ahora validan sus permisos contra el catálogo en código y normalizan `module + operation` hacia `code` técnico en mayúsculas.
- `AuthorizationService` ahora normaliza y filtra permisos efectivos usando el catálogo en código, reduciendo dependencia runtime a combinaciones libres o inconsistentes.
- Se retiró del runtime la infraestructura Mongo obsoleta de `permission_modules` y `permission_operations`, incluyendo puertos, schemas, mappers, repositorios, wiring y seeds que ya no eran fuente de verdad.
- Se aprobó cerrar también la convención de identidad de roles para que `role_id` sea idéntico a `code`, eliminando ids opacos en esta entidad.
- Se definió como siguiente paso una migración controlada adicional para convertir tanto `roles.role_id` como `users.role_id` al valor canónico basado en `code`.
- Se implementó el cambio de modelo para que todo rol nuevo nazca con `role_id = code`, incluyendo entidad, schema y seeds.
- Se agregó compatibilidad temporal de lectura para resolver roles por `role_id` histórico o por `code` durante la ventana de transición.
- Se implementó la migración manual `migrate-role-ids-to-code` con modos `dry-run` y `apply`, enfocada en convertir roles existentes y sus referencias de usuario sin duplicar datos.
- Se corrigió la migración `migrate-role-ids-to-code` para actualizar `roles.role_id` mediante el driver nativo de Mongo y no por el model de Mongoose, evitando el bloqueo de `immutable: true` durante la conversión de datos legacy.
- Se ejecutaron manualmente las migraciones de datos sobre la base remota: primero `users -> system_role + role_id` y después `role_id == code`, dejando usuarios y roles alineados al identificador canónico basado en `code`.
- Se cerró el contrato HTTP de entrada para `create/update user` y para creación de invitaciones, dejando de aceptar `UserRole` legacy y pidiendo ya `system_role + role_id` como shape nativo.
- Se ajustó la persistencia de invitaciones para guardar `system_role` y `role_id`, manteniendo lectura compatible con invitaciones legacy que solo tenían `role`.
- Se actualizó el consumo de invitaciones para crear usuarios desde `systemRole + roleId`, eliminando la dependencia principal al enum legacy en ese flujo.
- Se simplificó el `authContext` autenticado para que transporte solo `userId`, `systemRole`, `roleId` y `token`, eliminando `role` e `isMaster` como runtime state del guard JWT.
- Se limpió el listado de usuarios para ocultar `MASTER_ADMIN` basándose únicamente en `system_role`, quitando la mezcla anterior con checks sobre `role` legacy.
- La entidad `User` dejó de cargar `role` como estado de dominio; ahora el modelo runtime se sostiene en `systemRole + roleId` y el campo legacy solo se deriva al persistir en Mongo por compatibilidad temporal.
- Las respuestas HTTP de usuario y login dejaron de exponer `role` y `role_name`, reforzando que el contrato público vigente se basa en `system_role` y `role_id`.
- Se retiró `UserRolePolicy` del runtime porque sus reglas ya habían sido absorbidas por `AuthorizationService`.
- Se alinearon `docs/authorization/authorization-rules.md` y `docs/frontend/roles-permissions-refactor-handoff.md` al estado actual del backend, eliminando referencias ya obsoletas al `authContext` viejo y al contrato de salida legacy de usuarios.
- Durante la validación manual en Postman apareció y se corrigió un bug de normalización en `AuthorizationService`: los permisos efectivos ya se resolvían como `MODULE/OPERATION` en mayúsculas, pero la verificación seguía comparando contra decorators legacy en minúsculas como `users/READ`, provocando falsos `403` para roles que sí tenían permisos válidos.
- Se ajustó el diseño de self-service del usuario autenticado para que `GET /v1/users/me` y `PATCH /v1/users/me` dejen de depender de `USERS/READ` y `USERS/UPDATE`; ahora viven solo bajo autenticación JWT porque consultar o editar el propio perfil no equivale a administrar usuarios de terceros.
- Se dejó preparado el rerun de `db:seed` como mecanismo idempotente para sincronizar en la base remota los permisos completos y ya normalizados de `MASTER_ADMIN_DEFAULT` y `ADMIN_DEFAULT` sin duplicar datos.
- Se enriqueció `GET /v1/auth/me/permissions` para devolver también `modules` agregados y metadata localizada por `x-user-lang` tanto en módulos como en permisos, facilitando integración con navegación y controles finos del frontend sin acoplar el backend a una UI concreta.
- Se corrigió el listado de `roles` para que usuarios `ADMIN` no vean roles de `scope = MASTER_ADMIN`, propagando `actorSystemRole` hasta el repositorio y aplicando el filtro estructural también sobre la paginación y el total.
- Se enriquecieron `GET /v1/users`, `GET /v1/users/:userId` y `GET /v1/users/me` para incluir `role_name` como metadata descriptiva del `role_id` resuelto, obteniendo ese nombre desde el repositorio de roles sin reintroducir `role` legacy en el contrato principal.
- Se actualizó el handoff de frontend en `docs/frontend/roles-permissions-refactor-handoff.md` para reflejar este ajuste de contrato en responses de usuario autenticado, listado y detalle.

## 2026-07-29

- Se saneó la spec para alinear `03-task-list.md` y `07-implementation-breakdown.md` al estado real del código, marcando como completado todo lo que ya vive en runtime y dejando abiertos solo pendientes reales.
- Se dejó explícito que el spec no puede cerrarse todavía por deuda documental, sino por cleanup legacy pendiente dentro del mismo backend.
- Se formalizaron como bloqueadores de cierre de esta misma spec la eliminación de `UserRole` legacy, la purga del campo `role` como compatibilidad de transición en usuario e invitaciones, la salida legacy `role` y `role_name` en invitaciones, y la limpieza final de i18n y referencias residuales a `MASTER_STAFF`, `CUSTOMER` y `STAFF`.
- Se confirmó como criterio de cierre que este refactor no se dará por terminado mientras siga existiendo compatibilidad temporal efectiva en runtime o en contratos relacionados con autorización y gestión de usuarios.
- Se eliminó `UserRole` del dominio runtime de usuarios, junto con los helpers `resolveSystemRoleFromLegacyRole(...)` y `resolveCompatibilityLegacyRole(...)`, dejando el modelo `User` sostenido únicamente por `systemRole + roleId`.
- Se limpió la persistencia runtime de usuarios para dejar de leer o derivar el campo legacy `role` en `user.schema.ts` y `mongoose-user.mapper.ts`, manteniendo el script histórico de migración con su propio schema local para no depender del modelo actual.
- Se desacopló temporalmente la compatibilidad legacy de invitaciones para que ya no dependa de helpers borrados del agregado `User`, moviendo ese mapeo residual a los propios flows y mappers de invitación mientras se completa la purga final de ese módulo.
- Se completó la purga principal del módulo de invitaciones: `role` dejó de formar parte del record persistido, de los DTOs de salida, del presenter HTTP y del payload de notificación, dejando el contrato del flujo sostenido únicamente por `system_role + role_id`.
- Se eliminó del mapper de invitaciones la compatibilidad runtime que reconstruía `systemRole` y `roleId` desde `document.role`, cerrando también el residuo `resolveSystemRoleFromLegacyInvitationRole(...)`.
- Se retiró de `AuthorizationService` el fallback `allowLegacyUserRoleFallback`, dejando obligatorio `role_id` para cualquier actor `USER` en creación o actualización y eliminando la última compatibilidad runtime de autorización basada en ausencia de rol efectivo.
- Se limpiaron los enums i18n de usuario para retirar `MASTER_STAFF`, `STAFF` y `CUSTOMER` como roles visibles del modelo actual.
- Se retiró del repositorio de roles el lookup dual `role_id | code`, dejando `role_id` como única identidad runtime válida del agregado y acotando el legado restante a scripts históricos de migración.
- Se volvió a alinear el handoff de frontend y el breakdown del spec al estado posterior al cleanup, dejando documentado que la compatibilidad remanente se limita a scripts históricos de migración.
- Se normalizó el sort público de `GET /v1/users` para aceptar `system_role` como campo canónico, eliminando el alias residual `role` que todavía sobrevivía en request DTO, puerto de repositorio y mapper de ordenamiento.
- Se corrigió también el último residuo semántico en `update-user.use-case.ts`, dejando de reportar `field: 'role'` en validaciones de auto-actualización y sustituyéndolo por `system_role` o `role_id` según el cambio intentado.
- Se revisaron las referencias residuales a `role` dentro de DTOs, presenters, repositorios y documentación viva, confirmando que lo que permanece en runtime ya corresponde al agregado `Role` o a metadata explícita del rol efectivo, no al enum legacy de usuario.
- Se dejó documentado en ambos scripts de migración que permanecen únicamente como artefactos operativos/históricos y no como parte del runtime ordinario de la aplicación.
- La validación automática de cierre se reforzó con `npm run build`, que siguió pasando después del cleanup final; `npm run test:e2e` no fue concluyente en este entorno por un `EPERM` de conexión local del sandbox, por lo que la validación funcional pendiente sigue siendo manual.
- Con esto, el spec de backend quedó bloqueado ya solo por la ronda final de QA manual multi-rol y por el cierre formal posterior de los documentos de seguimiento.
- Se registró como completada la ronda final de QA manual con `MASTER_ADMIN`, `ADMIN` y `USER`, incluyendo la validación de `GET /v1/auth/me/permissions`, `GET /v1/roles`, `GET /v1/users/me`, CRUD de roles custom y creación/edición de usuarios con `system_role + role_id`.
- El spec de backend `roles-permissions-refactor` quedó formalmente cerrado el `2026-07-29`, con cleanup runtime completado, documentación alineada y QA manual final registrada.
