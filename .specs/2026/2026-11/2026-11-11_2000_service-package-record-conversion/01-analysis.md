# Análisis

- `ServicePackageRecord.id` es único por recolección; `packageId` agrupa varios registros de un ZIP y `serviceOrder` es referencia capturada manualmente.
- `details.equipment` no tiene ID estable, por lo que el contrato identifica cada equipo por posición. `visitDate` puede ser `null`.
- Fotos de recolección viven bajo `service-packages/` y no en `files`; los adjuntos de servicio al cliente usan `uploads/{fileId}/` y entidad `File`.
- Preparación de cliente y tipo, secuencia y materialización ya existen. Repositorios de origen y File requieren sesión de transacción en la nueva operación; S3 requiere copia y compensación.
- Clientes y usuarios relacionados ya tienen capabilities auxiliares; el catálogo de tipos aún está guardado por permiso local READ. Facturación necesita los mismos catálogos globales; portal de cliente conserva sus consultas acotadas.
