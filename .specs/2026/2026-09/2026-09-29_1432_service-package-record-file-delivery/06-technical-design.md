# Technical Design

## Objective

Publicar los archivos embebidos de `ServicePackageRecord` con el contrato de
lectura reutilizable de documentos, sin moverlos al agregado generico `files`
ni modificar su modelo persistido.

## HTTP Contract

```text
GET /v1/service-packages/records/:recordId/files/:fileId/download
Query: disposition=attachment|inline
```

- `disposition` es opcional y por defecto es `attachment`.
- La ruta es publica; no usa `JwtAuthGuard`, `PermissionsGuard` ni
  `@RequirePermission`.
- La respuesta es un stream, no un envelope `ApiResponseBuilder`.
- Los headers son:

  ```text
  Content-Type: MIME almacenado o resuelto por storage
  Content-Length: tamano almacenado o resuelto por storage
  Content-Disposition: <disposition>; filename*=UTF-8''<nombre codificado>
  ```

- Un registro inexistente, eliminado, un `fileId` ajeno o inexistente
  responden como recurso no encontrado. No se consulta S3 en esos casos.
- La ruta se declara antes de `GET records/:recordId`; evita que una ruta
  parametrica futura intercepte el subrecurso.

## Read Descriptor

El presenter compartido aplica esta proyeccion a `files[]` en
`GET /v1/service-packages/records` y
`GET /v1/service-packages/records/:recordId`. Cada elemento sera:

```json
{
  "file_id": "...",
  "relative_path": "...",
  "original_name": "informe.pdf",
  "mime_type": "application/pdf",
  "size": 12345,
  "download_url": "https://api.example/v1/service-packages/records/<recordId>/files/<fileId>/download",
  "preview_url": "https://api.example/v1/service-packages/records/<recordId>/files/<fileId>/download?disposition=inline"
}
```

El nucleo del descriptor (`file_id`, `original_name`, `mime_type`, `size`,
`download_url`, `preview_url`) es identico al de Customer Service Records.
`relative_path` permanece como metadata especifica opcional. `s3_key` y
`content_type` no se exponen. No existe compatibilidad temporal con las URLs
directas de S3 porque la migracion frontend y backend se desplegaran juntas.

## Flow By Layer

```text
HTTP controller
  -> ServicePackageRecordFileDownloadQuery
  -> DownloadServicePackageRecordFileUseCase
  -> IServicePackageRecordReadRepository.findById(recordId)
  -> verifica record activo y encuentra fileId en record.files
  -> IFileStorageService.getObject(file.s3Key)
  -> controller escribe headers y StreamableFile
```

### Application

El nuevo caso de uso recibe `recordId` y `fileId`; devuelve `stream`,
`filename`, `mimeType` y `size`.

1. Lee el registro mediante el puerto existente.
2. Rechaza registro nulo o `status=DELETED` usando
   `SERVICE_PACKAGE_RECORD` como error estandar de no encontrado.
3. Busca el archivo por su ID dentro de `record.files`; si no existe, responde
   el mismo error de no encontrado para no revelar pertenencia entre registros.
4. Solicita el objeto al storage existente solo despues de esas validaciones.
5. Usa `object.contentType` y `object.contentLength` cuando existan; conserva
   `file.contentType` y `file.size` como fallback.

El caso de uso no recibe ni interpreta `disposition`: esa es una preocupacion
HTTP que el DTO y controller resuelven al construir headers.

### Presentation

`ServicePackagePresenter` recibe `EnvService`, como el presenter de Customer
Service Records, para construir ambas URLs sobre `API_BASE_URL` normalizada.
La adaptacion de `contentType` a `mime_type` y la eliminacion de `s3_key`
ocurren aqui. Los DTOs internos continuan transportando `s3Key` porque es
necesario para que aplicacion obtenga el stream.

### Infrastructure Composition

Se agrega un request DTO propio del modulo para `disposition`; no se reutiliza
el DTO generico de archivos porque contiene `service_entry_id`, ajeno a este
recurso. El query/handler se exporta desde el indice de service packages y se
registra en `GlobalCqrsModule`. Los use cases se descubren por el registro
existente de `GlobalApplicationModule` basado en exports.

## Contract And Repository Impact

| Consumer | Previous contract | New contract | Compatibility and required action | Validation owner | Permanent document |
| --- | --- | --- | --- | --- | --- |
| `org-admin-suite-frontend` | `files[]` in both list and detail expose `content_type` and direct `s3_key`; they cannot use the generic document descriptor safely. | Both responses expose `mime_type`, `download_url` and `preview_url`; the new stream endpoint supports `attachment` and `inline`. | Intentional breaking replacement in the development contract. Frontend migration must stop reading `s3_key` and use the supplied URLs before joint deployment. | Frontend owner | `docs/frontend/service-package-record-file-delivery-handoff.md` |
| PWA Recoleccion | Creates embedded file snapshots through ZIP ingestion. | No contract or behavior change. | Fully compatible; no action. | Backend owner | N/A |

## Artifact Register

| Artifact | Type | Location | Responsibility | Dependencies | State |
| --- | --- | --- | --- | --- | --- |
| `ServicePackageRecord` and `ServicePackageRecordFileProps` | domain entity and embedded value shape | `src/internal/domain/entities/service-package-record.entity.ts` | Preserve the persisted record and its file metadata. | Existing read repository and ingestion. | reuse |
| `IServicePackageRecordReadRepository` | domain read port | `src/internal/domain/ports/repositories/service-package-record/service-package-record-read.repository.ts` | Read the owner record by ID without adding a file-specific query. | Existing Mongoose adapter. | reuse |
| `IFileStorageService` | domain external-service port | `src/internal/domain/ports/services/file-storage/file-storage.service.ts` | Retrieve the object stream by private storage key after owner/file validation. | `S3FileStorageService`. | reuse |
| `EntityNotFoundException` and `EntityNotFoundExceptionCode.SERVICE_PACKAGE_RECORD` | domain exception | `src/internal/domain/exceptions/entity-not-found.exception.ts` | Return the established not-found result for missing, deleted or unrelated resources. | API exception filter. | reuse |
| `DownloadServicePackageRecordFileDto` and `DownloadServicePackageRecordFileResultDto` | application DTOs | `src/internal/application/dto/service-package/download-service-package-record-file.dto.ts` | Carry record/file identifiers and the resolved stream result. | Node readable stream; delivery use case. | new |
| service-package DTO barrel | application composition | `src/internal/application/dto/service-package/index.ts` | Export the delivery DTOs to query and controller layers. | New application DTO file. | modify |
| `DownloadServicePackageRecordFileUseCase` | application use case | `src/internal/application/use-cases/service-package/download-service-package-record-file.use-case.ts` | Validate active owner and file membership, then resolve its storage stream. | `IServicePackageRecordReadRepository`, `IFileStorageService`, not-found exception. | new |
| service-package use-case barrel | application composition | `src/internal/application/use-cases/service-package/index.ts` | Export the delivery use case for automatic application DI registration. | New use case. | modify |
| `ServicePackageRecordMapper` and `ServicePackageRecordFileDto` | application mapper and DTO | `src/internal/application/mappers/service-package/service-package-record.mapper.ts`; `src/internal/application/dto/service-package/service-package-record.dto.ts` | Preserve internal `s3Key` transport from persistence to the delivery use case. | Existing record entity. | reuse |
| `DownloadServicePackageRecordFileQuery` and `DownloadServicePackageRecordFileHandler` | CQRS query and handler | `src/internal/infra/cqrs/queries/service-package/download-service-package-record-file.query.ts` | Delegate the delivery DTO to the use case without HTTP logic. | New use case and DTOs. | new |
| service-package query barrel | CQRS composition | `src/internal/infra/cqrs/queries/service-package/index.ts` | Export the new query and handler. | New query file. | modify |
| `GlobalCqrsModule` | Nest CQRS registration | `src/modules/global-cqrs.module.ts` | Register `DownloadServicePackageRecordFileHandler`. | Query barrel export. | modify |
| `ServicePackageRecordFileDownloadRequestDto` | HTTP request DTO | `src/internal/infra/api/dto/service-package/service-package-record-file-download.request.dto.ts` | Validate optional `disposition` and expose normalized default. | `class-validator`; controller. | new |
| service-package API DTO barrel | HTTP composition | `src/internal/infra/api/dto/service-package/index.ts` | Export the request DTO. | New request DTO. | modify |
| `ServicePackageController` | HTTP controller | `src/internal/infra/api/controllers/service-package/service-package.controller.ts` | Expose the public `GET /v1/service-packages/records/:recordId/files/:fileId/download`, write headers and return `StreamableFile`. | Request DTO and query bus. | modify |
| `ServicePackagePresenter` | HTTP presenter | `src/internal/infra/api/presenters/service-package/service-package.presenter.ts` | Build public API URLs and translate the public detail descriptor. | `EnvService`, internal record DTO. | modify |
| `S3FileStorageService` | infrastructure storage adapter | `src/internal/infra/services/file-storage/s3-file-storage.service.ts` | Serve the object stream after active-owner and membership validation. | `IFileStorageService`. | reuse |
| `MongooseServicePackageRecordReadRepositoryImpl`, schema and mapper | persistence adapter, schema and mapper | `src/internal/infra/persistence/mongoose/repositories/service-package/mongoose-service-package-record-read.repository.ts`; `src/internal/infra/persistence/mongoose/schemas/service-package/service-package-record.schema.ts`; `src/internal/infra/persistence/mongoose/mappers/service-package/mongoose-service-package-record.mapper.ts` | Keep current persisted shape and owner lookup. | Existing model and domain mapper. | reuse |
| migrations, backfill, indexes and rollback procedure | persistence/data operation | N/A | Not applicable: no data or query-shape persistence change occurs. | Existing data remains valid. | not_applicable |
| ZIP ingestion | external ingestion flow | `src/internal/application/use-cases/service-package/ingest-service-package.use-case.ts` | Preserve file creation and embedded snapshots. | PWA Recoleccion and storage service. | reuse |
| `GlobalApplicationModule` and `GlobalHttpModule` | Nest composition | `src/modules/global-application.module.ts`; `src/modules/global-http.module.ts` | Keep automatic registration through existing barrels; no module declaration changes. | Updated exports and existing module conventions. | reuse |
| `docs/icsacv-api.postman_collection.json` | API contract documentation | `docs/icsacv-api.postman_collection.json` | Add public download and inline-preview requests with representative outcomes. | Final endpoint contract. | modify |
| `docs/authorization/feature-permission-catalog.md` | authorization documentation | `docs/authorization/feature-permission-catalog.md` | Document the public file-delivery exception within the service packages domain. | Controller route. | modify |
| `service-package-record-file-delivery-handoff.md` | frontend integration handoff | `docs/frontend/service-package-record-file-delivery-handoff.md` | Specify descriptor fields, endpoint behavior, errors and preview/download consumption. | Final presenter and endpoint contract. | new |
| static and manual verification | verification | `package.json`; this spec | Compile, inspect diff and document endpoint scenarios; unit tests are expressly excluded. | Implemented slice and user API environment. | modify |

## Validation Strategy

| Risk | Scenario | Level | Expected evidence | Owner |
| --- | --- | --- | --- | --- |
| Descriptor incompatible | Detail contains PDF, image and non-previewable file. | Static review and manual API check | No `s3_key`; each item contains the six common fields and optional `relative_path`. | Agent, then frontend owner |
| Unsafe object access | `fileId` belongs to a different record or the owner is deleted. | Manual API validation | Standard not-found response; no storage stream is requested. | User |
| Content delivery regression | PDF/image opened with `inline`; download with accented filename. | Manual API validation | Correct MIME, length and UTF-8 `Content-Disposition`; browser previews supported types. | User |
| Browser delivery regression | Direct URL without JWT for download, inline PDF or image preview. | Manual API validation | The route returns the stream and headers without exposing S3 URLs. | User |
| Type or wiring failure | New DTO, CQRS and DI exports. | Static validation | `npm run build` and `git diff --check` pass. | Agent |

No se agregan, proponen ni ejecutan pruebas unitarias: la politica vigente del
proyecto las excluye. `npm run lint` no es una validacion automatica de esta
slice porque contiene `--fix` y podria modificar archivos ajenos.
