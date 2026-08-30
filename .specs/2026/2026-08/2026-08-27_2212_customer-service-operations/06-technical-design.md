# Technical Design

## Persistence

### Collections

| Collection | Responsibility |
| --- | --- |
| `customer_service_records` | Aggregate principal y sus bloques embebidos. |
| `customer_service_record_service_types` | Catalogo local administrable de tipos de servicio. |
| `internal_sequence_counters` | Contadores tecnicos globales reutilizables. |

`customer_service_records` no almacena objetos vacios. `provider` se omite o
persiste como `null` cuando el servicio se ejecuta sin Proveedor; sus datos,
configuracion de seguimiento y materializaciones se eliminan de forma
consistente cuando se limpia dicho bloque.

Los subdocumentos de infraestructura de Mongoose usaran `{ _id: false }`. Los
identificadores estables de `assets[]` y de reglas de seguimiento son IDs de
dominio generados por backend, no ObjectIds de subdocumentos.

### Consecutivo Global

El contador se identifica por `key = CUSTOMER_SERVICE_RECORDS` y conserva el
ultimo valor confirmado. La creacion sigue este orden dentro de
`ITransactionalExecutor`:

1. Incrementar atomicamente el contador y obtener el nuevo valor.
2. Construir el aggregate con ese valor en `service_number`.
3. Persistir el aggregate.
4. Confirmar ambas operaciones en una unica transaccion.

El indice unico de `service_number` es la garantia final de integridad. La capa
de presentacion aplica el padding minimo de cuatro digitos; la base conserva un
entero sin limite artificial de longitud.

### Initial Indexes

`customer_service_records` contara inicialmente con:

- Unico: `service_number`.
- Listado natural: `status`, `createdAt DESC`, ID tecnico como desempate.
- Filtros: `status` combinado con `operational_status`, `service_type_code`,
  `customer.customer_id`, `customer.users.user_id` y `provider.provider_id`.
- Fechas: `status` combinado con cada fecha estimada efectiva para permitir
  rangos y ordenamientos de compromisos de Cliente y Proveedor.

No se definiran indices de texto anticipados. Se agregaran despues de medir el
comportamiento de la busqueda del MVP sobre datos representativos.

## Domain And Ports

`CustomerServiceRecord` es el unico aggregate del recurso operativo. Sus
bloques se modelan como interfaces de valor para mantener limites claros sin
introducir entidades innecesarias: Cliente, usuarios del Cliente, activos,
compromiso con Cliente, Proveedor, seguimiento y materializaciones.

El aggregate contiene `status` tecnico (`ACTIVE`/`DELETED`) y
`operationalStatus` de negocio. La operacion de baja modifica solo el primero;
los refreshers y futuros jobs consideran ambos para incluir unicamente
registros activos pendientes o en proceso.

`CustomerServiceRecordServiceType` es una entidad de catalogo separada. El
codigo y nombre no se modifican despues de crearla; la administracion solo
activa o desactiva la entidad.

| Port | Responsibility |
| --- | --- |
| `ICustomerServiceRecordReadRepository` | Detalle, listado y lotes operacionales cursor-based. |
| `ICustomerServiceRecordWriteRepository` | Crear, actualizar y escritura aislada de materializaciones. |
| `ICustomerServiceRecordServiceTypeReadRepository` | Catalogo, opciones activas y busqueda por codigo. |
| `ICustomerServiceRecordServiceTypeWriteRepository` | Crear y cambiar estado del catalogo. |
| `ISequenceCounterRepository` | Asignar el siguiente consecutivo dentro de la transaccion activa. |

La escritura tecnica de materializaciones no modifica `updatedAt`, `updatedBy`
ni datos de negocio. Las politicas se leen desde sus propios repositorios; el
repositorio del registro solo localiza los registros operacionales que las
referencian por bloque.

## Application Flows

Los use cases CRUD son orquestadores. La creacion prepara y valida los bloques,
materializa los datos tecnicos y, dentro de una transaccion, obtiene el
consecutivo y crea el aggregate. La actualizacion prepara un patch por bloques,
persiste el aggregate y ejecuta solo los refreshers que correspondan al cambio.

La preparacion se concentra en `CustomerServiceRecordInputPreparationService`,
que coordina preparadores especializados de Cliente/Usuarios, tipo de servicio,
Proveedor y seguimiento. Cada preparador resuelve referencias activas y genera
snapshots historicos.

`CustomerServiceRecordTechnicalMaterializationsRefresherService` coordina los
cinco refreshers aislados. Su operacion cursor-based reutiliza el mismo flujo
para el endpoint tecnico, cambios de politicas y el futuro job. Un lock evita
ejecuciones tecnicas concurrentes.

La presentacion se resuelve con `CustomerServiceRecordPresentationDataService`:
carga datos de referencia requeridos por presenters y mantiene esa logica fuera
de los casos de uso CRUD.

Los casos del catalogo de tipos se mantienen separados del aggregate. Sus
opciones activas son locales al modulo; las opciones de Cliente, Usuarios,
Proveedor y grupos destinatarios continúan en los modulos propietarios.

## HTTP Contracts And Presentation

La frontera HTTP usa `snake_case`; los contratos internos usan `camelCase`.
Los presenters traducen enums con `EnumNameService` y siempre exponen el valor
tecnico junto al texto y llave localizada: `{ code, name, name_key }`.

Los semaforos incluyen `code`, `name`, `name_key`, `color_hex`, `source` y
`effective_start_date`. Un valor derivado de politica conserva su etiqueta de
negocio y deja `name_key` en `null`; uno de sistema se localiza por su llave.
El tipo de servicio no se traduce, pues su `name` es dato de negocio persistido.

El `POST` exige tipo, fecha de solicitud, Cliente y al menos un activo; el
estatus operativo omiso toma `PENDING`. El `PATCH` solo aplica propiedades
presentes: `null` limpia datos opcionales y el bloque de Proveedor; Cliente y
activos son reemplazos completos si se reciben. El `DELETE` responde `204`.

El refresco de materializaciones se expone bajo `internal-jobs`, con cursor y
lock. No pertenece a usuarios finales ni a la autorizacion del modulo.

## Authorization And Seeds

El modulo registra las operaciones `CREATE`, `READ`, `UPDATE`, `DELETE` y
`MANAGE_SERVICE_TYPES`. Cada valor fijo visible agrega su copia `es/en` y los
presenters siempre devuelven el codigo, el texto localizado y su llave.

Las permissions del modulo derivan capacidades de opciones de Clientes,
Usuarios relacionados, Proveedores, Grupos destinatarios y ambas clases de
politicas. Cada endpoint de opciones valida la capability de su modulo dueño.

El catalogo inicial de tipos se entrega mediante
`customer-service-record-service-types`, un seed create-only e idempotente.
Todos los seeds son operaciones independientes: cada uno tiene un comando
propio, no se ejecutan en conjunto y nunca se corren automaticamente como parte
de una migracion o despliegue.
