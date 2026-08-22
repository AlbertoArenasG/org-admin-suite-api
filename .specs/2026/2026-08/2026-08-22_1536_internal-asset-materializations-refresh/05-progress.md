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
- Se implementó el Slice 1:
  - `INTERNAL_JOBS_TOKEN` quedó incorporado al environment validado y al ejemplo de configuración.
  - `InternalJobsAuthGuard` quedó disponible para la nueva frontera técnica.
  - `InternalJobException` y su mapeo `409` con `locked_until` quedaron incorporados.
  - el puerto y la persistencia Mongo de locks reutilizables quedaron registrados globalmente.
- Se cerró formalmente el diseño técnico y comenzó la implementación.
- `npm run build` pasó correctamente después del Slice 1.
- Se implementó el Slice 2:
  - `findOperational` consulta únicamente records operativos por cursor estable.
  - el schema de records incorpora el índice compuesto de status y cursor.
  - `updateSystemManagedFields` persiste exclusivamente campos técnicos con `timestamps: false`.
  - el mapper de records expone conversiones reutilizables para materializaciones parciales.
- `npm run build` pasó correctamente después del Slice 2.
