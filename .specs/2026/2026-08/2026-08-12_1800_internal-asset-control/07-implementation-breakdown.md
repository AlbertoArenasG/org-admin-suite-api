# Implementation Breakdown

## Slice 1. Domain Framing Closure

- Estado: completed
- Objetivo:
  - cerrar el naming base del módulo y del recurso principal
  - cerrar que el recurso es histórico y no catálogo maestro de activos
- Cambios realizados:
  - se aprobó `internal-asset-control` como módulo
  - se aprobó `internal-asset-maintenance-record` como recurso principal
  - se aprobó captura directa del activo en `v1`

## Slice 2. Record Typing And Status Rules

- Estado: completed
- Objetivo:
  - definir tipificación base del registro y separar status persistidos de estados derivados
- Cambios realizados:
  - se aprobó `assetMaintenanceType` desde `v1`
  - se aprobó catálogo inicial en código
  - se aprobó separación entre semáforo y `status`
  - se aprobó `OVERDUE` como derivado para UI
  - se aprobó que todas las transiciones entre `PENDING`, `IN_PROGRESS`, `COMPLETED` y `CANCELLED` sean manuales
  - se aprobó que `DELETED` solo se alcance por borrado lógico
  - se aprobó la regla exacta de derivación de semáforo y `OVERDUE`

## Slice 3. Expiration Policies Split

- Estado: completed
- Objetivo:
  - separar formalmente el diseño de alertamiento en dos capabilities reutilizables
- Cambios realizados:
  - se descartó el enfoque genérico previo de una sola política de alertamiento
  - se aprobó `expiration-status-policy`
  - se aprobó `expiration-notification-policy`
  - se aprobó que el recurso principal referencie ambas de forma independiente

## Slice 4. Interval And Date Semantics

- Estado: completed
- Objetivo:
  - cerrar el shape exacto del intervalo y la semántica de fechas de negocio
- Cambios realizados:
  - se aprobó persistir el intervalo como estructura compuesta
  - se aprobaron las unidades:
    - `years`
    - `months`
    - `weeks`
    - `days`
  - se aprobó persistir también la `expiration_date` vigente
  - se aprobó `America/Mexico_City` como referencia funcional
  - se aprobó que `expiration_date` sea autocalculada por defecto pero editable

## Slice 5. Provider Subflow Closure

- Estado: completed
- Objetivo:
  - cerrar el shape exacto del subflujo externo opcional
- Cambios realizados:
  - se reemplazó semántica de `laboratory` por `provider`
  - se aprobó mantener el flujo embebido dentro del registro
  - se aprobó el bloque mínimo:
    - `sentToProvider`
    - `providerName`
    - `sentToProviderAt`
    - `providerLeadTime`
    - `providerNotes`
  - se aprobó el subbloque `provider_follow_up`

## Slice 6. HTTP Contracts Closure

- Estado: completed
- Objetivo:
  - aterrizar contratos HTTP y shapes de lectura/escritura
- Cambios realizados:
  - se aprobó CRUD completo para `expiration-status-policy`
  - se aprobó CRUD completo para `expiration-notification-policy`
  - se aprobó doble lectura para ambas:
    - paginada administrativa
    - no paginada de selección
  - se aprobó el shape del listado paginado del recurso principal
  - se aprobó el shape del detalle del recurso principal
  - se aprobó el contrato de `POST / PATCH / DELETE` del recurso principal
  - se aprobó la acción manual `POST /v1/internal-asset-maintenance-records/:recordId/provider-follow-up/send`

## Slice 7. Materializations Closure

- Estado: completed
- Objetivo:
  - cerrar el modelo técnico persistido para evitar recálculo costoso por fila y soportar el mecanismo diario de notificaciones
- Cambios realizados:
  - se aprobó `expiration_status_materialization`
  - se aprobó `expiration_notification_materialization`
  - se aprobó `effective_start_date` por record
  - se aprobó `next_trigger_date` como resumen útil
  - se aprobó `trigger_events[]` por regla materializada
  - se aprobó `source_rule_id` para trazabilidad
  - se aprobó `last_triggered_at` global y por regla
  - se aprobó `last_materialized_at`
  - se aprobó límite de `10` repeticiones materializadas por regla recurrente
  - se aprobó ausencia de reintentos automáticos en `v1`

## Slice 8. Backend Implementation

- Estado: in_progress
- Objetivo:
  - implementar módulos, catálogos, derivaciones y wiring backend
- Subtareas:
  - implementar `internal-asset-control`
  - implementar catálogo `assetMaintenanceType`
  - implementar `GET /v1/internal-asset-maintenance-records/catalog`
  - implementar `expiration-status-policy`
    - completado el 16 de agosto de 2026
    - incluye CRUD, `catalog`, `options`, autorización e i18n base
  - implementar `expiration-notification-policy`
    - completado el 16 de agosto de 2026
    - incluye CRUD, `catalog`, `options`, validación de recurrencia y expansión ligera de `recipient_groups`
  - implementar:
    - `GET /v1/expiration-status-policies/catalog`
    - `GET /v1/expiration-notification-policies/catalog`
  - implementar `expiration_status_materialization`
  - implementar `expiration_notification_materialization`
  - integrar derivación de semáforo y `OVERDUE`
  - integrar `provider_follow_up`

## Slice 9. Validation And Handoff

- Estado: pending
- Objetivo:
  - validar reglas mínimas, actualizar docs y dejar lista la base para frontend
