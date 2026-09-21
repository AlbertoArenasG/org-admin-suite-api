# Analysis

## Current State

Customer Service Records ya persiste un aggregate amplio con `assets`,
`customer_delivery`, `provider`, materializaciones y auditoria. Su escritura
actual se concentra en `PATCH /v1/customer-service-records/:recordId`,
`UpdateCustomerServiceRecordUseCase` y su command handler.

El modulo generico `files` almacena metadata, objeto S3 y auditoria de carga.
`POST /v1/files` requiere identidad para `uploaded_by`; la variante publica no
la tiene. Las descargas son genericas y sin guardia. El parametro
`service_entry_id` solo debe intervenir en las rutas publicas de Service Entry,
nunca en Customer Service Records.

## Constraints

- Los datos existentes son productivos y no se reestructura ningun campo ya
  persistido.
- La lectura de adjuntos no debe hacer `$lookup` a `files`.
- La API es agnostica a clientes. Los bloques HTTP representan subrecursos
  cohesionados, no tabs o pantallas de una aplicacion concreta.
- No se crearan permisos, capabilities ni codigos de error nuevos.
- La validacion funcional es manual por la persona usuaria y se registra en la
  spec; no se agregan pruebas unitarias.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Perder una desasociacion accidental | `removed_files` conserva snapshot y auditoria permanentemente. |
| Multiplicar consultas a `files` | El reconciliador obtiene en lote solo IDs nuevos. |
| Leer adjuntos internos desde Client Access | El mapper/presenter de Client Access proyecta solo adjuntos visibles activos. |
| Alterar auditoria durante backfill | Migracion con `bulkWrite` y `$set` dirigido; dry-run e integridad posterior. |
| Dejar un PATCH obsoleto | Se retiran ruta, DTO, command, handler y use case cuando los PUT equivalentes existan. |
