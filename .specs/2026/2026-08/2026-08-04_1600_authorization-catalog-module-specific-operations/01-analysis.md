# Analysis

## Initiative

- Name: `authorization-catalog-module-specific-operations`
- Date: `2026-08-04`

## Current State

- backend ya centraliza el catálogo de autorización en código
- el sistema ya permite declarar operaciones válidas por módulo
- parte del diseño histórico sigue leyendo ese catálogo como si todos los módulos fueran CRUD uniformes
- frontend acaba de requerir una UI guiada por catálogo real, lo que expuso con más claridad los límites del enfoque cuadrado

## Findings

- no todos los módulos representan capacidades CRUD clásicas
- algunos módulos parecen recursos CRUD reales y otros representan flujos, eventos o capacidades operativas
- seguir nombrando todo como CRUD puede ocultar operaciones reales del dominio
- no toda capacidad técnica expuesta por la API pertenece al catálogo funcional de negocio
- no todo endpoint de catálogo auxiliar merece una operación explícita propia
- el siguiente crecimiento de permisos será más sano si se redefine ahora el modelo conceptual

## Questions To Resolve

- qué módulos hoy sí son CRUD puros de forma legítima
- qué módulos ya deberían migrar a operaciones semánticas
- qué capacidades hoy viven en catálogo pero realmente pertenecen a plataforma
- qué catálogos auxiliares deben quedar absorbidos por una capacidad principal y cuáles sí merecerían operación propia
- si el sistema conservará un vocabulario base global
- cómo impacta esto a seeds, guards, catálogos HTTP y documentación operativa

## Risks

- si se mantiene la ficción de CRUD uniforme, cada módulo nuevo tenderá a deformarse para caber ahí
- si se migra sin análisis módulo por módulo, se puede romper consistencia o introducir nombres arbitrarios
- si no se separa plataforma de negocio, el catálogo se llenará de permisos que solo hacen ruido en producto
- si frontend avanza sin esta definición, volverá a consumir un contrato técnicamente correcto pero conceptualmente pobre

## Constraints

- backend debe seguir siendo la fuente de verdad del catálogo
- el refactor debe respetar el diseño limpio ya construido alrededor de `authorization.catalog.ts`
- el cambio debe quedar trazable en `.specs` y en `docs/` permanentes cuando aplique

## Modules Pending Review

- `ROLES`
- `CUSTOMERS`
- `PROVIDERS`
- `SERVICE_ENTRIES`
- `SERVICE_ENTRY_SURVEYS`
- `FILES`
- `SERVICE_PACKAGES`
- `USER_REGISTRATION_INVITATIONS`

## Reviewed Modules

### `USERS`

- clasificación actual:
  - módulo de negocio cercano a CRUD, pero no definido por obligación CRUD
- operaciones explícitas de negocio que hoy sí se sostienen:
  - `READ`
  - `UPDATE`
  - `DELETE`
- operaciones absorbidas o excluidas:
  - `GET /v1/users/roles` queda absorbido por `USERS/READ` como catálogo auxiliar
  - `GET /v1/users/me` y `PATCH /v1/users/me` quedan fuera del catálogo de backoffice por ser self-service
  - `POST /v1/users` deja de considerarse capacidad de negocio del catálogo general
- lectura actual:
  - la creación de usuarios para negocio hoy ocurre a través del flujo de invitaciones
  - el alta directa de usuarios queda mejor clasificada como capacidad operativa o de plataforma
- implicación para el refactor:
  - `USERS/CREATE` debe salir del catálogo general de negocio
  - el endpoint técnico de creación directa deberá reevaluarse bajo frontera `MASTER_ADMIN` o capacidad de plataforma equivalente

### `ROLES`

- clasificación actual:
  - módulo de negocio cercano a CRUD, pero con una operación explícita adicional de activación
- operaciones explícitas de negocio que hoy sí se sostienen:
  - `CREATE`
  - `READ`
  - `UPDATE`
  - `DELETE`
  - `ACTIVATE`
- operaciones absorbidas o excluidas:
  - `GET /v1/roles/modules` queda absorbido por `ROLES/READ` como catálogo auxiliar del editor de permisos
- lectura actual:
  - la administración de roles custom sí pertenece claramente al catálogo funcional de negocio
  - el cambio de estado de un rol no debe seguir modelado como simple `UPDATE`
- implicación para el refactor:
  - `PATCH /v1/roles/:roleId/status` debe migrar a `ROLES/ACTIVATE`
  - el vocabulario global deberá admitir `ACTIVATE` como operación real del dominio

### `CUSTOMERS`

- clasificación actual:
  - módulo de negocio CRUD para backoffice autenticado
- operaciones explícitas de negocio que hoy sí se sostienen:
  - `CREATE`
  - `READ`
  - `UPDATE`
  - `DELETE`
- operaciones absorbidas o excluidas:
  - los endpoints públicos por token del customer fiscal profile quedan fuera del catálogo autenticado
- lectura actual:
  - el controller autenticado de `CUSTOMERS` sí representa administración ordinaria del dominio desde backoffice
  - el flujo público por token pertenece al mismo dominio funcional, pero no al modelo de permisos por rol
- implicación para el refactor:
  - `CUSTOMERS` puede mantenerse como módulo CRUD dentro del catálogo autenticado
  - los endpoints públicos por token deben seguir documentándose como frontera separada y no como permisos del catálogo general
