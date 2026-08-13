# Task List

## Phase 1. Analysis

- [x] Consolidar el entendimiento del problema real del módulo
      Status: completed

- [x] Redefinir el recurso principal como registro histórico y no como activo único
      Status: completed

- [x] Cerrar nomenclatura base de módulo y recurso principal
      Status: completed

## Phase 2. Definition And Design

- [x] Definir que `v1` capturará el activo directamente dentro del registro
      Status: completed

- [x] Definir que el registro tendrá `interventionType` desde `v1`
      Status: completed

- [x] Definir separación entre `status` persistido, semáforo y `OVERDUE` derivado
      Status: completed

- [x] Definir que existirán políticas de alerta administrables desde `v1`
      Status: completed

- [x] Definir shape exacto del intervalo de vigencia
      Status: completed

- [x] Definir shape exacto del subflujo externo opcional
      Status: completed

- [ ] Definir contrato conceptual del módulo de políticas de alerta
      Status: pending

- [ ] Definir contratos HTTP iniciales de backend
      Status: pending

## Phase 3. Implementation

- [ ] Implementar módulo `internal-asset-control`
      Status: pending

- [ ] Implementar catálogo en código de `interventionType`
      Status: pending

- [ ] Implementar módulo de políticas de alerta
      Status: pending

- [ ] Integrar cálculo de vencimiento, alertamiento y `OVERDUE` derivado
      Status: pending

## Phase 4. Validation

- [ ] Validar reglas mínimas del recurso principal
      Status: pending

- [ ] Validar reglas mínimas de políticas de alerta
      Status: pending

- [ ] Actualizar docs y progreso conforme avance la iniciativa
      Status: pending
