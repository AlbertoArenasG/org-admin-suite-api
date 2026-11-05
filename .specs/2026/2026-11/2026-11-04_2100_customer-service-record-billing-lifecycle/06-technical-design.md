# Diseño técnico

## Modelo y reglas

- `CustomerServiceRecord.billingStatus` y `billingNotification` siguen en raíz. `CustomerServiceRecord.billing` guarda `instructions`, `invoiceStatus` nullable, `issuedAt`, `deliveredAt`, `paymentTerm` (`years`, `months`, `weeks`, `days`), `estimatedPaymentAt`, `paidAt`. Las fechas son `YYYY-MM-DD` o `null`; el plazo es objeto o `null`. Especializar `invoice` como tipo propio, manteniendo `referenceNumber`, `files`, `removedFiles` y añadiendo `paymentComplements` con ID estable, referencia opcional, `files` y `removedFiles`. Cotización y `purchaseOrder` conservan el tipo documental genérico; `purchaseOrder` no se duplica.
- `invoiceStatus = null` mientras nunca se haya enviado a facturación; primera transición a `SUBMITTED` lo inicializa en `PENDING`. No reinicializarlo en transiciones posteriores. `NOT_SUBMITTED` posterior conserva todo el bloque `billing` y los datos de factura.
- En escrituras de fechas, distinguir propiedad ausente (no cambia) de `null` (limpia). La política pura de dominio recibe fecha local explícita. Primero aplicar cambios de entrega/plazo; si ambos están presentes y cambió alguno, recalcular `estimatedPaymentAt` con aritmética de calendario y fin de mes acotado al último día válido. Si el mismo request trae `estimatedPaymentAt`, ese valor manual prevalece en ese request; un cambio futuro de entrega/plazo podrá sustituirlo. Si falta un insumo, conservar la fecha estimada existente. Fecha de pago real no cambia estado.
- Capturar `issuedAt` cambia estado a `IN_PROCESS_PAYMENT`; limpiarlo a `PENDING`. Un PATCH explícito de `invoiceStatus` permite cualquiera de los seis valores. El orden de los requests determina el último cambio; no hay bandera de procedencia manual.
- El job compara `estimatedPaymentAt < today` con `today` de `America/Mexico_City`; solo registros visibles de facturación, factura no archivada, estado distinto de `PAID`/`CANCELLED`/`REJECTED` se vuelven `OVERDUE`. Si `OVERDUE` y la fecha estimada se modifica a hoy o futuro, vuelve a `IN_PROCESS_PAYMENT`. El job no modifica `billingStatus` ni envía avisos.
- Un archivado crea snapshot inmutable con factura completa, `invoiceStatus`, fechas/plazo y `archivedAt`/`archivedBy`. En una transacción, insertar snapshot y limpiar solo factura vigente, fechas/plazo y estado de factura a `PENDING`. Conservar `billingStatus`, instrucciones, notificación y comentarios. Usar la revisión condicional para evitar duplicación por concurrencia y reintentos. Si factura y datos archivables están vacíos, devolver 409 sin crear snapshot vacío. No borrar documentos `File` ni objetos S3.
- Persistir `invoiceRevision` numérico (inicial 0) y aumentarlo en cada mutación de factura vigente, fechas y estado; archivar compara la revisión leída. El snapshot guarda la revisión archivada y tiene índice único `(record_id, invoice_revision)`. Así un reintento del archivado de la misma versión no crea otro snapshot; la transacción hace atómicas inserción y limpieza. Las escrituras de factura por ambas rutas deben ser condicionales a la revisión, incluida la ruta administrativa heredada.
- Comentarios y snapshots viven en colecciones Mongo separadas ligadas al ID del registro, para que las listas puedan crecer sin el límite de tamaño del documento principal. Exponerlos mediante endpoints paginados, orden estable por `createdAt`/ID y `archivedAt`/ID. Comentarios conservan visibilidad, autor y timestamps; no hay edición ni eliminación. El valor `EXTERNAL` aún no se publica en el portal.
- Para cada adjunto nuevo o retenido, reutilizar la conciliación existente, incluyendo trazabilidad de `removedFiles`; archivar no cuenta como eliminación. Los archivos del snapshot continúan descargables. `attachmentsCount`/`customerVisibleAttachmentsCount` incluyen archivos vigentes de complementos de la factura actual y excluyen los snapshots archivados. Adaptar ambas escrituras actuales de factura, administrativa y de facturación, para conservar `paymentComplements` y evitar reemplazarlo accidentalmente.
- Los enums nuevos siguen el presenter `{code,name,name_key}` y traducciones `es`/`en`. La respuesta del detalle de facturación incluye `billing` e `invoice.payment_complements`; la lista solo los resúmenes pertinentes (al menos `invoice_status` y fecha estimada). El detalle administrativo expone instrucciones para la acción de envío; la proyección del portal permanece igual.

## Contrato HTTP propuesto

Todas las respuestas usan `ApiResponseBuilder`; `GET`/escrituras retornan 200 salvo creación de comentario o complemento (201). Rutas de facturación bajo `JwtAuthGuard` + `PermissionsGuard` y módulo `billing_customer_service_records`; lecturas con `READ`, escrituras con `UPDATE`. Rutas administrativas bajo `customer_service_records:UPDATE`. Un registro fuera del conjunto visible de facturación responde 404; sin autenticación 401, sin permiso 403, DTO inválido 400, versión/estado concurrente 409. Se reutilizan los errores de archivo inválido/no visible que ya devuelve la conciliación existente. Los controladores siguen delgados y segmentados por responsabilidad: el actual conserva lista/detalle/estado de envío/factura, otro gestiona fechas/estado/orden de compra, otro complementos/archivo, otro comentarios y el job tiene controlador propio. `invoice-statuses/options` se registra antes de `:recordId` en el controlador existente.

| Método y ruta | Entrada y efecto | Respuesta |
| --- | --- | --- |
| `PATCH /v1/customer-service-records/:recordId/billing-status` | Extender body con `billing_instructions?: string\|null`; si viene y destino `SUBMITTED`, persiste instrucciones con el cambio de estado y las incluye en el correo. En fallo de correo, estado e instrucciones conservan su valor anterior. No-op de estado con instrucciones actualiza solo instrucciones, sin correo. | Detalle administrativo vigente. |
| `PATCH /v1/customer-service-records/:recordId/billing-instructions` | `{billing_instructions: string\|null}`; edición posterior sin correo. | Detalle administrativo. |
| `GET /v1/billing/customer-service-records/invoice-statuses/options` | Sin body, seis opciones localizadas. | Lista `{code,name,name_key}`. |
| `PATCH /v1/billing/customer-service-records/:recordId/billing-details` | Campos parciales `issued_at`, `delivered_at`, `payment_term`, `estimated_payment_at`, `paid_at`; ausente ≠ nulo. | Detalle de facturación. |
| `PATCH /v1/billing/customer-service-records/:recordId/invoice-status` | `{invoice_status: <enum>}`; estado explícito, sin mutar `billingStatus`. | Detalle de facturación. |
| `PUT /v1/billing/customer-service-records/:recordId/purchase-order` | `{reference_number: string\|null, file_ids: string[]}`; mismo patrón documental de factura. | Detalle de facturación. |
| `POST /v1/billing/customer-service-records/:recordId/invoice/payment-complements` | `{reference_number?: string\|null, file_ids: string[]}`; crea complemento con ID estable. | Detalle con complemento creado. |
| `PUT /v1/billing/customer-service-records/:recordId/invoice/payment-complements/:complementId` | `{reference_number: string\|null, file_ids: string[]}`; sustituye referencia/lista vigente y reconcilia removidos. | Detalle de facturación. |
| `POST /v1/billing/customer-service-records/:recordId/invoice/archive` | Sin body; snapshot íntegro en cualquier estado, limpieza de factura vigente. | Detalle de facturación y ID de snapshot. |
| `GET /v1/billing/customer-service-records/:recordId/invoice/archives` | `page`, `per_page`; orden descendente estable. | Lista paginada de resúmenes. |
| `GET /v1/billing/customer-service-records/:recordId/invoice/archives/:archiveId` | ID de snapshot. | Snapshot con adjuntos y URLs. |
| `POST /v1/billing/customer-service-records/:recordId/comments` | `{text: string, visibility: "INTERNAL"\|"EXTERNAL"}`; immutable. | Comentario creado con auditoría. |
| `GET /v1/billing/customer-service-records/:recordId/comments` | `page`, `per_page`; orden estable. | Lista paginada. |
| `POST /v1/internal-jobs/customer-service-records/invoices/overdue/refresh` | Token de `InternalJobsAuthGuard`, `{cursor?: string\|null}`. Lote fijo y cursor opaco; lock de job. | `{processed_records, updated_records, next_cursor, duration_ms}`. |

Los `GET` de lista/detalle de facturación y `PUT .../:recordId/invoice` ya existentes se extienden en sus respuestas; se conserva su ruta y semántica de edición de referencia/archivos. No se agrega ruta de comentarios al portal ni a administración. El handoff y Postman detallarán los ejemplos y códigos de error estables durante cada slice, contrastándolos con las excepciones existentes. Archivar sin datos vigentes devuelve 409; archivos inválidos mantienen el error de conciliación actual.

## Migración y compatibilidad

Script `migrate-customer-service-record-invoice-lifecycle.ts` con `--dry-run`, `--apply` y verificación. Actualización de campos faltantes con operadores Mongo y `timestamps: false`, preservando `updatedAt`/`updated_by`; nunca sustituir `billing` ya poblado ni reclasificar registros. Reportar totales, pendientes, inicializados por `billingStatus`, inválidos y auditoría intacta. Reejecución sin pendientes. El usuario ejecuta los comandos exactos que se añadirán a `package.json` tras revisar el dry-run. Los documentos históricos se leen con defaults compatibles antes de aplicar. Las rutas viejas no se eliminan.

## Registro de Artefactos

Cada fila indica nombre/ruta exactos propuestos; `M` modifica, `N` crea, `R` reutiliza. Dependencia principal y responsabilidad se indican en la última columna. Los `index.ts` de los directorios modificados se actualizan para exportar las clases nuevas; se consideran parte de la fila del artefacto que exportan. No hay artefactos `remove`.

| Grupo | Tipo | Artefacto y ubicación | Estado | Responsabilidad / dependencias |
| --- | --- | --- | --- | --- |
| Dominio | Entidad/enum | `CustomerServiceRecord`, `CustomerServiceRecordInvoiceStatus`, props de `billing`/complemento: `src/internal/domain/entities/customer-service-record.entity.ts` | modify | Invariantes, normalización, snapshot y limpieza; sin HTTP/Mongoose. |
| Dominio | Política | `CustomerServiceRecordInvoicePolicy`: `src/internal/domain/policies/customer-service-record-invoice.policy.ts` | new | Cálculo de plazo, vencimiento y transiciones derivadas; recibe fechas explícitas de aplicación. |
| Dominio | Entidad | `BillingRecordArchive`: `src/internal/domain/entities/billing-record-archive.entity.ts` | new | Snapshot inmutable asociado a registro/revisión; factura y datos de pago. |
| Dominio | Entidad | `BillingRecordComment`: `src/internal/domain/entities/billing-record-comment.entity.ts` | new | Texto/visibilidad/auditoría inmutable, asociado al registro. |
| Dominio | Puerto | `ICustomerServiceRecordWriteRepository`: `src/internal/domain/ports/repositories/customer-service-record/customer-service-record-write.repository.ts` | modify | Escrituras condicionales de facturación; entidad. |
| Dominio | Puerto | `IBillingCustomerServiceRecordReadRepository`: `src/internal/domain/ports/repositories/customer-service-record-billing/billing-customer-service-record-read.repository.ts` | modify | Consulta de candidatos al job y detalle visible. |
| Dominio | Puerto | `IBillingRecordArchiveRepository`: `src/internal/domain/ports/repositories/customer-service-record-billing/billing-record-archive.repository.ts` | new | Guardar/listar/leer snapshots; ID de registro. |
| Dominio | Puerto | `IBillingRecordCommentRepository`: `src/internal/domain/ports/repositories/customer-service-record-billing/billing-record-comment.repository.ts` | new | Crear/listar comentarios; ID de registro. |
| Dominio | Puerto de notificación | `CustomerServiceRecordBillingNotice`: `src/internal/domain/ports/services/notification/customer-service-record-billing-notice.service.ts` | modify | Incluir instrucciones en aviso; sender existente. |
| Dominio | Excepción | `StateConflictExceptionCode`: `src/internal/domain/exceptions/state-conflict.exception.ts` | modify | Código estable para revisión de factura cambiada al escribir/archivar. |
| Dominio | Excepción | `EntityNotFoundExceptionCode`: `src/internal/domain/exceptions/entity-not-found.exception.ts` | modify | Código estable para snapshot inexistente/no visible. |
| Aplicación | DTO de aplicación | DTOs de entrada/salida: `src/internal/application/dto/customer-service-record-billing/billing-customer-service-record.dto.ts` | modify | Tipar fechas, complementos, archivos e historial; entidad. |
| Aplicación | DTO de aplicación | DTO administrativo: `src/internal/application/dto/customer-service-record/customer-service-record.dto.ts` | modify | Instrucciones del envío; caso de uso administrativo. |
| Aplicación | Mapper | `BillingCustomerServiceRecordMapper`: `src/internal/application/mappers/customer-service-record-billing/billing-customer-service-record.mapper.ts` | modify | Proyección de billing/archivo; entidad. |
| Aplicación | Mapper | `CustomerServiceRecordMapper`: `src/internal/application/mappers/customer-service-record/customer-service-record.mapper.ts` | modify | Proyección administrativa de instrucciones; entidad. |
| Aplicación | Caso de uso | `UpdateCustomerServiceRecordBillingStatusUseCase`: `src/internal/application/use-cases/customer-service-record/update-customer-service-record-billing-status.use-case.ts` | modify | Persistir instrucciones con envío y aportar contenido al correo; puertos. |
| Aplicación | Caso de uso | `UpdateCustomerServiceRecordDocumentUseCase`: `src/internal/application/use-cases/customer-service-record/update-customer-service-record-document.use-case.ts` | modify | Conservar complementos al editar factura desde administración; conciliación. |
| Aplicación | Caso de uso | `UpdateBillingCustomerServiceRecordInvoiceUseCase`: `src/internal/application/use-cases/customer-service-record-billing/update-billing-customer-service-record-invoice.use-case.ts` | modify | Conservar complementos al editar referencia/archivos de factura; conciliación. |
| Aplicación | Servicio de aplicación | `CustomerServiceRecordAttachmentReconciliationService`: `src/internal/application/services/customer-service-record/customer-service-record-attachment-reconciliation.service.ts` | modify | Contar adjuntos vigentes de complementos sin incluir archivo histórico. |
| Aplicación | Caso de uso | `UpdateCustomerServiceRecordBillingInstructionsUseCase`: `src/internal/application/use-cases/customer-service-record/update-customer-service-record-billing-instructions.use-case.ts` | new | Edición administrativa sin correo; puertos. |
| Aplicación | Caso de uso | `UpdateBillingCustomerServiceRecordDetailsUseCase`: `src/internal/application/use-cases/customer-service-record-billing/update-billing-customer-service-record-details.use-case.ts` | new | Orquestar fechas/plazo mediante política pura de dominio y puerto de escritura. |
| Aplicación | Caso de uso | `UpdateBillingCustomerServiceRecordInvoiceStatusUseCase`: `src/internal/application/use-cases/customer-service-record-billing/update-billing-customer-service-record-invoice-status.use-case.ts` | new | Cambio manual de estado; puertos. |
| Aplicación | Caso de uso | `UpdateBillingCustomerServiceRecordPurchaseOrderUseCase`: `src/internal/application/use-cases/customer-service-record-billing/update-billing-customer-service-record-purchase-order.use-case.ts` | new | Referencia/adjuntos de orden; reconciliación. |
| Aplicación | Caso de uso | `CreateBillingCustomerServiceRecordPaymentComplementUseCase`: `src/internal/application/use-cases/customer-service-record-billing/create-billing-customer-service-record-payment-complement.use-case.ts` | new | Alta de complemento; reconciliación. |
| Aplicación | Caso de uso | `UpdateBillingCustomerServiceRecordPaymentComplementUseCase`: `src/internal/application/use-cases/customer-service-record-billing/update-billing-customer-service-record-payment-complement.use-case.ts` | new | Edición de complemento; reconciliación. |
| Aplicación | Caso de uso | `ArchiveBillingCustomerServiceRecordInvoiceUseCase`: `src/internal/application/use-cases/customer-service-record-billing/archive-billing-customer-service-record-invoice.use-case.ts` | new | Archivo transaccional; executor/puertos. |
| Aplicación | Caso de uso | `GetBillingCustomerServiceRecordArchivesUseCase`: `src/internal/application/use-cases/customer-service-record-billing/get-billing-customer-service-record-archives.use-case.ts` | new | Lectura paginada; puerto de archivo. |
| Aplicación | Caso de uso | `GetBillingCustomerServiceRecordArchiveByIdUseCase`: `src/internal/application/use-cases/customer-service-record-billing/get-billing-customer-service-record-archive-by-id.use-case.ts` | new | Lectura individual; puerto de archivo. |
| Aplicación | Caso de uso | `CreateBillingCustomerServiceRecordCommentUseCase`: `src/internal/application/use-cases/customer-service-record-billing/create-billing-customer-service-record-comment.use-case.ts` | new | Alta de comentario; puerto de comentarios. |
| Aplicación | Caso de uso | `GetBillingCustomerServiceRecordCommentsUseCase`: `src/internal/application/use-cases/customer-service-record-billing/get-billing-customer-service-record-comments.use-case.ts` | new | Lectura paginada; puerto de comentarios. |
| Aplicación | Caso de uso | `RefreshBillingCustomerServiceRecordOverdueUseCase`: `src/internal/application/use-cases/customer-service-record-billing/refresh-billing-customer-service-record-overdue.use-case.ts` | new | Procesar lote/cursor con `IInternalJobLockRepository` existente y actualización condicional. |
| Infra/persistencia | Schema/índice | `CustomerServiceRecordSchema`: `src/internal/infra/persistence/mongoose/schemas/customer-service-record/customer-service-record.schema.ts` | modify | Campos `billing`/complementos e índice vencimiento. |
| Infra/persistencia | Schema/índice | `BillingRecordArchiveSchema`: `src/internal/infra/persistence/mongoose/schemas/customer-service-record-billing/billing-record-archive.schema.ts` | new | Snapshots indexados por registro/fecha. |
| Infra/persistencia | Schema/índice | `BillingRecordCommentSchema`: `src/internal/infra/persistence/mongoose/schemas/customer-service-record-billing/billing-record-comment.schema.ts` | new | Comentarios indexados por registro/fecha. |
| Infra/persistencia | Schema/índice | `configSchemas`: `src/internal/infra/persistence/mongoose/schemas/schemas.config.ts` | modify | Registrar nuevos schemas. |
| Infra/persistencia | Mapper | `MongooseCustomerServiceRecordMapper`: `src/internal/infra/persistence/mongoose/mappers/customer-service-record/mongoose-customer-service-record.mapper.ts` | modify | Persistir/hidratar campos nuevos. |
| Infra/persistencia | Repositorio | `MongooseCustomerServiceRecordWriteRepositoryImpl`: `src/internal/infra/persistence/mongoose/repositories/customer-service-record/mongoose-customer-service-record-write.repository.ts` | modify | Actualizaciones condicionales sin borrar otros segmentos. |
| Infra/persistencia | Repositorio | `MongooseBillingCustomerServiceRecordReadRepositoryImpl`: `src/internal/infra/persistence/mongoose/repositories/customer-service-record-billing/mongoose-billing-customer-service-record-read.repository.ts` | modify | Candidatos de vencimiento, visibilidad vigente. |
| Infra/persistencia | Repositorio | `MongooseBillingRecordArchiveRepositoryImpl`: `src/internal/infra/persistence/mongoose/repositories/customer-service-record-billing/mongoose-billing-record-archive.repository.ts` | new | Persistir/listar snapshots; schema/transaction. |
| Infra/persistencia | Repositorio | `MongooseBillingRecordCommentRepositoryImpl`: `src/internal/infra/persistence/mongoose/repositories/customer-service-record-billing/mongoose-billing-record-comment.repository.ts` | new | Persistir/listar comentarios; schema. |
| Infra/persistencia | Configuración | `mongooseRepositoriesConfig`: `src/internal/infra/persistence/mongoose/repositories/mongoose-repositories.config.ts` | modify | DI de puertos nuevos. |
| Infra/persistencia | Migración | `migrate-customer-service-record-invoice-lifecycle.ts`: `src/internal/infra/persistence/mongoose/migrations/migrate-customer-service-record-invoice-lifecycle.ts` | new | Dry-run/apply/verificación idempotente sin auditoría. |
| Infra/notificación | Template de correo | `customerServiceRecordBillingNoticeTemplate`: `src/internal/infra/notification/services/templates/customer-service-record-billing-notice.template.ts` | modify | Añadir instrucciones al correo. |
| HTTP/API | Controlador | `CustomerServiceRecordController`: `src/internal/infra/api/controllers/customer-service-record/customer-service-record.controller.ts` | modify | Envío con instrucciones y edición posterior; guards existentes. |
| HTTP/API | Controlador | `BillingCustomerServiceRecordController`: `src/internal/infra/api/controllers/customer-service-record-billing/billing-customer-service-record.controller.ts` | modify | Lista/detalle, invoice actual y opciones de invoiceStatus; guards existentes. |
| HTTP/API | Controlador | `BillingCustomerServiceRecordLifecycleController`: `src/internal/infra/api/controllers/customer-service-record-billing/billing-customer-service-record-lifecycle.controller.ts` | new | Fechas, estado de factura y orden de compra; guards existentes. |
| HTTP/API | Controlador | `BillingCustomerServiceRecordInvoiceController`: `src/internal/infra/api/controllers/customer-service-record-billing/billing-customer-service-record-invoice.controller.ts` | new | Complementos y archivo; guards existentes. |
| HTTP/API | Controlador | `BillingCustomerServiceRecordCommentController`: `src/internal/infra/api/controllers/customer-service-record-billing/billing-customer-service-record-comment.controller.ts` | new | Comentarios de facturación; guards existentes. |
| HTTP/API | Controlador | `BillingCustomerServiceRecordOverdueController`: `src/internal/infra/api/controllers/internal-jobs/billing-customer-service-record-overdue.controller.ts` | new | Ruta de job bajo token interno. |
| HTTP/API | DTO HTTP | Request DTOs administrativos: `src/internal/infra/api/dto/customer-service-record/customer-service-record.request.dto.ts` | modify | Validar instrucciones. |
| HTTP/API | DTO HTTP | Request DTOs facturación: `src/internal/infra/api/dto/customer-service-record-billing/billing-customer-service-record.request.dto.ts` | modify | Validar dates, status, complementos, comentarios y paginación. |
| HTTP/API | DTO HTTP | Request DTO job: `src/internal/infra/api/dto/internal-jobs/refresh-billing-customer-service-record-overdue.request.dto.ts` | new | Validar cursor. |
| HTTP/API | Presenter | `BillingCustomerServiceRecordPresenter`: `src/internal/infra/api/presenters/customer-service-record-billing/billing-customer-service-record.presenter.ts` | modify | Respuestas y opciones i18n, URLs de archivos. |
| HTTP/API | Presenter | `BillingRecordArchivePresenter`: `src/internal/infra/api/presenters/customer-service-record-billing/billing-record-archive.presenter.ts` | new | Snapshot, lista y URLs de adjuntos archivados. |
| HTTP/API | Presenter | `BillingRecordCommentPresenter`: `src/internal/infra/api/presenters/customer-service-record-billing/billing-record-comment.presenter.ts` | new | Comentarios con auditoría y visibilidad. |
| HTTP/API | Presenter | `CustomerServiceRecordPresenter`: `src/internal/infra/api/presenters/customer-service-record/customer-service-record.presenter.ts` | modify | Instrucciones administrativas. |
| CQRS | Command/handler | `billing-customer-service-record-lifecycle.commands.ts`: `src/internal/infra/cqrs/commands/customer-service-record-billing/billing-customer-service-record-lifecycle.commands.ts` | new | Adaptadores/handlers delgados para fechas, estado y orden de compra. |
| CQRS | Command/handler | `billing-customer-service-record-invoice.commands.ts`: `src/internal/infra/cqrs/commands/customer-service-record-billing/billing-customer-service-record-invoice.commands.ts` | new | Adaptadores/handlers delgados para complementos/archivo. |
| CQRS | Command/handler | `billing-customer-service-record-comment.commands.ts`: `src/internal/infra/cqrs/commands/customer-service-record-billing/billing-customer-service-record-comment.commands.ts` | new | Adaptador/handler delgado para comentario. |
| CQRS | Query/handler | `billing-customer-service-record-lifecycle.queries.ts`: `src/internal/infra/cqrs/queries/customer-service-record-billing/billing-customer-service-record-lifecycle.queries.ts` | new | Opciones de estado, archivos y comentarios paginados. |
| CQRS | Command/handler | `UpdateCustomerServiceRecordBillingInstructionsCommandAdapter`: `src/internal/infra/cqrs/commands/customer-service-record/customer-service-record.commands.ts` | modify | Delegar edición administrativa. |
| CQRS | Command/handler | `RefreshBillingCustomerServiceRecordOverdueCommandAdapter`: `src/internal/infra/cqrs/commands/internal-jobs/refresh-billing-customer-service-record-overdue.handler.ts` | new | Delegar job. |
| Composición | Módulo/configuración | `GlobalCqrsModule`: `src/modules/global-cqrs.module.ts` | modify | Registrar handlers. |
| Composición | Módulo/configuración | `package.json` | modify | Scripts de migración. |
| Localización | Traducción | `enums.json`: `src/internal/infra/i18n/locales/es/enums.json`, `src/internal/infra/i18n/locales/en/enums.json` | modify | Seis etiquetas de invoiceStatus. |
| Localización | Traducción | `errors.json`: `src/internal/infra/i18n/locales/es/errors.json`, `src/internal/infra/i18n/locales/en/errors.json` | modify | Conflicto de revisión y snapshot inexistente. |
| Documentación viva | Handoff frontend | `docs/frontend/customer-service-record-billing-handoff.md` | modify | Contratos y proyecciones de la vista administrativa, facturación y portal. |
| Documentación viva | Colección Postman | `docs/icsacv-api.postman_collection.json` | modify | Rutas nuevas y modificadas, cuerpos, permisos y ejemplos. |
| Documentación viva | Catálogo de permisos | `docs/authorization/feature-permission-catalog.md` | modify | Registrar operaciones nuevas bajo permisos existentes. |
| Documentación viva | Runbook | `docs/runbooks/internal-jobs.md` | modify | Ejecución manual y cursor del job nuevo. |

### Exports y composición

Todos estos archivos `index.ts` tienen tipo **barrel**, responsabilidad de exportar los artefactos nuevos de su directorio y dependencia de los archivos nombrados arriba; estado `modify` salvo donde se indica `new`:

| Ubicación exacta | Estado |
| --- | --- |
| `src/internal/domain/entities/index.ts` | modify |
| `src/internal/domain/policies/index.ts` | modify |
| `src/internal/domain/ports/repositories/customer-service-record-billing/index.ts` | modify |
| `src/internal/application/dto/customer-service-record-billing/index.ts` | modify |
| `src/internal/application/mappers/customer-service-record-billing/index.ts` | modify |
| `src/internal/application/use-cases/customer-service-record/index.ts` | modify |
| `src/internal/application/use-cases/customer-service-record-billing/index.ts` | modify |
| `src/internal/infra/persistence/mongoose/schemas/customer-service-record-billing/index.ts` | new |
| `src/internal/infra/persistence/mongoose/schemas/index.ts` | modify |
| `src/internal/infra/persistence/mongoose/repositories/customer-service-record-billing/index.ts` | modify |
| `src/internal/infra/api/dto/customer-service-record-billing/index.ts` | modify |
| `src/internal/infra/api/dto/internal-jobs/index.ts` | modify |
| `src/internal/infra/api/controllers/customer-service-record-billing/index.ts` | modify |
| `src/internal/infra/api/controllers/internal-jobs/index.ts` | modify |
| `src/internal/infra/api/presenters/customer-service-record-billing/index.ts` | modify |
| `src/internal/infra/cqrs/commands/customer-service-record-billing/index.ts` | modify |
| `src/internal/infra/cqrs/commands/internal-jobs/index.ts` | modify |
| `src/internal/infra/cqrs/queries/customer-service-record-billing/index.ts` | modify |

`GlobalApplicationModule` y `GlobalHttpModule` reutilizan sus registros automáticos vía barrels; no se modifican. No aplican nuevos eventos, permisos, seed ni integraciones externas. `CustomerServiceRecordInvoicePolicy` se exporta desde el barrel de políticas; sus métodos son puros y no se registra como provider.

También se reutilizan `IInternalJobLockRepository` y su adaptador Mongo, `ITransactionalExecutor`, `InternalJobsAuthGuard` y los permisos actuales; no se modifican sus archivos ni se crea seed.

### Endpoints, propiedad y composición CQRS

En la tabla de rutas anterior: el controller administrativo atiende los dos PATCH administrativos y sus handlers son `UpdateCustomerServiceRecordBillingStatusHandler` (existente, modificado) y `UpdateCustomerServiceRecordBillingInstructionsHandler` (nuevo); ambos requieren `customer_service_records:UPDATE`. El controller billing existente atiende `GET invoice-statuses/options` mediante `GetBillingCustomerServiceRecordInvoiceStatusOptionsHandler` (nuevo) y conserva las lecturas/escrituras actuales. El controller `Lifecycle` atiende PATCH details/status y PUT purchase-order con handlers homónimos nuevos; `Invoice` atiende complementos/archivo/historial; `Comment` atiende POST/GET de comentarios. Todos esos handlers viven en los archivos CQRS registrados arriba y usan `billing_customer_service_records:READ` para GET o `UPDATE` para escrituras. El controller del job atiende su único POST con `RefreshBillingCustomerServiceRecordOverdueHandler` y `InternalJobsAuthGuard`, sin permiso funcional. Las rutas fijas `invoice-statuses/options` se declaran antes de `GET :recordId`; el registro de controladores nuevos en `GlobalHttpModule` ocurre por los barrels, sin modificar ese módulo.

### Persistencia, índices y reversión

`customer_service_records` añade `billing` e `invoice_revision`; índice `(status, billing_status, billing.invoice_status, billing.estimated_payment_at, createdAt, customer_service_record_id)` para el job. `billing_record_archives` tiene índice único `(record_id, invoice_revision)` y otro `(record_id, archived_at, archive_id)` para paginación. `billing_record_comments` tiene `(record_id, createdAt, comment_id)` para paginación. El script histórico no crea índices; estos se declaran en schemas y se comprueba su creación según la configuración real de Mongoose. No se propone reversión automática que borre datos nuevos: ante falla de apply, conservar el reporte, corregir la causa y reejecutar idempotentemente; ante datos incorrectos, detener escrituras y preparar reparación acotada basada en la evidencia, ejecutada por el usuario.

## Contrato e Impacto Entre Repositorios

| Consumidor | Antes → después | Compatibilidad / acción | Documento y validación |
| --- | --- | --- | --- |
| `org-admin-suite-frontend`, vista administrativa | `PATCH billing-status` solo recibe estatus → acepta instrucciones opcionales; nuevo PATCH de instrucciones. | Body antiguo sigue válido; UI futura mostrará instrucciones en confirmación. | `docs/frontend/customer-service-record-billing-handoff.md`; validar petición vieja/nueva. |
| `org-admin-suite-frontend`, módulo de facturación | Detalle con factura/estado de envío → detalle con `billing` y complementos; nuevos endpoints de edición, comentarios e historial. | Campos existentes conservados; cliente nuevo debe adoptar recursos paginados y estados localizados. | Mismo handoff y Postman; validación manual de filtros, permisos, adjuntos y fechas. |
| Portal de clientes externo | Proyección acotada actual → igual. | Comentarios `EXTERNAL` no aparecen todavía; verificar ausencia. | Handoff y validación manual. |
| Invocador de internal jobs | Nuevo endpoint de vencimiento bajo token interno. | No altera el job operativo existente; usuario lo invoca manualmente. | `docs/runbooks/internal-jobs.md`, `docs/icsacv-api.postman_collection.json`; validar token, cursor e idempotencia. |

Cada endpoint nuevo o modificado se registra en `docs/icsacv-api.postman_collection.json` y en el handoff **durante su slice**, antes de cerrarla. `docs/authorization/feature-permission-catalog.md` se actualiza con las nuevas operaciones bajo permisos existentes; no cambia el catálogo de capabilities auxiliares derivadas. `docs/api-pipeline.md` no cambia porque el pipeline es el mismo.

## Validación prevista

Build/lint enfocado tras código. El usuario ejecuta dry-run, apply y dry-run de verificación en la base que elija; comprobar conteos e invariancia de auditoría. La matriz de `08-manual-validation.md` cubre contrato, errores, permisos, concurrencia, fechas, archivos, comentarios, archivo y job. No se añaden pruebas automatizadas por iniciativa propia.
