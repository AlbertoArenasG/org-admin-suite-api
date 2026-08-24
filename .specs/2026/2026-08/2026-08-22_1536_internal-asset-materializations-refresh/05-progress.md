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
  - `updateSystemManagedFields` persiste exclusivamente campos técnicos sin auditoría de backoffice.
  - el mapper de records expone conversiones reutilizables para materializaciones parciales.
- `npm run build` pasó correctamente después del Slice 2.
- Se implementó el Slice 3:
  - se separaron refreshers de estatus y notificaciones, además del orquestador técnico por lotes.
  - los flujos directos de create, update y delete de records reutilizan los refreshers y conservan su auditoría ordinaria.
  - editar una policy refresca únicamente su materialización en records operativos, sin modificar `updatedAt` ni `updatedBy`.
  - eliminar una policy limpia su asociación en todos los records afectados y solo rematerializa los operativos.
- `npm run build` pasó correctamente después del Slice 3.
- Se implementó el Slice 4:
  - se expuso `POST /v1/internal-jobs/internal-asset-maintenance-records/refresh-materializations` protegido solo con `InternalJobsAuthGuard`.
  - el job procesa hasta 100 records operativos, usa cursor Base64URL opaco y conserva el progreso en `next_cursor`.
  - el lease persistido coordina ejecuciones; un lock activo responde `409` y el cursor inválido responde `400`.
  - la respuesta específica expone métricas, duración y cursor en `snake_case`; el job registra inicio, finalización, lock y error con `Logger` de Nest.
- Se implementó parcialmente el Slice 5:
  - se agregó [docs/runbooks/internal-jobs.md](../../../../docs/runbooks/internal-jobs.md) con autenticación, invocación, continuación por cursor, recuperación, rotación de token y verificaciones operativas.
  - los errores de escritura técnica ahora preservan `recordId` y etapa para el log del job.
  - `npm run build` y `npm run lint` pasaron correctamente.

## 2026-08-24

- Se ejecutó la validación manual local del endpoint mediante la colección Postman actualizada.
- El job autenticó con `INTERNAL_JOBS_TOKEN`, procesó correctamente los 23 records operativos disponibles y devolvió `next_cursor: null`, confirmando que no había lotes pendientes.
- Se confirmó el contrato de respuesta con métricas separadas para ambas materializaciones y duración de ejecución.
- La validación reveló una regresión: el refresh modificó `updatedAt` en records procesados. Se reabrió la spec para corregir la ruta técnica y repetir la validación.
- Se corrigió la persistencia técnica para usar la operación nativa de Mongo, fuera del middleware de timestamps de Mongoose.
- La validación manual repetida confirmó que el job actualiza las materializaciones sin modificar `updatedAt` ni `updatedBy`.
- Se cerró formalmente la spec.
