# Technical Design

## Write Contracts

| Method and path | Permission | Full block required | Result |
| --- | --- | --- | --- |
| `POST /v1/customer-service-records` | `customer_service_records:CREATE` | tipo, fecha solicitada, customer, usuarios, activo inicial, observaciones | `201` y detalle administrativo completo |
| `PUT /v1/customer-service-records/:recordId/details` | `customer_service_records:UPDATE` | tipo, fecha solicitada, observaciones, operational status | `200` y detalle completo |
| `PUT /v1/customer-service-records/:recordId/customer` | `customer_service_records:UPDATE` | customer y customer delivery completos | `200` y detalle completo |
| `PUT /v1/customer-service-records/:recordId/provider` | `customer_service_records:UPDATE` | provider completo o `null` | `200` y detalle completo |
| `PUT /v1/customer-service-records/:recordId/assets/:assetId` | `customer_service_records:UPDATE` | datos completos del activo y sus tres arrays de IDs | `200` y detalle completo |
| `PUT /v1/customer-service-records/:recordId/documents/:documentType` | `customer_service_records:UPDATE` | referencia y archivos de una coleccion, o solo archivos para `other-files` | `200` y detalle completo |

`documentType` solo acepta `quotation`, `purchase-order`, `invoice` y
`other-files`. Un tipo invalido responde `400` con el envelope estandar. Un
registro, activo, archivo, cliente, usuario o proveedor inexistente conserva el
tratamiento estandar vigente de recurso no encontrado o validacion aplicable.

El PATCH actual se elimina sin coexistencia temporal.

## Request Bodies

`POST /v1/customer-service-records` requiere el conjunto minimo:

```json
{
  "service_type_code": "CALIBRATION",
  "requested_at": "2026-09-20",
  "observations": null,
  "customer": {
    "customer_id": "customer-id",
    "customer_user_ids": []
  },
  "assets": [
    {
      "name": "Multimetro",
      "identifier": "DMM6500",
      "brand": "Keithley",
      "model": "DMM6500",
      "serial_number": "4642997",
      "observations": null
    }
  ]
}
```

`assets` debe contener al menos un elemento. No acepta customer delivery,
provider, operational status, documentos ni adjuntos al crear.
El backend genera los `asset_id`, asigna `operational_status=PENDING`, inicializa
customer delivery con fechas/politicas nulas e intervalo cero, deja `provider`
en `null`, crea todas las colecciones de adjuntos vacias y establece ambos
conteos en cero.

`PUT /v1/customer-service-records/:recordId/details`:

```json
{
  "service_type_code": "CALIBRATION",
  "requested_at": "2026-09-20",
  "observations": null,
  "operational_status": "IN_PROGRESS"
}
```

`PUT /v1/customer-service-records/:recordId/customer`:

```json
{
  "customer": {
    "customer_id": "customer-id",
    "customer_user_ids": ["user-id"]
  },
  "customer_delivery": {
    "received_at": "2026-09-20",
    "estimated_delivery_interval": {
      "years": 0,
      "months": 0,
      "weeks": 2,
      "days": 0
    },
    "estimated_delivery_at": null,
    "delivered_to_customer_at": null,
    "status_policy_id": "policy-id",
    "notification_policy_id": null
  }
}
```

`customer_user_ids` puede ser vacio. Todos los componentes del intervalo son
enteros no negativos. Con fecha de recepcion y estimacion explicita nula, se
conserva la derivacion vigente desde fecha e intervalo.

`PUT /v1/customer-service-records/:recordId/provider` acepta un provider
completo o `{ "provider": null }` para removerlo:

```json
{
  "provider": {
    "provider_id": "provider-id",
    "work_order_reference": "OT-LAB-2026-014",
    "delivered_to_provider_at": "2026-09-20",
    "estimated_return_interval": {
      "years": 0,
      "months": 0,
      "weeks": 1,
      "days": 0
    },
    "estimated_return_at": null,
    "returned_from_provider_at": null,
    "status_policy_id": "policy-id",
    "notification_policy_id": null,
    "follow_up": {
      "enabled": true,
      "rules": [
        {
          "interval": { "years": 0, "months": 0, "weeks": 1, "days": 0 },
          "recipient_group_ids": ["group-id"],
          "cc_recipient_group_ids": []
        }
      ]
    }
  }
}
```

`work_order_reference` es `string|null`. Las fechas, politicas y la fecha de
retorno conservan las reglas de derivacion vigentes.

`PUT /v1/customer-service-records/:recordId/assets/:assetId` recibe el activo
completo y siempre sus tres listados activos:

```json
{
  "name": "Multimetro",
  "identifier": "DMM6500",
  "brand": "Keithley",
  "model": "DMM6500",
  "serial_number": "4642997",
  "observations": null,
  "intake_condition_file_ids": ["file-1"],
  "delivery_condition_file_ids": [],
  "report_file_ids": ["file-2"]
}
```

`PUT /v1/customer-service-records/:recordId/documents/:documentType` acepta:

```json
{ "reference_number": "COT-2026-001", "file_ids": ["file-1", "file-2"] }
```

para `quotation`, `purchase-order` e `invoice`; `reference_number` siempre se
envia y puede ser `null`. Para `other-files` el unico cuerpo valido es:

```json
{ "file_ids": ["file-3"] }
```

`other-files` rechaza `reference_number`. Todos los arrays de IDs de archivo se
envian completos, pueden ser vacios y representan solo relaciones activas.

## Pipeline Compliance

Cada `POST` y `PUT` de Customer Service Records sigue este flujo sin excepcion:

```text
Controller -> Request DTO.toDomain() -> Command Adapter -> BaseCommandHandler
-> Use Case -> domain/services/repositories -> application DTO -> Presenter
-> ApiResponseBuilder
```

Los controllers reciben parametros, body y `@CurrentUser()`, declaran los
guards/permisos existentes y delegan al bus. No consultan repositorios,
materializan datos ni construyen respuestas finales.

`DownloadFileRequestDto` valida el query `disposition` para
`GET /v1/files/:fileId/download`. La disposicion no cruza CQRS: solo define el
header HTTP `Content-Disposition`, por lo que el controller la consume despues
de recibir el stream del query existente. El query, handler y caso de uso de
File conservan exclusivamente la entrega del archivo y el conteo opcional de
Service Entry.

Los presenters administrativo y de Client Access construyen `download_url` y
`preview_url` mediante `EnvService` y `API_BASE_URL`, siguiendo el patron de
presenters existentes. Ningun mapper de aplicacion/persistencia, use case o
controller construye URLs de descarga.

## Persisted Model

Por activo:

```text
intake_condition_files: { files: [], removed_files: [] }
delivery_condition_files: { files: [], removed_files: [] }
reports: { files: [], removed_files: [] }
```

En raiz:

```text
quotation: { reference_number: null, files: [], removed_files: [] }
purchase_order: { reference_number: null, files: [], removed_files: [] }
invoice: { reference_number: null, files: [], removed_files: [] }
other_files: { files: [], removed_files: [] }
attachments_count: 0
customer_visible_attachments_count: 0
```

En `provider`, `work_order_reference` es `string|null`. No se mueve ni renombra
ninguna estructura existente.

Un archivo activo contiene `file_id`, `original_name`, `mime_type`, `size`,
`added_at` y `added_by`. Un removido conserva lo anterior mas `removed_at` y
`removed_by`. El snapshot no persiste `label`, status, bucket, storage key ni
URL; el nombre original es el unico contexto de usuario de esta primera version.

## Reconciliation

Los requests de asset y document envian unicamente arrays de `file_ids`
activos. El servicio compartido preserva snapshots de activos que siguen
presentes, busca en lote IDs nuevos, archiva activos ausentes y reemplaza la
lista activa resultante respetando orden y duplicados. Los IDs deben existir;
no se deduplican ni se rechazan repeticiones. Los conteos contabilizan cada
elemento activo, incluso repetido.

La reconciliacion recalcula `attachments_count` y
`customer_visible_attachments_count` en cada actualizacion de asset o
document. En el alcance actual ambos valores coinciden porque todos esos
adjuntos son visibles en Client Access; la separacion evita una migracion
futura si provider incorpora adjuntos internos.

Cada mutacion actualiza `updated_by` y `updatedAt`; ninguna modifica
`created_by` ni `createdAt`. Los bloques details, customer y provider reutilizan
los refrescadores tecnicos existentes cuando corresponda. Asset y document no
refrescan materializaciones tecnicas.

## Read Contracts

Los listados administrativo y Client Access exponen `attachments_count`, sin
arrays de archivos. En administracion representa `attachments_count` interno;
en Client Access representa `customer_visible_attachments_count`, con el mismo
nombre de respuesta. El detalle administrativo expone todas las relaciones
activas; Client Access solo las visibles. Ninguno expone historial, auditoria
de adjuntos, bucket, storage key, URL de S3 o datos privados del proveedor.

Cada descriptor activo es:

```json
{
  "file_id": "file-id",
  "original_name": "informe.pdf",
  "mime_type": "application/pdf",
  "size": 248331,
  "download_url": "/v1/files/file-id/download",
  "preview_url": "/v1/files/file-id/download?disposition=inline"
}
```

## Generic Files

`POST /v1/files` y `POST /v1/files/public` conservan maximo 10 archivos por
request y aplican 20 MiB por archivo. No se agrega allowlist de MIME o
extension. `GET /v1/files/:fileId/download` conserva `attachment` como
disposicion por defecto y valida `disposition=attachment|inline`.

## Migration

La migracion recorre toda la coleccion `customer_service_records`, identifica
campos ausentes y usa `bulkWrite` con `$set` dirigido. Dry-run informa totales,
pendientes y verificacion de auditoria; apply inicializa las estructuras, los
conteos y `provider.work_order_reference: null` solo en providers existentes.
No agrega provider a records que no lo tienen. Es idempotente y no usa `save`,
reemplazos ni `$currentDate`.

Los comandos que ejecuta la persona usuaria, en este orden, seran:

```bash
npm run db:migrate:customer-service-record-attachments:dry-run
npm run db:migrate:customer-service-record-attachments:apply
```

No se ejecuta `apply` hasta revisar el plan del dry-run. La evidencia posterior
comprueba campos raiz, colecciones por activo, conteos en cero, provider sin
orden de trabajo y auditoria de creacion/actualizacion sin cambios.

## Acceptance Matrix

| Scenario | Observable result | Evidence |
| --- | --- | --- |
| Crear minimo | inicializa bloques, conteos y valores por defecto | validacion manual usuaria |
| PUT por bloque | persiste solo su bloque y devuelve detalle actualizado | validacion manual usuaria |
| Remover adjunto | desaparece de activos y permanece auditado en historial | validacion manual usuaria |
| Reenviar activo | conserva snapshot y `added_*` originales | validacion manual usuaria |
| IDs nuevos | se snapshottean con actor y momento actuales | validacion manual usuaria |
| Duplicados existentes | se conservan y cuentan tal como llegan | validacion manual usuaria |
| Client Access | solo ve conteo/adjuntos permitidos | validacion manual usuaria |
| Inline | imagen/PDF puede consumirse con URL inline; descarga por defecto se conserva | validacion manual usuaria |
| Migracion | crea faltantes sin tocar auditoria | dry-run, apply e inspeccion manual usuaria |

## Verification Commands

No se agregan ni ejecutan pruebas unitarias para esta iniciativa. Antes de la
validacion manual se ejecutaran, cuando corresponda:

```bash
npm run build
git diff --check
```

## Registro de Artefactos

| Artefacto | Tipo | Ubicacion | Responsabilidad y dependencias | Estado |
| --- | --- | --- | --- | --- |
| `CustomerServiceRecord`, `CustomerServiceRecordAssetProps`, `CustomerServiceRecordProviderProps` y `CustomerServiceRecordProps` | entidad y props de dominio | `src/internal/domain/entities/customer-service-record.entity.ts` | Añaden colecciones de adjuntos, `workOrderReference` y conteos sin alterar campos existentes. | modify |
| `CustomerServiceRecordFileAttachmentProps`, `CustomerServiceRecordRemovedFileAttachmentProps`, `CustomerServiceRecordFileAttachmentCollectionProps` y `CustomerServiceRecordDocumentProps` | interfaces de dominio | `src/internal/domain/entities/customer-service-record.entity.ts` | Definen snapshots activos, historial removido, colecciones y documentos raiz. | new |
| `ICustomerServiceRecordReadRepository`, `ICustomerServiceRecordWriteRepository` y `ICustomerServiceRecordClientAccessReadRepository` | puertos de lectura/escritura | `src/internal/domain/ports/repositories/customer-service-record/customer-service-record-read.repository.ts`; `src/internal/domain/ports/repositories/customer-service-record/customer-service-record-write.repository.ts`; `src/internal/domain/ports/repositories/customer-service-record-client-access/customer-service-record-client-access-read.repository.ts` | Conservan sus firmas basadas en el aggregate ampliado; no necesitan un metodo especializado. | reuse |
| `IFileReadRepository` | puerto de lectura | `src/internal/domain/ports/repositories/file/file-read.repository.ts` | Reutiliza `findManyByIds` para resolver IDs nuevos en lote. | reuse |
| `CreateCustomerServiceRecordDto`, `UpdateCustomerServiceRecordDetailsDto`, `UpdateCustomerServiceRecordCustomerDto`, `UpdateCustomerServiceRecordProviderDto`, `UpdateCustomerServiceRecordAssetDto` y `UpdateCustomerServiceRecordDocumentDto` | DTOs de aplicacion | `src/internal/application/dto/customer-service-record/customer-service-record.dto.ts` | Definen el create minimo y los cinco contratos completos de actualizacion. | modify |
| `CustomerServiceRecordViewDto` y `CustomerServiceRecordFileAttachmentViewDto` | DTOs de aplicacion | `src/internal/application/dto/customer-service-record/customer-service-record.dto.ts` | Transportan conteos y snapshots activos al presenter administrativo; el presenter agrega URLs HTTP. | modify |
| `CustomerServiceRecordMapper` | mapper de aplicacion | `src/internal/application/mappers/customer-service-record/customer-service-record.mapper.ts` | Convierte el aggregate ampliado al detalle/listado administrativo, incluidos conteos y adjuntos activos. | modify |
| `CustomerServiceRecordAttachmentReconciliationService` | servicio de aplicacion | `src/internal/application/services/customer-service-record/customer-service-record-attachment-reconciliation.service.ts` | Reconciliacion reutilizable de snapshots, archivos nuevos, removidos y conteos; consume `IFileReadRepository`. | new |
| `CustomerServiceRecordInputPreparationService` y `CustomerServiceRecordTechnicalMaterializationsRefresherService` | servicios de aplicacion | `src/internal/application/services/customer-service-record/customer-service-record-input-preparation.service.ts`; `src/internal/application/services/customer-service-record/customer-service-record-technical-materializations-refresher.service.ts` | Reutilizan validacion/preparacion de referencias y refresco de materializaciones existentes. | reuse |
| `UpdateCustomerServiceRecordDetailsUseCase` | caso de uso | `src/internal/application/use-cases/customer-service-record/update-customer-service-record-details.use-case.ts` | Orquesta el bloque details y el refresco tecnico por operational status. | new |
| `UpdateCustomerServiceRecordCustomerUseCase` | caso de uso | `src/internal/application/use-cases/customer-service-record/update-customer-service-record-customer.use-case.ts` | Orquesta customer/customer delivery y sus materializaciones. | new |
| `UpdateCustomerServiceRecordProviderUseCase` | caso de uso | `src/internal/application/use-cases/customer-service-record/update-customer-service-record-provider.use-case.ts` | Orquesta alta, actualizacion o remocion de provider y sus materializaciones. | new |
| `UpdateCustomerServiceRecordAssetUseCase` | caso de uso | `src/internal/application/use-cases/customer-service-record/update-customer-service-record-asset.use-case.ts` | Actualiza un activo perteneciente al record y sus tres colecciones de adjuntos. | new |
| `UpdateCustomerServiceRecordDocumentUseCase` | caso de uso | `src/internal/application/use-cases/customer-service-record/update-customer-service-record-document.use-case.ts` | Actualiza quotation, purchase order, invoice u other files segun `documentType`. | new |
| `UpdateCustomerServiceRecordUseCase` | caso de uso legacy | `src/internal/application/use-cases/customer-service-record/update-customer-service-record.use-case.ts` | Flujo PATCH amplio sustituido por los cinco casos de uso segmentados. | remove |
| `UpdateCustomerServiceRecordDto` y `UpdateCustomerServiceRecordResultDto` | DTOs legacy | `src/internal/application/dto/customer-service-record/customer-service-record.dto.ts` | Contrato amplio exclusivo de PATCH sustituido por DTOs por bloque. | remove |
| `CreateCustomerServiceRecordUseCase` | caso de uso | `src/internal/application/use-cases/customer-service-record/create-customer-service-record.use-case.ts` | Reduce POST al contrato minimo e inicializa los bloques aprobados. | modify |
| `GetCustomerServiceRecordsUseCase`, `GetCustomerServiceRecordByIdUseCase` y `DeleteCustomerServiceRecordUseCase` | casos de uso | `src/internal/application/use-cases/customer-service-record/get-customer-service-records.use-case.ts`; `src/internal/application/use-cases/customer-service-record/get-customer-service-record-by-id.use-case.ts`; `src/internal/application/use-cases/customer-service-record/delete-customer-service-record.use-case.ts` | Reutilizan lecturas/delete del aggregate ampliado sin nueva orquestacion. | reuse |
| `UpdateCustomerServiceRecordDetailsCommandAdapter`, `UpdateCustomerServiceRecordCustomerCommandAdapter`, `UpdateCustomerServiceRecordProviderCommandAdapter`, `UpdateCustomerServiceRecordAssetCommandAdapter` y `UpdateCustomerServiceRecordDocumentCommandAdapter`, con sus handlers | commands CQRS | `src/internal/infra/cqrs/commands/customer-service-record/customer-service-record.commands.ts` | Adaptan los cinco PUT a sus casos de uso; cada handler extiende `BaseCommandHandler` y delega sin logica de negocio. | new |
| `UpdateCustomerServiceRecordCommandAdapter` y `UpdateCustomerServiceRecordHandler` | command/handler legacy | `src/internal/infra/cqrs/commands/customer-service-record/customer-service-record.commands.ts` | Adaptador y handler exclusivos de PATCH sustituidos por los cinco handlers segmentados. | remove |
| `CreateCustomerServiceRecordRequestDto`, `UpdateCustomerServiceRecordDetailsRequestDto`, `UpdateCustomerServiceRecordCustomerRequestDto`, `UpdateCustomerServiceRecordProviderRequestDto`, `UpdateCustomerServiceRecordAssetRequestDto` y `UpdateCustomerServiceRecordDocumentRequestDto` | HTTP request DTOs | `src/internal/infra/api/dto/customer-service-record/customer-service-record.request.dto.ts` | Validan POST minimo y cuerpos completos de los cinco PUT; cada uno transforma el body a su DTO de aplicacion con `toDomain()`. | modify |
| `UpdateCustomerServiceRecordRequestDto` | HTTP request DTO legacy | `src/internal/infra/api/dto/customer-service-record/customer-service-record.request.dto.ts` | Request amplio exclusivo de PATCH sustituido por request DTOs por bloque. | remove |
| `CustomerServiceRecordController` | controlador | `src/internal/infra/api/controllers/customer-service-record/customer-service-record.controller.ts` | Expone POST/PUT, retira PATCH, conserva guards y envelope. | modify |
| `PATCH /v1/customer-service-records/:recordId` | endpoint HTTP legacy | `src/internal/infra/api/controllers/customer-service-record/customer-service-record.controller.ts` | Ruta amplia sustituida sin compatibilidad temporal por los cinco PUT cohesionados. | remove |
| `CustomerServiceRecordPresenter` | presenter HTTP | `src/internal/infra/api/presenters/customer-service-record/customer-service-record.presenter.ts` | Inyecta `EnvService`, emite detalle/listado administrativo, conteo y descriptores con URLs HTTP sin filtrar datos internos. | modify |
| `CustomerServiceRecordClientAccessViewDto` | DTO de aplicacion | `src/internal/application/dto/customer-service-record-client-access/customer-service-record-client-access.dto.ts` | Transporta conteo y solo snapshots visibles al presenter de Client Access; reutiliza `CustomerServiceRecordFileAttachmentViewDto`. | modify |
| `CustomerServiceRecordClientAccessMapper` | mapper de aplicacion | `src/internal/application/mappers/customer-service-record-client-access/customer-service-record-client-access.mapper.ts` | Construye proyeccion visible sin proveedor ni historial. | modify |
| `CustomerServiceRecordClientAccessPresenter` | presenter HTTP | `src/internal/infra/api/presenters/customer-service-record-client-access/customer-service-record-client-access.presenter.ts` | Inyecta `EnvService`, emite conteo y descriptores visibles con URLs HTTP en detalle; listados sin arrays. | modify |
| `CustomerServiceRecordClientAccessController` y `CustomerServiceRecordClientAccessVisibilityService` | controlador/servicio | `src/internal/infra/api/controllers/customer-service-record-client-access/customer-service-record-client-access.controller.ts`; `src/internal/application/services/customer-service-record-client-access/customer-service-record-client-access-visibility.service.ts` | Conservan rutas, autorizacion y frontera vigente; reciben la proyeccion ampliada sin cambio de responsabilidad. | reuse |
| `CustomerServiceRecordFileAttachmentDocument`, `CustomerServiceRecordRemovedFileAttachmentDocument`, `CustomerServiceRecordFileAttachmentCollectionDocument` y `CustomerServiceRecordDocumentReferenceDocument` | subdocumentos Mongoose | `src/internal/infra/persistence/mongoose/schemas/customer-service-record/customer-service-record.schema.ts` | Declaran el shape embebido de snapshots, historial y documentos. | new |
| `CustomerServiceRecordAssetDocument`, `CustomerServiceRecordProviderDocument` y `CustomerServiceRecordDocument` | schema Mongoose | `src/internal/infra/persistence/mongoose/schemas/customer-service-record/customer-service-record.schema.ts` | Incorporan las propiedades nuevas con defaults persistibles. | modify |
| `MongooseCustomerServiceRecordMapper` | mapper Mongoose | `src/internal/infra/persistence/mongoose/mappers/customer-service-record/mongoose-customer-service-record.mapper.ts` | Traduce dominio/persistencia de adjuntos, historial, referencias y conteos. | modify |
| `MongooseCustomerServiceRecordReadRepositoryImpl` y `MongooseCustomerServiceRecordWriteRepositoryImpl` | repositorios Mongoose | `src/internal/infra/persistence/mongoose/repositories/customer-service-record/mongoose-customer-service-record-read.repository.ts`; `src/internal/infra/persistence/mongoose/repositories/customer-service-record/mongoose-customer-service-record-write.repository.ts` | Reutilizan su flujo actual a traves de `MongooseCustomerServiceRecordMapper`, que ya traduce y persiste el aggregate ampliado y los conteos materializados. | reuse |
| `MongooseCustomerServiceRecordClientAccessReadRepositoryImpl` | repositorio Mongoose | `src/internal/infra/persistence/mongoose/repositories/customer-service-record-client-access/mongoose-customer-service-record-client-access-read.repository.ts` | Mantiene frontera de Client Access y devuelve la proyeccion con conteo visible. | modify |
| `DownloadFileRequestDto` | HTTP request DTO | `src/internal/infra/api/dto/file/download-file.request.dto.ts` | Valida `disposition=attachment|inline`; expone la disposicion normalizada como preocupacion exclusiva del header HTTP. | new |
| barrel de DTOs File | exportacion | `src/internal/infra/api/dto/file/index.ts` | Expone `DownloadFileRequestDto` dentro del modulo File. | new |
| barrel raiz de DTOs | exportacion | `src/internal/infra/api/dto/index.ts` | Reexporta el nuevo modulo File para `FileController`. | modify |
| `FileController` | API generica | `src/internal/infra/api/controllers/file/file.controller.ts` | Configura limite de 20 MiB por archivo en ambas cargas, recibe `DownloadFileRequestDto` y aplica la disposicion validada al header. | modify |
| `DownloadFileQuery`, `DownloadFileUseCase` y DTO de descarga | query/caso de uso/DTO | `src/internal/infra/cqrs/queries/file/download-file.query.ts`; `src/internal/application/use-cases/file/download-file.use-case.ts`; `src/internal/application/dto/file/get-file.dto.ts` | Reutilizan la entrega del stream y el conteo exclusivo de `service_entry_id`; no conocen la disposicion HTTP. | reuse |
| migracion CSR attachments | migracion | `src/internal/infra/persistence/mongoose/migrations/migrate-customer-service-record-attachments.ts` | Backfill idempotente con dry-run/apply y auditoria intacta. | new |
| scripts de migracion | configuracion | `package.json` | Expone comandos `db:migrate:customer-service-record-attachments:*`. | modify |
| barrel de servicios CSR | exportacion | `src/internal/application/services/customer-service-record/index.ts` | Exporta `CustomerServiceRecordAttachmentReconciliationService`. | modify |
| barrel de casos de uso CSR | exportacion | `src/internal/application/use-cases/customer-service-record/index.ts` | Exporta los cinco casos de uso nuevos y deja de exportar `UpdateCustomerServiceRecordUseCase`. | modify |
| `GlobalCqrsModule` | composicion Nest/CQRS | `src/modules/global-cqrs.module.ts` | Registra los cinco handlers nuevos y elimina `UpdateCustomerServiceRecordHandler`. | modify |
| permisos, capabilities, roles, seeds e indices | autorizacion/datos | N/A | No aplica: reutiliza `customer_service_records:CREATE|UPDATE|READ`; no requiere indice ni seed. | not_applicable |
| handoff CSR attachments | documento vivo | `docs/frontend/customer-service-record-attachments-handoff.md` | Informa contratos a aplicaciones cliente, sin progreso ni checks. | new |
| Postman | contrato operativo | `docs/icsacv-api.postman_collection.json` | Registra endpoints y ejemplos publicados. | modify |
| validacion | verificacion | N/A | Build/lint aplicables y validacion manual de la persona usuaria; sin pruebas unitarias. | modify |
