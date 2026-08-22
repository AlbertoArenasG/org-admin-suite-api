# Mapeo De Capabilities Auxiliares

## Propósito

Este documento registra la capa de capabilities auxiliares reutilizables del backoffice.

Su objetivo es separar dos fronteras de autorización funcionales sin contaminar el catálogo editable de permisos:

- `module + operation`: operaciones de negocio y auxiliares locales de un módulo
- `{ module, capability }`: lookups auxiliares reutilizables entre módulos

No es la fuente de verdad runtime. La fuente de verdad técnica vive en:

- `src/internal/application/services/authz/auxiliary-capabilities/auxiliary-capabilities.catalog.ts`
- `src/internal/application/services/authz/auxiliary-capabilities/auxiliary-capabilities-derivation.catalog.ts`

Complementos:

- las reglas permanentes viven en [authorization-rules.md](/Users/alberto/projects/icsacv/org-admin-suite-api/docs/authorization/authorization-rules.md:1)
- el catálogo funcional directo vive en [feature-permission-catalog.md](/Users/alberto/projects/icsacv/org-admin-suite-api/docs/authorization/feature-permission-catalog.md:1)

## Alcance

Esta capa aplica al backoffice autenticado de negocio (`ADMIN` y `USER`, además de roles del sistema que usan el mismo modelo de rol).

No aplica a:

- endpoints públicos bajo `public/*`
- accesos externos por link o token público
- fronteras estructurales exclusivas de `MASTER_ADMIN`
- endpoints auxiliares locales que ya pertenecen a una combinación `module + operation`

## Modelo Persistido

`Role` conserva dos listas con responsabilidades distintas:

- `permissions[]`: permisos directos configurables por el editor de roles, con `{ module, operation }`
- `auxiliaryCapabilities[]`: capacidades derivadas exclusivamente por backend, con `{ module, capability }`

Reglas:

- frontend solo envía y administra `permissions[]`
- backend deriva `auxiliaryCapabilities[]` a partir de los módulos directos presentes en `permissions[]`
- al crear o actualizar un rol, backend reemplaza por completo la lista derivada; no la mezcla con valores previos ni acepta valores enviados por cliente
- la derivación se deduplica y valida contra el catálogo maestro al iniciar la aplicación
- el seed de roles del sistema sincroniza las capabilities derivadas de `MASTER_ADMIN_DEFAULT` y `ADMIN_DEFAULT`; no altera roles custom ni `STAFF_LEGACY`

## Evaluación En Runtime

Los endpoints reutilizables se protegen con `JwtAuthGuard` y `AuxiliaryCapabilitiesGuard`.

El guard resuelve el rol persistido del actor autenticado y verifica su `auxiliaryCapabilities[]` mediante `AuxiliaryCapabilitiesService`. Esta evaluación es una responsabilidad exclusiva de backend.

Frontend no debe:

- recibir estas capabilities en las respuestas ordinarias de roles
- editarlas en el constructor de roles
- condicionar selects, vistas o controles según ellas

Cuando una vista ya autorizada requiere un lookup reutilizable, backend garantiza su acceso mediante la derivación del rol.

## Catálogo Maestro Actual

| Capability module | Capability | Endpoint protegido | Propósito |
| --- | --- | --- | --- |
| `CONTACTS` | `SEARCH` | `GET /v1/contacts/search` | Buscar contactos activos para selección reutilizable. |
| `COMMUNICATION_CHANNELS` | `READ_OPTIONS` | `GET /v1/communication-channels` | Obtener canales de comunicación seleccionables. |
| `EXPIRATION_STATUS_POLICIES` | `READ_OPTIONS` | `GET /v1/expiration-status-policies/options` | Obtener políticas de estatus de vencimiento seleccionables. |
| `EXPIRATION_NOTIFICATION_POLICIES` | `READ_OPTIONS` | `GET /v1/expiration-notification-policies/options` | Obtener políticas de notificación de vencimiento seleccionables. |

## Reglas De Derivación Actuales

La derivación depende del módulo directo del rol, no de una operación específica dentro de ese módulo.

| Módulo directo | Capabilities derivadas |
| --- | --- |
| `RECIPIENT_GROUPS` | `CONTACTS/SEARCH`, `COMMUNICATION_CHANNELS/READ_OPTIONS` |
| `INTERNAL_ASSET_MAINTENANCE_RECORDS` | `EXPIRATION_STATUS_POLICIES/READ_OPTIONS`, `EXPIRATION_NOTIFICATION_POLICIES/READ_OPTIONS` |

Esto permite que un usuario con cualquier operación directa válida del módulo consumidor obtenga los lookups que esa funcionalidad necesita, sin que quien construye el rol tenga que conocer ni seleccionar dependencias técnicas.

## Auxiliares Locales Fuera De Esta Capa

Los auxiliares locales siguen protegidos por la frontera funcional existente. Ejemplos:

- `GET /v1/roles/modules` usa `ROLES/READ`
- `GET /v1/users/roles` usa `USER_REGISTRATION_INVITATIONS/CREATE`
- `GET /v1/expiration-status-policies/catalog` usa `EXPIRATION_STATUS_POLICIES/READ`
- `GET /v1/expiration-notification-policies/catalog` usa `EXPIRATION_NOTIFICATION_POLICIES/READ`
- `GET /v1/internal-asset-maintenance-records/catalog` usa `INTERNAL_ASSET_MAINTENANCE_RECORDS/READ`

No se debe crear una capability auxiliar solo porque un endpoint sea un catálogo. Debe ser reutilizable entre módulos y requerir una frontera independiente de la operación administrativa del módulo dueño.

## Mantenimiento

Al agregar una capability auxiliar reutilizable:

1. Registrar `{ module, capability }` en el catálogo maestro de código.
2. Definir qué módulos consumidores la derivan.
3. Proteger el endpoint con el decorador y `AuxiliaryCapabilitiesGuard`.
4. Cubrir derivación, persistencia y autorización con pruebas.
5. Actualizar este documento y el catálogo funcional de endpoints.

Si la capability debe mostrarse de forma informativa en frontend en el futuro, deberá definirse mediante una spec propia y un contrato de API explícito. No debe exponerse ni editarse por conveniencia.
