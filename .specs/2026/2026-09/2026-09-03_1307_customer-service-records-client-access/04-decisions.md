# Decisions

## Ampliacion aprobada - Acceso del staff interno

El usuario aprobo quitar ambas restricciones relacionales al staff interno.
Con READ ve todos los registros ACTIVE, aunque no tenga relacion con el Cliente
ni figure como contacto. Externos conservan ambas restricciones. La respuesta
sigue siendo la proyeccion limitada de Client Access, sin datos de Proveedor.
Esta decision sustituye la frontera universal previa. La clasificacion se lee
del usuario persistido; no es un filtro publico ni depende del nombre del rol.

## 2026-09-06 - Compromiso completo con Cliente

### Decision

Client Access expone el bloque completo `customer_delivery` y el
`operational_status` del registro. El bloque incluye fechas, intervalo,
referencias de politicas, materializacion de estatus y materializacion de
notificaciones, con sus reglas y eventos.

### Reason

El seguimiento de servicios necesita mostrar el compromiso asumido con el
Cliente y sus señales materializadas. Esas señales pertenecen al compromiso
con Cliente y no revelan la operacion con Proveedor.

### Impact

- DTO, mapper, presenter y handoff incluyen el bloque completo en listado y
  detalle.
- Las representaciones de codigos se localizan igual que en el modulo
  administrativo.
- El contrato sigue excluyendo por completo provider, sus politicas,
  materializaciones y eventos.
- Esta decision sustituye la exclusion de `status_materialization` establecida
  el 2026-09-03 para el compromiso con Cliente. No modifica la exclusion de
  Provider.

## 2026-09-03 - Identidad y frontera del modulo

### Decision

El modulo tecnico se llamara `CUSTOMER_SERVICE_RECORDS_CLIENT_ACCESS`.
Su copy de autorizacion sera `Acceso de clientes a registros de servicio` y
su copy de navegacion e interfaz sera `Seguimiento de servicios`.

### Reason

La identidad tecnica debe comunicar que el acceso esta acotado por Cliente y
usuario, mientras que la interfaz debe describir la tarea de consulta sin
exponer detalles de autorizacion.

### Impact

- El catalogo de autorizacion y los permisos no dependen del copy visible.
- Las claves i18n de autorizacion y navegacion se mantienen separadas.

## 2026-09-03 - Frontera de visibilidad compuesta

### Decision

El permiso `READ` del modulo se combina con relacion vigente usuario-cliente,
asociacion del usuario al registro y estatus tecnico `ACTIVE`.

### Reason

Una relacion con el Cliente no autoriza por si sola a ver todos sus registros;
el registro tambien debe incluir explicitamente al usuario como contacto.

### Impact

- La consulta debe recibir el usuario autenticado como parte de su entrada.
- La frontera se aplica antes de contar y paginar.
- Perder la relacion con el Cliente revoca acceso inmediatamente.

## 2026-09-03 - Separacion contractual del modulo administrativo

### Decision

El modulo usara presenters y contratos exclusivos, aunque lea el mismo
aggregate `CustomerServiceRecord`.

### Reason

La ocultacion de Proveedor, politicas y eventos debe ser una garantia de API,
no una responsabilidad del frontend.

### Impact

- No se reutiliza la respuesta administrativa sin una proyeccion dedicada.
- Search, filtros y ordenamientos no consideran campos de Proveedor.

## 2026-09-03 - Ruta y lookup contextual

### Decision

El modulo expone `GET /v1/customer-service-records-client-access` y
`GET /v1/customer-service-records-client-access/:recordId`.

El lookup de Clientes se calcula como `distinct` sobre los registros que pasan
la frontera de acceso y la consulta activa, incluida la busqueda y los filtros
aplicados.

### Reason

La ruta independiente evita confundir la superficie de acceso restringido con
el CRUD administrativo. Un lookup contextual evita mostrar opciones de Cliente
sin coincidencias en la busqueda actual.

### Impact

- El query del lookup recibe los mismos criterios visibles que el listado.
- La frontera de acceso se mantiene como condicion invariable del lookup.

## 2026-09-03 - Puerto de lectura dedicado

### Decision

Se crea `ICustomerServiceRecordClientAccessReadRepository` como puerto de
lectura dedicado para listado, detalle y lookup de Clientes del modulo
`CUSTOMER_SERVICE_RECORDS_CLIENT_ACCESS`.

### Reason

El modulo consulta el mismo aggregate, pero su frontera de visibilidad y su
contrato son distintos del CRUD administrativo. Un puerto propio evita mezclar
consultas externas con las operaciones administrativas existentes.

### Impact

- La implementacion Mongoose puede reutilizar el mismo modelo y mapper del
  aggregate sin reutilizar los metodos administrativos.
- El nuevo puerto recibe parametros de actor y visibilidad propios.
- `ICustomerServiceRecordReadRepository` conserva sus responsabilidades
  actuales sin ramas de acceso por cliente.

## 2026-09-03 - Resolucion previa de relaciones vigentes

### Decision

Cada flujo del modulo consulta primero las relaciones vigentes del actor en
`IUserCustomerRelationshipReadRepository`. Con los `customerId` resultantes,
el puerto dedicado consulta registros `ACTIVE` que incluyan al actor en
`customer.users` y cuyo Cliente pertenezca a ese conjunto.

Si el actor no tiene relaciones vigentes, listado y lookup devuelven resultados
vacios sin consultar registros. El detalle responde `404` sin consultar datos
fuera de esa frontera.

### Reason

La desasociacion usuario-cliente elimina solo la relacion pivote; los snapshots
de usuarios dentro de registros de servicio se conservan como historia. La
relacion vigente debe ser una condicion de lectura independiente para revocar
el acceso inmediatamente sin alterar registros historicos.

### Impact

- No se agrega una sincronizacion de borrado sobre `customer_service_records`.
- La frontera se aplica antes de filtros, conteo y paginacion.
- La ausencia de coincidencia en detalle no revela si el registro existe.

## 2026-09-03 - Indices del MVP de acceso por Cliente

### Decision

El MVP no agrega un indice compuesto nuevo. Reutiliza el indice existente:

```text
{ status: 1, 'customer.users.user_id': 1, createdAt: -1 }
```

El filtro adicional de Clientes vigentes se aplica sobre esa consulta. Cualquier
indice nuevo se decide despues de medir el plan de ejecucion con volumen de
datos representativo.

### Reason

El numero de Clientes vigentes por usuario y la selectividad real de filtros
aun no estan medidos. Agregar un indice compuesto preventivo puede introducir
costo de escritura o afectar el orden natural sin una ganancia demostrada.

### Impact

- No se requiere migracion ni cambio de schema para el MVP.
- La validacion tecnica debe registrar una revision de rendimiento con datos
  representativos.
- Una optimizacion futura conserva como candidato un indice que incluya
  `status`, usuario asociado, Cliente y ordenamiento, sujeto a medicion.

## 2026-09-03 - Observaciones fuera del contrato inicial

### Decision

El modulo no expone `observations` en listado ni detalle durante el MVP.

### Reason

La primera version se limita a la informacion operativa y de compromiso que el
Cliente necesita para dar seguimiento al servicio.

### Impact

- El presenter dedicado no incluye el campo aunque el aggregate lo conserve.
- Agregarlo despues requerira una decision y cambio de contrato explicitos.

## 2026-09-03 - Fecha de registro visible en detalle

### Decision

El detalle expone `created_at` como fecha tecnica de registro del servicio.

### Reason

La fecha aporta trazabilidad al usuario sin revelar datos internos de edicion.

### Impact

- El presenter de detalle incluye `created_at`.
- El listado no necesita incluirlo como columna; permanece disponible como
  ordenamiento tecnico y valor de detalle.

## 2026-09-03 - Fecha de actualizacion fuera del contrato

### Decision

El modulo no expone `updated_at` en listado ni detalle durante el MVP.

### Reason

Representa actividad administrativa interna que no es necesaria para el
seguimiento del Cliente.

### Impact

- El presenter dedicado omite `updated_at` aunque el aggregate lo conserve.
- Su inclusion futura requiere una decision y cambio de contrato explicitos.

## 2026-09-03 - Lookup de Clientes ignora su propio filtro

### Decision

El lookup de Clientes replica la busqueda y los filtros visibles activos, pero
ignora exclusivamente `customer_id` al calcular sus opciones.

### Reason

La seleccion actual no debe ocultar alternativas que siguen siendo compatibles
con el resto de la consulta. El usuario puede cambiar de Cliente sin limpiar el
filtro antes.

### Impact

- El query del lookup recibe los mismos parametros publicos que el listado.
- El adaptador omite `customer_id` al construir su filtro, pero conserva tipo,
  estatus, busqueda y rangos de fecha.

## 2026-09-03 - Ordenamiento publico limitado y estable

### Decision

El listado acepta ordenamiento multiple solo por `service_number`,
`received_at` y `estimated_customer_delivery_at`. El valor predeterminado
interno es `created_at desc`; el ID tecnico del registro se agrega como
desempate estable.

### Reason

El contrato conserva la flexibilidad del listado administrativo sin permitir
ordenamientos sobre datos internos o de Proveedor. El desempate evita cambios
no deterministas entre paginas cuando varios registros comparten fecha.

### Impact

- El DTO HTTP rechaza campos y direcciones no admitidos antes de CQRS.
- `created_at` no es un ordenamiento publico; solo conserva el orden interno
  predeterminado y el desempate estable.
- La consulta no ordena por datos de Proveedor, politicas ni auditoria de
  actualizacion.

## 2026-09-03 - Proyecciones separadas de listado y detalle

### Decision

El modulo expone contratos separados. El listado devuelve folio, Cliente, tipo
de servicio, equipos y fechas principales del compromiso. El detalle agrega
usuarios asociados, todos los campos visibles del compromiso con Cliente y
`created_at`.

### Reason

El listado necesita identificar los equipos relacionados, pero no debe repetir
la informacion completa de contactos ni del compromiso en cada fila paginada.
El detalle conserva la fuente completa de consulta autorizada.

### Impact

- Se definen DTOs y presenters diferenciados para fila y detalle.
- `assets` forma parte de ambos contratos.
- `customer.users` se expone solo en detalle.

## 2026-09-03 - Shape visible de equipos

### Decision

Cada equipo visible en listado y detalle expone `asset_id`, `name`,
`identifier`, `brand`, `model` y `serial_number`. No expone `observations`.

### Reason

Los campos permiten identificar completamente un equipo asociado sin incluir
notas internas. `asset_id` conserva una identidad estable cuando un registro
contiene varios equipos.

### Impact

- Listado y detalle reutilizan el mismo subcontrato de equipo.
- El presenter excluye el campo de observaciones del aggregate.

## 2026-09-03 - Semaforo materializado sin origen interno

### Decision

El semaforo de compromiso con Cliente expone `code`, `name`, `name_key`,
`color_hex` y `effective_start_date`. No expone `source`, reglas, politicas ni
referencias de politica.

### Reason

El usuario necesita conocer el estado materializado y su vigencia, pero no los
mecanismos internos que lo producen.

### Impact

- Listado y detalle comparten el mismo subcontrato de semaforo.
- El presenter filtra metadatos de materializacion no autorizados.

## 2026-09-03 - Revision de informacion visible por aclaracion de Cliente

### Decision

El semaforo materializado queda fuera de listado y detalle. La fecha tentativa
de entrega al Cliente permanece visible. `observations` vuelve a formar parte
del contrato del modulo en listado y detalle.

### Reason

El Cliente solicita seguir la fecha tentativa de entrega, sin exponer el
semaforo de evaluacion interna. Tambien requiere acceso a las observaciones del
registro.

### Impact

- Esta decision sustituye las decisiones anteriores de omitir observaciones y
  exponer el semaforo materializado.
- El presenter no incluye `status_materialization`.
- Listado y detalle incluyen `observations` del aggregate.

## 2026-09-03 - Nombres de negocio listos para interfaz

### Decision

El tipo de servicio expone `service_type_code` y su `name` persistido; el
Cliente expone `customer_id` y `name`.

### Reason

La interfaz recibe nombres de negocio listos para presentar. Los tipos de
servicio y nombres de Cliente son datos persistidos, no enums localizables.

### Impact

- `service_type` usa `{ service_type_code, name }`.
- `customer` usa `{ customer_id, name }`.

## 2026-09-03 - Usuarios asociados visibles solo en detalle

### Decision

El detalle expone los usuarios asociados mediante sus snapshots:
`user_id`, `name` y `email`. El listado no los incluye.

### Reason

Los datos identifican los contactos asociados al servicio sin consultar ni
revelar atributos adicionales de cuenta, rol o relacion del usuario.

### Impact

- El presenter reutiliza solo los campos ya persistidos en `customer.users`.
- No se exponen rol, telefono ni metadatos de relacion usuario-cliente.

## 2026-09-03 - Fechas visibles del compromiso

### Decision

Listado y detalle exponen `received_at`, `estimated_delivery_at` y
`delivered_to_customer_at`. `requested_at` no forma parte de los contratos de
respuesta.

### Reason

Las tres fechas permiten seguir la recepcion o recoleccion, fecha tentativa y
entrega real sin revelar informacion de Proveedor.

### Impact

- El listado incluye las fechas de compromiso visibles sin cargar el bloque
  completo de detalle.
- Listado y detalle conservan el nombre y anidacion del contrato administrativo:
  las tres fechas viven en `customer_delivery`, sin crear una representacion
  plana o alternativa.

## 2026-09-03 - Intervalo de entrega no visible

### Decision

El detalle no expone `estimated_delivery_interval`; solo expone la fecha
efectiva `estimated_delivery_at`.

### Reason

El intervalo es un insumo tecnico de calculo. La fecha tentativa efectiva es
el valor operativo que el Cliente necesita consultar.

### Impact

- El presenter excluye anos, meses, semanas y dias del intervalo.
- Ajustes futuros de la fecha efectiva no obligan a explicar al Cliente la
  configuracion interna del intervalo.

## 2026-09-03 - Lookup contextual de tipos de servicio

### Decision

El lookup de tipos de servicio devuelve valores distintos existentes en los
registros activos y visibles para el actor. Replica la busqueda y filtros
activos de la consulta, e ignora exclusivamente su propio
`service_type_code`.

### Reason

El filtro no debe ofrecer tipos sin coincidencias para el usuario. La misma
frontera de acceso que protege el listado y el lookup de Clientes protege sus
opciones de tipo.

### Impact

- No se reutiliza el catalogo global de tipos como fuente de opciones.
- El lookup obtiene los snapshots `service_type_code` y `name` presentes en
  registros visibles, y los presenta con el contrato existente `{ code, name }`.
- El adaptador omite `service_type_code` al construir el filtro del lookup.

## 2026-09-03 - Rutas de opciones contextuales

### Decision

El modulo expone:

```text
GET /v1/customer-service-records-client-access/customers/options
GET /v1/customer-service-records-client-access/service-types/options
```

Ambas rutas requieren `CUSTOMER_SERVICE_RECORDS_CLIENT_ACCESS/READ`.

### Reason

Los lookups pertenecen a la misma frontera de lectura del modulo y no deben
depender de permisos administrativos de Clientes ni del catalogo global de
tipos.

### Impact

- El controlador dedicado conserva todas las rutas de consulta externa.
- Los lookups aplican la misma visibilidad que listado y detalle.

## 2026-09-03 - Parametros de lookups contextuales

### Decision

Los lookups aceptan los filtros visibles no paginados: `search`,
`customer_id`, `service_type_code` y rangos de `received_at` y
`estimated_customer_delivery_at`.

No aceptan `page`, `limit` ni `sort`. El lookup de Clientes ignora
`customer_id`; el de tipos ignora `service_type_code`.

### Reason

Las opciones deben reflejar la misma consulta funcional sin heredar controles
propios de la tabla paginada. Cada lookup debe evitar que su seleccion actual
oculte alternativas compatibles.

### Impact

- Los DTOs de opciones validan un contrato propio, sin parametros de tabla.
- Ningun lookup acepta filtros o rangos de Proveedor.

## 2026-09-03 - Estatus operativo fuera del acceso de Cliente

### Decision

El modulo no expone, filtra, ordena ni crea catalogo para
`operational_status`.

### Reason

El Cliente aclaró que no requiere ese estatus para el seguimiento de sus
servicios. Su inclusion ampliaria el contrato con un dato no solicitado.

### Impact

- Listado, detalle y lookups omiten el estatus operativo.
- No se crea una ruta `catalog` para este modulo.
- Los DTOs publicos no aceptan `operational_status`.

## 2026-09-03 - Orden estable de opciones

### Decision

Las opciones de Clientes se ordenan por `name asc`, `customer_id asc`; las de
tipos de servicio por `name asc`, `service_type_code asc`. Ningun lookup acepta
un parametro publico de ordenamiento.

### Reason

El orden alfabetico facilita la seleccion en interfaz y los desempates tecnicos
mantienen resultados deterministas.

### Impact

- El orden pertenece al repositorio, no al consumidor HTTP.
- El mismo filtro siempre produce opciones en el mismo orden.

## 2026-09-03 - Busqueda no incluye nombre de Cliente

### Decision

`search` no consulta el nombre de Cliente. El filtrado por Cliente se realiza
exclusivamente con `customer_id` y su lookup contextual.

### Reason

La busqueda se limita al folio, tipo de servicio y datos de equipo acordados.
Separar Cliente en un filtro explicito evita ampliar su semantica de forma
ambigua.

### Impact

- El filtro Mongo no agrega `customer.customer_name` a su expresion de busqueda.
- Los lookups conservan su comportamiento contextual al recibir `search`.

## 2026-09-03 - Campos de equipo buscables

### Decision

`search` consulta los campos de equipo `name`, `identifier`, `brand`, `model`
y `serial_number`. No consulta observaciones.

### Reason

Los campos aprobados identifican el equipo operativamente. Las observaciones se
pueden leer en los contratos visibles, pero no amplian el alcance de busqueda.

### Impact

- La expresion de busqueda solo incluye los cinco campos acordados de `assets`.
- La decision se comparte con listado y lookups contextuales.

## 2026-09-03 - Busqueda numerica de folio y texto

### Decision

Cuando `search` representa un entero, la consulta agrega una coincidencia
exacta contra `service_number` normalizado y conserva simultaneamente las
coincidencias textuales de tipo de servicio y equipos.

### Reason

Un valor como `0001` debe localizar el folio `1`, sin impedir que el mismo valor
encuentre identificadores o numeros de serie de equipos.

### Impact

- El padding visible del folio no altera su busqueda numerica.
- Un resultado puede coincidir por folio o por cualquiera de los campos de
  texto aprobados.

## 2026-09-03 - Ausencia de coincidencias como resultado normal

### Decision

Cuando el actor tiene permiso pero no mantiene relaciones vigentes o no existen
registros visibles, el listado responde una coleccion vacia con paginacion de
total cero. No responde `403` ni una excepcion de sistema.

### Reason

El permiso habilita el modulo; la frontera de Cliente y usuario determina si
hay datos consultables. La ausencia de coincidencias es un resultado funcional
normal.

### Impact

- El caso de uso evita consultar registros cuando no existen Clientes vigentes.
- La API conserva su envelope paginado normal con `data: []` y `total: 0`.
- El detalle sigue respondiendo `404` cuando no hay coincidencia visible.

## 2026-09-03 - Rangos de fecha validos

### Decision

Cuando el limite inferior de un rango es posterior al limite superior, la API
rechaza la solicitud con `400`. Aplica a `received_at` y
`estimated_customer_delivery_at` en listado y lookups.

### Reason

Un rango invertido es una entrada invalida, no una consulta sin coincidencias.
Rechazarlo permite a la interfaz corregir el filtro en lugar de ocultar el
problema con una respuesta vacia.

### Impact

- Los DTOs o validacion de aplicacion comparan los limites `date only`.
- La misma regla se comparte entre listado y rutas de opciones.

## 2026-09-03 - Datos internos fuera de filtros y ordenamientos publicos

### Decision

`requested_at` no se expone, filtra ni ordena en este modulo. La misma regla
aplica a cualquier dato interno o de Proveedor fuera del contrato visible.

### Reason

Los filtros y ordenamientos publicos solo operan sobre datos que el usuario
puede consultar en la respuesta. Exponer capacidad de filtrar datos ocultos
rompe la frontera funcional y puede revelar informacion indirecta.

### Impact

- Listado y lookups no aceptan rangos de `requested_at`.
- La lista de campos ordenables excluye `requested_at`.
- `requested_at` permanece solo como dato interno del aggregate.

## 2026-09-03 - Lookups no paginados sin limite artificial

### Decision

Los lookups de Clientes y tipos de servicio devuelven todas las opciones
coincidentes y autorizadas, sin paginacion ni limite artificial.

### Reason

Son controles de seleccion y siguen el patron de lookups existentes del
proyecto. Paginar opciones haria incompleta la seleccion de filtros.

### Impact

- Las rutas de opciones no aceptan ni devuelven metadatos de paginacion.
- La respuesta vacia es una lista normal vacia.

## 2026-09-03 - Envelope de lookups alineado con el patron existente

### Decision

Los lookups usan el envelope estandar no paginado de la API: devuelven `data`
con sus opciones, sin `pagination` ni `meta` adicional.

### Reason

Las rutas existentes de options o combos no agregan metadata propia. El modulo
mantiene ese contrato uniforme en lugar de introducir un formato aislado.

### Impact

- Sin coincidencias: `data: []` sin metadata adicional.

## 2026-09-03 - Nomenclatura existente de opciones

### Decision

El lookup contextual de Clientes responde cada opcion como
`{ customer_id, company_name }`, y el de tipos de servicio como
`{ code, name }`.

### Reason

Ambos formatos ya son los contratos de options de sus respectivos recursos en
la API. El origen contextual de estas opciones no justifica introducir nombres
de propiedad distintos.

### Impact

- El select de Cliente usa `customer_id` como valor y `company_name` como
  etiqueta.
- El select de tipo usa `code` como valor y `name` como etiqueta.
- El listado paginado conserva su metadata de paginacion normal.

## 2026-09-03 - Validacion manual sin pruebas automatizadas

### Decision

La iniciativa no incorpora pruebas automatizadas. La validacion se realiza
manualmente con escenarios documentados de API, junto con `build` y `lint` como
verificaciones tecnicas.

### Reason

El repositorio y las specs recientes usan validacion manual para estos modulos.
La iniciativa conserva ese alcance en lugar de introducir una suite automatizada
aislada.

### Impact

- La spec registra casos manuales, resultados y cualquier limitacion del
  entorno en `05-progress.md`.
- No se agregan archivos de prueba automatizada como parte de este modulo.

## 2026-09-04 - Integracion HTTP del acceso cliente

### Decision

Se implementa la Slice 2 con los contratos aprobados y carpetas propias. Los
parametros no declarados se descartan siguiendo el ValidationPipe global;
rangos invertidos y sort invalido en listado devuelven 400.

### Reason

La integracion debe conservar las convenciones existentes y la frontera
compuesta aprobada. El filtro customer_id se intersecta con los IDs autorizados.

### Impact

- Validacion local completada; ver evidencia de 07. La prueba HTTP con datos
  y seed conserva su lugar en Slice 3.
- Handoff y Postman describen el contrato implementado y distinguen ejemplos
  ilustrativos de evidencia de entorno.
