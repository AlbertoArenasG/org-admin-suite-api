# Analysis

## Current State

`ServicePackageRecord` persiste sus archivos como snapshots embebidos con
`file_id`, `relative_path`, `original_name`, `s3_key`, `size` y
`content_type`. `IngestServicePackageUseCase` los sube directamente mediante
`IFileStorageService`; no crea entidades dentro del agregado generico `files`.

El presenter actual convierte cada `s3_key` a una URL directa de S3. El detalle
administrativo consume esa URL como una misma referencia para descarga y
previsualizacion. Esto no coincide con el patron de documentos del producto:
no hay URL de descarga/previsualizacion diferenciada ni control de disposition.

## Existing Reusable Pieces

- `IFileStorageService` ya entrega el objeto almacenado por key.
- `DownloadFileRequestDto` ya normaliza `attachment|inline` para el modulo
  generico; su semantica puede reutilizarse sin reutilizar su query de dominio.
- `ApiResponseBuilder`, CQRS, guards y `ServicePackagePresenter` conservan el
  pipeline canónico.

## Constraints

- La ruta pertenece al modulo `service-packages`, pues debe verificar la
  relacion `recordId -> fileId` antes de usar el storage key embebido.
- No se consulta la coleccion generica `files` ni se crea una duplicacion de
  metadata.
- El storage key nunca llega al cliente en el descriptor final.
- La lectura de archivos debe conservar el nombre UTF-8 y el MIME original.
- No se agregan pruebas unitarias por politica vigente; la validacion sera
  manual, compilacion y revision estatica.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Leer una clave S3 ajena mediante `fileId` | Resolver siempre el archivo dentro del registro activo solicitado. |
| Exponer infraestructura | El presenter reemplaza `s3_key` por URLs de API relativas. |
| Duplicar el modulo generico `files` | Reutilizar solo la semantica de disposition y el servicio de storage; el ownership sigue en service packages. |
| Romper consumidores actuales | Frontend y backend se despliegan en paralelo; Postman y handoff documentan el contrato final. |
