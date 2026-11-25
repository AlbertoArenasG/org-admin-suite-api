# Slices backend

## Slice 1 — Consulta y contrato HTTP

- [x] Añadir DTO, puerto, consulta Mongo, mapper, caso de uso, handler, presenter y controller con guard READ y ruta antes de `:recordId`.
- [x] Registrar composición Nest/CQRS y verificar build/lint.
- [x] Actualizar en esta misma slice el handoff y la colección Postman con casos 200 vacío/lleno, 400, 401 y 403.
- Cierre: contrato y código cotejados, sin cambio de listado/detalle y sin datos de proveedor.

## Slice 2 — Revisión y entrega para validación

- [x] Auditar diff, permisos, paginación y todos los documentos de la spec.
- [x] Preparar matriz manual para el usuario y registrar evidencia estática.
- [x] Tras confirmación del usuario, marcar tareas y estados de validación, actualizar índice como completada.
