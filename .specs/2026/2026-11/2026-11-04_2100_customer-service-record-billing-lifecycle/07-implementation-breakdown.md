# Slices de implementación

El diseño es una propuesta revisable. Ninguna slice inicia sin autorización expresa del usuario después de aprobar `Implementation ready: yes`.

## Slice 1 — Modelo, persistencia y migración

Entregar entidad especializada de factura, bloque billing, enums localizados, schema/mapper/repositorio y script histórico idempotente. Mantener lectura de documentos anteriores con defaults. Ajustar las dos escrituras actuales de factura para preservar complementos y actualizar el conteo de adjuntos. Agregar scripts npm de dry-run/apply/verificación; **solo el usuario ejecuta los tres**. Cierre: build/lint enfocado y revisión del diff, sin asumir que la migración real ocurrió.

## Slice 2 — Instrucciones y transición administrativa

Extender `PATCH billing-status` con instrucciones opcionales y añadir edición posterior protegida por `customer_service_records:UPDATE`. Incluir instrucciones en el aviso de la transición real a `SUBMITTED`, sin correo al editar ni al no-op. Si falla el correo, conservar estado e instrucciones; si no hay destinatarios, conservar la semántica resiliente existente. Cierre: contrato/vistas de respuesta y fallos revisados; actualizar handoff y Postman **en esta slice**.

## Slice 3 — Edición de factura y datos de pago

Añadir PATCH parcial de fechas/plazo, PATCH de invoiceStatus, opciones localizadas, PUT de orden de compra y POST/PUT de complementos. Conservar rutas de edición de factura ya existentes y sus complementos. No habilitar edición técnica ni comentarios fuera del módulo billing. Cierre: build/lint, matriz manual de fechas, estados, adjuntos, permisos y concurrencia; handoff/Postman actualizados para cada ruta antes del cierre.

## Slice 4 — Archivo e historial

Añadir snapshot en colección separada y archivado transaccional en cualquier estado; limpiar solo factura vigente y sus fechas/estatus. Añadir lista paginada y detalle de snapshot, con archivos descargables y lectura `READ`. Cierre: comprobar en validación manual que reintentos/concurrencia no duplican snapshots y que instrucciones/comentarios permanecen. Actualizar handoff/Postman durante la slice.

## Slice 5 — Comentarios de facturación

Crear colección/puerto/repositorio y rutas POST/GET paginado; auditoría completa desde creación, contenido inmutable y visibilidad interna/externa. La respuesta del portal de clientes y el módulo administrativo no incluyen comentarios. Cierre: permisos, paginación, ausencia de edición/portal y handoff/Postman validados.

## Slice 6 — Job de vencimientos y documentación final

Implementar consulta por lotes, cursor estable, lock y actualización condicional; `InternalJobsAuthGuard` y fecha de Ciudad de México. No añadir scheduler ni correo. Cierre: idempotencia, borde del día y exclusiones confirmados manualmente; actualizar Postman, `docs/runbooks/internal-jobs.md` y `docs/authorization/feature-permission-catalog.md`; verificar coherencia de toda la spec y documentación viva. La validación real la confirma el usuario antes del cierre formal.

## Comandos reservados al usuario

En la Slice 1, después del build y de revisar el destino de `MONGO_URI`, el usuario ejecutará en este repositorio los scripts que se añadan a `package.json`: `npm run db:migrate:customer-service-record-invoice-lifecycle:dry-run`; tras revisar conteos, `npm run db:migrate:customer-service-record-invoice-lifecycle:apply`; finalmente repetir dry-run para verificar cero pendientes. `apply` modifica datos; no ejecutarlo si el reporte no coincide con lo esperado. Compartir conteos y resultado de auditoría para registrarlos en `05-progress.md`. No hace falta seed de roles porque se reutilizan permisos existentes.
