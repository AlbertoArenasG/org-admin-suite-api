# Progress

## 2026-08-12

- Se creó la spec `internal-asset-control`.
- Se consolidó el cambio más importante de entendimiento del dominio:
  - el recurso principal no será un activo interno único
  - cada fila será un registro histórico
  - el mismo activo podrá aparecer en múltiples registros
- Se aprobó el naming base de la iniciativa:
  - módulo:
    - `control de activos internos`
    - `internal-asset-control`
  - recurso principal:
    - `registro de mantenimiento de activo interno`
    - `internal-asset-maintenance-record`
- Se aprobó que `v1` capturará el activo directamente dentro de cada registro, sin catálogo maestro de activos por ahora.
- Se aprobó que el registro tendrá `interventionType` desde `v1`, tomado de catálogo en código.
- Se aprobó la separación entre:
  - `status` persistido
  - semáforo o alertamiento preventivo
  - `OVERDUE` derivado para UI
- Se aprobó que:
  - `PENDING`
  - `IN_PROGRESS`
  - `COMPLETED`
  - `CANCELLED`
  serán estados persistidos iniciales.
- Se aprobó que `OVERDUE` no se persistirá automáticamente en `v1`.
- Se aprobó que las políticas de alerta existirán como capability administrable desde `v1`.
- La iniciativa todavía no está lista para implementación; faltan definiciones críticas de:
  - intervalo de vigencia
  - subflujo de laboratorio
  - contrato y shape del módulo de políticas
  - contratos HTTP iniciales

