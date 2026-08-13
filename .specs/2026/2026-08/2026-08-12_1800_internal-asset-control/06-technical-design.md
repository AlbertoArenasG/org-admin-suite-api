# Technical Design

## Current State

La definición funcional ya quedó cerrada. El diseño técnico aquí debe servir como referencia ejecutable para la implementación, endureciendo únicamente lo ya aprobado en `00-definition.md` y `04-decisions.md`.

## Approved Base So Far

### Module

- backend module slug:
  - `internal-asset-control`

### Primary Resource

- backend resource slug:
  - `internal-asset-maintenance-record`

### Modeling Direction

- cada registro será histórico
- el activo se capturará directo dentro del registro
- el recurso principal no depende todavía de un catálogo maestro de activos
- existirá un catálogo en código de `assetMaintenanceType`
- existirá `status` persistido separado de estados derivados de UI
- existirá capability administrable de políticas de alerta

### Alert Policy Base Shape

- `name`
- `code` autogenerado desde `name`
- `description` opcional
- `status`
- `rules[]`

Estados iniciales de política:

- `ACTIVE`
- `INACTIVE`
- `DELETED`

Contratos HTTP mínimos aprobados para `alert-policies`:

- `GET /v1/alert-policies`
- `GET /v1/alert-policies/:policyId`
- `POST /v1/alert-policies`
- `PATCH /v1/alert-policies/:policyId`
- `DELETE /v1/alert-policies/:policyId`

Lecturas aprobadas:

- listado paginado administrativo
- colección simple no paginada para lookup o selección

Shape resumido aprobado para `GET /v1/alert-policies`:

- `id`
- `name`
- `code`
- `status`
- `rules_count`
- `created_at`
- `updated_at`

Capacidades de consulta aprobadas:

- paginación estándar
- búsqueda por `name` o `code`
- filtro por `status`

Shape ligero aprobado para la colección simple no paginada de `alert-policies`:

- `id`
- `name`
- `code`
- `status`

Comportamiento base aprobado:

- devolver por defecto solo políticas `ACTIVE`

Shape aprobado para `GET /v1/alert-policies/:policyId`:

- `id`
- `name`
- `code`
- `description`
- `status`
- `rules[]`
- `created_at`
- `updated_at`

Shape mínimo aprobado por regla en el detalle:

- `offset`
- `severityLabel`
- `severityColorHex`
- `recipient_groups`

`recipient_groups` se expandirá de forma ligera.

Contratos de escritura aprobados para `alert-policies`:

- `POST /v1/alert-policies`
  - crea con `name`, `description`, `status`, `rules[]`
- `PATCH /v1/alert-policies/:policyId`
  - edita `name`, `description`, `status`, `rules[]`
- `DELETE /v1/alert-policies/:policyId`
  - aplica borrado lógico a `DELETED`

Restricción aprobada:

- `code` no es editable manualmente

## Provisional Resource Shape

El shape exacto sigue pendiente, pero ya se asumen como mínimos conceptuales:

- identidad técnica del registro
- referencia capturada del activo:
  - nombre
  - identificador de negocio
- `assetMaintenanceType`
- fecha base del registro como fecha real de la acción documentada
- `last_maintenance_at` como fecha real de la última atención documentada
- intervalo de vigencia estructurado:
  - `years`
  - `months`
  - `weeks`
  - `days`
- `expiration_date` persistida como fecha de negocio vigente
- observaciones del registro concreto
- `status` persistido
- bloque opcional de provider
- referencia directa a política de alerta reutilizable

Shape resumido aprobado para `GET /v1/internal-asset-maintenance-records`:

- `id`
- `asset_name`
- `asset_identifier`
- `asset_maintenance_type`
- `last_maintenance_at`
- `expiration_date`
- `status`
- `derived_status`
- `alert_policy`
- `sent_to_provider`
- `provider_name`
- `provider_lead_time`
- `provider_follow_up_enabled`
- `provider_follow_up_rules_count`
- `provider_follow_up_last_sent_at`
- `created_at`
- `updated_at`

Shape aprobado para `GET /v1/internal-asset-maintenance-records/:recordId`:

- `id`
- `asset_name`
- `asset_identifier`
- `asset_maintenance_type`
- `last_maintenance_at`
- `interval`
- `expiration_date`
- `observations`
- `status`
- `derived_status`
- `alert_policy`
- `provider`
- `provider_follow_up`
- `created_at`
- `updated_at`
- `created_by`
- `updated_by`

Notas aprobadas:

- `alert_policy` se expandirá de forma ligera y opcional
- `provider_follow_up` incluirá reglas configuradas y `recipient_groups` expandidos de forma ligera
- `created_by` y `updated_by` se enriquecerán para presentación

Contrato aprobado para `POST /v1/internal-asset-maintenance-records`:

- recibe al menos:
  - `asset_name`
  - `asset_identifier`
  - `asset_maintenance_type`
  - `last_maintenance_at`
  - `interval`
  - `expiration_date` opcional
  - `observations`
  - `status`
  - `alert_policy_id` opcional
  - `provider` opcional
  - `provider_follow_up` opcional
- backend calcula o valida:
  - `expiration_date`
  - `derived_status` para UI

Contrato aprobado para `PATCH /v1/internal-asset-maintenance-records/:recordId`:

- permite editar al menos:
  - `asset_name`
  - `asset_identifier`
  - `asset_maintenance_type`
  - `last_maintenance_at`
  - `interval`
  - `expiration_date` opcional
  - `observations`
  - `status`
  - `alert_policy_id` opcional
  - `provider` opcional
  - `provider_follow_up` opcional
- backend recalcula o valida:
  - `expiration_date`
  - `derived_status` para UI

Contrato aprobado para `DELETE /v1/internal-asset-maintenance-records/:recordId`:

- aplica borrado lógico
- mueve el registro a `DELETED`

Catálogo persistido aprobado de `status` del recurso principal:

- `PENDING`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`
- `DELETED`

`OVERDUE` no forma parte del catálogo persistido.

### Status Transitions

Regla aprobada para `v1`:

- todas las transiciones entre:
  - `PENDING`
  - `IN_PROGRESS`
  - `COMPLETED`
  - `CANCELLED`
  serán manuales

Restricciones aprobadas:

- backend no cambiará automáticamente `status` por fecha, semáforo, vencimiento ni follow-up
- `DELETED` solo se alcanza por borrado lógico
- `COMPLETED` y `CANCELLED` excluyen semáforo y `OVERDUE`

Acción manual aprobada para follow-up a provider:

- `POST /v1/internal-asset-maintenance-records/:recordId/provider-follow-up/send`

Semántica aprobada:

- usa la configuración vigente de `provider_follow_up`
- no crea un nuevo registro
- no modifica `alert-policies`

## Provisional Provider Subflow

Cuando aplique el flujo externo hacia provider, ya se asume como mínimo conceptual:

- indicador de que el registro entró a flujo externo hacia provider
- fecha de envío al provider
- nombre capturado del provider
- tiempo estimado del trabajo o servicio externo
- notas opcionales del flujo externo

Todavía sigue pendiente cerrar el shape exacto y si se requerirán más timestamps o campos de seguimiento dentro de `v1`.

### Provider Follow-up Subblock

Dentro del registro principal existirá un subbloque opcional `provider_follow_up` con al menos:

- `enabled`
- `rules[]`
- `last_sent_at`

Cada regla tendrá al menos:

- `offset`
- `recipient_group_ids`
- `cc_recipient_group_ids` opcional

Reglas aprobadas:

- `provider_follow_up` no reutiliza `alert-policies`
- `offset` reutiliza exactamente el mismo shape estructurado de duración ya aprobado
- `recipient_group_ids` resuelve destinatarios y canales desde `recipient-groups`
- `cc_recipient_group_ids` permite copias internas u otras agrupaciones reutilizables sin duplicar contactos

## Provisional Derived Logic

### Fechas De Negocio

`last_maintenance_at` y `expiration_date` se tratarán como fechas de negocio `date-only`.

La referencia funcional del módulo será:

- `America/Mexico_City`

Eso implica:

- no se modela precisión horaria de negocio para esos campos
- cualquier lectura de `today` para alertas o vencimiento debe resolverse con esa zona horaria
- frontend deberá renderizar esas fechas con la misma referencia funcional

### Vencimiento

`expiration_date` representa la fecha de vencimiento vigente del registro.

El intervalo no será texto libre y no será concern exclusivo de UI.

Backend persistirá:

- el intervalo estructurado original
- la `expiration_date` persistida

Regla aprobada:

- si en `POST` o `PATCH` no llega `expiration_date`, backend la calculará a partir de:
  - `last_maintenance_at`
  - `interval`
- si `expiration_date` sí llega, backend la aceptará como fecha vigente de negocio

El frontend podrá precalcularla por UX, pero backend seguirá siendo la fuente de verdad del valor persistido.

### Alertamiento

El semáforo o nivel de alerta deberá derivarse con base en:

- fecha actual
- fecha de vencimiento
- política aplicable

Las reglas de una política no declararán canales propios.

Cuando una regla tenga `recipientGroupIds[]`, la notificación efectiva se resolverá usando:

- los canales habilitados del grupo
- los datos disponibles por canal en sus contactos

Una regla podrá existir sin grupos y seguir siendo válida como regla visual de severidad.

`offset` de cada regla reutilizará el mismo shape estructurado de duración ya aprobado para el intervalo principal:

- `years`
- `months`
- `weeks`
- `days`

La severidad de cada regla será configurable con:

- `severityLabel`
- `severityColorHex`

No habrá `severityPriority` configurable.

Cuando varias reglas pudieran competir, la severidad dominante se resolverá por cercanía al vencimiento usando el `offset`.

No se asumirá unicidad obligatoria de `offset` dentro de una política.

Antes de persistir la política, backend ordenará `rules[]` por `offset`.

Regla exacta aprobada de evaluación:

- solo se evalúa semáforo cuando `status` es:
  - `PENDING`
  - `IN_PROGRESS`
- si el registro ya cayó en `OVERDUE`, no se evalúa semáforo
- una regla aplica cuando:
  - `today >= expiration_date - offset`
- si varias reglas aplican, gana la más cercana al vencimiento
- si ninguna regla aplica, no existe severidad activa

### Overdue

`OVERDUE` no será persistido en `v1`.

Se calculará para UI cuando:

- `status` sea:
  - `PENDING`
  - `IN_PROGRESS`
- `expiration_date` sea menor que `today` en `America/Mexico_City`

`OVERDUE` domina visualmente sobre cualquier severidad de política.

## Pending Design Areas

- sin pendientes críticos de definición
