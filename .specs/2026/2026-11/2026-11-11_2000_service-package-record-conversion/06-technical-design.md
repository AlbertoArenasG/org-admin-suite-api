# Diseño técnico

## Contrato

`POST /v1/service-packages/records/:recordId/customer-service-records` — `ServicePackageRecordConversionController`, JWT + `PermissionsGuard` + `service_packages:CONVERT`; respuesta 201 en `ApiResponseBuilder`. El handler delega en `ConvertServicePackageRecordUseCase`; ruta específica antes de `:recordId` genérico. Body: `{ records: [{ equipment_index, customer: {customer_id, customer_user_ids}, service_type_code, requested_at, received_at?, asset: {name, identifier, brand, model, serial_number, observations?}, photo_file_ids: [] }] }`. La entrada debe cubrir exactamente los índices `0..equipment.length-1` una vez cada uno; las fotos deben pertenecer al origen y ser imágenes. Se permite asignar una foto a dos equipos creando una copia independiente para cada destino. `received_at` usa `visitDate` de origen si se omite; se exige fecha válida si ambos faltan.

Respuesta: `{ source_record_id, service_order, records: [{ equipment_index, customer_service_record_id, service_number, service_number_display }] }`. Origen inexistente 404; convertido/eliminado 409; cuerpo inválido 400; catálogos inválidos según excepciones existentes. Segunda solicitud concurrente no puede confirmar la transición condicional del origen. No se crea endpoint nuevo en acceso de cliente.

## Datos y efectos

`service_package_records.converted_to_customer_service_records` booleano default false. `customer_service_records.source_service_package_record_id` y `.source_service_order` strings nullable default null. Migración con Mongo nativo `$set` solo de campos faltantes, sin alterar auditoría. El origen se marca dentro de la misma transacción que crea destinos y File. S3 copia fotos a `uploads/{fileId}/...` antes de la transacción; ante fallo se intenta eliminar únicamente las claves nuevas y se registran los fallos de limpieza. Los originales permanecen.

## Registro de Artefactos

Cada fila indica ruta exacta, rol, responsabilidad, dependencia y estado. Los `index.ts` de carpetas nuevas se incluyen para exportar su artefacto.

| Artefacto / ubicación | Rol y responsabilidad | Dependencias | Estado |
| --- | --- | --- | --- |
| `ServicePackageRecord` — `src/internal/domain/entities/service-package-record.entity.ts` | Entidad: estado de conversión | Ninguna | modify |
| `CustomerServiceRecord` — `src/internal/domain/entities/customer-service-record.entity.ts` | Entidad: dos referencias nullable | Ninguna | modify |
| `StateConflictExceptionCode` — `src/internal/domain/exceptions/state-conflict.exception.ts` | Errores de origen convertido o inactivo | Dominio | modify |
| `IServicePackageRecordWriteRepository` — `src/internal/domain/ports/repositories/service-package-record/service-package-record-write.repository.ts` | Puerto: claim condicional | Entidad origen | modify |
| `IFileStorageService` — `src/internal/domain/ports/services/file-storage/file-storage.service.ts` | Puerto: copiar/eliminar objeto | S3 | modify |
| `IFileWriteRepository` — `src/internal/domain/ports/repositories/file/file-write.repository.ts` | Puerto de creación de entidad File | File | reuse |
| `ICustomerServiceRecordWriteRepository` — `src/internal/domain/ports/repositories/customer-service-record/customer-service-record-write.repository.ts` | Puerto de creación destino | CustomerServiceRecord | reuse |
| `ConvertServicePackageRecordDto` — `src/internal/application/dto/service-package-conversion/convert-service-package-record.dto.ts` | DTO: entrada/salida de aplicación | Tipos de dominio | new |
| `src/internal/application/dto/service-package-conversion/index.ts` | Export DTO | DTO nuevo | new |
| `ConvertServicePackageRecordUseCase` — `src/internal/application/use-cases/service-package-conversion/convert-service-package-record.use-case.ts` | Caso de uso: validar y orquestar | Repos, servicio de fotos, preparación, transacción | new |
| `src/internal/application/use-cases/service-package-conversion/index.ts` | Export caso de uso | Caso de uso nuevo | new |
| `ServicePackageConversionPhotoService` — `src/internal/application/services/service-package-conversion/service-package-conversion-photo.service.ts` | Copiar fotos, crear entidades File en memoria y limpiar claves nuevas ante error | Puerto de almacenamiento | new |
| `src/internal/application/services/service-package-conversion/index.ts`, `src/internal/application/services/index.ts` | Exportar servicio especializado a composición global | Servicio de fotos | new/modify |
| `CustomerServiceRecordInputPreparationService` — `src/internal/application/services/customer-service-record/customer-service-record-input-preparation.service.ts` | Validar cliente, usuarios y tipo | Repos de catálogos | reuse |
| `ServicePackageRecordViewDto` — `src/internal/application/dto/service-package/service-package-record.dto.ts` | DTO de lectura: booleano | Mapper | modify |
| `CustomerServiceRecordViewDto` — `src/internal/application/dto/customer-service-record/customer-service-record.dto.ts` | DTO de lectura: referencias | Mapper | modify |
| `BillingCustomerServiceRecordViewDto` — `src/internal/application/dto/customer-service-record-billing/billing-customer-service-record.dto.ts` | DTO de lectura de facturación: referencias | Mapper | modify |
| `ServicePackageRecordMapper` — `src/internal/application/mappers/service-package/service-package-record.mapper.ts` | Mapear booleano | Entidad origen | modify |
| `CustomerServiceRecordMapper` — `src/internal/application/mappers/customer-service-record/customer-service-record.mapper.ts` | Mapear referencias | Entidad destino | modify |
| `BillingCustomerServiceRecordMapper` — `src/internal/application/mappers/customer-service-record-billing/billing-customer-service-record.mapper.ts` | Mapear referencias para facturación | Entidad destino | modify |
| `ServicePackageRecordDocument` — `src/internal/infra/persistence/mongoose/schemas/service-package/service-package-record.schema.ts` | Schema: booleano | Mongoose | modify |
| `CustomerServiceRecordDocument` — `src/internal/infra/persistence/mongoose/schemas/customer-service-record/customer-service-record.schema.ts` | Schema: referencias nullable | Mongoose | modify |
| `MongooseServicePackageRecordMapper` — `src/internal/infra/persistence/mongoose/mappers/service-package/mongoose-service-package-record.mapper.ts` | Persistir booleano | Schema origen | modify |
| `MongooseCustomerServiceRecordMapper` — `src/internal/infra/persistence/mongoose/mappers/customer-service-record/mongoose-customer-service-record.mapper.ts` | Persistir referencias | Schema destino | modify |
| `MongooseServicePackageRecordWriteRepositoryImpl` — `src/internal/infra/persistence/mongoose/repositories/service-package/mongoose-service-package-record-write.repository.ts` | Claim con filtro false y sesión | MongooseTransactionContext | modify |
| `MongooseFileWriteRepositoryImpl` — `src/internal/infra/persistence/mongoose/repositories/file/mongoose-file-write.repository.ts` | Create con sesión | MongooseTransactionContext | modify |
| `S3FileStorageService` — `src/internal/infra/services/file-storage/s3-file-storage.service.ts` | copyObject/deleteObject | AWS S3 | modify |
| `migrate-service-package-record-conversion.ts` — `src/internal/infra/persistence/mongoose/migrations/migrate-service-package-record-conversion.ts` | Migración dry-run/apply/verify sin auditoría | MongoDB | new |
| `ConvertServicePackageRecordRequestDto` — `src/internal/infra/api/dto/service-package-conversion/convert-service-package-record.request.dto.ts` | Request HTTP validado | class-validator | new |
| `src/internal/infra/api/dto/service-package-conversion/index.ts` | Export request | DTO nuevo | new |
| `ConvertServicePackageRecordCommandAdapter/Handler` — `src/internal/infra/cqrs/commands/service-package-conversion/convert-service-package-record.handler.ts` | CQRS delega | Caso de uso | new |
| `src/internal/infra/cqrs/commands/service-package-conversion/index.ts` | Export CQRS | Handler | new |
| `ServicePackageRecordConversionController` — `src/internal/infra/api/controllers/service-package-conversion/service-package-record-conversion.controller.ts` | POST protegido | CommandBus, presenter | new |
| `src/internal/infra/api/controllers/service-package-conversion/index.ts` | Export controller | GlobalHttpModule | new |
| `ServicePackageRecordConversionPresenter` — `src/internal/infra/api/presenters/service-package-conversion/service-package-record-conversion.presenter.ts` | Presentar resultado | DTO resultado | new |
| `src/internal/infra/api/presenters/service-package-conversion/index.ts` | Export presenter | Controller | new |
| `ServicePackagePresenter` — `src/internal/infra/api/presenters/service-package/service-package.presenter.ts` | Booleano en lista/detalle | ViewDto origen | modify |
| `CustomerServiceRecordPresenter` — `src/internal/infra/api/presenters/customer-service-record/customer-service-record.presenter.ts` | Referencias en lista/detalle | ViewDto destino | modify |
| `BillingCustomerServiceRecordPresenter` — `src/internal/infra/api/presenters/customer-service-record-billing/billing-customer-service-record.presenter.ts` | Referencias en lista/detalle de facturación | ViewDto destino | modify |
| `CustomerServiceRecordServiceTypeController` — `src/internal/infra/api/controllers/customer-service-record-service-type/customer-service-record-service-type.controller.ts` | Guard auxiliar en options | Capability | modify |
| `AUTHORIZATION_CATALOG` — `src/internal/application/services/authz/authorization.catalog.ts` | `SERVICE_PACKAGES.CONVERT` | Operaciones | modify |
| `AUTHORIZATION_OPERATIONS` — `src/internal/application/services/authz/authorization-operations.catalog.ts` | Operación CONVERT | i18n | modify |
| `AUXILIARY_CAPABILITIES_CATALOG` — `src/internal/application/services/authz/auxiliary-capabilities/auxiliary-capabilities.catalog.ts` | Tipo READ_OPTIONS | Guard | modify |
| `AUXILIARY_CAPABILITIES_DERIVATION_CATALOG` — `src/internal/application/services/authz/auxiliary-capabilities/auxiliary-capabilities-derivation.catalog.ts` | Clientes/usuarios/tipos para service packages y billing; tipos para administración | Seed roles | modify |
| `enums.json` — `src/internal/infra/i18n/locales/es/enums.json`, `src/internal/infra/i18n/locales/en/enums.json` | Traducción de CONVERT | Catálogo permisos | modify |
| `errors.json` — `src/internal/infra/i18n/locales/es/errors.json`, `src/internal/infra/i18n/locales/en/errors.json` | Mensajes de conflicto del origen | Excepciones de dominio | modify |
| `src/modules/global-cqrs.module.ts` | Registrar handler | CQRS | modify |
| `src/internal/application/dto/index.ts`, `src/internal/application/use-cases/index.ts`, `src/internal/infra/api/dto/index.ts`, `src/internal/infra/cqrs/commands/index.ts`, `src/internal/infra/api/controllers/index.ts`, `src/internal/infra/api/presenters/index.ts` | Barrels de composición | Módulos globales | modify |
| `package.json` | Scripts de migración y dry run del seed de roles | ts-node | modify |
| `src/internal/infra/persistence/mongoose/seeds/run-role-seeds.ts`, `src/internal/infra/persistence/mongoose/seeds/roles/system-roles.seed.ts`, `src/internal/infra/persistence/mongoose/seeds/shared/mongoose-seed.runner.ts`, `src/internal/infra/persistence/mongoose/seeds/shared/mongoose-seed.types.ts`, `src/internal/infra/persistence/mongoose/seeds/shared/mongoose-seed.utils.ts` | Dry run de roles de solo lectura y reporte previo a la aplicación | Roles existentes | modify |
| `docs/authorization/feature-permission-catalog.md`, `docs/authorization/auxiliary-capabilities-mapping.md` | Reglas vivas de autorización | Catálogos | modify |
| `docs/frontend/service-package-record-conversion-handoff.md` | Contrato para futura UI | Endpoint | new |
| `docs/icsacv-api.postman_collection.json` | Request de Postman | HTTP | modify |
| `.specs/index.md` | Estado de iniciativa | Spec | modify |

Eventos, nuevas entidades, value objects, índices, frontend, endpoints de portal, notificaciones, artefactos legacy y limpieza diferida: `not_applicable` por alcance. `GlobalApplicationModule` y `GlobalHttpModule`: `reuse` vía exports. Pruebas automatizadas: `not_applicable` por instrucción expresa del usuario. La migración y el seed fueron ejecutados por el agente con autorización excepcional del usuario.
