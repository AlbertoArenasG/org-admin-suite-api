# Decisions

## Decision 01. Equipment Cardinality

### Decision Final

Un servicio podra contener uno o varios equipos en el modelo de backend. La primera interfaz limitara la captura a un equipo, sin convertir esa limitacion visual en una restriccion del dominio.

### Status

approved

## Decision 02. Provider And Laboratory

### Decision Final

Laboratorio reutilizara la entidad existente de Proveedores. La referencia sera opcional porque un servicio puede ejecutarse internamente.

No se agregara una bandera o modo explicito de ejecucion interna/externa, ni se inferiran reglas tecnicas a partir del Proveedor seleccionado. El laboratorio propio podra existir como un Proveedor mas para conservar la separacion operativa que utiliza el negocio.

### Status

approved

## Decision 03. Operational Status And Timeline

### Decision Final

Las fechas de solicitud, entrega al Proveedor, retorno y entrega al Cliente modelaran hitos independientes. No cambiaran automaticamente el estatus operativo del servicio.

### Status

approved

## Decision 04. Visible Service Number

### Decision Final

Cada servicio tendra un identificador interno inmutable y un `service_number` visible, numerico, autogenerado, global para todo el modulo y presentado con ceros a la izquierda.

`service_number` se persistira como entero. Los ceros a la izquierda seran solo
una normalizacion de presentacion con minimo de cuatro digitos: `1` se mostrara
como `0001` y `9999` como `9999`; valores mayores creceran sin truncarse ni
producir error, por ejemplo `10000` o `99999`.

La asignacion usara un contador tecnico global en una coleccion separada,
incrementado atomicamente dentro de la misma transaccion que crea el servicio,
junto con un indice unico sobre `service_number`. Esto evita colisiones entre
creaciones concurrentes y evita consumir un consecutivo cuando la creacion se
revierte.

No se implementara una `Idempotency-Key` en este MVP. Esa estrategia protege
reintentos del mismo intento de creacion, pero no es necesaria para garantizar
la unicidad del consecutivo; la interfaz bloqueara el envio duplicado como
medida de experiencia de usuario.

La duplicacion de registros, incluso en lote, queda fuera de este MVP y se
resolvera en una spec posterior con una operacion dedicada. Cada copia debera
recibir entonces su propio consecutivo mediante este mismo contador.

### Status

approved

## Decision 05. Deadline Notifications And Provider Follow-Up

### Decision Final

El servicio tendra dos compromisos de fecha independientes:

- Compromiso de entrega al Cliente.
- Compromiso de retorno del Proveedor, cuando exista Proveedor.

Cada compromiso podra asociar dos politicas independientes:

- Una politica de estatus, cuya unica responsabilidad es materializar el semaforo.
- Una politica de notificaciones, cuya unica responsabilidad es materializar eventos de recordatorio relativos a la cercania o incumplimiento de una fecha comprometida.

Una politica de estatus no enviara ni configurara notificaciones. Una politica de notificaciones no determinara el estado materializado del semaforo ni enviara correos directamente.

El envio sera responsabilidad de un mecanismo futuro de dispatch que procese los eventos de notificacion materializados en estado pendiente, registre su resultado y sea compartible entre control de activos y este modulo. Ese mecanismo queda fuera de esta spec.

El seguimiento al Proveedor sera una configuracion embebida por servicio, con reglas de intervalo, destinatarios principales y copias. Se calcula desde la entrega real al Proveedor y su proposito es solicitar o conocer el estatus del trabajo ante el Proveedor; no representa el vencimiento del compromiso de retorno.

### Status

approved

## Decision 06. Initial Operational Status Lifecycle

### Decision Final

El MVP manejara los estatus operativos `Pendiente`, `En proceso`, `Completado`
y `Cancelado`.

`Pendiente` permite capturar un servicio antes de su recoleccion o recepcion.
Se utilizara `Completado`, no `Finalizado`, para conservar consistencia con los
demas modulos de la aplicacion.

`Garantia` es un tipo de servicio, no un estatus operativo. Se incluira en el
seed inicial del catalogo de tipos de servicio.

### Status

approved

## Decision 07. Service Type Catalog

### Decision Final

Los tipos de servicio se modelaran como un catalogo administrable y persistido.
Cada tipo tendra un `code` tecnico autogenerado a partir de su nombre y un nombre
de negocio en espanol inmutable despues de su alta; no se almacenaran copias
localizados por idioma. Los tipos existentes del legacy se cargaran como datos
iniciales mediante un seed. Su ciclo de vida se administrara exclusivamente
mediante activacion o desactivacion.

La administracion del catalogo requerira un permiso directo especial del modulo.

Un tipo podra desactivarse aunque ya este referenciado por registros historicos.
Los registros conservaran su `serviceTypeCode` y snapshot de nombre; el tipo
desactivado quedara fuera de `options` y no podra seleccionarse en nuevos
registros. No existira eliminacion fisica ni bloqueo por referencias
historicas.

El endpoint de opciones de tipos sera un endpoint auxiliar **local** del modulo:
se protegera mediante el permiso directo del modulo que corresponda a la
operacion consumidora. No se modelara como una `auxiliary_capability`, pues no
es transversal ni reutilizable por otros modulos.

### Status

approved

## Decision 08. Customer Users

### Decision Final

Cada servicio tendra un Cliente asociado y podra relacionar uno o varios
Usuarios de ese Cliente desde su primera version. El legacy llama `Contacto` a
esta informacion, pero en el nuevo modelo se representara exclusivamente con
Usuarios, no con la entidad de contactos.

Al crear o actualizar un servicio, backend validara que cada Usuario indicado
mantenga una relacion vigente con el Cliente del servicio. No se permitira
asociar Usuarios ajenos al Cliente.

La primera interfaz podra limitar la captura visual si fuera necesario, pero el
modelo y los contratos de backend aceptaran una lista de Usuarios desde el
inicio.

### Status

approved

## Decision 09. MVP Dates, Estimates And Commitments

### Decision Final

El MVP tendra los siguientes hitos de fecha:

- `received_at`: fecha de recoleccion o recepcion; inicio operativo del servicio.
- `requested_at`: fecha de solicitud o registro de negocio, independiente de la
  fecha de recoleccion o recepcion.
- `delivered_to_provider_at`: fecha real de entrega al Proveedor, opcional y
  aplicable solo si el servicio tiene Proveedor.
- `returned_from_provider_at`: fecha real de retorno del Proveedor, opcional.
- `delivered_to_customer_at`: fecha real de entrega al Cliente, opcional.

El compromiso de entrega al Cliente se definira con:

- `estimated_customer_delivery_interval`.
- `estimated_customer_delivery_at`.

La estimacion de retorno comunicada por el Proveedor se definira con:

- `provider_estimated_return_interval`.
- `provider_estimated_return_at`.

Los dos intervalos usaran la misma estructura flexible de anos, meses, semanas
y dias ya empleada en control de activos. Las fechas estimadas se calcularan
desde su hito de origen (`received_at` y `delivered_to_provider_at`,
respectivamente) y podran ajustarse manualmente. La fecha estimada efectiva sera
la referencia de las materializaciones, incluso si deja de coincidir con el
intervalo tras un ajuste manual.

Todas las fechas anteriores seran `date only`: fechas de negocio sin hora, cuya
interpretacion operativa corresponde a Ciudad de Mexico. No se almacenaran ni
compararan como instantes dependientes de la zona horaria de la instancia.

`requested_at` sera obligatoria, se precargara con la fecha actual de Ciudad de
Mexico y podra editarse para registrar historicos. `received_at` sera opcional
en servicios pendientes para permitir su captura anticipada.

Los datos de envio, guias, pedimentos y otros detalles logisticos quedan fuera
del MVP y se trataran en una spec futura.

### Status

approved

## Decision 10. Extensible Service Record Structure

### Decision Final

El registro de servicio se estructurara desde el inicio en bloques cohesivos de
dominio, en lugar de concentrar todos los campos presentes y futuros en un
documento plano y creciente.

El diseno tecnico partira, como minimo, de bloques para datos generales,
equipos, compromiso de entrega al Cliente y gestion con Proveedor. Los futuros
datos logisticos, documentos y otros bloques se agregaran de manera aislada,
sin obligar a refactorizar los bloques existentes.

No se persistiran objetos vacios ni campos especulativos de funcionalidades que
todavia no existen. La extensibilidad proviene de los limites claros entre los
bloques, no de anticipar propiedades sin uso.

Los use cases principales conservaran una responsabilidad de orquestacion; la
normalizacion, materializaciones, validaciones transversales y futuras
sincronizaciones se aislaran en servicios especializados.

### Status

approved

## Decision 11. Policy Applicability By Commitment

### Decision Final

Las politicas de estatus y de notificaciones del compromiso de entrega al
Cliente seran opcionales. Sin politica de estatus, el servicio conserva su
semaforo de sistema; sin politica de notificaciones, conserva su
materializacion tecnica sin eventos.

Las referencias de politica para la estimacion de retorno del Proveedor seran
opcionales y solo seran validas si el servicio tiene Proveedor. Esto incluye su
politica de estatus y su politica de notificaciones.

Si se elimina el Proveedor de un servicio, backend limpiara de forma consistente
los datos propios de su bloque: hitos, intervalo, fecha estimada, politicas y
configuracion embebida de seguimiento.

### Status

approved

## Decision 12. Embedded Equipment Snapshots

### Decision Final

Los equipos se persistiran como una lista embebida de snapshots dentro del
servicio. Cada elemento incluira, desde el MVP, nombre, identificador, marca,
modelo, numero de serie y observaciones del equipo.

Los seis campos seran obligatorios en el MVP, salvo las observaciones, que seran
opcionales. No se creara un catalogo o entidad maestra de equipos en esta spec.
Un mismo equipo podra aparecer en distintos servicios, pero no se permitiran dos
equipos con el mismo identificador dentro de un mismo servicio.

### Status

approved

Las imagenes de entrada y salida, informes de calibracion, accesorios y otros
adjuntos de cada equipo quedan fuera del MVP y se incorporaran en bloques
aislados de una spec futura.

### Status

approved

## Decision 13. Operational Status Transitions

### Decision Final

No se implementara una maquina de estados ni reglas de transicion entre
`Pendiente`, `En proceso`, `Completado` y `Cancelado`. Cualquier estatus podra
cambiarse a otro mediante la operacion de edicion, sin exigir hitos de fecha
previos ni restringir reaperturas.

Esto conserva el comportamiento flexible de control de activos y permite
registrar o corregir servicios historicos cuya secuencia operativa no se haya
capturado en tiempo real.

No se agregaran estatus de recepcion fijos o derivados en esta version. La fecha
`received_at` y el estatus operativo se administraran de manera independiente
por el usuario.

### Status

approved

## Decision 14. Materialization Behavior

### Decision Final

El servicio tendra cuatro grupos de materializacion de fecha, todos aislados
entre si y siempre persistidos:

- Semaforo de entrega al Cliente.
- Notificaciones de entrega al Cliente.
- Semaforo de retorno del Proveedor.
- Notificaciones de retorno del Proveedor.

Los semaforos se calculan exclusivamente contra su fecha estimada efectiva:
`estimated_customer_delivery_at` para Cliente y
`provider_estimated_return_at` para Proveedor. Las fechas de origen solo sirven
para el calculo inicial de esas estimaciones.

Si no existe la fecha estimada correspondiente, el semaforo se materializara con
el codigo de sistema `PENDING_ESTIMATED_DATE`, texto `Sin fecha estimada` y
estilo neutral. No tendra regla coincidente ni fecha efectiva de regla. Sus
notificaciones se materializaran con estructura de sistema, sin reglas ni
eventos de disparo.

Si el servicio no tiene Proveedor, los dos grupos del Proveedor se
materializaran con el codigo de sistema `NOT_APPLICABLE` y texto `No aplica`.

Cuando exista la fecha estimada, el semaforo podra resultar en un estado de
sistema o en una regla de politica de estatus. La materializacion de
notificaciones generara eventos solo si existe una politica de notificaciones
aplicable. Una politica de estatus nunca genera eventos.

Al cambiar a `Completado` o `Cancelado`, los semaforos mostraran el estado
terminal y se invalidaran los eventos de notificacion pendientes. Al volver a
`Pendiente` o `En proceso`, se recalcularan los grupos aplicables.

El refresco tecnico se ejecutara al crear o editar un servicio para los grupos
afectados, sin modificar auditoria de negocio. Los cambios o eliminaciones de
una politica refrescaran solo los servicios con `status: ACTIVE` y
`operationalStatus` `PENDING` o `IN_PROGRESS` que la referencien, y solo el
grupo correspondiente. El job de refresco aplicara los mismos dos criterios.

El seguimiento al Proveedor tendra una quinta materializacion aislada. Cada
regla embebida genera un evento desde `delivered_to_provider_at` mas su
intervalo. Los eventos se preservan entre refreshes para evitar duplicados; los
eventos pendientes afectados se invalidan si cambian su fecha de origen o la
regla. El refresher materializa e invalida: no envia correos.

### Status

approved

## Decision 15. MVP Create Contract

### Decision Final

El contrato de creacion del MVP se organizara por bloques y no aceptara campos
tecnicos, de auditoria ni materializaciones.

Los campos base del contrato viviran en raiz. El contrato recibira un bloque
`customer` con `customer_id` y `customer_user_ids`; no aceptara snapshots de
Cliente ni Usuarios, pues backend los resolvera y persistira. Sera requerido el
tipo de servicio, Cliente, al menos un Usuario relacionado con ese Cliente,
fecha de solicitud/registro y al menos un equipo.
`operational_status` sera opcional en la entrada y, si se omite, iniciara en
`PENDING`; la API aceptara un estatus operativo explicito para registrar
historicos. `status` no formara parte de la entrada: backend lo inicializara en
`ACTIVE`.

Cada equipo incluira nombre, identificador, marca, modelo y numero de serie;
sus observaciones seran opcionales. Las observaciones generales del servicio
tambien seran opcionales.

El bloque de entrega al Cliente admitira `received_at`, intervalo estimado,
fecha estimada ajustable manualmente, referencias opcionales de politicas y la
fecha real de entrega. Si se proporcionan fecha de origen e intervalo, backend
calculara la fecha estimada; una fecha estimada recibida explicitamente
prevalece como ajuste manual.

El bloque de Proveedor sera opcional. Si existe, admitira sus hitos, intervalo y
fecha estimada de retorno, politicas opcionales y configuracion embebida de
seguimiento. No se aceptaran datos propios del Proveedor sin `provider_id`; si
el seguimiento se habilita, debera contener al menos una regla.

`service_number`, identificador de dominio, auditoria y materializaciones se
generaran exclusivamente en backend.

### Status

approved

## Decision 16. Selection Dependencies And Auxiliary Capabilities

### Decision Final

El modulo derivara en backend las siguientes `auxiliary capabilities` ya
existentes al otorgarle permisos directos:

- `CUSTOMERS / READ_OPTIONS`, para seleccionar el Cliente.
- `EXPIRATION_STATUS_POLICIES / READ_OPTIONS`, para seleccionar las politicas
  de estatus de ambos compromisos.
- `EXPIRATION_NOTIFICATION_POLICIES / READ_OPTIONS`, para seleccionar las
  politicas de notificaciones de ambos compromisos.
- `RECIPIENT_GROUPS / READ_OPTIONS`, para seleccionar los grupos destinatarios
  del seguimiento al Proveedor.

Se agregaran dos lookups reutilizables y sus capabilities auxiliares:

- `PROVIDERS / READ_OPTIONS`, para seleccionar un Proveedor o laboratorio.
- un lookup no paginado de Usuarios activos relacionados con un Cliente, para
  seleccionar los responsables del servicio. Sera una capability auxiliar
  reutilizable y no concedera permisos administrativos sobre `USERS`.

Los nombres concretos de la ruta, capability y contrato minimo del lookup de
Usuarios se definiran en el diseno tecnico, conservando el patron de
`options` para respuestas ligeras de seleccion.

El catalogo administrable de tipos de servicio sera local al nuevo modulo. Su
lectura `options` se protegera mediante permiso directo del modulo consumidor,
sin incorporarse al catalogo de `auxiliary capabilities`.

El endpoint de opciones de grupos destinatarios se agregara en esta spec. El
flujo equivalente de control de activos seguira usando su listado
administrativo actual y queda fuera de alcance; se alineara en una spec futura.

Frontend no administrara ni evaluara estas capabilities: backend las derivara
y protegira los endpoints correspondientes.

### Status

approved

## Decision 17. Notification Materialization Shape

### Decision Final

Las materializaciones de notificaciones de entrega al Cliente y retorno del
Proveedor reutilizaran sin extensiones el mismo contrato de
`expiration_notification_materialization` de control de activos.

Cuando falte la fecha estimada aplicable o no exista una politica de
notificaciones, se persistira la materializacion de sistema vacia: sin reglas,
sin eventos y con `nextTriggerDate` en `null`. En esta version no se agregara
un codigo o motivo tecnico para distinguir ambas causas, pues no existe un
consumidor de presentacion ni de negocio para esa distincion.

### Status

approved

## Decision 18. Status Materialization Shape And Missing Dates

### Decision Final

Las materializaciones de estatus de entrega al Cliente y retorno del Proveedor
reutilizaran el contrato completo de `expiration_status_materialization` de
control de activos: `source`, `code`, `effectiveStartDate`, `label`,
`labelKey`, `colorHex`, `matchedRule` y `lastMaterializedAt`.

Cuando exista la fecha estimada aplicable, se conservara la precedencia actual:
los codigos terminales o vencidos de sistema prevalecen; despues una regla de
politica vigente puede materializar un estado `POLICY`; y, si no hay politica o
regla vigente, se materializa el estado de sistema correspondiente.

Se agrega exclusivamente para este modulo el codigo de sistema
`PENDING_ESTIMATED_DATE`. Si falta la fecha estimada aplicable, la
materializacion sera neutral con ese codigo, copy `Sin fecha estimada`,
`matchedRule: null` y sin fecha efectiva. Esta condicion prevalece incluso si
el servicio conserva una politica de estatus asociada: la politica no se
evalua hasta que exista la fecha estimada.

### Status

approved

## Decision 19. Provider Return Status Materialization

### Decision Final

`provider_return_status_materialization` reutilizara el mismo contrato,
precedencias y comportamiento de `customer_delivery_status_materialization` y
de `expiration_status_materialization` en control de activos. Su unica fecha
de referencia sera `provider_estimated_return_at`.

Sus escenarios base seran:

- Sin Proveedor: `SYSTEM / NOT_APPLICABLE`, con copy `No aplica`.
- Con Proveedor, sin fecha estimada de retorno: `SYSTEM /
  PENDING_ESTIMATED_DATE`, con copy `Sin fecha estimada`, incluso si conserva
  una politica asociada.
- Con Proveedor y fecha estimada: un codigo de sistema (`ON_TIME`, `OVERDUE`,
  `COMPLETED` o `CANCELLED`) o la regla vigente de la politica de estatus.

Como en control de activos, la ausencia de politica no deja el bloque vacio:
se materializa el estado derivado de sistema. Una politica solo reemplaza ese
resultado cuando una de sus reglas es vigente y el servicio permanece
operativo; la materializacion conserva el identificador de la regla concreta,
no solo de la politica.

### Status

approved

## Decision 20. Provider Return Notification Materialization

### Decision Final

`provider_return_notification_materialization` reutilizara sin extensiones el
contrato y comportamiento de `customer_delivery_notification_materialization`
y de `expiration_notification_materialization` de control de activos. Sus
reglas y eventos se calcularan exclusivamente a partir de
`provider_estimated_return_at`.

Sin Proveedor, sin fecha estimada de retorno o sin politica de notificaciones,
el bloque se persistira como materializacion de sistema vacia: sin reglas, sin
eventos y con `nextTriggerDate` en `null`. No se agregaran codigos ni motivos
tecnicos adicionales en esta version.

### Status

approved

## Decision 21. Provider Follow-Up Materialization

### Decision Final

Se creara `provider_follow_up_materialization` como quinto bloque aislado. No
enviara correos: materializara reglas y eventos futuros para un dispatcher que
se construira en otra spec.

Su estructura replicara el patron de las materializaciones de notificacion:
`source`, `nextTriggerDate`, `lastTriggeredAt`, conteo de reglas, reglas
materializadas, eventos con estados `PENDING`, `TRIGGERED`, `FAILED` o
`INVALIDATED`, y `lastMaterializedAt`.

Cada regla embebida de seguimiento recibira un `ruleId` estable al crearse. La
materializacion usara ese valor como `sourceRuleId`, junto con su intervalo,
`recipientGroupIds`, `ccRecipientGroupIds`, eventos y ultima ejecucion. Esto
permite reconciliar refreshes sin duplicar eventos y conservar los eventos ya
disparados o fallidos como historial tecnico.

Sin Proveedor, con seguimiento deshabilitado, sin reglas o sin
`delivered_to_provider_at`, se persistira una materializacion `SYSTEM` vacia,
sin reglas ni eventos. Con seguimiento habilitado y fecha de entrega al
Proveedor, cada regla generara un evento unico en
`delivered_to_provider_at + offset`. Al cambiar una regla, esa fecha base o al
deshabilitar el seguimiento, se invalidaran exclusivamente sus eventos
pendientes afectados.

El contrato se disena deliberadamente compatible con una futura politica de
seguimiento reutilizable. En ese escenario, reglas, grupos y eventos
mantendran el mismo shape; cambiaran principalmente `source` de
`EMBEDDED_CONFIGURATION` a `POLICY` y el origen de `sourceRuleId`. El futuro
dispatcher no debera distinguir ambos origenes para procesar eventos.

### Status

approved

## Decision 22. Module Authorization Boundary

### Decision Final

El modulo `CUSTOMER_SERVICE_RECORDS` tendra los permisos directos `READ`,
`CREATE`, `UPDATE`, `DELETE` y `MANAGE_SERVICE_TYPES`.

- `READ` autoriza el listado, detalle y el lookup local de opciones de tipos de
  servicio.
- `CREATE` autoriza la creacion de registros.
- `UPDATE` autoriza la edicion de datos y del estatus operativo.
- `DELETE` autoriza la baja logica.
- `MANAGE_SERVICE_TYPES` autoriza crear, activar y desactivar tipos de servicio.

La seleccion de recursos de otros dominios no se resolvera con accesos
administrativos implicitos ni se duplicara dentro del modulo. El frontend
consumira los lookups de Cliente, Proveedor, politicas, grupos destinatarios y
Usuarios relacionados con el Cliente, protegidos por las `auxiliary
capabilities` derivadas ya definidas para este modulo.

### Status

approved

## Decision 23. Customer Service Record Resource Routes

### Decision Final

El recurso principal conservara la superficie HTTP y convenciones de control de
activos:

```text
POST   /v1/customer-service-records
GET    /v1/customer-service-records
GET    /v1/customer-service-records/catalog
GET    /v1/customer-service-records/:recordId
PATCH  /v1/customer-service-records/:recordId
DELETE /v1/customer-service-records/:recordId
```

`GET /catalog` expondra solo datos fijos locales que necesita el formulario,
incluidos los estatus operativos localizados. Los tipos de servicio no formaran
parte de ese contrato porque son un catalogo administrable con rutas propias.

### Status

approved

## Decision 24. Service Type Catalog Routes

### Decision Final

Los tipos de servicio seran un recurso anidado al modulo:

```text
GET   /v1/customer-service-records/service-types
POST  /v1/customer-service-records/service-types
PATCH /v1/customer-service-records/service-types/:serviceTypeId
GET   /v1/customer-service-records/service-types/options
```

El listado administrativo, la creacion y el `PATCH` requeriran
`MANAGE_SERVICE_TYPES`. En el MVP el `PATCH` solo aceptara `status` para
activar o desactivar el tipo. La ruta no quedara amarrada a un cambio de
estatus: campos administrables futuros podran agregarse al mismo contrato sin
crear rutas especificas por propiedad.

`GET /options` requerira `READ` del modulo y devolvera exclusivamente los tipos
activos aptos para la captura de servicios.

### Status

approved

## Decision 25. External Lookup Routes

### Decision Final

El formulario reutilizara los lookups existentes:

```text
GET /v1/customers/options
GET /v1/expiration-status-policies/options
GET /v1/expiration-notification-policies/options
```

Esta spec agregara los lookups faltantes:

```text
GET /v1/providers/options
GET /v1/recipient-groups/options
GET /v1/customers/:customerId/users/options
```

Excepto el catalogo local de tipos de servicio, todos estos endpoints se
protegeran mediante capabilities auxiliares. El lookup de Usuarios devolvera,
sin paginacion, solo Usuarios activos relacionados con el Cliente indicado y
con un contrato compacto para seleccion.

### Status

approved

## Decision 29. New Auxiliary Capability Names

### Decision Final

Esta spec incorporara al catalogo maestro las capabilities auxiliares:

```text
PROVIDERS / READ_OPTIONS
RECIPIENT_GROUPS / READ_OPTIONS
CUSTOMERS / READ_RELATED_USERS_OPTIONS
```

`CUSTOMERS / READ_RELATED_USERS_OPTIONS` protege
`GET /v1/customers/:customerId/users/options`. Aunque devuelva resumenes de
Usuarios, la capability pertenece al dominio de Clientes porque consulta una
relacion de Cliente y no concede `USERS / READ` ni permisos administrativos de
Clientes.

Las tres capabilities se derivaran automaticamente desde
`CUSTOMER_SERVICE_RECORDS`, junto con las capabilities ya existentes de
Clientes y politicas. Seran reutilizables por modulos futuros sin exponer su
administracion al frontend.

### Status

approved

## Decision 30. Create Request Shape

### Decision Final

`POST /v1/customer-service-records` recibira campos base en raiz y los bloques
`customer`, `assets`, `customer_delivery` y `provider`.

El bloque `customer` recibira `customer_id` y `customer_user_ids`; backend
resolvera sus snapshots. `assets` recibira al menos un snapshot de activo con
nombre, identificador, marca, modelo, numero de serie y observaciones
opcionales.

`customer_delivery` recibira opcionalmente `received_at`,
`estimated_delivery_interval`, `estimated_delivery_at`, referencias de
politicas y `delivered_to_customer_at`.

`provider` sera opcional. Cuando exista, recibira `provider_id`, sus hitos,
intervalo y fecha estimada de retorno, referencias de politicas y la
configuracion `follow_up` con reglas de intervalo y grupos destinatarios.

Las propiedades `estimated_delivery_at` y `estimated_return_at` podran
omitirse para que backend las calcule a partir de su fecha base e intervalo, o
enviarse explicitamente para conservar un ajuste manual. Los campos tecnicos,
snapshots, auditoria, consecutivo y materializaciones no se aceptaran en la
entrada.

### Status

approved

## Decision 26. Patch Semantics And Selective Refresh

### Decision Final

`PATCH /v1/customer-service-records/:recordId` tendra semantica parcial: un
campo omitido no se modifica.

- `assets` y `customer`, cuando se envien, reemplazaran integramente sus listas
  o relaciones respectivas.
- `customerDelivery` y `provider`, cuando se envien como objeto, actualizaran
  solo las propiedades incluidas.
- `provider: null` eliminara el bloque completo de Proveedor.
- `provider.followUp.rules`, cuando se envie, reemplazara la configuracion
  completa de reglas.
- Las fechas opcionales enviadas como `null` se limpiaran explicitamente.

Los refreshers tecnicos se invocaran selectivamente y no modificaran
`updatedAt` ni `updatedBy`:

- Al crear, se refrescaran todos los bloques aplicables.
- Un cambio de `operationalStatus` refrescara todos los bloques aplicables. Al
  completar o cancelar se materializaran estados terminales e invalidaran
  eventos pendientes; al volver a `PENDING` o `IN_PROGRESS`, se recalcularan.
- Cambios en `customerDelivery.receivedAt`, intervalo, fecha estimada o politica
  de estatus refrescaran solo el semaforo de Cliente.
- Cambios de politica de notificaciones de Cliente refrescaran solo sus eventos.
- Cambios de Proveedor, fecha de entrega, intervalo, fecha estimada o politica
  de estatus refrescaran solo el semaforo de retorno del Proveedor.
- Cambios de politica de notificaciones de Proveedor refrescaran solo sus
  eventos.
- Cambios en `provider.followUp` o `deliveredToProviderAt` refrescaran solo el
  seguimiento al Proveedor.
- `provider: null` refrescara los tres bloques de Proveedor para dejarlos no
  aplicables o sin eventos.
- Cambios en tipo, Cliente, Usuarios del Cliente, activos, observaciones o
  `requestedAt` no refrescaran materializaciones.

### Status

approved

## Decision 27. Response Contracts And Presentation Data

### Decision Final

El modulo tendra presenters diferenciados por proposito:

- El listado devolvera identificacion del servicio, Cliente, Proveedor, tipo de
  servicio, estatus operativo, fechas principales y las dos materializaciones
  de semaforo necesarias para pintar, filtrar y ordenar la tabla.
- El detalle devolvera todos los bloques persistidos, snapshots, reglas y las
  cinco materializaciones.
- Las respuestas de creacion y edicion reutilizaran el contrato completo de
  detalle.
- Los lookups devolveran solo identificador, `code` cuando exista y el texto
  minimo para seleccion.

Los presenters devolveran tanto los valores tecnicos como los copies
localizados necesarios para la capa de presentacion. Frontend no reconstruira
labels de estatus, tipos o materializaciones a partir de sus codigos.

### Status

approved

## Decision 28. List Query Contract

### Decision Final

El listado reutilizara la sintaxis de paginacion y ordenamiento de control de
activos: `page`, `limit` y `sort[n][field]` / `sort[n][direction]`.

Aceptara los filtros:

- `search`, sobre numero de servicio, tipo, activos, identificadores, Cliente y
  Proveedor.
- `operational_status`.
- `service_type_code`.
- `customer_id` y `customer_user_id`.
- `provider_id` y `has_provider`.
- Rangos date-only `*_from` / `*_to` para `requested_at`, `received_at`,
  `estimated_customer_delivery_at` y `provider_estimated_return_at`.

El orden natural por defecto sera `created_at desc`. Se permitiran sortings
simples y compuestos por los campos expuestos; al ordenar por una fecha, los
registros sin esa fecha se ubicaran al final. La interfaz podra combinar
`operational_status` con las fechas estimadas para sus vistas operativas.

No se agregara en este MVP un perfil de severidad predefinido ni filtros por
reglas de politica. Un futuro `sort_profile` podra concentrar una priorizacion
operativa cuando negocio valide su ponderacion definitiva.

### Status

approved

## Decision 22. Technical Refresh Orchestration

### Decision Final

Los cinco refreshers de materializacion viviran aislados y seran reutilizables
desde las operaciones de negocio, los cambios de politicas y el job tecnico:

- estatus de entrega al Cliente;
- notificaciones de entrega al Cliente;
- estatus de retorno del Proveedor;
- notificaciones de retorno del Proveedor; y
- seguimiento al Proveedor.

Un orquestador tecnico coordinara solo los refreshers que correspondan a cada
cambio. Sus escrituras actualizaran exclusivamente materializaciones, sin
modificar `updatedAt` ni `updatedBy`.

La matriz inicial sera:

- Al crear un servicio se calculan los cinco bloques.
- Un cambio de estatus operativo refresca los cinco bloques. `Completado` y
  `Cancelado` invalidan los eventos pendientes, incluidos los seguimientos al
  Proveedor; al volver a `Pendiente` o `En proceso`, se recalculan los bloques
  aplicables.
- Cambios de `received_at`, intervalo o fecha estimada de entrega al Cliente
  refrescan sus dos bloques; cambios de cada referencia de politica refrescan
  solo el bloque que corresponda.
- Cambios de Proveedor, intervalo, fecha estimada o politicas de retorno
  refrescan solo sus dos bloques; quitar el Proveedor los deja no aplicables.
- Cambios de `delivered_to_provider_at`, habilitacion, reglas, intervalos o
  grupos del seguimiento refrescan solo su materializacion.
- Editar o eliminar una politica refresca unicamente los servicios con
  `status: ACTIVE` y `operationalStatus` `PENDING` o `IN_PROGRESS` que la
  referencien, y solo el bloque afectado.
- Cambios de membresia de grupos destinatarios no refrescan eventos: los
  eventos guardan IDs de grupo y el dispatcher futuro resolvera sus miembros
  vigentes al enviar.
- El job tecnico recorrera servicios con `status: ACTIVE` y
  `operationalStatus` `PENDING` o `IN_PROGRESS`, y reutilizara los mismos
  refreshers para todos los bloques aplicables.

### Status

approved

## Decision 23. Service Deletion

### Decision Final

La baja sera logica y seguira el patron de control de activos. El campo tecnico
`status` cambiara a `DELETED`; el `operationalStatus` se conservara sin
alteracion. El registro quedara excluido de listados,
detalles y lookups normales, y conservara su consecutivo, bloques de datos,
relaciones, evidencia futura y auditoria para trazabilidad. No se incluira
restauracion en el MVP.

Al eliminarlo, las dos materializaciones de estatus se estableceran en `null`.
Las tres materializaciones de notificacion conservaran su historial tecnico,
pero invalidaran todos los eventos `PENDING`, incluidos los seguimientos al
Proveedor.

La eliminacion es una accion de negocio y actualizara su auditoria. El refresh
tecnico asociado no generara una segunda actualizacion de `updatedAt` ni
`updatedBy`. Cambios posteriores de politicas y el job tecnico excluiran los
servicios eliminados.

### Status

approved

## Decision 24. Technical Module Identity

### Decision Final

El modulo se nombrara tecnicamente `CUSTOMER_SERVICE_RECORDS`, con el recurso
HTTP `customer-service-records` y rutas bajo
`/v1/customer-service-records`. El concepto transversal en entidades, casos de
uso, repositorios y contratos sera `CustomerServiceRecord`.

Este nombre representa el recurso persistido y su ciclo completo, sin asumir
que siempre proviene de una solicitud formal. Tambien reserva
`CUSTOMER_SERVICE_OPERATIONS` para un posible modulo futuro de operaciones
tecnicas detalladas por equipo.

`Heijunka` no formara parte del nombre tecnico del recurso: podra construirse
posteriormente como una vista o modulo de planeacion y nivelacion que consume
los registros de servicio sin duplicar sus datos.

El modulo tendra las operaciones directas `CREATE`, `READ`, `UPDATE` y
`DELETE`, mas `MANAGE_SERVICE_TYPES` para administrar su catalogo local de
tipos. La lectura `options` de dicho catalogo requerira `READ`; su CRUD
requerira `MANAGE_SERVICE_TYPES`.

### Status

approved

## Decision 25. Customer Service Record Aggregate

### Decision Final

`CustomerServiceRecord` sera el aggregate root del MVP. Sus campos base viviran
en raiz para mantener visible la identidad y operacion central del servicio:
`serviceNumber`, `serviceTypeCode`, `serviceTypeName` como snapshot,
`requestedAt`, `operationalStatus` y observaciones generales.

Agrupara unicamente bloques embebidos con limites propios de dominio:

- `customer`: `customerId`, `customerName` como snapshot y una lista de
  Usuarios con `userId`, nombre y correo como snapshots.
- `assets`: lista de equipos capturados como snapshots.
- `customerDelivery`: `receivedAt`, `estimatedDeliveryInterval`,
  `estimatedDeliveryAt`, `deliveredToCustomerAt`, referencias de politicas y
  sus dos materializaciones.
- `provider`: bloque opcional con Proveedor, fechas, intervalo, politicas, sus
  dos materializaciones y seguimiento embebido. Contendra `providerId` y
  `providerName` como snapshot; `deliveredToProviderAt`,
  `estimatedReturnInterval`, `providerEstimatedReturnAt` y
  `returnedFromProviderAt`; `statusPolicyId` y `notificationPolicyId`; y el
  bloque `followUp` con su bandera, reglas estables y grupos destinatarios. Sus
  tres materializaciones permanecen dentro del mismo bloque. Si no existe
  Proveedor, el bloque no se persiste.
- `status`: estado tecnico raiz del recurso (`ACTIVE` o `DELETED`).
- auditoria raiz.

Cada elemento de `assets` tendra un `assetId` estable. Cada regla embebida de
seguimiento al Proveedor tendra un `ruleId` estable. No se asignaran IDs a
intervalos, bloques simples ni materializaciones.

Los futuros datos logisticos se evaluaran cuando negocio los requiera; podran
incorporarse como bloque embebido si comparten el ciclo de vida del registro.
Documentos, evidencias y archivos se evaluaran como recursos independientes
cuando se implemente esa capacidad. No se asume ningun futuro modulo de
operaciones tecnicas por equipo: esa fue una hipotesis de naming, no alcance
planeado.

### Status

approved

## Decision 26. Customer Reference Integrity

### Decision Final

Crear un registro o cambiar su Cliente requerira un Cliente `ACTIVE`. El
registro conservara un snapshot minimo de su nombre para lectura historica.

Si el Cliente se desactiva o se elimina despues, los registros que ya lo
referencian permaneceran consultables y editables sin alteracion ni cascada.
No podra seleccionarse para nuevos registros ni como nuevo Cliente de un
registro existente. La baja de un Cliente no se bloqueara por tener registros
historicos asociados.

### Status

approved

## Decision 27. Technical And Operational Status Separation

### Decision Final

El aggregate tendra dos campos de estado con responsabilidades distintas:

- `status`: estado tecnico del recurso, con valores `ACTIVE` y `DELETED`.
  Es consistente con los demas modulos, se inicializa en `ACTIVE` y no se
  modifica por operaciones ordinarias de negocio. La baja logica lo cambia a
  `DELETED`.
- `operationalStatus`: estado de negocio del servicio, con valores `PENDING`,
  `IN_PROGRESS`, `COMPLETED` y `CANCELLED`. Es el estatus que se muestra,
  filtra, ordena y actualiza mediante las operaciones de negocio.

Los refreshers, cambios de politicas y el job tecnico evaluaran ambos campos:
solo procesaran registros con `status: ACTIVE` y `operationalStatus` `PENDING`
o `IN_PROGRESS`. `COMPLETED` y `CANCELLED` conservan sus materializaciones e
historial, pero no reciben refreshes inducidos por politicas; al entrar a un
estado terminal se invalidan sus eventos pendientes. Los registros `DELETED`
quedan excluidos de toda operacion de refresco.

Los contratos de lectura dirigidos a frontend expondran el estado operativo y
su copy localizado (`operational_status_name`). `status` se mantendra como dato
tecnico del aggregate y no sustituira el estatus operativo en la presentacion.

### Status

approved

## Decision 28. Provider Block Shape

### Decision Final

`provider` sera un bloque opcional autocontenido. Su forma de dominio sera:

```ts
provider: {
  providerId,
  providerName,
  deliveredToProviderAt,
  estimatedReturnInterval: { years, months, weeks, days },
  providerEstimatedReturnAt,
  returnedFromProviderAt,
  statusPolicyId,
  notificationPolicyId,
  followUp: {
    enabled,
    rules: [{ ruleId, interval, recipientGroupIds, ccRecipientGroupIds }],
  },
  statusMaterialization,
  notificationMaterialization,
  followUpMaterialization,
}
```

`providerName` sera snapshot historico. Los nombres de referencias y
materializaciones no repetiran el prefijo `provider` dentro del bloque, porque
su contexto ya es inequivoco. Si no hay Proveedor, backend no persistira el
bloque y representara sus resultados derivados como no aplicables.

### Status

approved

## Decision 29. Customer Delivery Block Shape

### Decision Final

`customerDelivery` sera un bloque embebido con los hitos, estimacion, politicas
y materializaciones del compromiso con el Cliente:

```ts
customerDelivery: {
  receivedAt,
  estimatedDeliveryInterval: { years, months, weeks, days },
  estimatedDeliveryAt,
  deliveredToCustomerAt,
  statusPolicyId,
  notificationPolicyId,
  statusMaterialization,
  notificationMaterialization,
}
```

`receivedAt` sera la fecha base para calcular inicialmente
`estimatedDeliveryAt`. Una fecha estimada recibida de forma explicita se
conservara como ajuste manual. Los nombres internos del bloque no repetiran el
prefijo `customer`, porque `customerDelivery` ya define el contexto.

### Status

approved

## Decision 30. Asset Snapshot Shape

### Decision Final

`assets` sera una lista de snapshots con la siguiente forma:

```ts
assets: [
  {
    assetId,
    name,
    identifier,
    brand,
    model,
    serialNumber,
    observations,
  },
]
```

`assetId` sera generado por backend y estable dentro del registro; no
representa una entidad maestra de activos. Todos los demas campos seran
obligatorios, excepto `observations`. `identifier` sera unico dentro de cada
registro, sin impedir que el mismo activo aparezca en otros servicios.

El contrato de backend aceptara una lista de uno o mas activos; el MVP de
frontend enviara exactamente uno.

### Status

approved

## Decision 31. Persistence And Initial Indexes

### Decision Final

El modulo usara tres colecciones:

- `customer_service_records` para el aggregate `CustomerServiceRecord` y sus
  bloques embebidos (`customer`, `assets`, `customer_delivery`, `provider` y
  materializaciones).
- `customer_service_record_service_types` para el catalogo local administrable
  de tipos de servicio.
- `internal_sequence_counters` como infraestructura generica de consecutivos.

El contador tendra una clave unica `CUSTOMER_SERVICE_RECORDS`. El caso de uso de
creacion lo incrementara de forma atomica y persistira el registro dentro del
mismo `ITransactionalExecutor`; si la transaccion se revierte, tampoco se
confirmara el consecutivo.

`customer_service_records` tendra un indice unico para `service_number`. Sus
indices iniciales cubriran el listado activo y sus filtros principales:

- `status` y `createdAt` descendente como orden natural.
- `status` con `operational_status`.
- `status` con `service_type_code`.
- `status` con `customer.customer_id`.
- `status` con `customer.users.user_id`.
- `status` con `provider.provider_id`.
- `status` con cada fecha estimada de compromiso (`customer_delivery` y
  `provider`) para rangos y ordenamientos de fecha.

No se agregaran indices de texto en esta primera version. La busqueda se
implementara conforme al contrato del MVP y se medira con datos reales antes de
introducir indices adicionales.

Los subdocumentos embebidos no tendran `_id` de Mongo salvo los IDs estables de
dominio que ya se aprobaron para activos y reglas de seguimiento.

### Status

approved

## Decision 32. Domain Boundaries And Repository Ports

### Decision Final

`CustomerServiceRecord` sera el aggregate principal. Mantendra invariantes de
sus bloques, normalizacion de intervalos, snapshots, IDs estables de activos y
reglas, actualizacion parcial y baja logica.

Separara explicitamente `status` tecnico (`ACTIVE`/`DELETED`) de
`operationalStatus` de negocio (`PENDING`, `IN_PROGRESS`, `COMPLETED`,
`CANCELLED`). Los bloques se representaran con interfaces de valor cohesivas,
no con clases artificiales: intervalo, Cliente y snapshots de Usuarios,
activos, entrega al Cliente, Proveedor, seguimiento y materializaciones.

`CustomerServiceRecordServiceType` sera una entidad independiente. Sus
propiedades `code` y `name` seran inmutables; solo cambiara su `status` de
catalogo.

Se definiran puertos separados:

- `ICustomerServiceRecordReadRepository`: detalle, listado y lectura
  operacional paginada por cursor para refreshers y jobs.
- `ICustomerServiceRecordWriteRepository`: crear, actualizar el aggregate y
  `updateMaterializations(...)`, limitado a campos tecnicos sin modificar
  auditoria de negocio.
- Repositorios de lectura y escritura propios para
  `CustomerServiceRecordServiceType`.
- `ISequenceCounterRepository`, con `nextValue(CUSTOMER_SERVICE_RECORDS)`.
  No iniciara transacciones: operara dentro del contexto iniciado por el caso
  de uso mediante `ITransactionalExecutor`.

Los repositorios de registros no consultaran ni devolveran politicas. Los
refreshers usaran los repositorios propios de politicas y solicitaran al
repositorio de registros exclusivamente los registros activos y operativos que
referencien la politica y bloque afectado.

La normalizacion y validacion de Cliente, Usuarios del Cliente, Proveedor, tipo
de servicio y grupos destinatarios se aislara en servicios de aplicacion
reutilizables. Los use cases conservaran responsabilidad de orquestacion.

### Status

approved

## Decision 33. Application Flows And Isolated Services

### Decision Final

El recurso principal tendra estos casos de uso:

- `CreateCustomerServiceRecordUseCase`.
- `GetCustomerServiceRecordsUseCase`.
- `GetCustomerServiceRecordByIdUseCase`.
- `UpdateCustomerServiceRecordUseCase`.
- `DeleteCustomerServiceRecordUseCase`.
- `GetCustomerServiceRecordCatalogUseCase`.
- `RefreshCustomerServiceRecordMaterializationsUseCase`.

La creacion preparara y validara los bloques, calculara estimaciones cuando
corresponda y materializara los cinco grupos. Solo la asignacion del
consecutivo y la persistencia del aggregate se ejecutaran dentro de la misma
transaccion.

La edicion aplicara el contrato `PATCH` por bloques y ejecutara exclusivamente
los refreshers afectados. La baja logica anulara semaforos e invalidara eventos
pendientes sin una segunda actualizacion de auditoria.

El refresher tecnico se expondra como operacion cursor-based, protegida por
lock y con conteos separados para las cinco materializaciones. El futuro job
reutilizara este mismo flujo sin duplicar logica.

El catalogo local tendra:

- `GetCustomerServiceRecordServiceTypesUseCase`.
- `GetCustomerServiceRecordServiceTypeOptionsUseCase`.
- `CreateCustomerServiceRecordServiceTypeUseCase`.
- `UpdateCustomerServiceRecordServiceTypeUseCase`, limitado inicialmente a
  activar o desactivar.

Los use cases delegaran en servicios aislados:

- `CustomerServiceRecordInputPreparationService` orquesta la preparacion y
  detecta los bloques modificados.
- Preparadores de Cliente/Usuarios, tipo de servicio, Proveedor y seguimiento
  resuelven referencias, vigencia y snapshots.
- `CustomerServiceRecordTechnicalMaterializationsRefresherService` orquesta
  los cinco refreshers especializados.
- `CustomerServiceRecordPresentationDataService` prepara las dependencias de
  los presenters sin contaminar los flujos CRUD.

Los endpoints `options` de referencias externas permanecen en sus modulos
dueños. Las actualizaciones o bajas de politicas invocaran un refresher de
referencias de este aggregate: solo procesara registros `ACTIVE` con
`operationalStatus` `PENDING` o `IN_PROGRESS` y solo escribira el bloque de
compromiso afectado.

### Status

approved

## Decision 34. HTTP Contracts, Presentation And Localization

### Decision Final

Las solicitudes HTTP mantendran `snake_case`; los DTOs de aplicacion usaran
`camelCase`. Los presenters incluiran todos los valores localizados necesarios
para que frontend solo presente datos, junto a sus codigos tecnicos.

Todo catalogo fijo visible devolvera `{ code, name, name_key }`, incluidos
estatus operativo y tecnico, fuentes y estatus de eventos. Los semaforos
devolveran `code`, `name`, `name_key`, `color_hex`, `source` y
`effective_start_date`. Cuando su fuente sea `SYSTEM`, `name` y `name_key`
provendran de i18n; cuando sea `POLICY`, `name` sera la etiqueta persistida de
la politica y `name_key` sera `null`.

El nombre del tipo de servicio es dato persistido de negocio y no una copia
localizada. Sus respuestas devolveran `code` y `name`, sin `name_key`.

`POST /v1/customer-service-records` requerira `service_type_code`,
`requested_at`, `customer` y `assets` con al menos un elemento.
`operational_status` sera opcional y tomara `PENDING` por default, sin impedir
capturas historicas con los otros valores permitidos.

`PATCH /v1/customer-service-records/:recordId` aceptara exclusivamente campos
modificados: la omision conserva el valor actual; `null` limpia fechas
opcionales o el bloque `provider`; y `assets` y `customer` reemplazan
completamente su lista o bloque cuando se envian.

El listado devolvera resumen operativo, ambos semaforos, fechas relevantes y
auditoria compacta. Detalle, creacion y edicion incluiran todos los bloques,
snapshots, politicas resumidas, reglas, eventos materializados y auditoria.
Las opciones de tipos de servicio solo incluiran los activos como `{ code,
name }`.

`DELETE /v1/customer-service-records/:recordId` respondera `204 No Content`.
El refresco sera una operacion interna:
`POST /v1/internal-jobs/customer-service-records/materializations/refresh`,
con cursor opcional, lock y conteos independientes para las cinco
materializaciones.

CRUD requerira `CUSTOMER_SERVICE_RECORDS` con la operacion correspondiente;
la administracion del catalogo requerira `MANAGE_SERVICE_TYPES` y sus opciones
requeriran `READ`. El refresco interno no usara permisos de usuario final.

Errores de referencias no encontradas o inactivas, Usuarios ajenos al Cliente,
identificadores de activos duplicados, reglas invalidas y filtros u ordenes
invalidos tendran codigos estables y mensajes localizados por el filtro global.

### Status

approved

## Decision 35. Authorization, Capabilities And Independent Seeds

### Decision Final

El catalogo de autorizacion agregara `CUSTOMER_SERVICE_RECORDS` con
`CREATE`, `READ`, `UPDATE`, `DELETE` y `MANAGE_SERVICE_TYPES`. La operacion y
el modulo tendran copias en espanol e ingles, junto con los valores fijos que
los presenters expongan: estatus tecnico y operativo, semaforos, fuentes y
eventos materializados.

Cualquier permiso directo de `CUSTOMER_SERVICE_RECORDS` derivara estas
capabilities auxiliares sin conceder administracion de los modulos propietarios:

- `CUSTOMERS / READ_OPTIONS`.
- `CUSTOMERS / READ_RELATED_USERS_OPTIONS`.
- `PROVIDERS / READ_OPTIONS`.
- `RECIPIENT_GROUPS / READ_OPTIONS`.
- `EXPIRATION_STATUS_POLICIES / READ_OPTIONS`.
- `EXPIRATION_NOTIFICATION_POLICIES / READ_OPTIONS`.

El seed de roles actualizara por completo los roles de sistema. Para roles
custom, recalculara exclusivamente capabilities derivadas a partir de sus
permisos, mediante escritura directa que no modifica `updatedAt`.

El catalogo inicial de tipos se cargara mediante el seed idempotente
`customer-service-record-service-types`, con los codigos:
`AJUSTE`, `AJUSTE_Y_CALIBRACION`, `ANALISIS`, `CALIBRACION`,
`CALIBRACION_EN_SITIO`, `EQUIPO_AUXILIAR`, `FABRICACION`, `GARANTIA`,
`LOGISTICA`, `MANTENIMIENTO_CORRECTIVO`,
`MANTENIMIENTO_CORRECTIVO_Y_CALIBRACION`,
`MANTENIMIENTO_CORRECTIVO_AJUSTE_Y_CALIBRACION`,
`MANTENIMIENTO_PREVENTIVO`, `MANTENIMIENTO_PREVENTIVO_Y_CALIBRACION`,
`RENTA_DE_EQUIPO`, `REUBICACION`, `REVISION`, `SOPORTE_Y_CAPACITACION` y
`VENTA`.

El seed solo creara codigos ausentes. No renombrara, reactivara ni modificara
tipos existentes.

Cada seed tendra un comando propio e idempotente, como las migraciones. No se
mantendra un comando operativo que ejecute todos los seeds en conjunto. Para
este modulo se agregara
`db:seed:customer-service-record-service-types`; los roles conservaran
`db:seed:roles` y el seed actual de contactos recibira su propio comando.
La ejecucion de cualquier seed o migracion permanecera a cargo del usuario.

### Status

approved
