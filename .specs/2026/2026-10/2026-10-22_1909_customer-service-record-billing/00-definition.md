# Facturacion de registros de servicio a clientes (backend)

## Estado

- Initiative: `customer-service-record-billing`
- Date: `2026-10-22`
- Definition status: completed
- Implementation ready: yes
- Implementation status: in_progress
- Validation status: pending
- Spec status: in_progress

## Problema y resultado esperado

Los registros de servicio a clientes ya tienen estatus tecnico y operativo, pero no un estado independiente del flujo de facturacion. Los datos actuales de factura son una referencia y una coleccion de adjuntos. Se requiere distinguir registros no enviados, enviados a facturacion y facturados; habilitar un modulo de permisos separado para el personal de facturacion; conservar la edicion operativa bajo su permiso existente; y avisar por correo cuando un usuario envia explicitamente un registro a facturacion.

## Alcance aprobado

- Agregar `billingStatus` al agregado `CustomerServiceRecord` y `billing_status` a la coleccion `customer_service_records`, independiente de `status`, `operationalStatus` e `invoice`. Valores: `NOT_SUBMITTED`, `SUBMITTED`, `INVOICED`. Nuevos registros: `NOT_SUBMITTED`.
- Responder el estado como objeto internacionalizado `{ code, name, name_key }`. Etiquetas en espanol: `Sin enviar a facturacion`, `Enviado a facturacion`, `Facturado`. Mantener el patron de traducciones del API para todos los idiomas soportados.
- Crear una migracion con dry-run, apply y verificacion. Solo los registros historicos sin `billing_status` reciben un valor. Si `invoice.files` contiene al menos un archivo vigente, `INVOICED`; los demas, `NOT_SUBMITTED`. Una referencia sola, un objeto `invoice` vacio o solo `invoice.removed_files` no cuentan. No alterar `updatedAt`, `updatedBy` ni otros campos de auditoria. No enviar correos durante la migracion.
- Agregar una accion explicita de cambio de estado al modulo administrativo, protegida por `customer_service_records:UPDATE`. Ese modulo permite los tres valores sin restricciones de transicion en esta version.
- Agregar el modulo tecnico de autorizacion `BILLING_CUSTOMER_SERVICE_RECORDS`, con `READ` y `UPDATE` propios. El modulo de facturacion tiene controlador, contratos, queries, comandos, handlers, casos de uso y presenter independientes del modulo administrativo; comparte agregado y persistencia, no los casos de uso de negocio.
- La lectura de facturacion incluye informacion completa del registro, pero solo de registros tecnicamente `ACTIVE` con estado `SUBMITTED` o `INVOICED`. La restriccion aplica en listado y detalle. Un ID fuera de ese conjunto responde como no visible.
- El listado de facturacion devuelve los mismos campos por registro que el listado administrativo; el detalle de facturacion devuelve los mismos campos que el detalle administrativo. Los dos pares incluyen los nuevos campos `billing_status` y estado del ultimo aviso, con igual estructura y traducciones. La factura y sus adjuntos siguen el contrato actual de detalle, no se agregan al listado solo por pertenecer a facturacion. Los envelopes existentes de listado/detalle se conservan. La paridad de respuesta no implica compartir controlador, query, caso de uso ni presenter entre modulos; difieren la visibilidad y las escrituras permitidas.
- El listado y el detalle administrativos tambien incorporan `billing_status` y estado del ultimo aviso sin retirar ni renombrar campos existentes.
- Ambos listados aceptan `billing_status` como filtro opcional. El administrativo admite `NOT_SUBMITTED`, `SUBMITTED` e `INVOICED`; facturacion admite solo `SUBMITTED` e `INVOICED` y siempre excluye `NOT_SUBMITTED`, aun sin filtro. Cada modulo ofrece sus propias opciones de estado mediante un endpoint auxiliar local protegido por su permiso `READ`; no se agrega una capability auxiliar derivada ni un permiso nuevo para estas opciones. Los nombres internacionalizados proceden del mismo enum.
- `billing_customer_service_records:UPDATE` solo permite alternar entre `SUBMITTED` e `INVOICED`, editar `invoice.reference_number` y reconciliar `invoice.files`. No permite editar cliente, equipos, datos operativos u otros documentos. Adjuntar o editar la factura no cambia automaticamente `billing_status`.
- Enviar un aviso exclusivamente cuando una accion explicita cambie el estado desde un valor distinto de `SUBMITTED` hacia `SUBMITTED`. Guardar de nuevo un registro que ya este en `SUBMITTED` no reenvia el correo; salir de ese estado y volver a entrar genera un nuevo intento. Debe incluir consecutivo del registro, nombre del cliente y todos los equipos, con nombre, identificador, marca, modelo, numero de serie y observaciones cuando existan. No adjuntar archivos ni afirmar que el servicio esta completado sin comprobarlo.
- Persistir y exponer `billing_notification` como objeto del ultimo intento de aviso de facturacion, independiente de `billing_status` (campo al nivel del registro) y de las notificaciones operativas ya existentes. Sus estados son `NOT_REQUESTED` (sin intento), `SENT` (aceptado por el proveedor) y `FAILED` (intento fallido). `NOT_REQUESTED` tiene fechas y causa nulas; `SENT` tiene fecha de intento y aceptacion, con causa nula; `FAILED` tiene fecha de intento y causa sanitizada, con fecha de aceptacion nula. Cada intento reemplaza los datos del anterior. El envio es sincrono; no se necesita un `PENDING` persistido. `SENT` no garantiza entrega al buzon. La migracion historica no crea intentos: deja `NOT_REQUESTED` incluso para registros clasificados como `INVOICED`.
- Para una transicion explicita hacia `SUBMITTED`, intentar primero el correo. Solo si el proveedor lo acepta, persistir `billing_status = SUBMITTED` y el resultado `SENT` juntos. Si falla el envio, conservar el `billing_status` anterior, registrar `FAILED` para el intento y responder con error HTTP de codigo estable y mensaje internacionalizado. Si el correo fue aceptado pero falla la escritura, devolver el error de persistencia; el registro conserva su estado anterior y puede volver a intentarse.
- Configurar destinatarios mediante `CUSTOMER_SERVICE_BILLING_NOTIFICATION_RECIPIENTS_TO` y copias mediante `CUSTOMER_SERVICE_BILLING_NOTIFICATION_RECIPIENTS_CC`. Ambas variables representan listas de direcciones de correo; sus valores no se registran en esta spec. El adaptador de infraestructura interpreta y valida las listas. Los valores reales se configuraran en `.env` y en el entorno desplegado durante implementacion/operacion.
- La migracion no envia correos ni crea indices. Puede ejecutarse antes de agregar las variables de destinatarios al `envSchema`; si se ejecuta despues, el loader compartido exigira esas variables aunque el script no envie correos. Deben estar configuradas antes de desplegar la API con el sender. El indice nuevo se declara en el schema y Mongoose lo crea al arrancar la API con la configuracion actual. El backfill y el despliegue se haran en una ventana sin nuevas altas; si las hubiera, se repite el backfill pendiente antes de cerrar la validacion.
- Conservar el contrato y los permisos de las rutas operativas y de acceso de clientes salvo las adiciones expresamente definidas. Documentar el nuevo contrato para el frontend y actualizar la documentacion viva de autorizacion al implementar.
- El modulo de acceso de clientes externo no adquiere por inferencia los campos de facturacion; su contrato acotado queda sin cambios salvo decision posterior explicita.

## Fuera de alcance

- Vista Next Dashboard, navegacion y agrupador visual `Facturacion`: requieren una spec de frontend independiente. Backend solo registra modulos de permisos, no submodulos jerarquicos.
- Emision automatica de facturas, integracion con proveedores externos o nuevas entidades de facturacion.
- Flujo de devolucion para correccion, motivo de devolucion o un cuarto estado. Se definiran si aparecen casos de uso reales.
- Endpoint dedicado de reenvio y reintentos automaticos del correo; el estado del ultimo intento es solo informativo en esta version. Una nueva transicion explicita hacia `SUBMITTED` si genera un nuevo intento.
- Inferir cambios de estado por adjuntar archivos o modificar la referencia.
- Dar a facturacion el permiso operativo `customer_service_records:UPDATE` o compartir sus casos de uso de negocio.

## Revision del diseno aprobada

1. Se reviso la propuesta tecnica de `06-technical-design.md`: siete rutas, filtro/paginacion de facturacion, error `502` con codigo `BILLING_NOTIFICATION.DELIVERY_FAILED`, escritura condicional y nuevo indice.
2. Se revisaron el registro de artefactos, la matriz de comportamiento, las slices y el orden operativo de migracion/seed.

La persona usuaria autorizo expresamente marcar la spec como lista para implementacion el 2026-10-24. El inicio del codigo o de una slice requiere una instruccion posterior.

## Evidencia de validacion requerida

- Dry-run de migracion con conteos por estado y por factura con referencia sin archivo; apply idempotente y verificacion de auditoria sin cambios.
- Lectura administrativa y de facturacion con y sin permisos, incluyendo detalle por ID oculto.
- Filtro y opciones de estado propios de cada listado: tres valores en administracion, dos en facturacion, rechazo `400` de valores no permitidos y exclusion de `NOT_SUBMITTED` en facturacion incluso sin filtro.
- Paridad de campos administrativo/facturacion para listado y detalle por separado, incluidos los dos estados nuevos; conservar la proyeccion mas corta del listado y el contrato externo de acceso de clientes.
- Cambio explicito de estado desde ambos modulos, sin cambios implicitos al editar factura.
- Correo con multiples equipos y listas `TO`/`CC`; un envio por transicion explicita hacia `SUBMITTED`, sin envio por guardado sin cambio ni reintento automatico.
- Estado del aviso visible y correcto para historicos sin intento, aceptacion por proveedor y fallo; un rechazo conocido conserva el `billing_status` anterior.
- Ante rechazo conocido del proveedor, mantener el estado previo, registrar `FAILED` y devolver error internacionalizado con codigo estable. Ante escritura fallida tras aceptacion del correo, devolver error de persistencia sin afirmar que se guardo `SUBMITTED`.
- Build, lint y validacion manual del contrato HTTP y migracion. La ejecucion contra datos reales requiere autorizacion operativa expresa.
