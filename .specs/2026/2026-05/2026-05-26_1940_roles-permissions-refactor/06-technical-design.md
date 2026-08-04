# Technical Design

## Objetivo

Traducir las decisiones funcionales ya aprobadas del refactor de roles y permisos a un diseño técnico concreto para este repo.

Este documento no define nuevas reglas de negocio. Su objetivo es aterrizar:

- nuevas entidades y catálogos
- cambios al modelo `User`
- cambios a autenticación y `authContext`
- componentes nuevos de autorización
- nuevos endpoints
- estrategia de migración
- orden de implementación técnico

## Principios de implementación

- seguir el estándar documentado en [docs/api-pipeline.md](/Users/alberto/projects/icsacv/org-admin-suite-api/docs/api-pipeline.md:1)
- usar como referencia viva el catálogo funcional y de permisos en [docs/authorization/feature-permission-catalog.md](/Users/alberto/projects/icsacv/org-admin-suite-api/docs/authorization/feature-permission-catalog.md:1)
- no crear bypasses al pipeline con lógica en controllers
- mantener separación clara entre `domain`, `application` e `infra`
- migrar deuda técnica de autorización (`ensureAuthorized()`) al modelo centralizado
- introducir cambios de forma incremental sin romper el comportamiento existente antes de tiempo

## Estado actual del repo que condiciona el diseño

Puntos observados:

- el sistema actual ya usa `JwtAuthGuard`, `request.authContext` y `@CurrentUser()`
- la capa HTTP ya está montada sobre `CommandBus` / `QueryBus`
- las entidades actuales usan Mongoose con mapper dedicado
- los repositorios dependen de puertos de dominio y tokens
- la autorización actual está mezclada entre:
  - `UserRolePolicy`
  - `MasterScopeGuard`
  - `ensureAuthorized()` en algunos controllers

Conclusión:

- no hay que introducir un patrón nuevo
- hay que evolucionar el patrón existente y reemplazar el modelo viejo de autorización

## Diseño objetivo por capas

### 1. Domain

#### 1.1 User

La entidad actual `User` debe migrar desde:

- `role`
- `isMaster` derivado

hacia:

- `systemRole`
- `roleId`

Shape objetivo:

```ts
interface UserProps {
  id?: string;
  name: string;
  lastname: string;
  email: string;
  password: string;
  systemRole: SystemRole;
  roleId: string;
  status: UserStatus;
  cellPhone: {
    countryCode: string | null;
    number: string | null;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
```

Nuevo enum objetivo:

```ts
enum SystemRole {
  MASTER_ADMIN = 'MASTER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}
```

Notas:

- `roleId` será obligatorio
- no existirá usuario sin `roleId`
- `MASTER_ADMIN` y `ADMIN` tendrán siempre su rol default del sistema
- `USER` siempre tendrá un rol custom

#### 1.2 Role

Nueva entidad de dominio:

```ts
interface RolePermissionProps {
  module: string;
  operation: string;
}

interface RoleProps {
  id?: string;
  name: string;
  code: string;
  scope: RoleScope;
  isSystem: boolean;
  isImmutable: boolean;
  isDefault: boolean;
  status: RoleStatus;
  permissions: RolePermissionProps[];
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
```

Enums objetivo:

```ts
enum RoleScope {
  MASTER_ADMIN = 'MASTER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

enum RoleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}
```

Reglas a modelar en la entidad o policy:

- `id` será idéntico a `code`
- `name` único e inmutable
- `code` único e inmutable
- `code` generado desde `name`
- unicidad estricta de permisos por `module + operation`
- roles del sistema inmutables salvo intervención reservada
- roles con usuarios vinculados no se eliminan; se desactivan

#### 1.3 Permission catalog

El catálogo técnico de permisos debe vivir en código y no en Mongo.

La fuente de verdad objetivo es un catálogo agrupado por módulo, con `code` técnico en mayúsculas y `nameKey` para i18n.

Shape objetivo:

```ts
const AUTHORIZATION_OPERATIONS = {
  CREATE: { code: 'CREATE', nameKey: 'AUTHORIZATION.OPERATION.CREATE' },
  READ: { code: 'READ', nameKey: 'AUTHORIZATION.OPERATION.READ' },
  UPDATE: { code: 'UPDATE', nameKey: 'AUTHORIZATION.OPERATION.UPDATE' },
  DELETE: { code: 'DELETE', nameKey: 'AUTHORIZATION.OPERATION.DELETE' },
} as const;

const AUTHORIZATION_CATALOG = {
  USERS: {
    code: 'USERS',
    nameKey: 'AUTHORIZATION.MODULE.USERS',
    operations: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },
  ROLES: {
    code: 'ROLES',
    nameKey: 'AUTHORIZATION.MODULE.ROLES',
    operations: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },
} as const;
```

Reglas:

- `code` técnico en mayúsculas
- `nameKey` traducible por i18n
- cada módulo declara sus operaciones válidas
- `Role.permissions` sigue persistiendo pares `module + operation` por `code`
- el catálogo en código valida combinaciones válidas y alimenta endpoints de consulta

Regla adicional del modelo:

- `role_id` persistido en Mongo debe ser idéntico a `code`
- no se usan ids aleatorios para roles
- la migración de datos debe convertir roles y referencias de usuario ya existentes a ese formato

Ubicación sugerida:

```text
src/internal/application/services/authz/
  authorization-operations.catalog.ts
  authorization.catalog.ts
  authorization-catalog.utils.ts
```

#### 1.4 Authorization service/policy layer

Se necesita una nueva pieza de dominio/aplicación para resolver autorización.

Sugerencia:

- `AuthorizationService` en `application/services/authz` o similar

Responsabilidades:

- resolver permisos efectivos de un usuario
- validar permiso `module + operation`
- aplicar reglas estructurales de `MASTER_ADMIN`
- validar asignaciones de rol
- validar cambios de `systemRole`

No debe:

- construir respuestas HTTP
- depender de controller

#### 1.5 Frontera del `AuthorizationService`

El servicio de autorización no debe crecer con un método por cada acción del sistema.

Regla de diseño:

- si la decisión depende de `module + operation`, se resuelve con validación genérica por permiso
- si la decisión depende de jerarquía estructural, asignación de rol o cambio de `systemRole`, se resuelve con una validación estructural específica

No se busca un diseño como:

- `ensureCanCreateCustomer()`
- `ensureCanDeleteProvider()`
- `ensureCanReadServiceEntry()`

Eso volvería a hardcodear el sistema por feature.

Se busca un diseño híbrido y acotado.

##### A. Validación genérica por permiso

API mínima esperada:

```ts
authorizationService.ensurePermission(actor, module, operation)
authorizationService.hasPermission(actor, module, operation)
authorizationService.resolveEffectivePermissions(actor)
```

Uso esperado:

- `CUSTOMERS + CREATE`
- `CUSTOMERS + READ`
- `CUSTOMERS + READ_PUBLIC_ACCESS`
- `PROVIDERS + READ_PUBLIC_ACCESS`
- `PROVIDERS + UPDATE`
- `SERVICE_ENTRIES + DELETE`
- `ROLES + CREATE`

Este nivel debe cubrir la mayoría del backoffice ordinario.

##### B. Validaciones estructurales específicas

Solo deben existir para reglas que no pueden expresarse correctamente con `module + operation`.

API estructural sugerida:

```ts
authorizationService.ensureCanAssignRole(actor, targetRole)
authorizationService.ensureCanChangeSystemRole(actor, targetSystemRole)
authorizationService.ensureCanCreateUser(actor, {
  targetSystemRole,
  targetRole,
})
authorizationService.ensureCanUpdateUser(actor, {
  targetUser,
  nextSystemRole,
  nextRole,
})
```

Estas validaciones existen porque deben resolver preguntas como:

- si el actor puede asignar un rol default del sistema o solo un rol custom
- si el actor puede promover `USER -> ADMIN`
- si el actor puede degradar `ADMIN -> USER`
- si el actor puede tocar algo relacionado con `MASTER_ADMIN`
- si el actor necesita enviar obligatoriamente un `roleId` custom al convertir un usuario en `USER`

##### C. Qué no debe hacer el servicio

No debe:

- tener un método por endpoint
- depender de nombres de controllers
- depender de rutas HTTP
- mezclar response building
- reemplazar el catálogo de permisos con condicionales hardcodeados por feature

##### D. Criterio práctico de uso

Usar `ensurePermission(...)` cuando:

- el endpoint representa una acción ordinaria de negocio
- el permiso se puede expresar con el catálogo `module + operation`

Usar validación estructural específica cuando:

- interviene `systemRole`
- interviene asignación de `roleId`
- hay promoción o degradación de usuario
- el caso toca reglas reservadas de `MASTER_ADMIN`

##### E. Ejemplos de clasificación

Casos que deben resolverse con permiso genérico:

- crear customer
- listar providers
- actualizar service entry
- eliminar service package record
- crear rol custom
- consultar un endpoint autenticado dedicado para revelar un dato sensible puntual, cuando esa capacidad ya fue promovida a operación explícita del mismo módulo

Casos que deben resolverse con validación estructural:

- crear un usuario `ADMIN`
- crear un usuario `MASTER_ADMIN`
- promover un `USER` a `ADMIN`
- degradar un `ADMIN` a `USER`
- asignar el rol default `ADMIN`
- modificar un rol del sistema inmutable

Caso adicional aprobado:

- revelar `public_access_url` y `public_access_token` de un customer no debe quedar absorbido por `CUSTOMERS/READ`; debe convertirse en `CUSTOMERS/READ_PUBLIC_ACCESS`
- revelar `public_access_url` y `public_access_token` de un provider no debe quedar absorbido por `PROVIDERS/READ`; debe convertirse en `PROVIDERS/READ_PUBLIC_ACCESS`
- `service_entries` no requiere esa misma promoción para `READ`, pero la respuesta de `CREATE` debe dejar de devolver `public_access_token` porque el acceso público ya se distribuye por correo
- `files` no debe mantenerse como módulo funcional de negocio; debe salir del catálogo y tratarse como capability transversal consumida implícitamente por otros módulos
- para `files`, el cierre aprobado no es reexpresar sus endpoints con permisos del módulo padre; el cierre aprobado es conservar `JwtAuthGuard` donde ya exista autenticación y retirar `PermissionsGuard` junto con `FILES/*`

##### F. Interfaz exacta propuesta

La interfaz de `AuthorizationService` debe cerrarse con pocos métodos, explícitos y reutilizables.

Propuesta:

```ts
interface AuthorizationService {
  ensurePermission(
    actor: AuthenticatedUserContextDto,
    module: string,
    operation: string,
  ): Promise<void>;

  hasPermission(
    actor: AuthenticatedUserContextDto,
    module: string,
    operation: string,
  ): Promise<boolean>;

  resolveEffectivePermissions(
    actor: AuthenticatedUserContextDto,
  ): Promise<ResolvedAuthorizationContextDto>;

  ensureCanAssignRole(
    actor: AuthenticatedUserContextDto,
    targetRole: AuthorizationRoleSummaryDto,
  ): Promise<void>;

  ensureCanChangeSystemRole(
    actor: AuthenticatedUserContextDto,
    targetSystemRole: SystemRole,
  ): Promise<void>;

  ensureCanCreateUser(
    actor: AuthenticatedUserContextDto,
    input: UserAuthorizationTargetDto,
  ): Promise<void>;

  ensureCanUpdateUser(
    actor: AuthenticatedUserContextDto,
    input: UpdateUserAuthorizationTargetDto,
  ): Promise<void>;
}
```

##### G. DTOs de soporte propuestos

`AuthenticatedUserContextDto` objetivo:

```ts
interface AuthenticatedUserContextDto {
  userId: string;
  systemRole: SystemRole;
  roleId: string;
  token: string;
  role?: AuthorizationRoleSummaryDto;
}
```

`AuthorizationRoleSummaryDto`:

```ts
interface AuthorizationRoleSummaryDto {
  id: string;
  code: string;
  scope: RoleScope;
  isSystem: boolean;
  isImmutable: boolean;
  isDefault: boolean;
  status: RoleStatus;
}
```

`ResolvedPermissionDto`:

```ts
interface ResolvedPermissionDto {
  module: string;
  operation: string;
}
```

`ResolvedAuthorizationContextDto`:

```ts
interface ResolvedAuthorizationContextDto {
  actor: {
    userId: string;
    systemRole: SystemRole;
    roleId: string;
  };
  role: AuthorizationRoleSummaryDto;
  permissions: ResolvedPermissionDto[];
}
```

`UserAuthorizationTargetDto`:

```ts
interface UserAuthorizationTargetDto {
  targetSystemRole: SystemRole;
  targetRole: AuthorizationRoleSummaryDto;
}
```

`UpdateUserAuthorizationTargetDto`:

```ts
interface UpdateUserAuthorizationTargetDto {
  targetUserId: string;
  currentSystemRole: SystemRole;
  currentRole: AuthorizationRoleSummaryDto;
  nextSystemRole: SystemRole;
  nextRole: AuthorizationRoleSummaryDto;
}
```

##### H. Contratos semánticos de cada método

`ensurePermission(...)`

- falla si el actor no tiene el permiso solicitado
- usa `systemRole` solo para excepciones estructurales, no como reemplazo del catálogo de permisos

`hasPermission(...)`

- devuelve `true/false`
- útil para composición interna o presenters de capacidades si llegara a hacer falta

`resolveEffectivePermissions(...)`

- devuelve el rol resuelto y la lista efectiva de permisos
- alimenta `GET /v1/auth/me/permissions`
- sirve también para evitar recálculos repetidos dentro de un mismo request si después se quiere optimizar

`ensureCanAssignRole(...)`

- valida si el actor puede asignar el rol objetivo
- debe bloquear asignación de `MASTER_ADMIN` salvo actor `MASTER_ADMIN`
- debe permitir a `ADMIN` asignar `ADMIN` y roles custom
- debe permitir a `USER` solo roles custom cuando tenga permiso delegado

`ensureCanChangeSystemRole(...)`

- valida el cambio estructural del `systemRole` destino
- no reemplaza la validación completa de actualización de usuario, solo la restricción estructural del rol de sistema

`ensureCanCreateUser(...)`

- combina permiso operativo de crear usuario con restricción estructural del usuario objetivo
- valida consistencia entre `targetSystemRole` y `targetRole`
- ejemplo:
  - si `targetSystemRole = USER`, el `targetRole` debe ser custom
  - si `targetSystemRole = ADMIN`, el `targetRole` debe ser el default `ADMIN`
  - si `targetSystemRole = MASTER_ADMIN`, el `targetRole` debe ser el default `MASTER_ADMIN`

`ensureCanUpdateUser(...)`

- resuelve promoción, degradación o reasignación
- debe validar transición completa:
  - rol actual del usuario objetivo
  - nuevo `systemRole`
  - nuevo `roleId`
  - restricciones exclusivas de `MASTER_ADMIN`

##### I. Validaciones de consistencia esperadas

El servicio también debe proteger reglas de coherencia del modelo:

- `MASTER_ADMIN` solo puede usar el rol default `MASTER_ADMIN`
- `ADMIN` solo puede usar el rol default `ADMIN`
- `USER` no puede usar roles default del sistema
- roles custom solo existen con `scope = USER`
- al degradar `ADMIN -> USER` debe existir `nextRole` custom válido
- al promover `USER -> ADMIN` el `nextRole` debe resolverse al default `ADMIN`

### 2. Domain ports

Nuevos puertos a agregar:

- `role-read.repository.ts`
- `role-write.repository.ts`
- `permission-module-read.repository.ts`
- `permission-module-write.repository.ts` si se decide formalizar escrituras fuera de seeds
- `permission-operation-read.repository.ts`
- `permission-operation-write.repository.ts` si aplica

Puertos existentes a tocar:

- `user-read.repository.ts`
- `user-write.repository.ts`

Cambios esperados:

- buscar usuarios por `systemRole`
- buscar usuarios por `roleId`
- contar usuarios vinculados a un `roleId`
- filtrar roles por `scope`, `status`, `isSystem`, etc.

### 3. Application layer

#### 3.1 Nuevos DTOs

Se requerirán DTOs de aplicación para:

- `RoleViewDto`
- `RolePermissionDto`
- `PermissionModuleViewDto`
- `PermissionOperationViewDto`
- `MyPermissionsResultDto`
- comandos de creación/edición/asignación de roles

#### 3.2 Nuevos use cases

Mínimo:

- `CreateRoleUseCase`
- `GetRolesUseCase`
- `GetRoleByIdUseCase`
- `UpdateRoleUseCase`
- `DeactivateRoleUseCase`
- `GetPermissionModulesUseCase`
- `GetPermissionOperationsUseCase`
- `GetMyPermissionsUseCase`

Use cases a modificar:

- `CreateUserAndNotifyUseCase`
- `CreateMasterUserAndNotifyUseCase`
- `UpdateUserUseCase`
- `UpdateMyProfileUseCase`
- `DeleteUserUseCase`
- `GetUsersUseCase`
- `GetUserByIdUseCase`
- `GetUserRolesUseCase` o su reemplazo
- use cases de invitaciones de usuario
- autenticación

#### 3.3 Servicio de autorización

Sugerencia de API interna:

```ts
authorizationService.ensurePermission(actor, module, operation)
authorizationService.canAssignRole(actor, role)
authorizationService.canChangeSystemRole(actor, targetSystemRole)
authorizationService.resolveEffectivePermissions(actor)
```

### 4. Infra persistence (Mongoose)

#### 4.1 Nuevos schemas

Agregar:

- `schemas/role/role.schema.ts`
- `schemas/permission-module/permission-module.schema.ts`
- `schemas/permission-operation/permission-operation.schema.ts`

Colecciones sugeridas:

- `roles`
- `permission_modules`
- `permission_operations`

#### 4.2 Cambios al schema de user

`user.schema.ts` debe migrar de:

- `role`

a:

- `system_role`
- `role_id`

Y deberá eliminarse gradualmente la dependencia al enum viejo.

#### 4.3 Mappers

Nuevos mappers:

- `mongoose-role.mapper.ts`
- `mongoose-permission-module.mapper.ts`
- `mongoose-permission-operation.mapper.ts`

Cambios a `mongoose-user.mapper.ts`:

- mapear `system_role`
- mapear `role_id`
- eliminar `role` del modelo viejo

#### 4.4 Repositories config

Se deben registrar nuevos tokens en:

- `src/internal/infra/persistence/mongoose/repositories/mongoose-repositories.config.ts`

### 5. Seeds / catalogs

Crear infraestructura de seeds controlados por código.

Ubicación sugerida:

```text
src/internal/infra/persistence/mongoose/seeds/
```

Estructura sugerida:

```text
src/internal/infra/persistence/mongoose/
  seeds/
    catalogs/
      permission-modules.seed.ts
      permission-operations.seed.ts
    roles/
      system-roles.seed.ts
      legacy-staff-role.seed.ts
    shared/
      mongoose-seed.runner.ts
      mongoose-seed.types.ts
      mongoose-seed.utils.ts
    run-seeds.ts
  migrations/
    shared/
      mongoose-migration.types.ts
      mongoose-migration.utils.ts
    migrate-users-to-system-role-and-role-id.ts
```

Razón:

- separar seeds de catálogos, roles base y utilidades compartidas
- dejar `migrations/` para cambios sobre datos ya existentes
- evitar mezclar seeds idempotentes con scripts de transformación de usuarios

Principio:

- `seeds/` crea o sincroniza datos base del modelo
- `migrations/` transforma datos productivos existentes

#### 5.1 Runner técnico sugerido

No conviene levantar `AppModule` completo para correr seeds o migrations.

Propuesta:

- usar scripts `ts-node` o `tsx` que conecten a Mongo directamente con `mongoose.connect(...)`
- reutilizar:
  - `envSchema`
  - `MONGO_URI`
- no depender de bootstrap HTTP ni de `NestFactory`

Ventajas:

- menor superficie de fallo
- más rápido de ejecutar
- menos riesgo de efectos secundarios del arranque completo de la app

#### 5.2 Convención de archivos

Convención propuesta para seeds:

- un archivo por seed lógico
- nombre explícito en kebab-case
- exportar una función `run`

Shape conceptual:

```ts
export async function run(context: MongooseSeedContext): Promise<SeedReportItem>
```

Convención propuesta para migrations:

- un archivo por migración manual
- nombre descriptivo orientado al cambio
- aceptar modo explícito de ejecución

Shape conceptual:

```ts
export async function run(context: MongooseMigrationContext): Promise<void>
```

#### 5.3 Contexto compartido de ejecución

Seeds y migrations deben compartir un contexto mínimo común.

Shape conceptual:

```ts
interface MongooseExecutionContext {
  connection: mongoose.Connection;
  now: Date;
  logger: {
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
  };
}
```

Extensiones:

```ts
interface MongooseSeedContext extends MongooseExecutionContext {}

interface MongooseMigrationContext extends MongooseExecutionContext {
  mode: 'dry-run' | 'apply';
}
```

#### 5.4 Comandos sugeridos

Agregar scripts dedicados en `package.json`.

Propuesta:

```json
{
  "scripts": {
    "db:seed": "tsx src/internal/infra/persistence/mongoose/seeds/run-seeds.ts",
    "db:migrate:users-system-role:dry-run": "tsx src/internal/infra/persistence/mongoose/migrations/migrate-users-to-system-role-and-role-id.ts --dry-run",
    "db:migrate:users-system-role:apply": "tsx src/internal/infra/persistence/mongoose/migrations/migrate-users-to-system-role-and-role-id.ts --apply"
  }
}
```

Notas:

- `db:seed` ejecuta solo seeds idempotentes
- la migración de usuarios se ejecuta con comandos separados para evitar confusión
- no debe existir un comando ambiguo que aplique migración real por accidente

#### 5.5 Comportamiento de `run-seeds.ts`

El runner de seeds debe:

1. validar entorno
2. abrir conexión a Mongo
3. ejecutar seeds en orden fijo
4. imprimir reporte por seed
5. cerrar conexión

Orden inicial sugerido:

1. `permission-modules.seed.ts`
2. `permission-operations.seed.ts`
3. `system-roles.seed.ts`
4. `legacy-staff-role.seed.ts`

Razón:

- roles del sistema dependen de catálogos ya definidos
- `STAFF_LEGACY` debe crearse después de que exista la infraestructura base del modelo

#### 5.6 Reporte esperado de seeds

Cada seed debe reportar al menos:

- nombre del seed
- documentos creados
- documentos encontrados sin cambio
- documentos actualizados
- errores

Shape conceptual:

```ts
interface SeedReportItem {
  name: string;
  created: number;
  updated: number;
  unchanged: number;
}
```

#### 5.7 Regla de seguridad operativa

En este repo:

- los seeds sí pueden ejecutarse repetidamente
- las migrations deben ejecutarse manualmente y con intención explícita

Por lo tanto:

- `db:seed` puede formar parte del flujo de preparación controlada
- las migrations nunca deben correr automáticamente al levantar la app
- las migrations nunca deben dispararse desde el runner de seeds

Seeds iniciales:

- `system-roles.seed.ts`
- `legacy-staff-role.seed.ts`

Nota:

- `permission-modules.seed.ts` y `permission-operations.seed.ts` pasan a quedar obsoletos con el nuevo enfoque
- pueden mantenerse temporalmente mientras se completa la transición, pero ya no deben considerarse fuente de verdad

Requisitos:

- idempotentes
- versionados en git
- basados en `code`

Seed data inicial esperado:

#### Permission modules

- `USERS`
- `ROLES`
- `CUSTOMERS`
- `PROVIDERS`
- `SERVICE_ENTRIES`
- `SERVICE_ENTRY_SURVEYS`
- `FILES`
- `SERVICE_PACKAGES`
- `USER_REGISTRATION_INVITATIONS`

#### Permission operations

- `CREATE`
- `READ`
- `UPDATE`
- `DELETE`

Referencia operativa:

- el mapeo entre módulos, operaciones y features existentes del backend vive en `docs/authorization/feature-permission-catalog.md`
- ese documento debe usarse para diseñar permisos, guards, seeds y endpoints de administración de roles custom

Más adelante:

- `SEND_EMAIL`
- `EXPORT`
- `ASSIGN`

#### System roles

- `MASTER_ADMIN_DEFAULT`
- `ADMIN_DEFAULT`

#### Legacy role

- `STAFF_LEGACY`

### 6. Authentication and auth context

#### 6.1 JWT payload

Payload objetivo:

```ts
interface AuthTokenPayloadDto {
  sub: string;
  systemRole: SystemRole;
  roleId: string;
  iat?: number;
  exp?: number;
}
```

#### 6.2 Authenticated context

El patrón actual se conserva, pero se evoluciona.

Nuevo contexto sugerido:

```ts
interface AuthenticatedUserContextDto {
  userId: string;
  systemRole: SystemRole;
  roleId: string;
  token: string;
}
```

Opcionalmente, para no consultar repetido:

```ts
interface AuthenticatedUserContextDto {
  userId: string;
  systemRole: SystemRole;
  roleId: string;
  token: string;
  role?: {
    id: string;
    code: string;
    scope: string;
  };
}
```

#### 6.3 JwtAuthGuard

El guard debe:

- validar firma del token
- construir el `authContext`
- opcionalmente cargar metadata actual del usuario/rol
- adjuntarlo a `request.authContext`

#### 6.4 CurrentUser decorator

Debe seguir existiendo, pero tipado al nuevo contexto.

#### 6.5 Endpoint de permisos

Nuevo endpoint sugerido:

- `GET /v1/auth/me/permissions`

Contrato aprobado:

- usa `ApiResponseBuilder`
- devuelve `system_role`
- devuelve metadata ampliada del rol actual
- devuelve permisos efectivos como lista plana, no agrupada por módulo

Shape de `data`:

```json
{
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
}
```

Notas:

- no devolver capacidades derivadas extra en esta primera versión
- el frontend debe inferir visibilidad ordinaria desde la lista plana de permisos
- este endpoint es la fuente principal para guards y visibilidad de UI en frontend

### 7. Authorization in HTTP

#### 7.1 New decorator

Ubicación sugerida:

```text
src/common/decorators/permissions.decorator.ts
```

Forma sugerida:

```ts
@RequirePermission('USERS', 'READ')
```

Contrato exacto propuesto:

```ts
const PERMISSION_METADATA_KEY = 'required_permission';

interface RequiredPermissionMetadata {
  module: string;
  operation: string;
}

function RequirePermission(
  module: string,
  operation: string,
): MethodDecorator;
```

Reglas:

- declara exactamente un permiso requerido por endpoint
- usa el catálogo controlado `module + operation`
- no debe aceptar strings libres fuera del catálogo aprobado en implementación final
- no reemplaza validaciones estructurales sensibles del use case

Decisión de diseño:

- no introducir por ahora un decorator separado como `@RequireMasterAdmin()`
- las reglas exclusivas de `MASTER_ADMIN` deben resolverse por:
  - ubicación arquitectónica del endpoint bajo `controllers/master-admin`
  - `systemRole`
  - `PermissionsGuard` y/o validación estructural del `AuthorizationService`

#### 7.2 New guard

Ubicación sugerida:

```text
src/internal/infra/api/guards/permissions.guard.ts
```

Responsabilidades:

- leer metadata del decorator
- usar `authContext`
- preguntar a `AuthorizationService`
- aplicar reglas estructurales

Contrato exacto propuesto:

```ts
class PermissionsGuard implements CanActivate {
  canActivate(context: ExecutionContext): Promise<boolean>;
}
```

Dependencias esperadas:

- `Reflector`
- `AuthorizationService`

Flujo esperado:

1. leer `RequiredPermissionMetadata` del handler
2. si el endpoint no declara permiso, permitir continuar
3. leer `request.authContext`
4. fallar si no existe contexto autenticado válido
5. invocar `authorizationService.ensurePermission(actor, module, operation)`
6. permitir continuar si no hubo excepción

Reglas:

- el orden esperado en endpoints protegidos es:
  - `@UseGuards(JwtAuthGuard, PermissionsGuard)`
- `JwtAuthGuard` construye el `authContext`
- `PermissionsGuard` nunca debe reconstruir autenticación por su cuenta
- el guard no debe conocer repositorios directamente
- el guard no debe hardcodear listas de roles legacy

Comportamiento con endpoints `master-admin`:

- si el endpoint vive bajo el dominio `master-admin`, el guard debe convivir con reglas estructurales que restrinjan acceso a `MASTER_ADMIN`
- esa restricción puede mantenerse temporalmente con `MasterScopeGuard` durante migración
- una vez absorbida por el nuevo modelo, la restricción estructural debe seguir existiendo aunque el endpoint también declare permisos

Ejemplo objetivo:

```ts
@Post()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('CUSTOMERS', 'CREATE')
async create() {}
```

Ejemplo en capa `master-admin`:

```ts
@Post()
@UseGuards(JwtAuthGuard, MasterScopeGuard, PermissionsGuard)
@RequirePermission('USERS', 'CREATE')
async createMasterAdminUser() {}
```

Interpretación:

- el permiso declara la acción de negocio/técnica
- la regla estructural sigue decidiendo si el actor puede tocar la zona reservada a `MASTER_ADMIN`

#### 7.3 Deuda técnica a remover

Eliminar gradualmente:

- `ensureAuthorized()` en controllers
- dependencia al enum viejo en validaciones HTTP
- `MasterScopeGuard` si queda reemplazado completamente por reglas estructurales nuevas

#### 7.4 Ejemplo aterrizado: migración de `customer.controller.ts`

Estado actual:

- el controller usa `JwtAuthGuard`
- cada endpoint ejecuta `this.ensureAuthorized(currentUser.role)`
- la decisión depende de roles legacy hardcodeados: `MASTER_ADMIN`, `ADMIN`, `STAFF`

Problema:

- la autorización vive en el controller
- depende del enum viejo
- no escala a roles custom

Forma objetivo:

```ts
@Controller('v1/customers')
export class CustomerController {
  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('CUSTOMERS', 'CREATE')
  async create(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Body() body: CreateCustomerFiscalProfileRequestDto,
  ) {
    const command = CreateCustomerFiscalProfileCommandAdapter.create(
      body.toDomain(currentUser.userId),
    );

    const result = await this.commandBus.execute(command);
    const data = this.presenter.toCreateResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('CUSTOMER.CREATED'))
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('CUSTOMERS', 'READ')
  async findAll() {}

  @Get(':customerId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('CUSTOMERS', 'READ')
  async findOne() {}

  @Get(':customerId/public-access')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('CUSTOMERS', 'READ_PUBLIC_ACCESS')
  async findPublicAccess() {}

  @Patch(':customerId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('CUSTOMERS', 'UPDATE')
  async update() {}

  @Delete(':customerId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('CUSTOMERS', 'DELETE')
  async delete() {}
}
```

Resultado esperado:

- desaparece `ensureAuthorized()`
- el controller declara intención, no lógica de autorización
- el permiso se resuelve desde `systemRole + roleId`
- los campos sensibles no viajan embebidos en responses ordinarias de listado y detalle

#### 7.4.1 Criterio específico para customers con acceso tokenizado

Problema detectado:

- `public_access_url` y `public_access_token` son datos sensibles
- si viajan dentro de `GET /v1/customers` o `GET /v1/customers/:customerId`, cualquier actor con `CUSTOMERS/READ` obtiene capacidad indirecta para reutilizar el flujo público tokenizado

Diseño aprobado para esta spec:

- mantener `CUSTOMERS/READ` para listado y detalle ordinario
- retirar `public_access_url` y `public_access_token` de los presenters ordinarios
- crear un endpoint autenticado dedicado para consultar esos dos campos cuando la UI lo solicite explícitamente
- modelar esa revelación como operación explícita `CUSTOMERS/READ_PUBLIC_ACCESS`
- aplicar el mismo criterio en `providers` con la operación explícita `PROVIDERS/READ_PUBLIC_ACCESS`

#### 7.4.2 Criterio específico para providers con acceso tokenizado

Problema detectado:

- `public_access_url` y `public_access_token` son datos sensibles
- si viajan dentro de `GET /v1/providers` o `GET /v1/providers/:providerId`, cualquier actor con `PROVIDERS/READ` obtiene capacidad indirecta para reutilizar el flujo público tokenizado

Diseño aprobado para esta spec:

- mantener `PROVIDERS/READ` para listado y detalle ordinario
- retirar `public_access_url` y `public_access_token` de los presenters ordinarios
- crear un endpoint autenticado dedicado para consultar esos dos campos cuando la UI lo solicite explícitamente
- modelar esa revelación como operación explícita `PROVIDERS/READ_PUBLIC_ACCESS`

#### 7.5 Ejemplo aterrizado: migración de `CreateUserAndNotifyUseCase`

Estado actual:

- `user.controller.ts` pasa `currentUser.role` al command adapter
- el handler pasa `actorRole` al use case
- el use case ejecuta `UserRolePolicy.ensureCanManageRole(actorRole, input.role)`

Problema:

- la autorización operativa sigue acoplada a `UserRole`
- el contrato del command y del use case sigue arrastrando el enum legacy
- no distingue claramente regla estructural de `systemRole` contra permiso operativo derivado de `roleId`

Dirección objetivo:

- el controller pasa un `actorContext`
- el command adapter deja de transportar `actorRole` legacy
- el use case delega la validación a `AuthorizationService`
- `AuthorizationService` resuelve:
  - si el actor puede crear usuarios
  - si el actor puede asignar el `roleId` solicitado
  - si el actor puede fijar el `systemRole` solicitado

Forma objetivo aproximada:

```ts
export class CreateUserAndNotifyCommandAdapter implements ICommand {
  private constructor(
    public readonly payload: CreateUserDto,
    public readonly actor: AuthenticatedUserContextDto,
  ) {}
}

@Injectable()
export class CreateUserAndNotifyUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(
    input: CreateUserDto,
    actor: AuthenticatedUserContextDto,
  ): Promise<CreateUserResultDto> {
    await this.authorizationService.ensurePermission(
      actor,
      'USERS',
      'CREATE',
    );

    await this.authorizationService.ensureUserCreationAllowed(actor, {
      targetSystemRole: input.systemRole,
      targetRoleId: input.roleId,
    });

    // resto del flujo
  }
}
```

Resultado esperado:

- el uso de `UserRolePolicy.ensureCanManageRole(...)` desaparece de este flujo
- la regla estructural de promoción/degradación se centraliza
- la asignación de rol deja de depender del enum legacy y pasa a depender del nuevo modelo

#### 7.6 Regla de diseño derivada

- controllers nuevos o migrados no deben decidir permisos por rol hardcodeado
- commands y use cases nuevos o migrados no deben transportar `actorRole` legacy como mecanismo principal de autorización
- la autorización operativa debe resolverse por permiso
- las restricciones estructurales deben resolverse por `systemRole`
- cuando un use case mantenga validaciones defensivas, debe apoyarse en `AuthorizationService`, no en policies legacy acopladas a `UserRole`

### 8. HTTP modules and endpoints

#### 8.1 Role endpoints

Dominio sugerido de negocio:

- `v1/roles`

Endpoints sugeridos:

- `GET /v1/roles`
- `POST /v1/roles`
- `GET /v1/roles/:roleId`
- `PATCH /v1/roles/:roleId`
- `DELETE /v1/roles/:roleId`
- `PATCH /v1/roles/:roleId/status`

#### 8.2 Catalog endpoints

Si se exponen:

- `GET /v1/roles/modules`
- `GET /v1/roles/operations`

Fuente de verdad:

- deben leer desde el catálogo en código
- no deben depender de `permission_modules` ni `permission_operations` en Mongo

Shape sugerido:

```ts
{
  module_code: 'USERS',
  module_name: 'Usuarios',
  module_name_key: 'AUTHORIZATION.MODULE.USERS',
}
```

```ts
{
  operation_code: 'CREATE',
  operation_name: 'Crear',
  operation_name_key: 'AUTHORIZATION.OPERATION.CREATE',
}
```

Más adelante puede agregarse:

- `GET /v1/roles/permission-catalog`

para devolver el catálogo agrupado por módulo con sus operaciones válidas.

#### 8.2.1 Plan de transición

1. introducir el catálogo en código y sus helpers
2. cambiar `GET /v1/roles/modules` y `GET /v1/roles/operations` para leer desde código
3. cambiar validaciones internas para usar el catálogo en código
4. actualizar documentación y handoff
5. en fase posterior, eliminar infraestructura sobrante de `permission_modules` y `permission_operations`

#### 8.3 Master-admin endpoints

Exclusivos de plataforma:

- administración de usuarios `MASTER_ADMIN`
- administración de roles del sistema
- administración de catálogos del sistema si se exponen por HTTP

Ubicación:

```text
src/internal/infra/api/controllers/master-admin
```

### 9. User and invitation migration

#### 9.1 User create/update flows

Cambios:

- dejar de recibir `role` legacy
- recibir `systemRole` + `roleId` según reglas del modelo
- aplicar reglas automáticas:
  - `USER -> ADMIN` asigna `ADMIN_DEFAULT`
  - `ADMIN -> USER` exige `roleId`

#### 9.2 Invitations

Las invitaciones deberán migrar del enum viejo a:

- `systemRole`
- `roleId`

Y respetar:

- `MASTER_ADMIN` sólo desde dominio `master-admin`
- `USER` siempre con `roleId`

### 10. Data migration strategy

#### 10.1 Ordered rollout

Objetivo:

- migrar al nuevo modelo sin interrumpir la operación
- evitar una migración “big bang”
- permitir convivencia temporal entre modelo legacy y modelo nuevo

Orden técnico sugerido:

1. agregar nuevos modelos y seeds
2. introducir nuevo `User` schema con `system_role` y `role_id`
3. migrar JWT/authContext
4. introducir `AuthorizationService` + guard + decorators
5. migrar endpoints de roles
6. migrar flujos de usuario e invitaciones
7. migrar datos legacy
8. eliminar enums/policies/rutas viejas

Interpretación operativa:

- la infraestructura para migrar se prepara antes
- la ejecución real de la migración de usuarios ocurre más tarde
- la limpieza del legacy es el último paso, no el primero

#### 10.2 Legacy data mapping

- `MASTER_ADMIN` -> `MASTER_ADMIN` + `MASTER_ADMIN_DEFAULT`
- `ADMIN` -> `ADMIN` + `ADMIN_DEFAULT`
- `STAFF` -> `USER` + `STAFF_LEGACY`

Regla:

- no modelar migraciones para `CUSTOMER` ni `MASTER_STAFF` si no existen datos reales

#### 10.3 Backward compatibility window

Mientras dure la migración:

- evitar romper login
- evitar mezclar dos fuentes de verdad más tiempo del necesario
- migrar datos antes de retirar el modelo viejo completamente

El backend debe pasar por una etapa de compatibilidad temporal.

Durante esa etapa:

- la base ya puede contener `system_role` y `role_id`
- parte del código todavía puede seguir leyendo `role` legacy
- los scripts de migración pueden ejecutarse sin exigir corte operativo

#### 10.4 Seeders en este proyecto

En este proyecto, “seeders” no significa resetear ni repoblar la base.

Significa scripts versionados que hacen `upsert` controlado sobre catálogos y datos base del nuevo modelo.

Ejemplos:

- crear módulo si no existe
- crear operación si no existe
- crear rol del sistema si no existe
- crear `STAFF_LEGACY` si no existe

Reglas:

- los seeders deben ser idempotentes
- ejecutarlos varias veces no debe duplicar ni romper datos
- deben apoyarse en `code`, no en `_id` manuales

#### 10.5 Punto exacto dentro del plan

La infraestructura para permitir la migración se prepara antes de la ejecución operativa:

- Slice 1:
  - entidad `Role`
  - catálogos
  - seeds base
- Slice 2:
  - `User` extendido con `systemRole + roleId`
  - persistencia compatible temporalmente con legacy
- Slice 3 y 4:
  - `authContext`
  - `AuthorizationService`
  - permisos centralizados

La ejecución operativa de la migración de datos sucede formalmente en:

- Slice 8

La limpieza final del modelo viejo sucede en:

- Slice 9

#### 10.6 Runbook de migración sin interrupción

##### Fase A. Preparación de código

Antes de tocar datos reales, el backend debe:

- soportar `system_role` y `role_id` en schema y mapper
- tolerar temporalmente usuarios todavía no migrados
- seguir funcionando mientras algunos flujos aún dependan de `role`

Condición de salida:

- el despliegue no rompe usuarios legacy existentes

##### Fase B. Seeds base

Ejecutar seeders idempotentes para:

- `permission_modules`
- `permission_operations`
- `MASTER_ADMIN_DEFAULT`
- `ADMIN_DEFAULT`
- `STAFF_LEGACY`

Condición de salida:

- los catálogos y roles base existen en la base remota

##### Fase C. Verificación previa

Antes de la migración real, validar:

- conteo de usuarios `MASTER_ADMIN`
- conteo de usuarios `ADMIN`
- conteo de usuarios `STAFF`
- ausencia real de `CUSTOMER`
- ausencia real de `MASTER_STAFF`
- existencia de los roles:
  - `MASTER_ADMIN_DEFAULT`
  - `ADMIN_DEFAULT`
  - `STAFF_LEGACY`

##### Fase D. Migración de usuarios en `dry-run`

Crear un script versionado, por ejemplo:

```text
src/internal/infra/persistence/mongoose/migrations/migrate-users-to-system-role-and-role-id.ts
```

El script debe aceptar dos modos:

- `--dry-run`
- `--apply`

Comportamiento en `dry-run`:

- no escribe nada
- reporta qué usuarios serían migrados
- reporta conteos por tipo
- reporta inconsistencias detectadas

Salida esperada del `dry-run`:

- cuántos `MASTER_ADMIN` migrarían
- cuántos `ADMIN` migrarían
- cuántos `STAFF` migrarían
- cuántos usuarios ya están migrados
- cuántos usuarios quedarían sin mapeo

##### Fase E. Migración real

Comportamiento en `--apply`:

- actualizar solo usuarios que aún no tengan `system_role` o `role_id`
- no tocar usuarios ya migrados correctamente
- registrar resumen final de actualización

Reglas de actualización:

- `MASTER_ADMIN` -> `system_role=MASTER_ADMIN`, `role_id=MASTER_ADMIN_DEFAULT`
- `ADMIN` -> `system_role=ADMIN`, `role_id=ADMIN_DEFAULT`
- `STAFF` -> `system_role=USER`, `role_id=STAFF_LEGACY`

Reglas de seguridad:

- no borrar usuarios
- no borrar campos legacy todavía
- no sobreescribir usuarios ya migrados correctamente
- si aparece un rol inesperado, el script debe fallar o reportarlo, no improvisar conversión

##### Fase F. Verificación posterior

Después de `--apply`, validar:

- todos los usuarios tienen `system_role`
- todos los usuarios tienen `role_id`
- no quedó ningún usuario `STAFF` sin mapear
- `MASTER_ADMIN` quedó apuntando a `MASTER_ADMIN_DEFAULT`
- `ADMIN` quedó apuntando a `ADMIN_DEFAULT`
- `USER` migrado desde `STAFF` quedó apuntando a `STAFF_LEGACY`

Verificación adicional:

- login sigue funcionando
- endpoints sensibles siguen respondiendo
- `GET /v1/auth/me/permissions` resuelve correctamente para actores representativos

##### Fase G. Cambio de lectura preferente

Una vez migrados los usuarios:

- el backend debe leer prioritariamente `systemRole + roleId`
- `role` legacy queda solo como fallback temporal si aún hiciera falta

##### Fase H. Limpieza final

Solo al final:

- eliminar dependencia funcional a `role`
- eliminar `isMaster`
- eliminar policies legacy
- eliminar enums legacy
- retirar fallback de compatibilidad

#### 10.7 Naturaleza del script de migración

El script de migración debe ser:

- manual
- versionado en git
- auditable
- idempotente
- seguro para reintento

No debe ser:

- automático en bootstrap de la app
- implícito dentro de un seeder ordinario
- destructivo

#### 10.8 Riesgos y mitigaciones

Riesgo:

- usar la misma base remota para desarrollo y producción

Mitigaciones:

- usar `dry-run` antes de cada ejecución real
- no ejecutar scripts experimentales directo sobre la base compartida
- mantener el script pequeño, determinista y revisable
- hacer verificaciones previas y posteriores obligatorias

Riesgo:

- desplegar código que exija el nuevo modelo antes de sembrar roles base

Mitigación:

- el orden correcto siempre es:
  - código compatible
  - seeders
  - migración
  - cambio de lectura preferente

#### 10.9 Criterio de “sin interrupción”

Se considera migración transparente si durante el proceso:

- los usuarios actuales pueden seguir autenticándose
- los endpoints productivos no requieren ventana de mantenimiento
- la base nunca queda en un estado donde el backend desplegado no pueda interpretar los usuarios existentes

#### 10.10 Diseño concreto del script de migración

Ubicación sugerida:

```text
src/internal/infra/persistence/mongoose/migrations/migrate-users-to-system-role-and-role-id.ts
```

Objetivo del script:

- migrar usuarios legacy al nuevo modelo `system_role + role_id`
- permitir simulación previa sin escritura
- producir un reporte claro y auditable

##### Comando sugerido

Forma sugerida de ejecución:

```bash
pnpm tsx src/internal/infra/persistence/mongoose/migrations/migrate-users-to-system-role-and-role-id.ts --dry-run
```

```bash
pnpm tsx src/internal/infra/persistence/mongoose/migrations/migrate-users-to-system-role-and-role-id.ts --apply
```

Si el proyecto termina usando otro runner, la semántica debe mantenerse aunque cambie el comando exacto:

- `--dry-run`
- `--apply`

Reglas:

- el script debe fallar si no se recibe exactamente uno de esos modos
- `--apply` nunca debe ser el modo por defecto

##### Entrada esperada

El script no necesita payload manual complejo.

Debe leer:

- conexión Mongo desde el mismo entorno/configuración del proyecto
- colección de `users`
- colección de `roles`

Opcionalmente puede aceptar flags auxiliares en una iteración posterior, por ejemplo:

- `--limit`
- `--user-id`

Pero no son necesarias para la primera versión.

##### Dependencias de datos previas

Antes de ejecutar, el script debe resolver y validar la existencia de:

- rol `MASTER_ADMIN_DEFAULT`
- rol `ADMIN_DEFAULT`
- rol `STAFF_LEGACY`

Si alguno falta:

- el script debe fallar antes de intentar migrar usuarios

##### Consultas mínimas que debe hacer

Lecturas previas:

- buscar roles por `code`
- contar usuarios legacy por `role`
- contar usuarios ya migrados con `system_role` y `role_id`
- buscar usuarios con roles inesperados fuera de:
  - `MASTER_ADMIN`
  - `ADMIN`
  - `STAFF`

Lecturas de consistencia:

- detectar usuarios con `system_role` sin `role_id`
- detectar usuarios con `role_id` sin `system_role`
- detectar usuarios aparentemente ya migrados

Escrituras en `--apply`:

- `updateMany` o procesamiento por lotes sobre usuarios pendientes
- actualización de:
  - `system_role`
  - `role_id`

Regla:

- no borrar `role` legacy en esta fase

##### Algoritmo propuesto

1. conectar a Mongo
2. validar modo de ejecución
3. cargar roles base por `code`
4. obtener conteos previos
5. detectar inconsistencias bloqueantes
6. construir plan de migración
7. si es `--dry-run`, imprimir reporte y salir sin escribir
8. si es `--apply`, ejecutar migración por lotes
9. volver a consultar conteos e integridad
10. imprimir reporte final

##### Reglas de mapeo aplicadas por el script

Para cada usuario no migrado:

- si `role = MASTER_ADMIN`
  - asignar `system_role = MASTER_ADMIN`
  - asignar `role_id = <id de MASTER_ADMIN_DEFAULT>`
- si `role = ADMIN`
  - asignar `system_role = ADMIN`
  - asignar `role_id = <id de ADMIN_DEFAULT>`
- si `role = STAFF`
  - asignar `system_role = USER`
  - asignar `role_id = <id de STAFF_LEGACY>`

Si aparece cualquier otro `role`:

- no migrar automáticamente
- reportar como inconsistencia
- fallar el script o dejarlo como bloqueo explícito

##### Criterio de “usuario no migrado”

Para la primera versión, un usuario se considera pendiente si:

- no tiene `system_role`
- o no tiene `role_id`

Si ya tiene ambos:

- no debe reescribirse automáticamente

##### Estrategia de escritura

Recomendación:

- procesar por lotes pequeños y deterministas
- preferir filtros explícitos por estado de migración
- registrar cuántos documentos fueron modificados por cada mapping

No es obligatorio hacer una transacción multi-documento para esta migración si:

- el script es idempotente
- cada actualización deja al usuario en estado consistente

##### Reporte esperado en `--dry-run`

El `dry-run` debe imprimir al menos:

- modo de ejecución
- fecha y hora
- total de usuarios
- total ya migrados
- total pendientes por migrar
- total `MASTER_ADMIN` a migrar
- total `ADMIN` a migrar
- total `STAFF` a migrar
- total de roles inesperados encontrados
- total de inconsistencias estructurales encontradas

Ejemplo de salida conceptual:

```text
Migration mode: DRY_RUN
Users total: 18
Already migrated: 0
Pending migration: 18
To migrate MASTER_ADMIN -> MASTER_ADMIN_DEFAULT: 1
To migrate ADMIN -> ADMIN_DEFAULT: 2
To migrate STAFF -> STAFF_LEGACY: 15
Unexpected roles: 0
Blocking inconsistencies: 0
```

##### Reporte esperado en `--apply`

Además del resumen previo, debe imprimir:

- cuántos documentos se actualizaron efectivamente
- conteos posteriores
- validación final de integridad
- resultado final `SUCCESS` o `FAILED`

Ejemplo conceptual:

```text
Migration mode: APPLY
Updated MASTER_ADMIN users: 1
Updated ADMIN users: 2
Updated STAFF users: 15
Users with system_role after migration: 18
Users with role_id after migration: 18
Integrity check: OK
Result: SUCCESS
```

##### Condiciones de fallo

El script debe terminar con error si ocurre cualquiera de estas condiciones:

- faltan roles base requeridos
- aparecen roles inesperados no contemplados
- se detectan inconsistencias estructurales que vuelvan insegura la migración
- falla cualquier escritura crítica

##### Condiciones de éxito

Se considera exitosa la migración si:

- todos los usuarios objetivo quedaron con `system_role`
- todos los usuarios objetivo quedaron con `role_id`
- los conteos posteriores coinciden con el mapping esperado
- no se tocaron usuarios fuera del plan definido

##### Artefactos complementarios

Además del script, conviene dejar:

- un README corto de ejecución o una sección de uso en el propio archivo
- trazas suficientemente claras para auditoría manual
- referencia desde esta spec y desde el documento de handoff si el contrato visible cambia

### 11. Files/paths to touch

Áreas casi seguras:

- `src/internal/domain/entities/user.entity.ts`
- `src/internal/domain/entities/role.entity.ts` nuevo
- `src/internal/domain/ports/repositories/...` nuevos y modificados
- `src/internal/application/dto/...`
- `src/internal/application/use-cases/...`
- `src/internal/application/services/...`
- `src/internal/infra/persistence/mongoose/schemas/...`
- `src/internal/infra/persistence/mongoose/repositories/...`
- `src/internal/infra/cqrs/...`
- `src/internal/infra/api/controllers/...`
- `src/internal/infra/api/dto/...`
- `src/internal/infra/api/presenters/...`
- `src/internal/infra/api/guards/...`
- `src/common/decorators/...`
- `types/express/index.d.ts`

### 12. Implementation slices

Recomendación de slices pequeños:

#### Slice 1

- modelos `Role`, `PermissionModule`, `PermissionOperation`
- schemas
- repos
- seeds

#### Slice 2

- evolución de `User`
- JWT payload
- `authContext`

#### Slice 3

- `AuthorizationService`
- decorators
- guard
- endpoint de permisos

#### Slice 4

- CRUD de roles
- catálogos expuestos por API

#### Slice 5

- migración de `user` e invitaciones
- migración de endpoints legacy

#### Slice 6

- migración de datos
- eliminación de deuda técnica residual

## Riesgos técnicos principales

- romper login o guards durante la transición
- mezclar el modelo viejo y nuevo demasiado tiempo
- dejar autorización duplicada en controller y guard
- olvidar la migración de invitaciones además de usuarios
- permitir inconsistencias entre `systemRole` y `roleId`

## Definition Of Ready para implementación

Antes de tocar código, confirmar:

- definición funcional cerrada en `00-definition.md`
- pipeline documentado en `docs/api-pipeline.md`
- catálogo inicial de módulos aprobado
- catálogo inicial de operaciones aprobado
- reglas estructurales de `MASTER_ADMIN` cerradas
- estrategia de JWT/authContext cerrada
- estrategia de migración legacy cerrada

## Definition Of Done para el refactor

- no quedan dependencias al enum viejo de roles en runtime
- `User` usa `systemRole + roleId`
- existe entidad `Role` y catálogos controlados
- permisos centralizados en guard/decorator/servicio
- `ensureAuthorized()` eliminado de los endpoints migrados
- JWT y `authContext` alineados al nuevo modelo
- migración legacy ejecutable y documentada
