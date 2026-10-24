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
