# Technical Design

## Ampliacion aprobada: staff interno

Regla vigente (sustituye la frontera universal descrita originalmente):
los cuatro GET conservan JWT, READ y status tecnico ACTIVE. Si el usuario
persistido tiene isInternalStaff=true, se omiten las condiciones de relacion
usuario-cliente y pertenencia a customer.users. Para externos ambas siguen
siendo obligatorias. Filtros, lookup contextual y proyecciones no cambian.

El servicio CustomerServiceRecordClientAccessVisibilityService reutiliza
IUserReadRepository.findById y resuelve en cada consulta
{ customerIds, isInternalStaff }. No confia en query params ni en un flag del JWT.
Para staff no consulta relaciones; usuario inexistente produce contexto
restringido vacio. No se deriva staff del rol.

Artefactos modificados: servicio de visibilidad, puerto de lectura (flag interno
obligatorio en listado/options/detalle), sus cuatro casos de uso y repositorio
Mongoose. Se reutiliza sin cambios IUserReadRepository en
src/internal/domain/ports/repositories/user/user-read.respository.ts y su token.
No se crean nuevas clases, permisos, schemas o migraciones.

Criterios adicionales: staff sin relaciones ni snapshot puede consultar todos
los registros ACTIVE; externos mantienen ambas condiciones; staff tampoco ve
eliminados ni campos internos. Un filtro de cliente sigue reduciendo resultados.
Ambos lookups siguen la busqueda y los filtros excepto el propio. Cambiar staff
en persistencia cambia el alcance de la siguiente consulta sin emitir otro JWT.
Verificar manualmente con dos usuarios y registrar evidencia en 05.

## Module Identity

- Catalog module: `CUSTOMER_SERVICE_RECORDS_CLIENT_ACCESS`.
- Initial operation: `READ`.
- Authorization copy: `Acceso de clientes a registros de servicio`.
- UI copy: `Seguimiento de servicios`.

## Acceptance Criteria And Behavior Matrix

| Flow | Preconditions and input | Observable result | Evidence |
| --- | --- | --- | --- |
| List | JWT and `READ`; active relation, record snapshot and `ACTIVE` status match | `200`, paginated visible projection only | Postman and manual validation |
| List without matches | No active relations or filters have no visible matches | `200`, `data: []`, normal pagination with `total: 0` | Postman and manual validation |
| Detail | Same visibility fence and visible ID | `200`, detail projection without internal or Provider data | Postman and manual validation |
| Hidden detail | Missing, deleted, unrelated, or actor absent from snapshot | `404`; existence is not revealed | Postman and manual validation |
| Options | Same fence plus contextual public filters | `200`, non-paginated contextual options; no `meta` or pagination | Postman and manual validation |
| Invalid range | lower date is after upper date | Existing validation envelope with `400` | Postman and manual validation |
| Missing permission | JWT without module `READ` | Existing authorization denial behavior | Postman and manual validation |

No events, writes, migrations, backfills, transactions, or external integrations
are part of the module. The aggregate and existing administrative endpoints keep
their contracts unchanged.

## Read Flows

## Persistence And Read Port

Se creara `ICustomerServiceRecordClientAccessReadRepository`, separado de
`ICustomerServiceRecordReadRepository`. Ambos pueden usar el modelo Mongoose y
el mapper existentes de `customer_service_records`, pero no comparten metodos
de consulta: la frontera por cliente pertenece exclusivamente al puerto nuevo.

El puerto dedicado incorporara operaciones para listado paginado, detalle por
ID y lookup `distinct` de Clientes. Sus parametros incluiran el contexto de
visibilidad aprobado para el actor, junto con los filtros publicos permitidos.

Antes de invocar ese puerto, los casos de uso resuelven los Clientes vigentes
del actor mediante `IUserCustomerRelationshipReadRepository.findByUserId`. Si
no hay relaciones, devuelven resultados vacios o `404` sin ejecutar consultas
sobre registros. El puerto recibe los IDs vigentes y exige ademas que
`customer.users.user_id` contenga al actor.

## Index Strategy

El MVP reutiliza el indice existente de `customer_service_records`:

```text
{ status: 1, 'customer.users.user_id': 1, createdAt: -1 }
```

No se agrega un indice compuesto preventivo para los IDs de Cliente vigentes.
La validacion posterior revisara el plan de ejecucion con datos representativos
antes de decidir una optimizacion de persistencia.

### List

El listado recibe `actorUserId`, filtros visibles, pagina y ordenamientos. La
consulta de persistencia aplica la frontera de acceso junto con todos los
filtros permitidos antes de ejecutar `countDocuments`, `skip` y `limit`.
Si no existen Clientes vigentes o coincidencias visibles, responde la coleccion
vacia con paginacion normal y total cero.

### Detail

El detalle recibe `actorUserId` y `recordId`, aplica la misma frontera y
devuelve not found cuando no existe, esta eliminado o no es visible para el
actor.

### Customer Lookup

El lookup recibe la misma busqueda y filtros visibles del listado y devuelve
Clientes distintos que aparezcan en los registros activos y visibles resultantes
para el actor. No consulta las relaciones usuario-cliente como fuente
independiente de opciones. Al calcular sus opciones, ignora exclusivamente el
filtro `customer_id`; conserva tipo de servicio, busqueda y rangos de fecha.

### Service Type Lookup

El lookup de tipos devuelve valores distintos existentes en registros activos y
visibles para el actor. Replica la busqueda y filtros activos, e ignora solo
`service_type_code`. No consume el catalogo global de tipos como fuente de
opciones.

Las rutas de opciones son:

```text
GET /v1/customer-service-records-client-access/customers/options
GET /v1/customer-service-records-client-access/service-types/options
```

Ambas requieren `CUSTOMER_SERVICE_RECORDS_CLIENT_ACCESS/READ`.

Ambos lookups aceptan `search`, `customer_id`, `service_type_code` y los rangos visibles `received_at` y
`estimated_customer_delivery_at`; no aceptan `page`, `limit` ni `sort`. El
lookup de Clientes omite `customer_id` y el de tipos omite
`service_type_code` al construir su consulta.

Las opciones de Clientes se ordenan por `name asc`, `customer_id asc`; las de
tipos por `name asc`, `service_type_code asc`. No reciben ordenamiento publico.
Ambos devuelven todas las opciones coincidentes sin paginacion ni limite
artificial, usando el envelope estandar de options sin `pagination` ni `meta`
adicional.

Cada opcion de Cliente conserva el contrato existente de selects de Clientes:
`{ customer_id, company_name }`. Cada opcion de tipo conserva el contrato de
options de tipos de servicio: `{ code, name }`. El origen de ambas opciones es
contextual al actor y a los filtros activos, pero su nomenclatura publica no
crea un formato nuevo.

## Visible Projection

### List

El listado expone folio, Cliente, tipo de servicio, equipos, observaciones,
`received_at`, `estimated_delivery_at` y
`delivered_to_customer_at`. No expone `requested_at`, usuarios asociados, el
bloque completo de compromiso ni el semaforo materializado.

Conserva la estructura del contrato administrativo: las tres fechas se emiten
dentro de `customer_delivery`, no como campos planos del registro. El bloque
del listado contiene exclusivamente `received_at`, `estimated_delivery_at` y
`delivered_to_customer_at`.

### Detail

El detalle agrega usuarios asociados, todos los campos visibles del compromiso
con Cliente y `created_at`.

Tambien conserva `customer_delivery` con exactamente las mismas tres fechas
visibles del listado; no agrega una estructura alternativa.

En ambos contratos, cada equipo contiene `asset_id`, `name`, `identifier`,
`brand`, `model` y `serial_number`; no contiene observaciones.

La respuesta dedicada puede incluir:

- identificador y folio de servicio;
- tipo de servicio;
- observaciones;
- `created_at` en detalle;
- snapshot de Cliente;
- usuarios asociados al registro;
- equipos;
- `received_at`, `estimated_delivery_at` y `delivered_to_customer_at`.

El detalle no expone `estimated_delivery_interval`; la fecha tentativa efectiva
`estimated_delivery_at` es el unico valor visible de estimacion.

`service_type` usa `{ service_type_code, name }` y `customer` usa
`{ customer_id, name }`, pues ambos contienen nombres de negocio persistidos.

El detalle expone `customer.users` como snapshots con `user_id`, `name` y
`email`. No consulta ni expone rol, telefono o metadatos de la relacion actual.

La respuesta no puede incluir `provider`, referencias de politicas,
materializaciones de notificacion, sus eventos, semaforo materializado ni
`updated_at`.

## Filters And Sorting

El request DTO del listado hereda sin cambios la convencion transversal de
paginacion de la API: `page`, `limit` y el alias `items_per_page`. Conserva
tambien la sintaxis existente de ordenamiento multiple mediante `sort[]` con
objetos `{ field, direction }`. No constituye una decision especifica del
modulo; el DTO dedicado solo restringe sus campos publicos a los definidos a
continuacion.

Se soportaran filtros por Cliente, tipo de servicio y rangos de `received_at`
y `estimated_customer_delivery_at`. El search considerara
folio, tipo de servicio y campos de equipo; no considera nombre de Cliente. Los
ordenamientos se limitan a campos visibles del mismo conjunto.

Los campos buscables de equipo son `name`, `identifier`, `brand`, `model` y
`serial_number`; no se buscan observaciones.

Cuando `search` representa un entero, tambien coincide exactamente con
`service_number` normalizado, sin eliminar las coincidencias textuales de tipo
y equipos.

Los rangos de `received_at` y `estimated_customer_delivery_at` rechazan con
`400` un limite inferior posterior al superior. La validacion se comparte entre
listado y lookups.

No se aceptan ni se ejecutan filtros, busquedas, rangos u ordenamientos de
Proveedor.

El ordenamiento multiple acepta exclusivamente `service_number`, `received_at`
y `estimated_customer_delivery_at`. Por defecto se usa internamente
`created_at desc` y se agrega el ID tecnico como desempate estable; ninguno de
ambos se expone como ordenamiento publico.

## Authorization And Seed

El catalogo central de autorizacion registra
`CUSTOMER_SERVICE_RECORDS_CLIENT_ACCESS` con la unica operacion `READ` y con la
llave `AUTHORIZATION.MODULE.CUSTOMER_SERVICE_RECORDS_CLIENT_ACCESS`. Las
traducciones `es` y `en` se agregan al catalogo de enums, siguiendo el patron
de `CUSTOMER_SERVICE_RECORDS`.

Los cuatro endpoints usan `JwtAuthGuard`, `PermissionsGuard` y
`@RequirePermission('customer_service_records_client_access', 'READ')`. No
requieren capabilities auxiliares: sus lookups son proyecciones del aggregate
y aplican la misma frontera del modulo, no consultan endpoints o catalogos de
un modulo propietario distinto.

El seed `system-roles` asigna sus permisos a Master Admin y Administrador al
derivar permisos desde el catalogo. El comando manual, que no ejecuta Codex, es:

```bash
npm run db:seed:roles
```

Debe solicitarse despues de integrar el cambio de catalogo y antes de validar
roles de sistema contra un entorno con datos persistidos.

## CQRS, DI And HTTP Registration

El modulo agrega cuatro queries de lectura: listado paginado, detalle por ID,
opciones contextuales de Clientes y opciones contextuales de tipos de servicio.
Cada handler recibe `actorUserId` desde el controlador y comparte una capa de
resolucion de relaciones usuario-Cliente vigentes antes de invocar el puerto
dedicado.

La implementacion Mongoose del puerto dedicado se registra mediante el token
de `ICustomerServiceRecordClientAccessReadRepository` en el modulo de
persistencia existente. Los query handlers, controller y presenter dedicado se
registran en los mismos modulos CQRS/API que concentran el resto de
`customer-service-records`; no se modifica el controlador ni el presenter
administrativos.

El controller expone las rutas de opciones antes de `:recordId` para que
`customers/options` y `service-types/options` no sean interpretadas como IDs.
El envelope de listado y detalle usa el `ApiResponseBuilder` existente; los
lookups usan el mismo builder sin `pagination` ni `meta` adicional.

## Registro de Artefactos

### Domain and persistence

| Artefacto | Tipo | Ubicacion | Responsabilidad y dependencias | Estado |
| --- | --- | --- | --- | --- |
| `CustomerServiceRecord` | aggregate | `src/internal/domain/entities/customer-service-record.entity.ts` | Fuente de lectura reutilizada; no cambia. | reuse |
| `ICustomerServiceRecordClientAccessReadRepository` | puerto de lectura | `src/internal/domain/ports/repositories/customer-service-record-client-access/customer-service-record-client-access-read.repository.ts` | Define listado, detalle y opciones con actor, clientes vigentes y filtros publicos. | new |
| repository port barrel | composition | `src/internal/domain/ports/repositories/customer-service-record-client-access/index.ts` | Exporta el puerto dedicado hacia el barrel de repositorios. | new |
| `IUserCustomerRelationshipReadRepository` | puerto de lectura | `src/internal/domain/ports/repositories/user-customer-relationship/user-customer-relationship-read.repository.ts` | Obtiene relaciones vigentes; no cambia. | reuse |
| `CustomerServiceRecordDocument` and schema | persistencia | `src/internal/infra/persistence/mongoose/schemas/customer-service-record/` | Modelo existente de `customer_service_records`; no cambia schema ni indices en MVP. | reuse |
| `MongooseCustomerServiceRecordClientAccessReadRepositoryImpl` | repositorio | `src/internal/infra/persistence/mongoose/repositories/customer-service-record-client-access/mongoose-customer-service-record-client-access-read.repository.ts` | Consulta el modelo existente aplicando la frontera antes de count, pagination, detail and distinct options. | new |
| client-access repository barrel | composition | `src/internal/infra/persistence/mongoose/repositories/customer-service-record-client-access/index.ts` | Exporta la implementacion dedicada hacia el barrel de repositorios Mongoose. | new |
| `MongooseCustomerServiceRecordBaseRepository` | base repository | `src/internal/infra/persistence/mongoose/repositories/customer-service-record/mongoose-customer-service-record-base.repository.ts` | Reutiliza modelo y mapper existentes; no cambia. | reuse |
| `MongooseRepositoriesConfig` and tokens | DI configuration | `src/internal/infra/persistence/mongoose/repositories/mongoose-repositories.config.ts` | Registra y exporta el token del repositorio dedicado. | modify |
| migration, backfill, new index | data operation | N/A | No aplican: la coleccion y el indice de acceso existentes se reutilizan; nueva optimizacion exige medicion posterior. | not_applicable |

### Application and CQRS

| Artefacto | Tipo | Ubicacion | Responsabilidad y dependencias | Estado |
| --- | --- | --- | --- | --- |
| `CustomerServiceRecordClientAccessVisibilityService` | application service | `src/internal/application/services/customer-service-record-client-access/customer-service-record-client-access-visibility.service.ts` | Resuelve una vez los `customerId` vigentes del actor mediante el puerto de relaciones; lo consumen los cuatro use cases. | new |
| `GetCustomerServiceRecordClientAccessListDto`, `GetCustomerServiceRecordClientAccessOptionsDto`, result and option interfaces | DTOs | `src/internal/application/dto/customer-service-record-client-access/customer-service-record-client-access.dto.ts` | Define inputs, fila, detalle y opciones exclusivas; son interfaces, no una clase singular. | new |
| `CustomerServiceRecordClientAccessMapper` | mapper | `src/internal/application/mappers/customer-service-record-client-access/customer-service-record-client-access.mapper.ts` | Proyecta el aggregate a DTOs permitidos, sin Provider ni campos internos. | new |
| `GetCustomerServiceRecordClientAccessListUseCase` | use case | `src/internal/application/use-cases/customer-service-record-client-access/get-customer-service-record-client-access-list.use-case.ts` | Coordina visibilidad, listado paginado y mapper. | new |
| `GetCustomerServiceRecordClientAccessByIdUseCase` | use case | `src/internal/application/use-cases/customer-service-record-client-access/get-customer-service-record-client-access-by-id.use-case.ts` | Coordina visibilidad y devuelve `404` no revelador. | new |
| `GetCustomerServiceRecordClientAccessCustomerOptionsUseCase` | use case | `src/internal/application/use-cases/customer-service-record-client-access/get-customer-service-record-client-access-customer-options.use-case.ts` | Obtiene opciones de Cliente ignorando solo su filtro propio. | new |
| `GetCustomerServiceRecordClientAccessServiceTypeOptionsUseCase` | use case | `src/internal/application/use-cases/customer-service-record-client-access/get-customer-service-record-client-access-service-type-options.use-case.ts` | Obtiene opciones de tipo ignorando solo su filtro propio. | new |
| application DTO barrel | composition | `src/internal/application/dto/customer-service-record-client-access/index.ts` | Exporta DTOs del acceso cliente. | modify |
| application mapper barrel | composition | `src/internal/application/mappers/customer-service-record-client-access/index.ts` | Exporta el mapper dedicado. | modify |
| application service barrel | composition | `src/internal/application/services/customer-service-record-client-access/index.ts` | Exporta el servicio de visibilidad. | modify |
| application use-case barrel | composition | `src/internal/application/use-cases/customer-service-record-client-access/index.ts` | Exporta los cuatro casos de uso. | modify |
| `GetCustomerServiceRecordClientAccessListQuery` / `Handler` | CQRS | `src/internal/infra/cqrs/queries/customer-service-record-client-access/customer-service-record-client-access.queries.ts` | Adapta listado al use case correspondiente; no contiene reglas de visibilidad. | new |
| `GetCustomerServiceRecordClientAccessByIdQuery` / `Handler` | CQRS | `src/internal/infra/cqrs/queries/customer-service-record-client-access/customer-service-record-client-access.queries.ts` | Adapta detalle al use case correspondiente. | new |
| `GetCustomerServiceRecordClientAccessCustomerOptionsQuery` / `Handler` | CQRS | `src/internal/infra/cqrs/queries/customer-service-record-client-access/customer-service-record-client-access.queries.ts` | Adapta el lookup contextual de Clientes. | new |
| `GetCustomerServiceRecordClientAccessServiceTypeOptionsQuery` / `Handler` | CQRS | `src/internal/infra/cqrs/queries/customer-service-record-client-access/customer-service-record-client-access.queries.ts` | Adapta el lookup contextual de tipos. | new |
| query barrel and `GlobalCqrsModule` | CQRS registration | `src/internal/infra/cqrs/queries/customer-service-record-client-access/index.ts`, `src/modules/global-cqrs.module.ts` | Exportan y registran los cuatro handlers. | modify |

### HTTP, authorization and composition

| Artefacto | Tipo | Ubicacion | Responsabilidad y dependencias | Estado |
| --- | --- | --- | --- | --- |
| `GetCustomerServiceRecordClientAccessListRequestDto`, `GetCustomerServiceRecordClientAccessCustomerOptionsRequestDto`, `GetCustomerServiceRecordClientAccessServiceTypeOptionsRequestDto` | HTTP DTOs | `src/internal/infra/api/dto/customer-service-record-client-access/customer-service-record-client-access.request.dto.ts` | Valida paginacion heredada, filtros, sort y rangos; los DTOs de options excluyen paginacion y sort. | new |
| `CustomerServiceRecordClientAccessPresenter` | presenter | `src/internal/infra/api/presenters/customer-service-record-client-access/customer-service-record-client-access.presenter.ts` | Convierte DTOs a snake_case y aplica las proyecciones list/detail/options. | new |
| `CustomerServiceRecordClientAccessController` | controller | `src/internal/infra/api/controllers/customer-service-record-client-access/customer-service-record-client-access.controller.ts` | Expone cuatro GET; options antes de `:recordId`; aplica JWT, permissions and `READ`. | new |
| API DTO barrels | composition | `src/internal/infra/api/dto/customer-service-record-client-access/index.ts`, `src/internal/infra/api/dto/index.ts` | Exportan los request DTOs dedicados. | modify |
| API presenter barrels | composition | `src/internal/infra/api/presenters/customer-service-record-client-access/index.ts`, `src/internal/infra/api/presenters/index.ts` | Exportan el presenter dedicado. | modify |
| API controller barrels | composition | `src/internal/infra/api/controllers/customer-service-record-client-access/index.ts`, `src/internal/infra/api/controllers/index.ts` | Exportan el controller dedicado. | modify |
| `GlobalMongooseRepositoriesModule`, `GlobalCqrsModule`, `GlobalHttpModule` | composition | `src/modules/global-mongoose-repositories.module.ts`, `src/modules/global-cqrs.module.ts`, `src/modules/global-http.module.ts` | Consumen barrels/configuraciones para exportar repositorio y registrar handlers, controller y presenter. | modify |
| `AUTHORIZATION_CATALOG` | authorization catalog | `src/internal/application/services/authz/authorization.catalog.ts` | Registra module `CUSTOMER_SERVICE_RECORDS_CLIENT_ACCESS` with `READ`. | modify |
| enum translations | i18n | `src/internal/infra/i18n/locales/{es,en}/enums.json` | Agrega copy de modulo en ambos idiomas. | modify |
| `system-roles` seed | seed | existing roles seed | Reutilizado; el usuario ejecuta `npm run db:seed:roles` despues de integrar catalogo. | reuse |
| auxiliary capabilities | authorization | N/A | No aplican: options pertenecen al mismo modulo y usan su `READ`. | not_applicable |

## Contrato e Impacto Entre Repositorios

El consumidor afectado es `org-admin-suite-frontend`. No existe contrato
anterior para este modulo; se agregan cuatro endpoints de lectura sin alterar
el CRUD administrativo. La slice HTTP creara el borrador y cerrara la version
verificada de `docs/frontend/customer-service-records-client-access-handoff.md`.
Incluira requests, respuestas, permiso, `404`, `400`, colecciones vacias,
restricciones de UI y compatibilidad.

La misma slice actualizara `docs/icsacv-api.postman_collection.json` con los
cuatro requests, autenticacion, filtros, respuestas representativas y errores.
Tambien actualizara `docs/authorization/feature-permission-catalog.md` al
integrar el permiso. No cambia `api-pipeline.md` ni las reglas generales de
autorizacion.

## Validation

No se agregan pruebas automatizadas. La validacion sera manual, se registrara
en `05-progress.md` y estara acompanada por `build` y `lint`.

- Usuario con permiso, relacion vigente y asociacion al registro: puede listar
  y ver detalle.
- Usuario con permiso pero sin relacion vigente: no ve registros ni opciones.
- Usuario con permiso y relacion vigente, pero sin asociacion al registro: no
  ve ese registro.
- Registro eliminado: no aparece ni responde en detalle.
- Ninguna respuesta ni campo de filtro revela datos de Proveedor.

## Integracion de Slice 2 - 2026-09-04

Los barrels de Client Access son propios de cada capa. Los padres exportan el
nuevo submodulo; GlobalHttpModule y GlobalApplicationModule lo descubren sin
modificarse. GlobalCqrsModule registra explicitamente los cuatro handlers.
El repositorio conserva su registro existente por token.

El archivo de request DTOs contiene validateRanges, funcion local compartida
por listado y options para validar rangos invertidos antes de invocar CQRS.
Reutiliza BadRequestException y el envelope global de VALIDATION.DEFAULT.
El ValidationPipe existente elimina propiedades no declaradas; no se agrego
rechazo global de parametros desconocidos.

Durante la integracion se corrigieron dos defectos del codigo de Slice 1:
customer_id ahora se combina mediante AND con los IDs autorizados (no reemplaza
el filtro de visibilidad); la base CustomerServiceRecordClientAccessUseCase
declara explicitamente la inyeccion de VisibilityService para que los cuatro
casos heredados resuelvan ambas dependencias.

Contrato HTTP implementado en carpetas propias. Handoff y Postman actualizados
con ejemplos ilustrativos. La validacion contra entorno y datos persiste como
tarea de Slice 3; no se reporta como realizada.
