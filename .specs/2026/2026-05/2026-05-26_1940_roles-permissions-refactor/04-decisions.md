# Decisions

## 2026-05-26

Decision: crear una spec dedicada para el refactor de roles y permisos.

Reason:

- el cambio impacta dominio, autenticacion, autorizacion, controllers y migracion de datos
- conviene dejar registro persistente de analisis, plan y tareas

Impact:

- la iniciativa se seguira en esta carpeta hasta completar el refactor o redefinir su alcance

## 2026-05-26

Decision: la task list se mantiene en orden fijo por fase del plan.

Reason:

- evita reordenamientos segun status
- facilita lectura historica del plan de ejecucion

Impact:

- cada tarea refleja su estado inline
- el avance se marca actualizando checkbox y `Status`

## 2026-07-12

Decision: el modelo de usuario se cierra como `systemRole + roleId`.

Reason:

- evita excepciones en el modelo para `MASTER_ADMIN` y `ADMIN`
- permite que toda autorizacion operativa se resuelva de forma consistente desde `roleId`
- deja `systemRole` reservado para reglas estructurales de plataforma

Impact:

- todo usuario tendra exactamente un `roleId`
- `systemRole` y `roleId` coexistiran con responsabilidades distintas
- JWT, actor context y dominio de usuario deberan migrarse a este modelo

## 2026-07-12

Decision: los unicos `systemRole` seran `MASTER_ADMIN`, `ADMIN` y `USER`.

Reason:

- evita que el modelo estructural vuelva a crecer por necesidades de negocio
- deja la variabilidad funcional en roles configurables
- separa plataforma, administracion del cliente y usuarios generales

Impact:

- `MASTER_ADMIN` queda reservado para plataforma, soporte y desarrollo
- `ADMIN` representa autoridad administrativa del cliente
- `USER` es una categoria amplia, interna o externa, definida por su `roleId`
- `MASTER_STAFF`, `STAFF` y `CUSTOMER` pasan a ser legacy y requeriran migracion

## 2026-07-12

Decision: existirán roles default del sistema, permanentes e inmutables, para los `systemRole` que sí lo necesiten estructuralmente.

Reason:

- simplifica el modelo
- evita que permisos estructurales criticos se rompan por error humano
- mantiene consistencia para `MASTER_ADMIN` y `ADMIN`

Impact:

- habra roles default del sistema para `MASTER_ADMIN` y `ADMIN`
- `MASTER_ADMIN` y `ADMIN` solo usaran su rol default del sistema
- `USER` no tendra rol default del sistema y siempre requerira un rol custom
- solo `MASTER_ADMIN` podra modificar roles default del sistema si hiciera falta

## 2026-07-26

Decision: `USER` no tendra rol default del sistema; siempre requerira un rol custom.

Reason:

- `USER` es una categoria amplia y flexible
- el comportamiento real de un `USER` debe depender siempre de su `roleId`
- evita introducir un `user_default` que no agrega valor al modelo

Impact:

- solo existen roles default del sistema para `MASTER_ADMIN` y `ADMIN`
- crear un `USER` requiere siempre un `roleId` custom valido
- degradar `ADMIN -> USER` requiere enviar explicitamente un `roleId` custom valido

## 2026-07-26

Decision: la entidad `Role` vivira en una sola coleccion para roles del sistema y roles custom.

Reason:

- mantiene el modelo simple y consistente
- evita mezclar multiples modelos o colecciones para representar el mismo concepto

Impact:

- roles del sistema y roles custom se diferencian por flags y `scope`
- un mismo repositorio y una misma capa de autorizacion pueden resolver ambos casos

## 2026-07-26

Decision: la estructura de permisos se persiste como lista normalizada de pares `module + operation`, referenciados por `code`.

Reason:

- es mas flexible para soportar acciones no CRUD en el futuro
- mantiene legibilidad humana
- evita depender de ids opacos cuando ya existen codigos unicos y controlados

Impact:

- `Role.permissions` guarda `module` y `operation` por `code`
- existe unicidad estricta por par `module + operation`
- el arreglo de permisos puede estar vacio

## 2026-07-26

Decision: `modules` y `operations` seran catalogos controlados, persistidos en Mongo y sembrados por scripts idempotentes.

Reason:

- deja controlada su evolucion por codigo
- permite historico en git
- evita creacion libre de catalogos desde la UI

Impact:

- habra colecciones dedicadas para modulos y operaciones
- los cambios a catalogos se haran por codigo y seeders
- el sistema queda listo para exponer catalogos a la UI de forma consistente

## 2026-07-28

Decision: el catálogo técnico de permisos deja de tener su fuente de verdad en Mongo y pasa a código.

Reason:

- `modules` y `operations` son catálogos técnicos, no datos de negocio configurables por el cliente
- conviene que queden controlados por desarrollo, versionados en git y sin drift contra el backend
- la API ya usa i18n, así que el catálogo debe exponer `nameKey` y no nombres hardcodeados
- un catálogo agrupado por módulo permite definir operaciones válidas por módulo y evita combinaciones inválidas

Impact:

- `roles` siguen persistidos en Mongo como configuración de negocio
- `permission_modules` y `permission_operations` dejan de considerarse fuente de verdad
- el nuevo shape objetivo será catálogo en código con `code` en mayúsculas, `nameKey` y operaciones válidas por módulo
- `GET /v1/roles/modules` y `GET /v1/roles/operations` deben seguir existiendo, pero leyendo desde código
- quedará una fase posterior de limpieza para retirar infraestructura Mongo sobrante

## 2026-07-28

Decision: `roleId` y `Role.id` serán idénticos al `code` del rol.

Reason:

- evita ids opacos innecesarios para una entidad cuyo `code` ya es único e inmutable
- simplifica migraciones, debugging, payloads y trazabilidad humana
- reduce el costo mental al asignar, consultar y auditar roles en usuarios

Impact:

- todo rol nuevo debe persistirse con `role_id = code`
- los roles existentes requieren migración controlada de `roles.role_id` y `users.role_id`
- mientras se ejecuta la migración, la lectura de roles debe tolerar resolución por `role_id` o por `code`

## 2026-07-26

Decision: los modulos iniciales del sistema se alinean a las features actuales del repo.

Reason:

- evita modelar modulos especulativos
- toma como base el inventario real del backend actual

Impact:

- modulos iniciales: `users`, `roles`, `customers`, `providers`, `service_entries`, `service_entry_surveys`, `files`, `service_packages`, `user_registration_invitations`
- `auth`, `health` y `public/*` quedan fuera del catalogo de permisos internos

## 2026-07-26

Decision: la autorizacion se centralizara en guard + decorator, con reglas estructurales especiales para `MASTER_ADMIN` y `ADMIN`.

Reason:

- evita seguir duplicando validaciones en controllers
- mantiene claras las reglas estructurales fuera de la logica de negocio ordinaria

Impact:

- los controllers deben migrar fuera de `ensureAuthorized()`
- `MASTER_ADMIN` conserva visibilidad y control total
- `ADMIN` conserva poder total de negocio, sin tocar la capa reservada a `MASTER_ADMIN`

## 2026-07-26

Decision: las capacidades exclusivas de `MASTER_ADMIN` se listan formalmente y sus endpoints deben vivir bajo `src/internal/infra/api/controllers/master-admin`.

Reason:

- evita que la frontera entre plataforma y negocio quede solo implícita
- facilita auditoría, seguridad y mantenibilidad
- deja físicamente separado el dominio HTTP exclusivo de soporte/plataforma

Impact:

- queda un catálogo explícito de capacidades exclusivas de `MASTER_ADMIN`
- futuras features reservadas deben implementarse bajo `controllers/master-admin`
- la administración de roles del sistema y catálogos del sistema queda del lado de `MASTER_ADMIN`

## 2026-07-28

Decision: el catálogo de permisos en código solo debe contener módulos funcionales del sistema; la frontera exclusiva de `MASTER_ADMIN` se documenta y evoluciona aparte.

Reason:

- evita mezclar capacidades de negocio con herramientas técnicas o de soporte
- reduce el riesgo de modelar como permiso configurable algo que en realidad debe seguir reservado a plataforma
- deja una regla clara para futuras features que se agreguen mucho tiempo después de este refactor

Impact:

- `authorization.catalog.ts` debe contener únicamente módulos funcionales/autorizables
- una feature nueva de `MASTER_ADMIN` debe evaluarse primero como frontera estructural
- si la feature es técnica o de soporte, debe vivir en `controllers/master-admin` y no entrar automáticamente al catálogo
- si la feature es funcional y potencialmente reusable por negocio, sí puede modelarse como módulo del catálogo aunque inicialmente solo la use `MASTER_ADMIN`

## 2026-07-26

Decision: el JWT se reduce a `sub + systemRole + roleId`, y el patrón existente de `authContext` se evoluciona en lugar de reemplazarse.

Reason:

- el proyecto ya usa un contexto autenticado por request
- no conviene seguir acoplando el token al modelo viejo de `role` e `isMaster`
- no hace falta embutir permisos efectivos en el JWT

Impact:

- el JWT no llevará permisos efectivos
- los permisos del usuario autenticado se consultarán por endpoint y/o se resolverán en runtime
- el `JwtAuthGuard`, `AuthenticatedUserContextDto`, `@CurrentUser()` y `request.authContext` deberán migrarse al nuevo modelo

## 2026-07-26

Decision: el patrón de pipeline de la API se documenta como regla permanente del proyecto en `docs/api-pipeline.md`.

Reason:

- el repo ya sigue un pipeline consistente en la mayoría de endpoints
- el refactor de roles/permisos debe construirse bajo ese mismo patrón
- conviene dejar una referencia normativa fuera de `.specs`

Impact:

- el proyecto tendrá un documento permanente para guiar endpoints nuevos
- la migración de autorización también debe eliminar deuda técnica como `ensureAuthorized()` dentro de ese estándar

## 2026-07-27

Decision: el catálogo funcional de features y permisos vive fuera de `.specs` como documento permanente en `docs/authorization/feature-permission-catalog.md`.

Reason:

- ese catálogo deberá ser consultado y actualizado por futuras specs e implementaciones
- no pertenece solo a esta iniciativa, sino al modelo vivo de autorización del proyecto
- conviene separar documento histórico de decisiones y documento operativo del sistema

Impact:

- la spec actual solo referencia el catálogo, no lo encapsula
- futuras iniciativas deberán consultar y actualizar el documento permanente
- el diseño de roles custom y permisos deberá alinearse con ese catálogo vivo

## 2026-07-26

Decision: la entidad `Role` queda cerrada con una sola coleccion, `scope`, flags de sistema, auditoria y reglas de inmutabilidad/uso ya definidas.

Reason:

- el shape ya quedo suficientemente definido para empezar persistencia y contratos
- mantener una sola coleccion evita complejidad innecesaria
- el negocio necesita roles custom flexibles, pero la plataforma requiere roles del sistema bien protegidos

Impact:

- `Role` queda listo para modelarse en dominio y Mongoose
- solo `MASTER_ADMIN` y `ADMIN` tienen roles default del sistema
- `USER` siempre usa un rol configurable
- los roles custom viven en `scope = USER`

## 2026-07-26

Decision: la migracion legacy se limitara al estado real de datos, sin modelar migraciones para roles que nunca existieron efectivamente.

Reason:

- algunos roles legacy fueron conceptuales y no llegaron a existir en frontend ni en datos reales
- conviene evitar complejidad inventada en la migracion
- el nuevo modelo exige `roleId` obligatorio, por lo que `STAFF` necesita una salida determinista

Impact:

- `MASTER_ADMIN` migra a `MASTER_ADMIN` + rol default del sistema
- `ADMIN` migra a `ADMIN` + rol default del sistema
- `STAFF` migra a `USER` + rol custom seed `STAFF_LEGACY`
- `CUSTOMER` y `MASTER_STAFF` no tienen migracion por ahora

## 2026-07-26

Decision: las reglas de asignación y cambio de `systemRole` quedan cerradas por jerarquía estructural y delegación por permisos.

Reason:

- el modelo necesitaba separar claramente cambio estructural de usuario y asignación operativa de roles
- `MASTER_ADMIN` y `ADMIN` deben conservar poder por defecto, pero cierta administración puede delegarse a roles custom

Impact:

- `MASTER_ADMIN` puede asignar cualquier rol y cambiar cualquier `systemRole`
- `ADMIN` puede crear `USER` y `ADMIN`, promover `USER -> ADMIN` y degradar `ADMIN -> USER`
- usuarios `USER` con permisos delegados pueden asignar roles custom, pero no cambiar `systemRole`
- los roles custom existen solo en `scope = USER`
