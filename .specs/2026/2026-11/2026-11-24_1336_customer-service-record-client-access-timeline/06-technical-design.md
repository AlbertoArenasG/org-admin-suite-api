# Diseño técnico

## Contrato e impacto entre repositorios

Consumidor: futuro frontend del portal, bajo `CUSTOMER_SERVICE_RECORDS_CLIENT_ACCESS/READ`. Antes: solo listado paginado y detalle. Después: `GET /v1/customer-service-records-client-access/timeline?from=2026-11-01&to=2026-11-30&match=periods&page=1&limit=10`. Valores date-only inclusivos; `match` opcional, por defecto `periods`; 42 días máximos. `limit`/`items_per_page` usan el DTO de paginación existente. Sin body. La ruta va antes de `:recordId`.

Respuesta: envelope común y `pagination`. Fila: `customer_service_record_id`, `service_number`, `service_number_display`, `service_type`, `requested_at`, `customer`, `assets` reducidos, `operational_status`, `customer_delivery.{received_at,estimated_delivery_at,status_materialization}`. Estado y source de materialización localizados como en la consulta administrativa; no existe campo `provider`. Sin datos de facturación, contactos, adjuntos ni notificaciones. Sin coincidencias: array vacío y total 0. Errores: 400 por rango/match/paginación; 401/403 por guard; 500 por error interno. Endpoint aditivo. El responsable de validar HTTP manualmente es el usuario. Handoff: `docs/frontend/customer-service-records-client-access-handoff.md`; Postman: `docs/icsacv-api.postman_collection.json`.

Mongo: `status: ACTIVE` y, para externos, `customer.customer_id ∈ relationship.customerIds` junto con `customer.users.user_id = actorUserId`. `periods` usa recepción o entrega estimada en rango o cruce de ambas; `customer_milestones` usa solo extremos. `find` y `countDocuments` comparten filtro; sort ID ascendente, skip y limit, select reducido y lean. No se comparten rutas ni permisos administrativos.

## Registro de Artefactos

| Artefacto | Tipo y ubicación | Responsabilidad | Dependencias | Estado |
| --- | --- | --- | --- | --- |
| `GetCustomerServiceRecordClientAccessTimelineRequestDto` | request DTO, `src/internal/infra/api/dto/customer-service-record-client-access/customer-service-record-client-access.request.dto.ts` | Validar rango, match, paginación y crear DTO de aplicación | `PaginationRequestDto`, class-validator | modify |
| `GetCustomerServiceRecordClientAccessTimelineDto`, `CustomerServiceRecordClientAccessTimelineViewDto` | DTOs, `src/internal/application/dto/customer-service-record-client-access/customer-service-record-client-access.dto.ts` | Tipar entrada y proyección sin proveedor | timeline match/materialization del puerto administrativo | modify |
| `FindCustomerServiceRecordClientAccessTimelineParams`, `CustomerServiceRecordClientAccessTimelineReadModel`, `findTimeline` | puerto, `src/internal/domain/ports/repositories/customer-service-record-client-access/customer-service-record-client-access-read.repository.ts` | Contrato de lectura acotada | tipos compartidos de fecha/materialización | modify |
| `GetCustomerServiceRecordClientAccessTimelineUseCase` | caso de uso, `src/internal/application/use-cases/customer-service-record-client-access/get-customer-service-record-client-access-timeline.use-case.ts` | Resolver alcance y mapear página | visibilidad, puerto, mapper | new |
| `CustomerServiceRecordClientAccessTimelineMapper` | mapper, `src/internal/application/mappers/customer-service-record-client-access/customer-service-record-client-access-timeline.mapper.ts` | Formatear folio y convertir read model a DTO | entidad de folio | new |
| `GetCustomerServiceRecordClientAccessTimelineQuery/Handler` | CQRS, `src/internal/infra/cqrs/queries/customer-service-record-client-access/customer-service-record-client-access.queries.ts` | Delegar en caso de uso | BaseQueryHandler | modify |
| `MongooseCustomerServiceRecordClientAccessReadRepositoryImpl.findTimeline` | repositorio, `src/internal/infra/persistence/mongoose/repositories/customer-service-record-client-access/mongoose-customer-service-record-client-access-read.repository.ts` | Filtrar, contar y paginar en Mongo | schema actual, filtro base de portal | modify |
| `CustomerServiceRecordClientAccessPresenter.toTimelineCollection` | presenter, `src/internal/infra/api/presenters/customer-service-record-client-access/customer-service-record-client-access.presenter.ts` | Serializar y localizar payload | EnumNameService | modify |
| `CustomerServiceRecordClientAccessController.findTimeline` | GET `/v1/customer-service-records-client-access/timeline`, `src/internal/infra/api/controllers/customer-service-record-client-access/customer-service-record-client-access.controller.ts` | Guard READ, despachar query, envelope paginado; antes de `:recordId` | JWT, PermissionsGuard, QueryBus, presenter | modify |
| `GlobalCqrsModule` | composición, `src/modules/global-cqrs.module.ts` | Registrar handler; el caso de uso se registra mediante el barrel existente de `GlobalApplicationModule` | DI existente | modify |
| `docs/frontend/customer-service-records-client-access-handoff.md` | handoff | Contrato para siguiente spec frontend | resultado real | modify |
| `docs/icsacv-api.postman_collection.json` | Postman | Request y respuestas ejemplo | contrato real | modify |
| `docs/authorization/feature-permission-catalog.md` | catálogo de permisos | Registrar la ruta bajo el READ existente | permiso actual | modify |
| Entidad, schema, índice, migración, seed, permiso/capability, middleware nuevo | dominio/persistencia/autorización | No hay escritura, cambio de datos ni permiso | componentes existentes | not_applicable |
| Verificación automatizada nueva | prueba | No se añaden suites por política vigente; build/lint y validación HTTP manual | usuario | not_applicable |

## Estrategia de validación

Compilación y lint enfocado verifican registro de DI y tipos. Inspección estática verifica ausencia de proveedor en select y presenter, y visibilidad en find/count. El usuario comprobará HTTP 200/400/401/403, rangos, cruce, extremos, paginación y staff/externo. No se inicia servidor ni se escriben datos por el agente.
