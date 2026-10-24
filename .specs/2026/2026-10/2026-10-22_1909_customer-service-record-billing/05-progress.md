# Progreso

## 2026-10-22 - Apertura de definicion

- Se registro el alcance backend acordado: estado independiente, backfill por archivo de factura vigente, edicion administrativa y modulo separado de facturacion, permisos, internacionalizacion y aviso configurable por listas `TO`/`CC`.
- No se registraron direcciones de correo concretas; quedan para configuracion local y desplegada durante implementacion/operacion.
- La definicion permanece `in_progress` e `Implementation ready: no`; en esta apertura faltaban politica de fallo/reenvio, contratos detallados, matriz de comportamiento y registro obligatorio de artefactos.
- No se modifico codigo ni documentacion viva; se actualizara al implementar y validar el contrato.

## 2026-10-22 - Estado del aviso de facturacion

- Por peticion del usuario, se agrego al alcance un estado persistido del ultimo intento de correo, independiente del estado de facturacion y de notificaciones operativas.
- Se documentaron inicialmente estados y metadatos como propuesta. El usuario aclaro despues que el estado del aviso es solo informativo y no desea endpoint dedicado de reenvio ni reintentos automaticos en esta primera version.

## 2026-10-22 - Disparador del correo

- Se fijo una notificacion por transicion explicita hacia `SUBMITTED`; un guardado sin cambio de estado no envia correo y una nueva transicion posterior si crea un nuevo intento.
- El estado del ultimo intento queda como dato expuesto por el API, sin endpoint dedicado ni mecanismo automatico de reintento. En este punto seguia pendiente la semantica de respuesta HTTP ante fallo del proveedor.

## 2026-10-22 - Fallo de notificacion

- El usuario definio que un fallo conocido del correo no debe confirmar la transicion a `SUBMITTED`; el API debe conservar el estado previo, registrar `FAILED` y devolver error traducido para permitir repetir la solicitud.
- Se verifico que el filtro global del API ya soporta status HTTP, `error_code` y mensaje internacionalizado de excepciones de dominio. En este punto quedaba abierta la garantia tecnica ante fallos entre correo y MongoDB y respuestas ambiguas del proveedor.

## 2026-10-22 - Secuencia simplificada

- El usuario aprobo enviar primero el correo y persistir `SUBMITTED` solo despues de que el proveedor lo acepte. El fallo conocido del correo conserva el estado anterior y registra `FAILED`; un fallo posterior de escritura devuelve error de persistencia y deja el estado anterior.
- Se retiro el estado persistido `PENDING` y la propuesta de rollback/coordinacion distribuida. Se conserva como limite conocido la posible repeticion del aviso si el correo fue aceptado pero no se pudo guardar el registro.

## 2026-10-22 - Paridad de contratos de lectura

- El usuario pidio que facturacion entregue los mismos campos que administracion en listado y detalle, respectivamente. Ambas respuestas administrativas se amplian con `billing_status` y estado del ultimo aviso.
- Se conserva la diferencia actual entre fila y detalle (incluida la factura solo en detalle), los pipelines separados y el contrato limitado de acceso de clientes.

## 2026-10-22 - Diseno tecnico para revision

- Se completaron plan, tareas, decisiones, diseno tecnico, matriz de comportamiento, registro de artefactos y cinco slices de implementacion.
- Se propusieron rutas HTTP, filtro obligatorio de lectura, indice, escrituras dirigidas, error traducido y validaciones de migracion. El limite de correo aceptado con fallo posterior de MongoDB queda documentado como posibilidad de aviso duplicado al reintentar.
- La definicion sigue `in_progress`, `Implementation ready: no`, sin tareas de implementacion marcadas: falta aprobacion expresa del diseno y del registro de artefactos. No se modifico codigo ni documentacion viva y no se envio nada al stage.

## 2026-10-22 - Revision tecnica de la spec

- Se confronto el diseno con entidad/schema, repositorio, reconciliador de adjuntos, controlador de archivos, excepciones y autorizacion existentes.
- Se corrigio la afirmacion erronea de validacion de propiedad de archivos: el reconciliador actual valida existencia y reconcilia, no autoria/procedencia. Se preciso la auditoria de escrituras dirigidas frente a la migracion.
- La spec permanece pendiente de aprobacion expresa; no se modifico codigo ni el stage.

## 2026-10-24 - Orden de migracion y despliegue

- Se aclaro que el backfill solo actualiza campos historicos: no invoca el envio de correo ni crea indices.
- Las variables TO/CC se configuran antes de dry-run/apply porque `loadMigrationEnv()` valida el `envSchema` completo. Se registro la ventana sin nuevas altas entre migracion y despliegue, y el barrido adicional si esa condicion cambia.
- El indice de facturacion se declara en el schema; Mongoose lo crea al arrancar la API con `autoIndex` actual. Su presencia se verifica despues del despliegue. Plan, tareas y slices quedaron alineados sin cambiar el gate: `Implementation ready: no`.

## 2026-10-24 - Estado del ultimo aviso

- Se aclaro que `billing_status` vive al nivel del registro y `billing_notification` es un objeto distinto en ese mismo registro.
- El usuario acepto que el objeto represente solo el ultimo intento: un exito limpia la causa anterior, un fallo limpia la fecha de aceptacion anterior y el estado inicial no tiene fechas ni causa. Se agrego el caso a la matriz de validacion.
- El segundo punto de la revision, contrato de paginacion/filtro del listado, permanece sin tocar para revisarlo por separado. El gate sigue `Implementation ready: no`.

## 2026-10-24 - Filtros y opciones locales de estado

- El usuario aprobo filtros `billing_status` para los listados administrativo y de facturacion, y dos endpoints auxiliares locales de opciones, cada uno bajo el `READ` de su modulo. No se crea capability auxiliar derivada ni permiso nuevo para estos endpoints.
- Administracion admite los tres estados; facturacion solo `SUBMITTED`/`INVOICED` y mantiene la exclusion obligatoria de `NOT_SUBMITTED`. Se documento `400` para estado no permitido y reutilizacion de la paginacion comun (pagina 1, 10 filas iniciales, maximo 100).
- Se actualizaron contratos, matriz, registro de artefactos, tareas y slice de lectura. El gate sigue `Implementation ready: no`; no se inicio codigo ni se envio nada al stage.

## 2026-10-24 - Validacion operativa del backfill

- El usuario rechazo agregar un respaldo especifico como precondicion de esta migracion; se mantiene la secuencia acordada de dry-run, revision del reporte, apply y verificacion posterior.
- Plan, tareas y breakdown ya no presuponen un respaldo. Si el dry-run no cuadra, no se ejecuta apply. El gate sigue `Implementation ready: no`.

## 2026-10-24 - Lista para implementacion

- Tras una nueva revision sin contradicciones ni gaps materiales, la persona usuaria autorizo expresamente marcar la spec lista para implementacion.
- `Definition status: completed` e `Implementation ready: yes`; implementacion y validacion siguen pendientes. Se actualizaron la definicion, las decisiones, el diseno tecnico y el indice para reflejar el gate aprobado.
- No se inicio codigo ni se agregaron archivos al stage.

## 2026-10-24 - Slice 1 implementada

- Se agregaron `billingStatus` y `billingNotification` al agregado, DTO de lectura, mappers, schema e indice declarado para Mongoose. El presenter administrativo incorpora ambos campos en listado y detalle con traducciones ES/EN; la edicion operativa ordinaria no acepta esos campos.
- Se creo la migracion con comandos `dry-run` y `apply`. Solo escribe campos faltantes mediante MongoDB nativo; clasifica archivos vigentes frente a referencia sola y archivos removidos, verifica pendientes y auditoria tras aplicar. No crea indices ni envia correos.
- `npm run build` y ESLint enfocado pasaron. Fixtures aisladas comprobaron clasificacion, preservacion de estado existente, auditoria e idempotencia de segundo apply, asi como los campos del presenter en lista/detalle y el indice declarado en el schema. No se conecto a MongoDB ni se ejecuto el backfill real.
- Las dos tareas de la fase 1 quedan completadas; las fases siguientes y la validacion operativa permanecen pendientes. No se agregaron archivos al stage.

## 2026-10-24 - Secuencia del backfill antes del sender

- La persona usuaria confirmo que ejecutara personalmente todos los comandos que muten la base de datos. Puede iniciar ahora con dry-run y, tras revisar los conteos, ejecutar apply.
- Se corrigio la precondicion de variables de destinatarios: aun no forman parte del `envSchema` vigente en la slice 1. Solo se requieren al correr la migracion si ya se agregaron al schema; para el despliegue de la API con sender si son obligatorias. Se actualizaron definicion, plan, tareas, diseno y breakdown para reflejar esta secuencia.

## 2026-10-24 - Dry-run del backfill ejecutado por el usuario

- El usuario ejecuto `npm run db:migrate:customer-service-record-billing:dry-run` y compartio el reporte: 57 registros totales; 57 estados y 57 avisos pendientes; 0 clasificados `INVOICED`, 57 `NOT_SUBMITTED`; 0 con solo referencia, 0 con solo archivos removidos, 0 estados preexistentes y 0 registros invalidos. El script informo que termino sin escrituras.
- Los conteos son internamente consistentes. Queda confirmar con la persona usuaria que 0 registros con archivos de factura vigentes refleja los datos esperados antes de ejecutar `apply`. Aun no hay evidencia de escritura ni verificacion posterior.

## 2026-10-24 - Apply del backfill ejecutado por el usuario

- Tras revisar el dry-run, la persona usuaria ejecuto `npm run db:migrate:customer-service-record-billing:apply` y compartio el resultado: 57 registros actualizados, 0 pendientes tras apply, `Audit unchanged: true` y `Result: SUCCESS`.
- El apply verifica integridad y auditoria en la misma ejecucion. Falta repetir dry-run para demostrar que el backfill no intenta nuevas escrituras. No se ejecutaron comandos de base de datos por el agente.

## 2026-10-24 - Verificacion final del backfill

- La persona usuaria repitio `npm run db:migrate:customer-service-record-billing:dry-run`: 57 registros totales, 57 con estado existente, 0 estados pendientes, 0 avisos pendientes y 0 invalidos. Termino sin escrituras.
- Quedo demostrada la idempotencia del backfill en la base objetivo junto con la verificacion de auditoria reportada por apply. Se completo la tarea operativa de migracion; el despliegue y las slices 2-5 siguen pendientes.

## 2026-10-24 - Ejemplo de entorno en slice 2

- Se adelanto la actualizacion de `.env.example` a la slice 2, junto con `envSchema` y el sender, para que la configuracion quede documentada al incorporarse. La slice 5 solo verificara esa consistencia; no se agregan direcciones reales al archivo de ejemplo.

## 2026-10-24 - Slice 2 implementada

- Se agrego `PATCH /v1/customer-service-records/:recordId/billing-status` bajo JWT y `customer_service_records:UPDATE`, con DTO, command/handler y caso de uso administrativos propios. Un no-op responde sin escritura ni correo; las transiciones a `NOT_SUBMITTED`/`INVOICED` conservan el ultimo aviso; una entrada real a `SUBMITTED` envia primero y despues persiste estado y `SENT` juntos.
- En rechazo del sender se conserva el estado anterior, se guarda `FAILED` con causa generica y se devuelve `502` con `BILLING_NOTIFICATION.DELIVERY_FAILED` traducido. Las escrituras dirigidas y condicionadas usan el estado anterior esperado y solo afectan estado/aviso y auditoria; un conflicto devuelve `409`. Un fallo de escritura posterior a la aceptacion del correo se propaga sin revertir el envio.
- El adaptador SMTP usa TO/CC validados como CSV por `envSchema`; el template de texto incluye consecutivo, cliente y todos los equipos. `.env.example` muestra solo direcciones de ejemplo y `.env` local contiene los valores entregados por la persona usuaria; la configuracion del entorno desplegado sigue pendiente.
- `npm run build`, ESLint enfocado, traducciones y parsing de entorno Nest pasaron. Fixtures aisladas con correo/repositorio simulados cubrieron no-op, envio, fallo, reintento, conflicto, `502`, destinatarios/equipos y actualizacion dirigida. No se enviaron correos reales ni se hicieron escrituras a MongoDB; la validacion manual de HTTP/correo sigue pendiente.
- No se agregaron archivos al stage.

## 2026-10-24 - Destinatarios generales de facturacion

- A solicitud del usuario, las variables del sender se renombraron a `BILLING_NOTIFICATION_RECIPIENTS_TO` y `BILLING_NOTIFICATION_RECIPIENTS_CC` para que futuros modulos de facturacion puedan usar las mismas listas.
- Se actualizaron el contrato en definicion y diseno tecnico, el schema de entorno, el adaptador, el `.env` local y `.env.example`. El ejemplo ahora usa el mismo encabezado de seccion que los bloques existentes. No se cambiaron los valores privados ni se agregaron archivos al stage.

## 2026-10-24 - Slice 3 implementada

- Se agrego `BILLING_CUSTOMER_SERVICE_RECORDS` con operaciones `READ` y `UPDATE` en el catalogo, con nombres ES/EN. Los tres GET nuevos de facturacion usan JWT y el `READ` propio; el detalle no visible responde `404`.
- La lectura de facturacion tiene puerto, repositorio Mongoose, DTO, mapper, casos de uso, queries/handlers, presenter y controlador independientes de los administrativos. El repositorio filtra `ACTIVE` y `SUBMITTED`/`INVOICED` antes de contar, paginar o consultar el detalle. Busqueda, orden y paginacion siguen el diseno; lista y detalle conservan paridad de campos con administracion.
- El listado administrativo acepta `billing_status` entre los tres estados. Ambos modulos exponen un GET local de opciones internacionalizadas: tres estados en administracion y dos en facturacion. Los DTO rechazan valores fuera de su conjunto.
- `npm run build` y ESLint enfocado pasaron. Comprobaciones aisladas cubrieron validacion de filtros, limites de paginacion, opciones, filtros Mongo de lista/detalle, paridad de presenters, metadatos de guards y detalle no visible. No hubo llamadas HTTP reales ni acceso a MongoDB; la validacion integrada y el seed de roles permanecen pendientes en la fase 5. No se agregaron archivos al stage.

## 2026-10-24 - Slice 4 implementada

- Se agregaron dos escrituras de facturacion bajo JWT y `billing_customer_service_records:UPDATE`: cambio de estado limitado a `SUBMITTED`/`INVOICED` y reemplazo de referencia/archivos de factura. Cada ruta tiene DTO, command/handler y caso de uso propios, con respuesta del presenter de facturacion.
- Las escrituras consultan el alcance de lectura de facturacion y usan filtros condicionados por registro activo y estado anterior. Un registro fuera de alcance responde `404`; un cambio concurrente devuelve `409`. El no-op de estado no escribe ni envia correo; `INVOICED` a `SUBMITTED` envia antes de persistir y conserva la politica de fallo de la slice 2.
- La factura reutiliza el reconciliador de adjuntos y actualiza solo `invoice`, conteos y auditoria. No cambia el estado ni otros documentos. El cuerpo no acepta un tipo documental alternativo.
- `npm run build`, ESLint enfocado y comprobaciones aisladas de validacion, transiciones, fallo del sender, reconciliacion y escritura dirigida pasaron. No se enviaron correos ni se hicieron escrituras a MongoDB. La validacion HTTP integrada, documentacion viva y operaciones desplegadas permanecen en fase 5. No se agregaron archivos al stage.

## 2026-10-24 - Documentacion de integracion de la fase 5

- Se actualizo el catalogo vivo de permisos con `BILLING_CUSTOMER_SERVICE_RECORDS` (`READ`/`UPDATE`), sus cinco rutas, las dos rutas administrativas nuevas y el filtro administrativo. Se mantuvo la distincion entre opciones locales y capabilities auxiliares derivadas.
- Se creo el handoff de frontend con contratos de lectura/escritura, permisos independientes, filtros, envelopes, estados y ultimo aviso, factura, fallos `400`/`401`/`403`/`404`/`409`/`502`, y el limite conocido de correo aceptado seguido de escritura fallida.
- La coleccion Postman incluye las siete rutas nuevas, detalle administrativo de apoyo, el filtro del listado administrativo y ejemplos ilustrativos de respuestas exitosas y errores. Se verifico que el JSON es parseable y que `.env.example` documenta `BILLING_NOTIFICATION_RECIPIENTS_TO`/`CC` como listas CSV de ejemplo.
- El registro de artefactos en `06-technical-design.md` se alineo con los nombres de clases y rutas de archivo que efectivamente quedaron implementados; se comprobo que no queden rutas `src/*.ts` inexistentes en ese registro.
- Se completo solo la tarea documental de fase 5. La validacion HTTP manual, la configuracion desplegada, el indice, el seed de roles y el cierre formal de la spec siguen pendientes. No se agregaron archivos al stage.

## 2026-10-24 - Aclaracion del orden del seed de roles

- Se verifico que `npm run db:seed:roles` carga `AUTHORIZATION_CATALOG` del checkout local y se conecta a `MONGO_URI` directamente; no depende del proceso ni del despliegue de la API. La indicacion anterior de esperar al despliegue confundia un orden propuesto con una precondicion tecnica.
- Se corrigieron tarea, breakdown y documentacion viva. El usuario puede ejecutar el seed con el codigo actual y la base objetivo confirmada. El seed sigue pendiente hasta recibir su salida; no se ejecuto desde esta sesion.
