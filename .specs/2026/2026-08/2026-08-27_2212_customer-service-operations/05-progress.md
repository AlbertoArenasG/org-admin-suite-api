# Progress

## 2026-08-27

- Se creo la spec y se inicio la fase de definicion.
- Se registraron decisiones sobre cardinalidad de equipos, reutilizacion de Proveedores, independencia entre hitos y estatus, y consecutivo global visible.
- Se agrego el registro de dudas de negocio para decisiones que requieren confirmacion del Cliente.
- Se separaron los dos compromisos de fecha de los seguimientos al Proveedor y se definio el proposito de cada notificacion, sin mezclar politicas de estatus con politicas de notificaciones.
- Se preciso que las politicas de notificaciones solo materializan eventos; el envio futuro correspondera a un dispatcher compartido.
- Se definieron las dependencias de seleccion del modulo y sus capabilities
  auxiliares derivadas, incluidos los futuros lookups reutilizables de
  Proveedores y Usuarios relacionados con el Cliente.
- Se confirmo que las materializaciones de notificaciones reutilizaran sin
  extensiones el contrato de control de activos.
- Se definio que las materializaciones de estatus conservaran el contrato de
  activos y agregaran el estado neutral `PENDING_ESTIMATED_DATE` cuando falte
  su fecha estimada aplicable, aun con politica configurada.
- Se aprobo la materializacion de retorno del Proveedor, con estado de sistema
  aun sin politica y `NOT_APPLICABLE` cuando el servicio no tenga Proveedor.
- Se aprobo la materializacion de notificaciones de retorno del Proveedor como
  una replica del patron de activos, vacia cuando no sea aplicable.
- Se aprobo `provider_follow_up_materialization` con eventos persistidos y un
  contrato compatible con una futura migracion hacia politicas reutilizables.
- Se aprobo una orquestacion tecnica de cinco refreshers aislados, reutilizable
  por operaciones, politicas y el futuro job, sin alterar auditoria de negocio.
- Se aprobo la baja logica de servicios con preservacion de trazabilidad e
  invalidacion de todos los eventos pendientes.
- Se adopto `CUSTOMER_SERVICE_RECORDS` como identidad tecnica; Heijunka queda
  reservado para una futura capa de planeacion y visualizacion.
- Se definio `CustomerServiceRecord` con campos base en raiz, bloque `customer`
  para su relacion y snapshots, y bloques embebidos para los limites de dominio
  que creceran de forma independiente. Los IDs estables se reservan para
  equipos y reglas de seguimiento.
- Se aprobo la referencia historica de Cliente: solo Clientes activos pueden
  seleccionarse, sin bloquear bajas ni alterar registros ya capturados.
- Se separaron formalmente los estados del aggregate: `status` tecnico
  (`ACTIVE`/`DELETED`) y `operationalStatus` de negocio. Los refreshers y el
  job futuro evaluaran ambos: solo procesaran registros activos que esten
  pendientes o en proceso.
- Se concreto el bloque opcional `provider`, con snapshot historico, hitos,
  intervalo, politicas, seguimiento embebido y sus tres materializaciones.
- Se concreto `customerDelivery` como bloque de compromiso con el Cliente,
  incluyendo recepcion, estimacion ajustable, entrega real, politicas y sus
  dos materializaciones.
- Se fijo el shape de `assets[]`: snapshots con ID estable generado por backend,
  identificador unico por registro y un activo en la captura inicial de
  frontend.
- Se definio que el consecutivo visible se persiste como entero y se presenta
  con minimo cuatro digitos, sin longitud maxima ni truncamiento.
- Se aprobo la asignacion transaccional del consecutivo mediante contador
  atomico global e indice unico. La proteccion de reintentos con
  `Idempotency-Key` y la duplicacion de registros quedan fuera del MVP.
- Se definio la frontera de autorizacion del modulo: permisos directos para sus
  operaciones de negocio y catalogo local, con lookups externos resueltos por
  capabilities auxiliares derivadas.
- Se aprobaron las rutas CRUD, listado y catalogo fijo del recurso principal,
  alineadas con las convenciones de control de activos.
- Se definieron las rutas anidadas del catalogo de tipos de servicio, con un
  `PATCH` convencional que inicialmente solo permite activar o desactivar.
- Se corrigio la dependencia de seguimiento al Proveedor: seleccionara grupos
  destinatarios mediante una capability auxiliar y endpoint de opciones nuevo,
  no contactos. La alineacion de control de activos queda para una spec futura.
- Se aprobaron los lookups externos del formulario: se reutilizaran Clientes y
  politicas; se incorporaran opciones de Proveedores, grupos destinatarios y
  Usuarios activos del Cliente.
- Se definio el `PATCH` parcial por bloques y la matriz de refresh selectivo de
  materializaciones, preservando la auditoria de negocio.
- Se aprobaron presenters diferenciados para listado, detalle y lookups, con
  values tecnicos y copies localizados listos para consumo de frontend.
- Se definio el contrato de filtros, rangos date-only y ordenamiento compuesto
  del listado, con `created_at desc` como orden natural inicial.
- Se aprobaron los codigos de capabilities auxiliares nuevas para Proveedores,
  grupos destinatarios y Usuarios relacionados con un Cliente; todas derivadas
  automaticamente por el nuevo modulo.
- Se fijo el contrato de creacion por bloques, con calculo de fechas estimadas
  en backend y posibilidad explicita de conservar ajustes manuales.
- Se preciso el comportamiento historico de tipos de servicio desactivados:
  conservan snapshots en registros existentes y dejan de estar disponibles para
  nuevas capturas.
- Se aprobo la persistencia inicial: aggregate, catalogo local y contador
  generico en colecciones separadas; el consecutivo se asignara dentro de la
  transaccion existente y se reforzara con un indice unico.
- Se definieron indices iniciales enfocados en listado activo, filtros de
  negocio y fechas estimadas, sin anticipar indices de texto antes de medir la
  consulta real del MVP.
- Se aprobaron los limites de dominio y los puertos del aggregate, catalogo y
  contador. La escritura de materializaciones queda aislada de auditoria y los
  repositorios de registros no mezclaran consultas de politicas.
- Se desglosaron los casos de uso CRUD, catalogo y refresco tecnico. La
  preparacion de inputs, las materializaciones y los datos de presentacion se
  aislan en servicios reutilizables; los cambios de politicas refrescan solo
  referencias operacionales y su bloque afectado.

## 2026-08-30

- Se aprobaron los contratos HTTP de CRUD, catalogo y refresh tecnico, incluida
  la semantica de `PATCH`, la respuesta `204` de baja y el default de
  `operational_status`.
- Se formalizo la responsabilidad de presenters: valores tecnicos y copies
  localizados para valores fijos visibles; tipos de servicio como datos de
  negocio persistidos sin llave de localizacion.
- Se aprobo la configuracion de autorizacion, las capabilities derivadas y el
  seed create-only del catalogo inicial. Los seeds se ejecutaran de forma
  independiente mediante comandos propios, igual que las migraciones.
- Se cerraron definicion y diseno tecnico. La implementacion se dividio en seis
  slices verificables, con validaciones manuales y ejecucion de seeds a cargo
  del usuario.
- Se completo el Slice 1: aggregate, catalogo local, contador transaccional,
  esquemas, mappers, repositorios, indices y registro en DI. La compilacion de
  backend finalizo correctamente; no se ejecutaron migraciones ni seeds.
- Se completo el Slice 2: autorizacion directa y capabilities derivadas,
  enumeraciones localizadas y seeds independientes para contactos desde
  usuarios y tipos de servicio. La compilacion de backend finalizo
  correctamente; no se ejecuto ningun seed.
- Se completo el Slice 3: catalogo administrable de tipos de servicio con
  nombre y codigo inmutables, opciones locales activas y lookups auxiliares
  compactos de Proveedores, grupos destinatarios y Usuarios activos de un
  Cliente. La compilacion de backend finalizo correctamente.
- Se completo el Slice 4: cinco refreshers aislados para estatus y
  notificaciones de Cliente y Proveedor, y seguimiento al Proveedor. El
  orquestador reutilizable procesa registros operativos por cursor y escribe
  exclusivamente campos tecnicos, sin modificar auditoria. La compilacion de
  backend finalizo correctamente.
- Se completo el Slice 5: CRUD de registros de servicio con preparacion
  aislada de referencias y snapshots, consecutivo transaccional, PATCH por
  campos presentes, baja logica, refresh selectivo y respuestas localizadas.
  La compilacion de backend finalizo correctamente.
- Se completo el Slice 6: refresco interno cursor-based protegido por lock,
  conteos separados para las cinco materializaciones y refresh dirigido desde
  cambios o bajas de politicas, limitado a registros operativos. No se agrego
  un dispatcher de correos; solo se recalculan datos tecnicos materializados.
  La compilacion de backend finalizo correctamente.
- Se ejecutaron los seeds independientes de roles y tipos de servicio, y se
  completó la validación manual del módulo.
- Se actualizó la documentación permanente de autorización, capabilities,
  runbook y colección Postman del job interno. La spec queda cerrada.
