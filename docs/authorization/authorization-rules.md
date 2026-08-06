# Reglas De Autorización

## Propósito

Este documento define las reglas permanentes de diseño para autorización dentro de la API.

Su objetivo es evitar que el proyecto vuelva a caer en:

- autorización hardcodeada por rol legacy
- lógica local de autorización dentro de controllers
- proliferación de métodos específicos por endpoint o por feature

## Principios

- la autorización operativa debe resolverse por `module + operation`
- la autorización estructural debe resolverse por `systemRole` y reglas explícitas
- los controllers declaran permisos; no deben decidir permisos por sí mismos
- los use cases pueden conservar validaciones defensivas, pero deben apoyarse en un servicio central de autorización

## Frontera Del Catálogo Vs Frontera `MASTER_ADMIN`

El catálogo de autorización y la frontera exclusiva de `MASTER_ADMIN` no son lo mismo.

Reglas:

- `authorization.catalog.ts` debe contener solo módulos funcionales autorizables del sistema
- esos módulos representan capacidades de negocio o backoffice que pueden asignarse por permisos
- las capacidades exclusivas de plataforma, soporte o mantenimiento no deben entrar automáticamente al catálogo
- toda feature exclusiva de `MASTER_ADMIN` debe evaluarse primero como frontera estructural, no como módulo funcional

Criterio práctico:

- si la feature es una capacidad del producto que en el futuro podría asignarse por permisos, debe modelarse como módulo del catálogo
- si la feature es una capacidad técnica, operativa o de soporte reservada a desarrollo/plataforma, debe vivir fuera del catálogo general

Implementación esperada para features exclusivas de `MASTER_ADMIN`:

- controller bajo `src/internal/infra/api/controllers/master-admin`
- protección con frontera `MASTER_ADMIN`
- reglas complementarias en `AuthorizationService` cuando aplique
- si crecen varias capacidades de plataforma, deben distribuirse en múltiples controllers o áreas dentro de `master-admin`, no concentrarse en un megacontroller

Regla adicional:

- no agregar metadata tipo `business/platform` dentro de `authorization.catalog.ts`
- la separación correcta no es marcar ambas cosas dentro del mismo catálogo, sino dejar fuera del catálogo general toda capacidad que realmente pertenezca a plataforma

Ejemplos de cosas que normalmente no deben entrar al catálogo general:

- herramientas de mantenimiento
- utilidades de soporte
- reparación o corrección manual de datos
- administración técnica de catálogos internos del sistema
- diagnósticos operativos
- capabilities transversales de infraestructura consumidas implícitamente por otros módulos funcionales, como manejo genérico de archivos

## Regla Central

El sistema no debe modelar autorización con un método por cada acción del sistema.

No queremos un diseño como:

- `ensureCanCreateCustomer()`
- `ensureCanDeleteProvider()`
- `ensureCanReadServiceEntry()`

Eso volvería a hardcodear la aplicación por feature y no escalaría con roles custom.

## Modelo Correcto

La autorización se divide en dos niveles.

### 1. Validación Genérica Por Permiso

Debe cubrir la mayoría de acciones ordinarias del backoffice.

API esperada:

```ts
authorizationService.ensurePermission(actor, module, operation)
authorizationService.hasPermission(actor, module, operation)
authorizationService.resolveEffectivePermissions(actor)
```

La respuesta derivada de `resolveEffectivePermissions(actor)` puede incluir:

- `role`: metadata del rol efectivo
- `modules`: módulos efectivos deduplicados
- `permissions`: permisos efectivos detallados

Ejemplos:

- `CUSTOMERS + CREATE`
- `CUSTOMERS + READ`
- `PROVIDERS + UPDATE`
- `SERVICE_ENTRIES + DELETE`
- `ROLES + CREATE`

### 2. Validaciones Estructurales Específicas

Solo deben existir cuando la regla no puede expresarse correctamente con `module + operation`.

API sugerida:

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
authorizationService.ensureCanDeleteUser(
  actorSystemRole,
  targetSystemRole,
  isSelfDelete,
)
authorizationService.ensureHasHigherPrivileges(actorSystemRole, targetSystemRole)
```

Estas validaciones deben cubrir casos como:

- asignar un rol default del sistema
- asignar un rol custom
- promover `USER -> ADMIN`
- permitir `USER -> USER` cuando exista permiso funcional suficiente
- degradar `ADMIN -> USER`
- tocar algo relacionado con `MASTER_ADMIN`
- exigir `roleId` custom al convertir un usuario en `USER`

## Criterio Práctico

Usar `ensurePermission(...)` cuando:

- el endpoint representa una acción ordinaria de negocio
- la autorización puede expresarse con el catálogo `module + operation`

Regla para endpoints de catálogo auxiliares:

- un endpoint de catálogo o lookup no debe convertirse por defecto en un permiso explícito editable dentro del CRUD de roles
- si ese endpoint solo existe para soportar una acción principal de negocio, su acceso puede quedar implícitamente cubierto por el permiso funcional principal
- solo debe modelarse como operación explícita si expone información con sensibilidad propia o si negocio necesita gobernarlo de manera separada

Regla para datos sensibles dentro de un módulo:

- si un endpoint ordinario de `READ` incluye campos con sensibilidad propia, esos campos no deben quedarse acoplados por inercia al permiso general de lectura
- en esos casos, el dato sensible debe separarse a un endpoint o capacidad auxiliar dedicada
- esa capacidad sí debe promoverse a operación explícita del mismo módulo cuando negocio o seguridad necesiten gobernarla por separado
- esto evita meter lógica condicional por campo dentro de presenters generales y mantiene más clara la frontera de autorización

Usar validación estructural cuando:

- interviene `systemRole`
- interviene asignación de `roleId`
- hay promoción o degradación de usuario
- el caso toca reglas exclusivas de `MASTER_ADMIN`

## Ejemplos De Clasificación

Casos que deben resolverse con permiso genérico:

- crear customer
- listar providers
- actualizar service entry
- eliminar service package record
- crear rol custom
- consultar catálogos auxiliares necesarios para ejecutar una acción principal ya autorizada, cuando no tengan autonomía funcional propia

Excepción importante:

- endpoints self-service del usuario autenticado como `GET /v1/users/me` y `PATCH /v1/users/me` pueden vivir solo con `JwtAuthGuard` cuando la acción no implica backoffice ni acceso sobre otros usuarios

Ejemplo práctico:

- `GET /v1/users/roles` puede quedar absorbido por la capacidad funcional principal que lo consume; en el estado actual del sistema, al servir el flujo ordinario de invitaciones, queda absorbido por `USER_REGISTRATION_INVITATIONS/CREATE`
- si la creación funcional de usuarios ocurre por invitación, un endpoint técnico como `POST /v1/users` no debe mantenerse por inercia dentro del catálogo general de negocio
- `GET /v1/customers` y `GET /v1/customers/:customerId` no deben exponer `public_access_url` ni `public_access_token`; esos campos deben resolverse mediante `CUSTOMERS/READ_PUBLIC_ACCESS`
- `GET /v1/providers` y `GET /v1/providers/:providerId` no deben exponer `public_access_url` ni `public_access_token`; esos campos deben resolverse mediante `PROVIDERS/READ_PUBLIC_ACCESS`
- si un capability como `FILES` solo existe para soportar uploads, metadata o descargas requeridas por otros módulos funcionales y no tiene UI ni gobierno de negocio propio, debe salir del catálogo funcional general y tratarse como infraestructura transversal
- para `files`, la decisión aprobada no es absorber sus endpoints por permisos del módulo padre, sino dejar `JwtAuthGuard` donde hoy ya exista autenticación y retirar `PermissionsGuard` junto con cualquier permiso `FILES/*`

Casos que deben resolverse con validación estructural:

- crear un usuario `ADMIN`
- crear un usuario `MASTER_ADMIN`
- promover un `USER` a `ADMIN`
- degradar un `ADMIN` a `USER`
- asignar el rol default `ADMIN`
- modificar un rol del sistema inmutable

## Interfaz Esperada De `AuthorizationService`

La interfaz debe ser pequeña, estable y reutilizable.

Forma esperada:

```ts
interface AuthorizationService {
  ensurePermission(actor, module, operation): Promise<void>;
  hasPermission(actor, module, operation): Promise<boolean>;
  resolveEffectivePermissions(actor): Promise<ResolvedAuthorizationContextDto>;
  ensureCanAssignRole(actor, targetRole): Promise<void>;
  ensureCanChangeSystemRole(actor, targetSystemRole): Promise<void>;
  ensureCanCreateUser(actor, input): Promise<void>;
  ensureCanUpdateUser(actor, input): Promise<void>;
  ensureCanDeleteUser(actorSystemRole, targetSystemRole, isSelfDelete): void;
}
```

## Shape Esperado Del Actor Autenticado

El actor autenticado objetivo debe migrar a:

```ts
interface AuthenticatedUserContextDto {
  userId: string;
  systemRole: SystemRole;
  roleId: string;
  token: string;
}
```

Reglas:

- `role` e `isMaster` legacy deben desaparecer del contexto nuevo
- el `authContext` debe transportar lo mínimo para autorización consistente

## DTOs Estructurales Esperados

El diseño debe contemplar al menos estos inputs conceptuales:

- `AuthorizationRoleSummaryDto`
- `ResolvedAuthorizationContextDto`
- `UserAuthorizationTargetDto`
- `UpdateUserAuthorizationTargetDto`

Su función es separar:

- permisos efectivos
- metadata resumida de rol
- validaciones de creación de usuario
- validaciones de promoción, degradación y reasignación

## Reglas Semánticas De La Interfaz

- `ensurePermission(...)` cubre acciones ordinarias de negocio
- `ensureCanAssignRole(...)` cubre asignación de roles del sistema o custom
- `ensureCanChangeSystemRole(...)` cubre la restricción estructural del `systemRole`
- `ensureCanCreateUser(...)` cubre creación de usuario con coherencia entre `systemRole` y `roleId`
- `ensureCanUpdateUser(...)` cubre promoción, degradación y reasignación
- `ensureCanDeleteUser(...)` cubre borrado de terceros respetando frontera estructural y bloqueo de autoeliminación

## Reglas De Consistencia Del Modelo

La autorización debe reforzar estas reglas:

- `MASTER_ADMIN` solo usa el rol default `MASTER_ADMIN`
- `ADMIN` solo usa el rol default `ADMIN`
- `USER` siempre usa rol custom
- los roles custom solo existen para `scope = USER`
- `ADMIN -> USER` exige rol custom válido
- `USER -> ADMIN` debe resolver al default `ADMIN`

## Reglas Para Controllers

Los controllers no deben:

- usar listas locales de roles permitidos
- implementar `ensureAuthorized()` como mecanismo principal
- decidir permisos por enum legacy

Forma objetivo:

```ts
@Get()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('CUSTOMERS', 'READ')
async findAll() {}
```

Excepción válida:

```ts
@Get('me')
@UseGuards(JwtAuthGuard)
async getProfile() {}
```

Implementación actual:

- `AuthorizationService` ya existe como base operativa
- `PermissionsGuard` ya existe
- `@RequirePermission(...)` ya existe
- la migración de controllers quedó aterrizada en los endpoints internos principales del repo
- los flows sensibles de usuario e invitaciones ya migraron sus validaciones estructurales desde `UserRolePolicy` hacia `AuthorizationService`

## Estado Actual De Reglas Estructurales

Hoy `AuthorizationService` ya concentra estas reglas:

- `MASTER_ADMIN` puede gestionar cualquier `systemRole`
- `ADMIN` puede gestionar `ADMIN` y `USER`, pero nunca `MASTER_ADMIN`
- `USER` solo puede gestionar objetivos `USER`
- `MASTER_ADMIN` y `ADMIN` solo pueden quedar consistentes con sus roles default del sistema
- `USER` debe usar rol custom de `scope = USER`

Compatibilidad temporal:

- el request model HTTP ya quedó migrado a `systemRole + roleId`
- el runtime todavía conserva compatibilidad de persistencia para algunos campos legacy en Mongo, pero ya no como contrato principal de autorización

Antipatrón:

```ts
@Get()
@UseGuards(JwtAuthGuard)
async findAll(@CurrentUser() currentUser: AuthenticatedUserContextDto) {
  this.ensureAuthorized(currentUser.role);
}
```

## Contrato Esperado De `@RequirePermission`

Forma objetivo:

```ts
@RequirePermission('CUSTOMERS', 'READ')
```

Semántica:

- declara un permiso requerido por endpoint
- usa el catálogo controlado `module + operation`
- no debe representar reglas estructurales exclusivas de `MASTER_ADMIN`
- no es obligatorio en endpoints self-service autenticados que no deban depender del catálogo de permisos

## Contrato Recomendado Para `GET /v1/auth/me/permissions`

Este endpoint puede exponer una vista enriquecida del contexto efectivo de autorización sin mezclar lógica de interfaz específica.

Forma recomendada:

- `system_role`
- `role`
- `modules`
- `permissions`

Reglas:

- `modules` debe derivarse de `permissions`
- un módulo aparece si el usuario tiene al menos un permiso válido dentro de ese módulo
- `permissions` debe incluir `module`, `operation` y metadata localizada (`name` + `name_key`)
- `modules` también debe incluir `name` + `name_key`
- la localización debe resolverse con el idioma efectivo del request
- no deben agregarse flags acoplados a UI como `show_in_sidebar`

## Runbook De Evolución Del Catálogo

Cuando se agregue un nuevo módulo o una nueva operación autorizable al sistema, la fuente de verdad debe actualizarse primero en código.

Orden esperado:

1. actualizar `AUTHORIZATION_CATALOG` y, si aplica, el catálogo de operaciones controladas
2. migrar o crear los endpoints que usarán ese nuevo permiso
3. correr `npm run db:seed` para sincronizar `MASTER_ADMIN_DEFAULT` y `ADMIN_DEFAULT`
4. validar `GET /v1/auth/me/permissions` con usuarios `MASTER_ADMIN` y `ADMIN`
5. actualizar `docs/authorization/feature-permission-catalog.md` si cambió el mapa funcional de endpoints

Reglas:

- `npm run db:seed` es idempotente
- el seed de roles del sistema recalcula los permisos desde el catálogo en código
- `MASTER_ADMIN_DEFAULT` y `ADMIN_DEFAULT` se sincronizan automáticamente con el catálogo vigente
- los roles custom no se modifican automáticamente
- los permisos persistidos en `roles.permissions` deben quedar en formato canónico de mayúsculas, por ejemplo `USERS/READ`

## Contrato Esperado De `PermissionsGuard`

Responsabilidad:

- leer el permiso declarado por el decorator
- tomar el `authContext` construido por `JwtAuthGuard`
- delegar la validación a `AuthorizationService`

Secuencia esperada:

1. `JwtAuthGuard`
2. `PermissionsGuard`

Forma objetivo:

```ts
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('CUSTOMERS', 'READ')
```

Reglas:

- `PermissionsGuard` no autentica, solo autoriza
- `PermissionsGuard` no debe consultar repositorios directamente
- `PermissionsGuard` no debe hardcodear roles legacy
- en endpoints `master-admin`, el permiso debe convivir con la restricción estructural correspondiente

## Regla Para Endpoints `master-admin`

- una acción exclusiva de `MASTER_ADMIN` no se vuelve ordinaria solo por declarar `@RequirePermission(...)`
- la zona `master-admin` siempre requiere además la restricción estructural correspondiente

## Reglas Para Use Cases

Los use cases pueden conservar validaciones defensivas cuando la regla es sensible, pero:

- no deben depender de `actorRole` legacy como mecanismo principal
- no deben codificar jerarquías de roles legacy como regla nueva
- deben apoyarse en `AuthorizationService`

## Relación Con Otros Documentos

- el catálogo funcional y de permisos vive en [feature-permission-catalog.md](/Users/alberto/projects/icsacv/org-admin-suite-api/docs/authorization/feature-permission-catalog.md:1)
- el pipeline general de la API vive en [api-pipeline.md](/Users/alberto/projects/icsacv/org-admin-suite-api/docs/api-pipeline.md:1)
