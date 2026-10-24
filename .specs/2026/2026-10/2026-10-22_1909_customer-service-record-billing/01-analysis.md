# Analisis del estado actual

## Modelo y persistencia

- `src/internal/domain/entities/customer-service-record.entity.ts`: el agregado tiene `status` (`ACTIVE`/`DELETED`), `operationalStatus` y un documento `invoice` con `referenceNumber`, `files` y `removedFiles`. No existe un estado de facturacion.
- `src/internal/infra/persistence/mongoose/schemas/customer-service-record/customer-service-record.schema.ts`: la coleccion `customer_service_records` usa timestamps de Mongoose; `invoice` es un subdocumento con defaults y puede existir sin una factura real.
- `src/internal/infra/persistence/mongoose/mappers/customer-service-record/mongoose-customer-service-record.mapper.ts` mapea el agregado a/desde la coleccion; application DTO, mapper y presenters deben incorporar el nuevo estado.
- `src/internal/infra/persistence/mongoose/migrations/migrate-customer-service-record-service-number-display.ts` ofrece el patron dry-run/apply/verificacion y actualizacion nativa con `$set`, sin tocar timestamps por middleware Mongoose. La nueva migracion debe ser idempotente y condicionada a ausencia del campo.

## Limites de autorizacion y API

- `src/internal/application/services/authz/authorization.catalog.ts`: `CUSTOMER_SERVICE_RECORDS` tiene `READ` y `UPDATE`; no existe modulo tecnico de facturacion. Las operaciones son por modulo; la agrupacion de submodulos de UI no existe en este catalogo.
- `src/internal/infra/api/controllers/customer-service-record/customer-service-record.controller.ts`: los segmentos de detalle, cliente, proveedor, equipos y documentos estan bajo `customer_service_records:UPDATE`. No se puede conceder este permiso solo para facturas.
- `src/internal/infra/api/controllers/customer-service-record-client-access/customer-service-record-client-access.controller.ts` es precedente de una superficie independiente sobre el mismo agregado. Tiene puertos, repositorio de lectura, queries, casos de uso y presenter propios para imponer su frontera de visibilidad.
- Sus rutas `customers/options` y `service-types/options` son auxiliares locales bajo el `READ` del propio modulo. El nuevo filtro por estado de facturacion seguira esa frontera en administracion y facturacion, sin crear una capability auxiliar derivada compartida: las opciones permitidas son distintas.
- `CustomerServiceRecordPresenter.toCollection()` produce filas con folio, tipo, cliente, equipos basicos, entrega, proveedor, estado operativo y timestamps. `toViewResponse()` extiende esa proyeccion con adjuntos de equipos, quotation, purchase_order, invoice y otros archivos. La paridad solicitada es listado con listado y detalle con detalle, no aplanar el detalle dentro de cada fila.
- `src/internal/application/use-cases/customer-service-record/update-customer-service-record-document.use-case.ts` reconcilia todos los tipos documentales en un mismo caso de uso. Facturacion no debe invocarlo como su flujo de negocio, porque admite tipos distintos de `invoice`; se puede reutilizar el servicio delimitado de reconciliacion de adjuntos.
- `CustomerServiceRecordAttachmentReconciliationService` comprueba existencia de los `file_id` nuevos y reconcilia los adjuntos, pero no verifica propiedad, origen ni autor del archivo. La spec no debe atribuirle esa garantia; la escritura de factura conserva el mismo contrato de adjuntos vigente.

## Internacionalizacion y notificacion

- El presenter administrativo devuelve `operational_status` mediante `{ code, name, name_key }`, con claves `CUSTOMER_SERVICE_RECORD.OPERATIONAL_STATUS.*`. `src/internal/infra/i18n/locales/es/enums.json` y `en/enums.json` contienen las traducciones.
- `src/internal/infra/env/env.ts` valida configuracion con Zod. `src/internal/infra/notification/services/aws-ses-email/ses-email.service.ts` muestra el adaptador de correo y acepta listas `to`/`cc` en otros flujos. La nueva notificacion debe tener un limite propio y variables tipadas; no copiar el hardcode de alertas de carga ZIP.
- `CustomerServiceRecordNotificationTriggerEventStatus` y `CustomerServiceRecordProviderFollowUpEventStatus` ya usan `PENDING`, `TRIGGERED`, `FAILED` e `INVALIDATED` en flujos operativos. No representan el aviso de envio a facturacion ni deben reutilizarse para ese proposito. El nuevo estado de aviso se modelara aparte y describira solo el ultimo intento.
- `serviceNumberDisplay`, `customer.customerName` y `assets[]` proporcionan los datos solicitados para el aviso. Un registro puede contener varios equipos. `operationalStatus` puede no ser `COMPLETED`, por lo que el texto del aviso no puede afirmar universalmente que el servicio se realizo.

## Riesgos

- Estado `SUBMITTED` e intento de correo no deben confundirse: persistir estado no prueba entrega de correo.
- La aceptacion por SES u otro proveedor no prueba entrega final al buzon; el contrato debe definir de manera precisa que significa `SENT`. Un estado unico del ultimo intento no constituye auditoria de todos los reenvios.
- `GlobalExceptionFilter` y `GlobalExceptionMapper` exponen `status_code`, `error_details.error_code` y mensaje obtenido de `ErrorMessageService` para excepciones de dominio. Un error dedicado al envio de aviso puede seguir este contrato con traducciones en `es` y `en`; no debe filtrar detalles sensibles del proveedor.
- Secuencia aprobada: intentar correo primero y persistir `SUBMITTED` junto con `SENT` solo tras aceptacion. Un rechazo del proveedor deja el estado anterior y registra `FAILED`. Si falla la escritura despues de un correo aceptado, el registro conserva el estado anterior y el API devuelve error; el usuario puede repetir la operacion. No se implementan rollback ni coordinacion distribuida en esta version.
- La migracion debe ignorar `removed_files` y distinguir archivos vigentes de referencia sola. No debe sobrescribir registros ya migrados ni actualizar auditoria.
- Las escrituras dirigidas nuevas deben conservar `updatedAt` y `updated_by` del actor como las ediciones ordinarias; solo la migracion historica excluye cambios de auditoria.
- El nuevo repositorio de lectura debe filtrar estado tecnico y de facturacion antes de contar, paginar y resolver detalle; ocultar solo en presenter filtraria demasiado tarde.
- La paridad de campos entre superficies administrativas y de facturacion debe verificarse expresamente; los presenters propios permiten evolucionar cada modulo mas adelante sin reutilizar sus casos de uso o controladores. El contrato de acceso de clientes tiene proyeccion limitada y no participa de esta paridad.
- Si se permite `NOT_SUBMITTED` en facturacion, el registro desaparece del modulo sin proceso de devolucion. Por eso la escritura de facturacion se limita a `SUBMITTED`/`INVOICED`; administracion conserva los tres.
