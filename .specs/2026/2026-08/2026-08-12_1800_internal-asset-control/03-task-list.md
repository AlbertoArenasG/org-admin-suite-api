# Task List

## Phase 1. Analysis

- [x] Consolidar el entendimiento real del problema de negocio
      Status: completed

- [x] Redefinir el recurso principal como registro histórico y no como activo único
      Status: completed

- [x] Cerrar nomenclatura base de módulo y recurso principal
      Status: completed

## Phase 2. Definition And Design

- [x] Definir que `v1` capturará el activo directamente dentro del registro
      Status: completed

- [x] Definir que el registro tendrá `assetMaintenanceType` desde `v1`
      Status: completed

- [x] Definir separación entre `status` persistido, semáforo y `OVERDUE` derivado
      Status: completed

- [x] Definir que existirán dos políticas reutilizables desde `v1`
      Status: completed

- [x] Definir shape exacto del intervalo de vigencia
      Status: completed

- [x] Definir shape exacto del subflujo externo opcional
      Status: completed

- [x] Definir contrato conceptual de `expiration-status-policy`
      Status: completed

- [x] Definir contrato conceptual de `expiration-notification-policy`
      Status: completed

- [x] Definir contratos HTTP iniciales de backend
      Status: completed

## Phase 3. Implementation

- [x] Implementar base backend de `internal-asset-control`
      Status: completed

- [x] Implementar catálogo en código de `assetMaintenanceType`
      Status: completed

- [x] Implementar endpoint catálogo localizado de `internal-asset-maintenance-record`
      Status: completed

- [x] Implementar módulo `expiration-status-policy`
      Status: completed

- [x] Implementar módulo `expiration-notification-policy`
      Status: completed

- [x] Implementar endpoints catálogo localizados de policies de expiración
      Status: completed

- [x] Implementar `expiration_status_materialization`
      Status: completed

- [x] Implementar `expiration_notification_materialization`
      Status: completed

- [x] Integrar cálculo base de vencimiento y `OVERDUE` derivado en runtime
      Status: completed

- [ ] Integrar subflujo opcional completo de provider y `provider_follow_up`
      Status: pending

## Phase 4. Validation

- [x] Validar reglas mínimas del recurso principal
      Status: completed

- [x] Validar reglas mínimas de `expiration-status-policy`
      Status: completed

- [x] Validar reglas mínimas de `expiration-notification-policy`
      Status: completed

- [x] Actualizar docs y progreso conforme avance la iniciativa
      Status: completed
