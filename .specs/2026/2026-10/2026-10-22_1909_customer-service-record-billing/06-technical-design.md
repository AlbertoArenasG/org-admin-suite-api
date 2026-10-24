# Diseno tecnico de backend

## Modelo y contrato comun de lectura

`CustomerServiceRecord` incorpora `billingStatus: NOT_SUBMITTED | SUBMITTED | INVOICED` y `billingNotification` con `status: NOT_REQUESTED | SENT | FAILED`, `attemptedAt`, `sentAt` y `failureReason` sanitizada. `billingStatus` vive al nivel de `operationalStatus`, no dentro de `invoice`; `billingNotification` es un objeto separado dentro del mismo registro y representa solo el ultimo intento, no un historial de entregas. En respuestas, `billing_status` y `billing_notification.status` son `{ code, name, name_key }` resueltos en presenter; fechas ISO/null y razon sanitizada/null. Los datos del objeto se reemplazan juntos en cada intento: `NOT_REQUESTED` deja fechas y causa en null; `SENT` guarda `attemptedAt` y `sentAt`, y limpia `failureReason`; `FAILED` guarda `attemptedAt` y causa sanitizada, y limpia `sentAt`. `SENT` significa aceptacion del proveedor, no entrega al buzon.

Nuevos registros: `NOT_SUBMITTED` y `NOT_REQUESTED`. La migracion historica escribe ambos campos solo cuando faltan. Para `billing_status`, `invoice.files` no vacio implica `INVOICED`; referencia sola, objeto vacio o `removed_files` sin vigentes implican `NOT_SUBMITTED`. No se infiere estado al guardar adjuntos despues de la migracion. Se usan operaciones nativas MongoDB `$set` condicionadas, sin Mongoose timestamps ni cambios a `updated_by`/`updatedAt`; segundo apply no escribe. Dry-run informa total, pendientes, clasificados por valor, referencia sola, solo removidos y estado ya existente; verificacion posterior confirma ausencia de faltantes y conserva snapshot de auditoria. El script no invoca el sender ni envia correos.

El listado administrativo mantiene su proyeccion actual mas los dos campos nuevos. El detalle administrativo mantiene su proyeccion actual (incluidos adjuntos/factura) mas los dos campos. Facturacion presenta exactamente los mismos campos por registro en listado y en detalle, respectivamente; no se agregan adjuntos de factura al listado. Cada modulo tiene DTO/mapper/presenter y casos de uso propios; la paridad se comprueba en validacion. El contrato de acceso de clientes no cambia.

## HTTP y autorizacion

Todas las rutas nuevas requieren JWT y `PermissionsGuard`; el listado administrativo existente conserva sus guards. El codigo tecnico del modulo nuevo es `BILLING_CUSTOMER_SERVICE_RECORDS`, decorador en minusculas `billing_customer_service_records`. El agrupador visual de frontend no es modulo de backend. La tabla contiene siete rutas nuevas y el GET administrativo existente que se extiende con el filtro.

| Metodo y ruta | Controlador -> CQRS -> caso de uso | Permiso | Entrada | Resultado |
| --- | --- | --- | --- | --- |
| `PATCH /v1/customer-service-records/:recordId/billing-status` | `CustomerServiceRecordController` -> `UpdateCustomerServiceRecordBillingStatusCommandAdapter` -> `UpdateCustomerServiceRecordBillingStatusUseCase` | `customer_service_records:UPDATE` | `{ billing_status: NOT_SUBMITTED | SUBMITTED | INVOICED }` | `200`, detalle administrativo actualizado |
| `GET /v1/customer-service-records` | `CustomerServiceRecordController` -> query/caso de uso existentes | `customer_service_records:READ` | Filtro nuevo `billing_status` opcional (`NOT_SUBMITTED`, `SUBMITTED` o `INVOICED`); parametros previos intactos | `200`, filas administrativas filtradas |
| `GET /v1/customer-service-records/billing-statuses/options` | `CustomerServiceRecordController` -> `GetCustomerServiceRecordBillingStatusOptionsQuery` -> `GetCustomerServiceRecordBillingStatusOptionsUseCase` | `customer_service_records:READ` | Sin query | `200`, tres opciones internacionalizadas |
| `GET /v1/billing/customer-service-records` | `BillingCustomerServiceRecordController` -> `GetBillingCustomerServiceRecordsQuery` -> `GetBillingCustomerServiceRecordsUseCase` | `billing_customer_service_records:READ` | `page`, `limit`/`items_per_page`, `search`, `billing_status` opcional (`SUBMITTED` o `INVOICED`) | `200`, envelope paginado y filas con misma proyeccion administrativa |
| `GET /v1/billing/customer-service-records/billing-statuses/options` | `BillingCustomerServiceRecordController` -> `GetBillingCustomerServiceRecordStatusOptionsQuery` -> `GetBillingCustomerServiceRecordStatusOptionsUseCase` | `billing_customer_service_records:READ` | Sin query | `200`, dos opciones internacionalizadas |
| `GET /v1/billing/customer-service-records/:recordId` | mismo controlador -> `GetBillingCustomerServiceRecordByIdQuery` -> `GetBillingCustomerServiceRecordByIdUseCase` | `billing_customer_service_records:READ` | `recordId` | `200`, detalle con misma proyeccion administrativa; `404` si no visible |
| `PATCH /v1/billing/customer-service-records/:recordId/billing-status` | mismo controlador -> `UpdateBillingCustomerServiceRecordStatusCommandAdapter` -> `UpdateBillingCustomerServiceRecordStatusUseCase` | `billing_customer_service_records:UPDATE` | `{ billing_status: SUBMITTED | INVOICED }` | `200`, detalle de facturacion actualizado |
| `PUT /v1/billing/customer-service-records/:recordId/invoice` | mismo controlador -> `UpdateBillingCustomerServiceRecordInvoiceCommandAdapter` -> `UpdateBillingCustomerServiceRecordInvoiceUseCase` | `billing_customer_service_records:UPDATE` | `{ reference_number: string | null, file_ids: string[] }` | `200`, detalle de facturacion actualizado |

La lectura de facturacion usa `status = ACTIVE` y `billing_status IN [SUBMITTED, INVOICED]` como filtro obligatorio en MongoDB antes de `countDocuments`, paginacion y consulta individual. La busqueda inicial cubre consecutivo, tipo de servicio, cliente, proveedor, nombre/identificador/marca de equipos como el listado administrativo; `billing_status` opcional solo estrecha la frontera obligatoria. Administracion acepta los tres estados como filtro sin cambiar sus demas filtros u ordenamientos. Ambos listados reutilizan `PaginationRequestDto` y `PaginationDefaultConfig`: pagina inicial 1, limite inicial 10, maximo 100 filas por pagina y validacion existente de pagina/limite. Un `billing_status` fuera de la lista permitida en cada modulo devuelve `400`; no se ignora ni se trata como listado vacio. Orden inicial de facturacion: `createdAt DESC`, `customer_service_record_id ASC` como desempate estable. No se interpreta "misma respuesta" como "mismos filtros u ordenamientos": esos contratos son independientes. Listado sin coincidencias devuelve `200`, `data: []` y paginacion normal. Se declara el indice `{ status: 1, billing_status: 1, createdAt: -1, customer_service_record_id: 1 }` en el schema; con la configuracion actual `autoIndex` de Mongoose lo crea al iniciar la API. La migracion no crea indices. Se verifica su presencia tras el arranque y se valida el plan de consulta despues con datos representativos.

Los dos GET de opciones son auxiliares locales, no capabilities derivadas. Cada uno usa el `READ` de su modulo y devuelve solo los codigos permitidos con `{ code, name, name_key }`, traducidos por su presenter a partir del mismo enum; no dependen de la cantidad de registros existentes. Se declaran antes de `GET :recordId` en sus controladores para que `billing-statuses/options` no se interprete como ID. El modulo administrativo puede consultar los tres valores; el de facturacion no puede solicitar `NOT_SUBMITTED` por un parametro alternativo.

Escritura de facturacion consulta primero la visibilidad del registro: ausente, eliminado o `NOT_SUBMITTED` responde `404`, incluso con ID conocido. `PATCH` de facturacion no acepta `NOT_SUBMITTED`; el DTO lo rechaza con `400`. `PUT invoice` siempre esta tipado a factura, no acepta `documentType`. Usa `CustomerServiceRecordAttachmentReconciliationService` para existencia y reconciliacion de `file_ids`, igual que el endpoint documental administrativo; el servicio actual no valida propiedad ni procedencia del archivo. Reemplaza el conjunto vigente segun `file_ids`, actualiza referencia y conteos relacionados, no cambia `billing_status`. La escritura dirigida de invoice vuelve a exigir `ACTIVE` y `SUBMITTED`/`INVOICED` en el filtro de Mongo para impedir una actualizacion si el registro pierde visibilidad entre lectura y escritura. Se preserva el endpoint documental administrativo existente.

Transiciones de administracion: cualquiera de los tres valores desde cualquier estado; facturacion: solo `SUBMITTED` e `INVOICED` en registros visibles. Un no-op con el mismo valor responde `200` sin escritura ni correo. Cambios a `INVOICED` o `NOT_SUBMITTED` no envian correo y conservan los datos del ultimo aviso. Una transicion real hacia `SUBMITTED` invoca el sender sincrono antes de guardar. En aceptacion, el repositorio guarda `SUBMITTED` y aviso `SENT` en la misma escritura; ante rechazo conocido guarda solo aviso `FAILED`, conserva el estado de facturacion anterior y lanza `BillingNotificationDeliveryException` (`502`, `BILLING_NOTIFICATION.DELIVERY_FAILED`, mensaje es/en). Errores del proveedor no se exponen al cliente; `failureReason` persistida es sanitizada. Si falla guardar despues de aceptacion, se devuelve error de persistencia y el estado previo permanece. El usuario puede repetir la solicitud; un segundo aviso es posible. No se agrega rollback, cola, reintento automatico o endpoint dedicado.

El puerto de escritura incorpora actualizaciones dirigidas y condicionales para estado/aviso e invoice, usando `recordId`, estado anterior esperado y/o frontera de visibilidad. Las transiciones exitosas y ediciones de invoice conservan la auditoria ordinaria del agregado (`updatedAt` y `updated_by`/`updatedBy` del actor); la migracion es la unica escritura de esta spec que debe preservarla intacta. No reemplaza todo el agregado durante la espera del correo. Si el estado cambia concurrentemente, la escritura no aplica y devuelve conflicto `409`; esto reduce sobrescrituras, aunque el aviso pudo haberse aceptado antes del conflicto. No introducir un agregado o coleccion de facturacion nuevos.

## Correo y configuracion

La aplicacion depende del puerto `ICustomerServiceRecordBillingNoticeSender` con payload de consecutivo, cliente y arreglo de equipos. El adaptador de infraestructura usa el `MailerService` configurado, construye texto seguro sin adjuntos y lee dos variables generales tipadas para avisos de facturacion: `BILLING_NOTIFICATION_RECIPIENTS_TO` y `BILLING_NOTIFICATION_RECIPIENTS_CC`. Se pueden compartir con futuros modulos de facturacion. Ambas son listas no vacias de correos, codificadas como CSV en entorno; se recortan espacios, validan direcciones y rechazan listas invalidas al iniciar. No se colocan valores concretos en esta spec ni en `.env.example`. El cuerpo dice que el registro fue enviado a facturacion, no que el servicio se completo; incluye numero/consecutivo, cliente y por cada equipo nombre, identificador, marca, modelo, serie y observaciones disponibles. El asunto incluye el consecutivo. El resultado aceptado por el proveedor se registra como `SENT`.

El helper de migraciones `loadMigrationEnv()` usa el `envSchema` completo. Si las variables de destinatarios ya se agregaron al schema cuando se ejecute dry-run/apply, deben estar presentes en ese entorno, aunque el script no envie correos. Antes de incorporar el sender, el schema vigente aun no las exige y la migracion puede ejecutarse. Deben configurarse en el entorno de la API antes del despliegue con el sender.

El sender es un adaptador tecnico compartido por los dos casos de uso de transicion; no comparte controlador, handler ni caso de uso. Las direcciones no atraviesan dominio ni aplicacion. La nueva excepcion es traducida por `GlobalExceptionMapper` y conservada en el envelope estandar: `success: false`, `status_code: 502`, `error_details.error_code`, `error_details.message`, `validation_errors: []`.

## Matriz de comportamiento y evidencia

| Caso | Respuesta / efecto | Evidencia |
| --- | --- | --- |
| GET administracion listado/detalle | Campos previos mas `billing_status` y `billing_notification`; factura sigue solo en detalle | Comparar JSON y claves previas |
| GET facturacion con READ | Misma proyeccion por tipo; solo `ACTIVE` + `SUBMITTED`/`INVOICED` antes de count/paginacion | Postman con registros de tres estados, eliminado y pages |
| GET facturacion sin coincidencias / ID oculto | `200` vacio con total 0 / `404` sin revelar existencia | Postman |
| GET opciones locales | Administracion devuelve tres estados y facturacion dos; JWT y `READ` del modulo respectivo | Postman con permisos separados |
| Filtro `billing_status` | Administracion admite tres valores; facturacion dos y siempre excluye `NOT_SUBMITTED`; valor no permitido devuelve `400` | Postman por modulo, con y sin filtro |
| Paginacion de facturacion | Por defecto pagina 1/10 filas; maximo 100 filas y validacion comun | Postman con defaults, maximo y valor invalido |
| Sin JWT / sin READ o UPDATE | `401` / `403` segun guard existente | Postman con roles distintos |
| Estado administrativo valido | `200`; los tres valores permitidos | Tres transiciones manuales |
| Estado facturacion valido / NOT_SUBMITTED enviado | `200` para SUBMITTED/INVOICED; `400` para NOT_SUBMITTED | Postman |
| Guardar mismo estado / editar invoice | `200`, sin correo por no-op; invoice no cambia estado | Stub/correo de prueba y lectura posterior |
| Transicion real a SUBMITTED y proveedor acepta | Correo con todos los equipos; `200`; estado SUBMITTED y aviso SENT | Mailbox de prueba y GET posterior |
| Proveedor rechaza | `502` traducido; estado anterior; aviso FAILED | Proveedor simulado y GET posterior |
| Nuevo intento tras SENT o FAILED anterior | El aviso expone solo fechas/causa del intento mas reciente; campos del resultado opuesto quedan null | Dos transiciones sucesivas y GET posterior |
| Proveedor acepta y Mongo falla | Error de persistencia; estado anterior; posible correo ya aceptado | Validacion controlada; documentar limite |
| Escritura concurrente del estado | `409` si estado esperado ya no coincide; no sobrescribir | Validacion controlada |
| Invoice valida/invalida | Solo invoice, conteos y auditoria ordinaria cambian / error estandar, sin cambio de estado; se exige existencia del `file_id`, no propiedad | Postman con IDs existentes e inexistentes |
| Migracion dry-run/apply/segundo dry-run | Clasificacion por archivos vigentes; auditoria intacta; idempotencia | Reportes y comparacion de documentos |
| Acceso de clientes | Sin campos ni permisos nuevos por esta spec | Comparar respuesta existente |

No aplican creacion/eliminacion desde facturacion, eventos de dominio nuevos, subida binaria directa por estas rutas ni cambio automatico de estado por adjuntos: el API actual de archivos sigue siendo la via de alta del `file_id`.

## Registro de Artefactos

Cada fila fija artefacto, tipo, ubicacion, responsabilidad, dependencias y estado. Los barrels se registran para evitar exports faltantes. Los nombres son propuestos para esta spec; cualquier desviacion durante implementacion actualiza este registro y `04-decisions.md` antes de crear codigo.

### Dominio

| Artefacto | Tipo | Ubicacion | Responsabilidad; dependencias | Estado |
| --- | --- | --- | --- | --- |
| `CustomerServiceRecord`, `CustomerServiceRecordBillingStatus`, `CustomerServiceRecordBillingNotificationStatus/Props` | entidad/enums | `src/internal/domain/entities/customer-service-record.entity.ts` | Defaults, transicion explicita y ultimo aviso; `Entity` | modify |
| `ICustomerServiceRecordBillingReadRepository`, token | puerto de lectura | `src/internal/domain/ports/repositories/customer-service-record-billing/customer-service-record-billing-read.repository.ts` | Listado/detalle filtrados; agregado | new |
| `ICustomerServiceRecordBillingNoticeSender`, token | puerto de notificacion | `src/internal/domain/ports/services/notification/customer-service-record-billing-notice.service.ts` | Contrato para envio de aviso sin transporte ni direcciones; payload de registro/equipos | new |
| `ICustomerServiceRecordReadRepository` | puerto de lectura administrativo | `src/internal/domain/ports/repositories/customer-service-record/customer-service-record-read.repository.ts` | Agregar filtro opcional de estado de facturacion al listado; agregado | modify |
| `ICustomerServiceRecordWriteRepository` | puerto de escritura | `src/internal/domain/ports/repositories/customer-service-record/customer-service-record-write.repository.ts` | Escritura condicional y dirigida de estado/aviso e invoice; agregado | modify |
| `BillingNotificationDeliveryException` | excepcion de dominio/contrato | `src/internal/domain/exceptions/billing-notification-delivery.exception.ts` | Codigo estable del fallo de aviso; `DomainException` | new |
| Export de entidad | barrel | `src/internal/domain/entities/index.ts` | Exportar enums/props del agregado; entidad | modify |
| Export de puerto read billing | barrel | `src/internal/domain/ports/repositories/customer-service-record-billing/index.ts` | Exportar puerto/token; puerto nuevo | new |
| Export de repositorios | barrel | `src/internal/domain/ports/repositories/index.ts` | Hacer disponible puerto billing; barrel nuevo | modify |
| Export de puerto notice | barrel | `src/internal/domain/ports/services/notification/index.ts` | Exportar sender/token; puerto nuevo | modify |
| Export de servicios | barrel | `src/internal/domain/ports/services/index.ts` | Propagar sender/token; barrel notification | modify |
| Export de excepcion | barrel | `src/internal/domain/exceptions/index.ts` | Exponer error dedicado; excepcion nueva | modify |

No se crean value objects, eventos de dominio ni agregado de facturacion adicionales (`not_applicable`): tres estados y el ultimo intento viven en el agregado existente; no hay flujo de publicacion diferida.

### Aplicacion

| Artefacto | Tipo | Ubicacion | Responsabilidad; dependencias | Estado |
| --- | --- | --- | --- | --- |
| `CustomerServiceRecordViewDto`, `GetCustomerServiceRecordsDto`, `UpdateCustomerServiceRecordBillingStatusDto` | DTO | `src/internal/application/dto/customer-service-record/customer-service-record.dto.ts` | Exponer nuevos campos, filtro de listado y comando administrativo; enums de dominio | modify |
| `CustomerServiceRecordMapper` | mapper | `src/internal/application/mappers/customer-service-record/customer-service-record.mapper.ts` | Proyectar estados nuevos; agregado | modify |
| `GetCustomerServiceRecordsUseCase` | caso de uso | `src/internal/application/use-cases/customer-service-record/get-customer-service-records.use-case.ts` | Pasar filtro de estado al puerto de lectura administrativo; DTO/puerto | modify |
| `UpdateCustomerServiceRecordBillingStatusUseCase` | caso de uso | `src/internal/application/use-cases/customer-service-record/update-customer-service-record-billing-status.use-case.ts` | Transicion administrativa, envio previo, persistencia/error; lectura/escritura y sender | new |
| `GetCustomerServiceRecordBillingStatusOptionsUseCase` | caso de uso | `src/internal/application/use-cases/customer-service-record/get-customer-service-record-billing-status-options.use-case.ts` | Entregar tres codigos permitidos; enum del agregado | new |
| `CustomerServiceRecordBillingViewDto`, DTOs de query/commands | DTO | `src/internal/application/dto/customer-service-record-billing/customer-service-record-billing.dto.ts` | Tipos propios del modulo con proyeccion equivalente; agregado/puertos | new |
| `CustomerServiceRecordBillingMapper` | mapper | `src/internal/application/mappers/customer-service-record-billing/customer-service-record-billing.mapper.ts` | Proyeccion propia de facturacion; agregado | new |
| `GetBillingCustomerServiceRecordsUseCase` | caso de uso | `src/internal/application/use-cases/customer-service-record-billing/get-billing-customer-service-records.use-case.ts` | Listado paginado visible con filtro permitido; puerto de lectura billing y mapper propio | new |
| `GetBillingCustomerServiceRecordByIdUseCase` | caso de uso | `src/internal/application/use-cases/customer-service-record-billing/get-billing-customer-service-record-by-id.use-case.ts` | Detalle visible o not found; puerto de lectura billing | new |
| `GetBillingCustomerServiceRecordStatusOptionsUseCase` | caso de uso | `src/internal/application/use-cases/customer-service-record-billing/get-billing-customer-service-record-status-options.use-case.ts` | Entregar solo SUBMITTED/INVOICED; enum del agregado | new |
| `UpdateBillingCustomerServiceRecordStatusUseCase` | caso de uso | `src/internal/application/use-cases/customer-service-record-billing/update-billing-customer-service-record-status.use-case.ts` | Transicion limitada y envio previo; puertos lectura/escritura/sender | new |
| `UpdateBillingCustomerServiceRecordInvoiceUseCase` | caso de uso | `src/internal/application/use-cases/customer-service-record-billing/update-billing-customer-service-record-invoice.use-case.ts` | Actualizar solo factura y conteos; lectura billing, escritura y reconciliacion | new |
| Export DTO billing | barrel | `src/internal/application/dto/customer-service-record-billing/index.ts` | Exportar DTO propios; DTO billing | new |
| Export DTO global | barrel | `src/internal/application/dto/index.ts` | Exponer DTO billing; barrel billing | modify |
| Export mapper billing | barrel | `src/internal/application/mappers/customer-service-record-billing/index.ts` | Exportar mapper billing; mapper propio | new |
| Export mapper global | barrel | `src/internal/application/mappers/index.ts` | Exponer mapper billing; barrel billing | modify |
| Export use cases billing | barrel | `src/internal/application/use-cases/customer-service-record-billing/index.ts` | Exportar cinco casos de uso; casos billing | new |
| Export use cases admin | barrel | `src/internal/application/use-cases/customer-service-record/index.ts` | Exportar transicion y opciones administrativas; casos nuevos | modify |
| Export use cases global | barrel | `src/internal/application/use-cases/index.ts` | Registrar casos por `GlobalApplicationModule`; barrels admin/billing | modify |

Se reutiliza sin modificar `CustomerServiceRecordAttachmentReconciliationService` en `src/internal/application/services/customer-service-record/customer-service-record-attachment-reconciliation.service.ts` (`reuse`). No se comparten casos de uso entre modulos; un servicio auxiliar de aplicacion nuevo es `not_applicable` porque el sender y la operacion dirigida del repositorio cubren las dependencias comunes reales.

### Infraestructura y composicion

| Artefacto | Tipo | Ubicacion | Responsabilidad; dependencias | Estado |
| --- | --- | --- | --- | --- |
| `CustomerServiceRecordDocument`, subdocumento de aviso e indice billing | schema/indice | `src/internal/infra/persistence/mongoose/schemas/customer-service-record/customer-service-record.schema.ts` | Campos, defaults e indice de lectura; entidad | modify |
| `MongooseCustomerServiceRecordMapper` | mapper | `src/internal/infra/persistence/mongoose/mappers/customer-service-record/mongoose-customer-service-record.mapper.ts` | Mapear estado/aviso en ambos sentidos; schema/entidad | modify |
| `MongooseCustomerServiceRecordWriteRepositoryImpl` | repositorio | `src/internal/infra/persistence/mongoose/repositories/customer-service-record/mongoose-customer-service-record-write.repository.ts` | Cambios condicionales/dirigidos de estado/aviso e invoice; schema | modify |
| `MongooseCustomerServiceRecordReadRepositoryImpl` | repositorio | `src/internal/infra/persistence/mongoose/repositories/customer-service-record/mongoose-customer-service-record-read.repository.ts` | Aplicar filtro de estado de facturacion al listado administrativo antes de count/paginacion; schema | modify |
| `MongooseCustomerServiceRecordBillingReadRepositoryImpl` | repositorio | `src/internal/infra/persistence/mongoose/repositories/customer-service-record-billing/mongoose-customer-service-record-billing-read.repository.ts` | Filtro obligatorio antes de count/paginacion/detalle; base repo/schema | new |
| Export repositorio billing | barrel | `src/internal/infra/persistence/mongoose/repositories/customer-service-record-billing/index.ts` | Exportar implementacion; repositorio billing | new |
| Export repositorios global | barrel | `src/internal/infra/persistence/mongoose/repositories/index.ts` | Propagar implementacion billing; barrel nuevo | modify |
| `MongooseRepositoriesConfig` | DI | `src/internal/infra/persistence/mongoose/repositories/mongoose-repositories.config.ts` | Vincular puerto billing a implementacion; `GlobalMongooseRepositoriesModule` | modify |
| `migrate-customer-service-record-billing` | migracion | `src/internal/infra/persistence/mongoose/migrations/migrate-customer-service-record-billing.ts` | Dry-run/apply/verificacion idempotente sin auditoria ni correo; no crea indices; Mongo nativo/shared utils | new |
| Comandos de migracion | scripts | `package.json` | Exponer `db:migrate:customer-service-record-billing:{dry-run,apply}`; script anterior | modify |
| `Env` | configuracion | `src/internal/infra/env/env.ts` | Validar listas TO/CC al arranque; Zod | modify |
| Ejemplo de entorno | configuracion | `.env.example` | Documentar nombres y formato CSV sin direcciones reales; Env | modify |
| Configuracion local real | configuracion | `.env` | Valores privados al implementar, no registrados en spec ni versionados; Env | modify (operacional) |
| Configuracion desplegada | configuracion externa | entorno Elastic Beanstalk | Valores privados TO/CC en despliegue; Env | modify (operacional) |
| `MailerCustomerServiceRecordBillingNoticeSender` | adaptador | `src/internal/infra/notification/services/customer-service-record-billing-notice.service.ts` | Enviar email sincrono con TO/CC de entorno; MailerService/EnvService/template | new |
| `customerServiceRecordBillingNoticeTemplate` | template | `src/internal/infra/notification/services/templates/customer-service-record-billing-notice.template.ts` | Asunto/texto con todos los equipos y sin adjuntos; payload del puerto | new |
| `GlobalNotificationModule` | DI | `src/modules/global-notification.module.ts` | Registrar/exportar token del sender billing; adaptador | modify |
| `GlobalCqrsModule` | DI CQRS | `src/modules/global-cqrs.module.ts` | Registrar cuatro query y tres command handlers nuevos; barrels | modify |
| `GlobalApplicationModule` | DI | `src/modules/global-application.module.ts` | Registro automatico de use cases por exports; confirmar en validacion | reuse |
| `GlobalHttpModule` | DI | `src/modules/global-http.module.ts` | Registro automatico de controllers/presenters por exports; confirmar en validacion | reuse |
| `systemRolesSeed` | seed | `src/internal/infra/persistence/mongoose/seeds/roles/system-roles.seed.ts` | Deriva permisos de `AUTHORIZATION_CATALOG`; ejecutar, no modificar algoritmo | reuse |

No hay coleccion nueva ni integracion con proveedor de facturacion externo (`not_applicable`). La creacion del indice corresponde a Mongoose al iniciar la API con `autoIndex` habilitado, como en la configuracion actual; se comprueba que exista despues del despliegue y se valida con `explain`/volumen representativo. No se condiciona su declaracion a datos que aun no existen.

### HTTP, CQRS, autorizacion y documentacion

| Artefacto | Tipo | Ubicacion | Responsabilidad; dependencias | Estado |
| --- | --- | --- | --- | --- |
| `CustomerServiceRecordController` | controlador | `src/internal/infra/api/controllers/customer-service-record/customer-service-record.controller.ts` | Agregar PATCH de estado y GET local de opciones antes de `:recordId`; extender filtro del listado; guard/command/query/presenter | modify |
| `GetCustomerServiceRecordsRequestDto`, `UpdateCustomerServiceRecordBillingStatusRequestDto` | request DTO | `src/internal/infra/api/dto/customer-service-record/customer-service-record.request.dto.ts` | Validar filtro administrativo y los tres valores del comando; enum | modify |
| `UpdateCustomerServiceRecordBillingStatusCommandAdapter/Handler` | command/handler | `src/internal/infra/cqrs/commands/customer-service-record/customer-service-record.commands.ts` | Despachar caso de uso administrativo; DTO | modify |
| `GetCustomerServiceRecordsQuery/Handler`, `GetCustomerServiceRecordBillingStatusOptionsQuery/Handler` | query/handler | `src/internal/infra/cqrs/queries/customer-service-record/customer-service-record.queries.ts` | Pasar filtro al listado y despachar opciones administrativas; casos propios | modify |
| `BillingCustomerServiceRecordController` | controlador | `src/internal/infra/api/controllers/customer-service-record-billing/billing-customer-service-record.controller.ts` | Cinco rutas del modulo billing, guard/DTO/CQRS/presenter; opciones antes de `:recordId` | new |
| `GetBillingCustomerServiceRecordsRequestDto`, `UpdateBillingCustomerServiceRecordStatusRequestDto`, `UpdateBillingCustomerServiceRecordInvoiceRequestDto` | request DTO | `src/internal/infra/api/dto/customer-service-record-billing/customer-service-record-billing.request.dto.ts` | Filtros/paginacion y cuerpos restringidos; DTO de aplicacion | new |
| `BillingCustomerServiceRecordPresenter` | presenter | `src/internal/infra/api/presenters/customer-service-record-billing/billing-customer-service-record.presenter.ts` | Contrato de lista/detalle paritario y dos opciones i18n; DTO/env/i18n | new |
| `CustomerServiceRecordPresenter` | presenter | `src/internal/infra/api/presenters/customer-service-record/customer-service-record.presenter.ts` | Agregar dos campos internacionalizados a lista/detalle y tres opciones; DTO/i18n | modify |
| `GetBillingCustomerServiceRecordsQuery/Handler`, `GetBillingCustomerServiceRecordByIdQuery/Handler`, `GetBillingCustomerServiceRecordStatusOptionsQuery/Handler` | query/handler | `src/internal/infra/cqrs/queries/customer-service-record-billing/customer-service-record-billing.queries.ts` | Despachar listado, detalle y opciones propios; DTO | new |
| `UpdateBillingCustomerServiceRecordStatusCommandAdapter/Handler`, `UpdateBillingCustomerServiceRecordInvoiceCommandAdapter/Handler` | command/handler | `src/internal/infra/cqrs/commands/customer-service-record-billing/customer-service-record-billing.commands.ts` | Despachar escrituras propias; DTO | new |
| `BillingNotificationDeliveryException` mapping | filtro | `src/internal/infra/api/filters/global-exception.mapper.ts` | Mapear codigo dedicado a `502`; excepcion/i18n | modify |
| `AUTHORIZATION_CATALOG.BILLING_CUSTOMER_SERVICE_RECORDS` | permiso | `src/internal/application/services/authz/authorization.catalog.ts` | Operaciones READ y UPDATE; guards, catalogo y seed automatico | modify |
| Traducciones de estados/modulo ES | i18n | `src/internal/infra/i18n/locales/es/enums.json` | Nombres de valores y modulo; presenters | modify |
| Traducciones de estados/modulo EN | i18n | `src/internal/infra/i18n/locales/en/enums.json` | Nombres de valores y modulo; presenters | modify |
| Traduccion de error ES | i18n | `src/internal/infra/i18n/locales/es/errors.json` | Mensaje de fallo del aviso; filtro | modify |
| Traduccion de error EN | i18n | `src/internal/infra/i18n/locales/en/errors.json` | Mensaje de fallo del aviso; filtro | modify |
| Export controller billing | barrel | `src/internal/infra/api/controllers/customer-service-record-billing/index.ts` | Exportar controlador; controller billing | new |
| Export controllers global | barrel | `src/internal/infra/api/controllers/index.ts` | Registrar controlador por `GlobalHttpModule`; barrel billing | modify |
| Export request DTO billing | barrel | `src/internal/infra/api/dto/customer-service-record-billing/index.ts` | Exportar request DTOs; DTO billing | new |
| Export request DTO global | barrel | `src/internal/infra/api/dto/index.ts` | Propagar request DTOs; barrel billing | modify |
| Export presenter billing | barrel | `src/internal/infra/api/presenters/customer-service-record-billing/index.ts` | Exportar presenter; presenter billing | new |
| Export presenters global | barrel | `src/internal/infra/api/presenters/index.ts` | Registrar presenter por `GlobalHttpModule`; barrel billing | modify |
| Export queries billing | barrel | `src/internal/infra/cqrs/queries/customer-service-record-billing/index.ts` | Exportar tres queries/handlers; queries billing | new |
| Export queries admin | barrel | `src/internal/infra/cqrs/queries/customer-service-record/index.ts` | Exportar query/handler de opciones administrativas; queries admin | modify |
| Export queries global | barrel | `src/internal/infra/cqrs/queries/index.ts` | Propagar handlers nuevos de ambos modulos; barrels admin/billing | modify |
| Export commands billing | barrel | `src/internal/infra/cqrs/commands/customer-service-record-billing/index.ts` | Exportar dos commands/handlers; commands billing | new |
| Export commands global | barrel | `src/internal/infra/cqrs/commands/index.ts` | Propagar dos handlers; barrel billing | modify |
| Postman collection | verificacion/API | `docs/icsacv-api.postman_collection.json` | Requests/ejemplos de siete rutas nuevas, listado administrativo extendido, permisos/errores/filtros | modify |
| Handoff de facturacion | documentacion viva | `docs/frontend/customer-service-record-billing-handoff.md` | Contrato de frontend, paridad, permisos, filtros y opciones; endpoints | new |
| Catalogo de permisos | documentacion viva | `docs/authorization/feature-permission-catalog.md` | Nuevo modulo READ/UPDATE, PATCH administrativo y dos auxiliares locales bajo READ; catalogo/API | modify |

Guard/decorador `JwtAuthGuard`, `PermissionsGuard` y `RequirePermission` se reutilizan sin modificar (`reuse`), ubicados en `src/internal/infra/api/guards/` y `src/common/decorators/`. Los GET de opciones son auxiliares locales protegidos por el `READ` directo del modulo respectivo; no se crea operacion global nueva, capability auxiliar derivada, rol personalizado, seed nuevo ni ruta publica (`not_applicable`): READ/UPDATE existentes bastan; el seed de roles de sistema consume el catalogo. No se elimina artefacto legacy ni se requiere compatibilidad temporal especial (`not_applicable`): las rutas previas permanecen. No hay limpieza diferida en esta spec; funcionalidades futuras de devolucion y frontend son iniciativas independientes, no tareas implicitas de cierre.

## Verificacion y gate

Artefactos de verificacion: matriz de este documento, requests/ejemplos Postman y `05-progress.md` (`modify`); pruebas automatizadas nuevas: `not_applicable` por alcance manual acordado, sin dispensar build, lint y validacion HTTP. Comandos previstos: `npm run build`, `npm run lint` (revisar diff porque puede formatear), los dos comandos de migracion y `npm run db:seed:roles` en orden documentado. La persona usuaria aprobo este diseno y la lista de artefactos al autorizar `Implementation ready: yes` el 2026-10-24. Antes de codigo, debe autorizar la implementacion o slice concreta.
