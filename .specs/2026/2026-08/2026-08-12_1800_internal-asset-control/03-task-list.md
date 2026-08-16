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

- [ ] Implementar módulo `internal-asset-control`
      Status: pending

- [ ] Implementar catálogo en código de `assetMaintenanceType`
      Status: pending

- [ ] Implementar módulo `expiration-status-policy`
      Status: pending

- [ ] Implementar módulo `expiration-notification-policy`
      Status: pending

- [ ] Implementar `expiration_status_materialization`
      Status: pending

- [ ] Implementar `expiration_notification_materialization`
      Status: pending

- [ ] Integrar cálculo de vencimiento, semáforo y `OVERDUE` derivado
      Status: pending

- [ ] Integrar subflujo opcional de provider y `provider_follow_up`
      Status: pending

## Phase 4. Validation

- [ ] Validar reglas mínimas del recurso principal
      Status: pending

- [ ] Validar reglas mínimas de `expiration-status-policy`
      Status: pending

- [ ] Validar reglas mínimas de `expiration-notification-policy`
      Status: pending

- [ ] Actualizar docs y progreso conforme avance la iniciativa
      Status: pending
