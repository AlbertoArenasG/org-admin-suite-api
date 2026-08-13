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
- Se registró explícitamente que la fecha principal del registro representa la acción concreta realizada o documentada sobre el activo.
- Se registró explícitamente que `observaciones` pertenece al registro concreto y no al activo general.
- Se aprobó que el registro tendrá `interventionType` desde `v1`, tomado de catálogo en código.
- Se aprobó que el intervalo de vigencia se persistirá como estructura compuesta por unidades:
  - `years`
  - `months`
  - `weeks`
  - `days`
- Se aprobó que backend persistirá tanto el intervalo estructurado como la `expirationDate` derivada.
- Se aprobó que el subflujo externo opcional usará semántica de `provider` y no de `laboratory`.
- Se aprobó que ese subflujo seguirá embebido dentro del registro en `v1`, con al menos:
  - `sentToProvider`
  - `providerName`
  - `sentToProviderAt`
  - `providerLeadTime`
  - `providerNotes`
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
- Se registró que el subflujo externo opcional, cuando aplique, requerirá al menos fecha de envío como dato de negocio relevante.
- La iniciativa todavía no está lista para implementación; faltan definiciones críticas de:
  - contrato y shape del módulo de políticas
  - contratos HTTP iniciales
