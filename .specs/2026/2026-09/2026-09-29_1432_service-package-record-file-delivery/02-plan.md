# Plan

## Phase 1. Contract And Delivery Query

Crear el DTO HTTP de `disposition`, el DTO de aplicacion, query/handler CQRS y
caso de uso de lectura. El caso de uso resuelve exclusivamente el registro y
archivo solicitado, valida que el registro siga activo y obtiene el stream
mediante el puerto existente de almacenamiento.

## Phase 2. HTTP Composition And Read Projection

Exponer el subrecurso protegido desde `ServicePackageController`, aplicar los
headers de stream existentes y transformar `files[]` en el presenter al
descriptor publico de documentos. No se modifica el DTO interno, la entidad,
el schema, el mapper de persistencia ni la ingesta ZIP.

## Phase 3. Consumer Handoff And Verification

Actualizar Postman, el catalogo de permisos y el handoff de frontend. Ejecutar
validacion estatica aplicable y dejar la validacion manual de descarga,
previsualizacion, pertenencia y autorizacion como evidencia de cierre.
