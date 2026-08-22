# Progress

## 2026-08-22

- Se creó la spec para actualizar manualmente las materializaciones de records de control de activos internos.
- Se cerró la fase de definición con decisiones sobre frontera técnica, autenticación, batches, cursor, lock, auditoría, respuesta y operación.
- Se auditó la implementación existente de materializaciones, policies, repositorios, guards, configuración, CQRS y persistencia Mongoose.
- Se identificó y corrigió en diseño una inconsistencia del comportamiento actual:
  - editar una policy hoy actualiza auditoría de records afectados
  - eliminar una policy hoy actualiza auditoría de records afectados
  - ambos efectos son cascadas técnicas y quedarán fuera de `updatedBy` y `updatedAt`
- Se aprobó el contrato técnico ampliado `updateSystemManagedFields` para materializaciones y limpieza de asociaciones a policies sin auditoría de backoffice.
- No se ha modificado código de aplicación para esta spec.

