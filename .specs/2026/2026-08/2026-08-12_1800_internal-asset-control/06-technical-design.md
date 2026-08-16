# Technical Design

## Current State

La definición funcional ya quedó cerrada. Este documento sirve como referencia ejecutable para implementación backend y endurece únicamente lo ya aprobado en `00-definition.md` y `04-decisions.md`.

## Approved Base

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
- existirán dos capabilities administrables reutilizables:
  - `expiration-status-policy`
  - `expiration-notification-policy`
- existirá subbloque `provider_follow_up` separado de esas políticas

## Shared Value Objects

### Structured Duration

Shape compartido para:

- `interval`
- `expiration-status-policy.rules[].start_offset`
- `expiration-notification-policy.rules[].start_offset`
- `expiration-notification-policy.rules[].repeat_every`
- `expiration-notification-policy.rules[].repeat_for`
- `provider.providerLeadTime`
- `provider_follow_up.rules[].offset`

Campos:

- `years`
- `months`
- `weeks`
- `days`

Reglas:

- todas las unidades son enteros `>= 0`
- al menos una unidad debe ser mayor que `0`

## Expiration Status Policy

### Base Shape

- `name`
- `code` autogenerado desde `name`
- `description` opcional
- `status`
- `rules[]`

Estados:

- `ACTIVE`
- `INACTIVE`
- `DELETED`

### Rule Shape

- `start_offset`
- `label`
- `color_hex`

Reglas:

- `rules[]` se ordenará por cercanía al vencimiento antes de persistirse
- no habrá prioridad manual configurable
- si varias reglas aplican, gana la más cercana al vencimiento
- no se forzará unicidad de umbral

### HTTP Contracts

- `GET /v1/expiration-status-policies`
- `GET /v1/expiration-status-policies/options`
- `GET /v1/expiration-status-policies/:policyId`
- `POST /v1/expiration-status-policies`
- `PATCH /v1/expiration-status-policies/:policyId`
- `DELETE /v1/expiration-status-policies/:policyId`

### Paged List Shape

- `id`
- `name`
- `code`
- `status`
- `rules_count`
- `created_at`
- `updated_at`

Soporta:

- paginación estándar
- búsqueda por `name` o `code`
- filtro por `status`

### Options Shape

- `id`
- `name`
- `code`
- `status`

Comportamiento:

- por defecto devuelve solo políticas `ACTIVE`

### Detail Shape

- `id`
- `name`
- `code`
- `description`
- `status`
- `rules[]`
- `created_at`
- `updated_at`

Cada regla:

- `start_offset`
- `label`
- `color_hex`

### Write Contracts

`POST` y `PATCH` aceptan:

- `name`
- `description`
- `status`
- `rules[]`

Restricciones:

- `code` no es editable manualmente
- `DELETE` aplica borrado lógico a `DELETED`

## Expiration Notification Policy

### Base Shape

- `name`
- `code` autogenerado desde `name`
- `description` opcional
- `status`
- `rules[]`

Estados:

- `ACTIVE`
- `INACTIVE`
- `DELETED`

### Rule Shape

- `anchor`
- `start_offset`
- `trigger_mode`
- `recipient_group_ids[]`
- `repeat_every` opcional
- `repeat_until` opcional
- `repeat_for` opcional

Enums:

- `anchor`
  - `BEFORE_EXPIRATION`
  - `AFTER_EXPIRATION`
- `trigger_mode`
  - `ONE_TIME`
  - `RECURRING`
- `repeat_until`
  - `EXPIRATION_DATE`
  - `STATUS_CHANGES`
  - `FIXED_DURATION`

Reglas:

- `recipient_group_ids[]` no es obligatorio
- cuando `trigger_mode = ONE_TIME`, no deben enviarse campos de recurrencia
- cuando `trigger_mode = RECURRING`, `repeat_every` es obligatorio
- cuando `repeat_until = FIXED_DURATION`, `repeat_for` es obligatorio
- no se forzará unicidad de umbral

### HTTP Contracts

- `GET /v1/expiration-notification-policies`
- `GET /v1/expiration-notification-policies/options`
- `GET /v1/expiration-notification-policies/:policyId`
- `POST /v1/expiration-notification-policies`
- `PATCH /v1/expiration-notification-policies/:policyId`
- `DELETE /v1/expiration-notification-policies/:policyId`

### Paged List Shape

- `id`
- `name`
- `code`
- `status`
- `rules_count`
- `created_at`
- `updated_at`

Soporta:

- paginación estándar
- búsqueda por `name` o `code`
- filtro por `status`

### Options Shape

- `id`
- `name`
- `code`
- `status`

Comportamiento:

- por defecto devuelve solo políticas `ACTIVE`

### Detail Shape

- `id`
- `name`
- `code`
- `description`
- `status`
- `rules[]`
- `created_at`
- `updated_at`

Cada regla:

- `anchor`
- `start_offset`
- `trigger_mode`
- `repeat_every`
- `repeat_until`
- `repeat_for`
- `recipient_groups`

`recipient_groups` se expandirá de forma ligera.

### Write Contracts

`POST` y `PATCH` aceptan:

- `name`
- `description`
- `status`
- `rules[]`

Cada regla podrá incluir:

- `anchor`
- `start_offset`
- `trigger_mode`
- `recipient_group_ids[]`
- `repeat_every`
- `repeat_until`
- `repeat_for`

Restricciones:

- `code` no es editable manualmente
- `DELETE` aplica borrado lógico a `DELETED`

## Internal Asset Maintenance Record

### Base Shape

- `asset_name`
- `asset_identifier`
- `asset_maintenance_type`
- `last_maintenance_at`
- `interval`
- `expiration_date`
- `observations`
- `status`
- `expiration_status_policy_id` opcional
- `expiration_notification_policy_id` opcional
- `provider` opcional
- `provider_follow_up` opcional

### Provider Block

- `sentToProvider`
- `providerName`
- `sentToProviderAt`
- `providerLeadTime`
- `providerNotes`

### Provider Follow Up Block

- `enabled`
- `rules[]`
- `last_sent_at`

Cada regla:

- `offset`
- `recipient_group_ids`
- `cc_recipient_group_ids` opcional

Reglas:

- sigue usando offset simple en `v1`
- no reutiliza `expiration-notification-policy`
- resuelve canales implícitamente desde `recipient-groups`

### Paged List Shape

- `id`
- `asset_name`
- `asset_identifier`
- `asset_maintenance_type`
- `last_maintenance_at`
- `expiration_date`
- `status`
- `derived_status`
- `expiration_status_policy`
- `expiration_notification_policy`
- `sent_to_provider`
- `provider_name`
- `provider_lead_time`
- `provider_follow_up_enabled`
- `provider_follow_up_rules_count`
- `provider_follow_up_last_sent_at`
- `created_at`
- `updated_at`

Soporta:

- paginación estándar
- búsqueda por `asset_name` o `asset_identifier`
- filtro por `asset_maintenance_type`
- filtro por `status`
- filtro por `expiration_status_policy_id`
- filtro por `expiration_notification_policy_id`
- filtro por `sent_to_provider`

### Detail Shape

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
- `expiration_status_policy`
- `expiration_notification_policy`
- `provider`
- `provider_follow_up`
- `created_at`
- `updated_at`
- `created_by`
- `updated_by`

Notas:

- `expiration_status_policy` se expandirá de forma ligera y opcional
- `expiration_notification_policy` se expandirá de forma ligera y opcional
- `provider_follow_up` incluirá `recipient_groups` expandidos de forma ligera
- `created_by` y `updated_by` se enriquecerán para presentación

### POST Contract

`POST /v1/internal-asset-maintenance-records`

Recibe al menos:

- `asset_name`
- `asset_identifier`
- `asset_maintenance_type`
- `last_maintenance_at`
- `interval`
- `expiration_date` opcional
- `observations`
- `status`
- `expiration_status_policy_id` opcional
- `expiration_notification_policy_id` opcional
- `provider` opcional
- `provider_follow_up` opcional

Backend:

- calcula `expiration_date` si no llega
- valida `expiration_date` si sí llega
- deriva `derived_status` para UI

### PATCH Contract

`PATCH /v1/internal-asset-maintenance-records/:recordId`

Permite editar al menos:

- `asset_name`
- `asset_identifier`
- `asset_maintenance_type`
- `last_maintenance_at`
- `interval`
- `expiration_date` opcional
- `observations`
- `status`
- `expiration_status_policy_id` opcional
- `expiration_notification_policy_id` opcional
- `provider` opcional
- `provider_follow_up` opcional

Backend:

- recalcula o valida `expiration_date`
- deriva `derived_status` para UI

### DELETE Contract

`DELETE /v1/internal-asset-maintenance-records/:recordId`

Comportamiento:

- aplica borrado lógico
- mueve el registro a `DELETED`

### Manual Action Contract

`POST /v1/internal-asset-maintenance-records/:recordId/provider-follow-up/send`

Comportamiento:

- usa la configuración vigente del subbloque `provider_follow_up`
- no modifica políticas de expiración
- no crea un nuevo registro

## Status And Expiration Evaluation

### Persisted Status Catalog

- `PENDING`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`
- `DELETED`

### Derived Status

`OVERDUE` no forma parte del catálogo persistido.

Aplica cuando:

- `status` es `PENDING` o `IN_PROGRESS`
- `expiration_date` es menor que `today`
- `today` se calcula en `America/Mexico_City`

### Semaphore Evaluation

Se evalúa solo cuando:

- `status` es `PENDING` o `IN_PROGRESS`
- el registro no cayó en `OVERDUE`

Regla:

- una regla de `expiration-status-policy` aplica cuando:
  - `today >= expiration_date - start_offset`
- si varias reglas aplican, gana la más cercana al vencimiento
- si ninguna regla aplica, no hay semáforo activo

Dominancia:

- `OVERDUE` está por encima de cualquier regla de `expiration-status-policy`
- `COMPLETED` y `CANCELLED` no muestran semáforo ni `OVERDUE`

### Derived Materialization Fields

Las policies de expiración persisten reglas relativas, no fechas absolutas.

Las fechas absolutas se materializan por `record + rule` y se persisten para lectura y ejecución eficiente.

Para status por vencimiento, backend podrá exponer y persistir un bloque derivado como:

- `expiration_status_materialization`
  - `source`
  - `code`
  - `effective_start_date`
  - `label`
  - `label_key`
  - `color_hex`
  - `matched_rule`
  - `last_materialized_at`

Para notificaciones por vencimiento, backend podrá exponer y persistir un bloque derivado como:

- `expiration_notification_materialization`
  - `source`
  - `next_trigger_date`
  - `last_triggered_at`
  - `materialized_rules_count`
  - `materialized_rules`
  - `last_materialized_at`

Reglas:

- `effective_start_date` no vive en `expiration-status-policy`
- `next_trigger_date` no vive en `expiration-notification-policy`
- ambos nacen de evaluar `start_offset` contra la `expiration_date` del registro concreto
- `last_materialized_at` registra cuándo backend persistió por última vez la materialización derivada

Shape mínimo recomendado para `materialized_rules[]` dentro de `expiration_notification_materialization`:

- `source_rule_id`
- `anchor`
- `start_offset`
- `trigger_mode`
- `repeat_every`
- `repeat_until`
- `repeat_for`
- `trigger_events`
- `last_triggered_at`

Shape mínimo recomendado para `trigger_events[]`:

- `trigger_date`
- `status`
- `triggered_at`
- `failure_reason`

Reglas de `v1`:

- `trigger_events[]` deberá persistirse ordenado ascendentemente por `trigger_date`
- si `status = FAILED`, el evento conservará su estado
- si el record pasa a `COMPLETED`, `CANCELLED` o `DELETED`, los eventos en `PENDING` pasarán a `INVALIDATED`
- si el record vuelve a `PENDING` o `IN_PROGRESS`, backend deberá recalcular la materialización y regenerar eventos aplicables
- `v1` no implementará reintentos automáticos
- `failure_reason` servirá para diagnóstico del fallo original
- el mecanismo diario procesará eventos con:
  - `status = PENDING`
  - `trigger_date <= today`
  usando `today` en `America/Mexico_City`
- en una misma corrida se procesarán también eventos atrasados no despachados
- si el record cambia a `COMPLETED`, `CANCELLED` o `DELETED`, los `trigger_events` en `PENDING` deberán pasar a `INVALIDATED` y dejar de ser elegibles para procesamiento

Notas:

- `expiration_notification_materialization` se persiste dentro del record
- `source_rule_id` será la referencia estable hacia la regla fuente dentro de la policy reusable
- `trigger_events[]` representa la materialización absoluta por regla en el contexto del registro junto con su estado operativo
- `next_trigger_date` es un resumen útil derivado de `trigger_events[]`
- `last_triggered_at` representa el último disparo efectivo procesado para ese record
- `materialized_rules[].last_triggered_at` representa el último disparo efectivo procesado para esa regla materializada
- el mecanismo diario debe apoyarse en la materialización persistida y no recalcular la policy completa por fila
- para reglas recurrentes, el sistema impondrá un límite explícito de repeticiones al materializar `trigger_events[]`
- el límite aprobado en `v1` será de `10` repeticiones materializadas por regla recurrente

### Recalculation Triggers

Backend deberá recalcular materializaciones cuando cambie cualquiera de sus inputs efectivos.

Casos mínimos:

- al crear un record:
  - recalcular `expiration_status_materialization`
  - recalcular `expiration_notification_materialization`
- al editar un record y cambiar cualquiera de:
  - `last_maintenance_at`
  - `interval`
  - `expiration_date`
  - `status`
  - `expiration_status_policy_id`
  - `expiration_notification_policy_id`
- eso incluye:
  - asignar una nueva `expiration-status-policy`
  - desasignar la `expiration-status-policy` vigente
  - asignar una nueva `expiration-notification-policy`
  - desasignar la `expiration-notification-policy` vigente
- al editar una `expiration-status-policy` usada por records:
  - recalcular `expiration_status_materialization` de records afectados
- al editar una `expiration-notification-policy` usada por records:
  - recalcular `expiration_notification_materialization` de records afectados
- al inactivar o borrar lógicamente cualquiera de esas policies:
  - recalcular records afectados

Notas:

- cambios en `provider` o `provider_follow_up` no recalculan materializaciones de expiración
- en `v1`, el contrato funcional exige consistencia del recálculo aunque la estrategia técnica pueda ser inmediata o diferida según volumen

Shape mínimo recomendado para `matched_rule` dentro de `expiration_status_materialization`:

- `source_rule_id`
- `start_offset`

Notas:

- `matched_rule` es una proyección ligera
- no replica el shape completo de la policy reusable
- `source_rule_id` apunta al `rule_id` técnico de la regla fuente en `expiration-status-policy`
- `source` podrá ser:
  - `SYSTEM`
  - `POLICY`
- `code` será el identificador neutral del estado visual efectivo
- `label_key` será la key i18n backend del estado visual efectivo
- cuando `source = SYSTEM`, `matched_rule` será `null`

Estados visuales derivados del sistema:

- `En tiempo`
  - aplica cuando:
    - `status` es `PENDING` o `IN_PROGRESS`
    - no existe `OVERDUE`
    - no aplica ninguna regla de `expiration-status-policy`
  - `code`:
    - `ON_TIME`
  - `color_hex`:
    - `#22C55E`
- `OVERDUE`
  - aplica cuando:
    - `status` es `PENDING` o `IN_PROGRESS`
    - `expiration_date < today`
  - `code`:
    - `OVERDUE`
  - `color_hex`:
    - `#EF4444`
- `Completado`
  - aplica cuando:
    - `status = COMPLETED`
  - `code`:
    - `COMPLETED`
  - `color_hex`:
    - `#2563EB`
- `Cancelado`
  - aplica cuando:
    - `status = CANCELLED`
  - `code`:
    - `CANCELLED`
  - `color_hex`:
    - `#6B7280`

Notas:

- estos estados del sistema deberán exponer:
  - `code`
  - `label`
  - `label_key`
- `label` y `label_key` deben venir localizados desde backend al menos para español e inglés
