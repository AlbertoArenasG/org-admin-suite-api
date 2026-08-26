# API Pipeline

## Objetivo

Este documento define el patrón estándar que deben seguir los endpoints de la API.

El objetivo es mantener consistencia en:

- estructura del código
- validación
- separación de responsabilidades
- autorización
- formato de respuesta

## Resumen del pipeline

El flujo estándar de un endpoint en esta API es:

```text
Controller
-> Request DTO
-> Command/Query Adapter
-> CQRS Handler
-> Use Case
-> Domain + Policies + Services + Repositories
-> Application DTO
-> Presenter
-> ApiResponseBuilder
```

## Capas y responsabilidades

### 1. Controller

Responsabilidades:

- recibir `@Body`, `@Query`, `@Param` y `@CurrentUser()`
- aplicar guards
- invocar `CommandBus` o `QueryBus`
- pasar el resultado a un presenter
- construir la respuesta con `ApiResponseBuilder`

No debe:

- contener lógica de negocio relevante
- hablar directamente con repositorios
- transformar respuestas finales manualmente si ya existe presenter
- centralizar autorización con lógica local hardcodeada

Notas:

- la autorización nueva debe vivir en guards/decorators y reglas estructurales centralizadas
- `ensureAuthorized()` en controllers se considera deuda técnica a eliminar

### 2. Request DTO

Responsabilidades:

- vivir en `src/internal/infra/api/dto/...`
- validar con `class-validator`
- transformar entrada HTTP a DTO de aplicación con `toDomain()`

No debe:

- contener lógica de negocio
- consultar repositorios

### 3. Command/Query Adapter

Responsabilidades:

- encapsular el payload para `CommandBus` o `QueryBus`
- mantener el contrato de entrada al handler

No debe:

- contener lógica de negocio

### 4. CQRS Handler

Responsabilidades:

- delegar en un use case
- usar `BaseCommandHandler` o `BaseQueryHandler`

No debe:

- implementar lógica de negocio relevante

### 5. Use Case

Responsabilidades:

- vivir en `src/internal/application/use-cases/...`
- orquestar políticas, servicios, repositorios y entidades
- validar invariantes de negocio
- devolver DTOs de application

No debe:

- construir respuestas HTTP
- conocer detalles de presentación web

### 6. Domain

Responsabilidades:

- entidades
- value objects
- policies
- excepciones
- puertos de dominio

No debe:

- depender de NestJS
- depender de Mongoose
- depender de HTTP

### 7. Repository

Responsabilidades:

- implementar contratos definidos en `domain/ports/repositories`
- traducir entre persistencia y entidades de dominio

No debe:

- mezclar lógica de negocio de aplicación

### 8. Presenter

Responsabilidades:

- convertir DTOs de application en responses HTTP
- adaptar naming y shape de salida
- enriquecer enum names o estructuras de respuesta

No debe:

- ejecutar lógica de negocio
- consultar repositorios

### 9. ApiResponseBuilder

Responsabilidades:

- estandarizar el envelope de salida
- agregar `success_message`, `data`, `pagination`, `status_code`, etc.

## Autenticación y contexto autenticado

Patrón aprobado:

- `JwtAuthGuard` valida el token
- construye y adjunta `request.authContext`
- `@CurrentUser()` extrae ese contexto

Evolución aprobada:

- el patrón de `authContext` no se reemplaza, se evoluciona
- el nuevo contexto autenticado debe alinearse al modelo:
  - `userId`
  - `systemRole`
  - `roleId`
  - metadata del rol cuando aplique

## Autorización

Regla objetivo:

- la autorización debe centralizarse
- usar guard de permisos + decorators
- conservar reglas estructurales especiales para `MASTER_ADMIN`

No se deben crear endpoints nuevos con:

- listas locales de roles permitidos hardcodeadas en controllers
- `ensureAuthorized()` como mecanismo principal

Regla práctica:

- el controller declara el permiso requerido
- el guard resuelve si el actor autenticado puede ejecutar la acción
- el use case solo conserva validaciones defensivas sensibles cuando la regla no pertenece puramente al HTTP layer

Para una operación funcional directa, la forma objetivo es:

```ts
@Get()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('CUSTOMERS', 'READ')
async findAll() {}
```

Para un lookup reutilizable entre módulos, el controller declara una capability auxiliar; el permiso directo del módulo propietario no sustituye esta frontera:

```ts
@Get('options')
@UseGuards(JwtAuthGuard, AuxiliaryCapabilitiesGuard)
@RequireAuxiliaryCapability('CUSTOMERS', 'READ_OPTIONS')
async findOptions() {}
```

Las capabilities auxiliares se derivan y persisten exclusivamente en backend a partir de los permisos directos del rol. No se exponen ni se administran desde frontend. Consultar [auxiliary-capabilities-mapping.md](/Users/alberto/projects/icsacv/org-admin-suite-api/docs/authorization/auxiliary-capabilities-mapping.md:1) para el catálogo y las derivaciones vigentes.

Antipatrón a evitar:

```ts
@Get()
@UseGuards(JwtAuthGuard)
async findAll(@CurrentUser() currentUser: AuthenticatedUserContextDto) {
  this.ensureAuthorized(currentUser.role);
}
```

## Dominio `master-admin`

Regla arquitectónica:

- toda feature exclusiva de `MASTER_ADMIN` debe vivir bajo:

```text
src/internal/infra/api/controllers/master-admin
```

Ejemplos:

- administración de usuarios `MASTER_ADMIN`
- administración de roles del sistema
- administración de catálogos `modules` y `operations`
- futuras acciones de soporte o mantenimiento reservadas

## Respuestas

Todos los endpoints deben devolver respuestas usando `ApiResponseBuilder`.

Convenciones:

- usar `SuccessMessageService` para mensajes de éxito cuando aplique
- usar presenters para estructurar `data`
- usar paginación estándar cuando el endpoint devuelve colecciones

## Regla práctica para desarrollo nuevo

Antes de implementar un endpoint nuevo, verificar:

1. ¿Existe request DTO con validación y `toDomain()`?
2. ¿Existe command o query adapter?
3. ¿Existe handler delgado?
4. ¿Existe use case con la lógica real?
5. ¿La autorización va en guard/decorator y no en controller?
6. ¿Existe presenter para la respuesta?
7. ¿La salida usa `ApiResponseBuilder`?

## Aplicación a este refactor

El refactor de roles y permisos debe seguir este pipeline completo.

En particular:

- nuevos catálogos
- nuevos endpoints de roles
- nuevo guard de permisos
- evolución del `authContext`
- eliminación de `ensureAuthorized()`

todo debe construirse sin romper este estándar.
