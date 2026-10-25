# Implementation Breakdown

Estos slices son el plan de referencia. No se inicia ninguno sin `Implementation ready: yes` aprobado expresamente y una autorizacion explicita para iniciar la implementacion o la slice.

## Slice 1. Modelo y migracion

**Fase:** 1. **Resultado:** estados de facturacion y aviso representados de extremo a extremo, migracion operable sin tocar auditoria.

Artefactos: dominio, schema, mappers, DTO y presenter administrativos, traducciones, script de migracion y scripts npm registrados en `06`. Definir defaults `NOT_SUBMITTED`/`NOT_REQUESTED`, adaptacion de documentos historicos sin campo, y cambios de estado explicitos del agregado. Crear `dry-run`, `apply`, verificacion e idempotencia; declarar el indice de lectura en el schema para que Mongoose lo cree al arrancar la API. El script no crea el indice. No crear rutas de facturacion ni enviar correo aqui.

Validacion: build, lint enfocado, ejemplos de presenter, fixtures de migracion con archivo vigente, referencia sola, archivo removido y estado existente. Cierre: contrato administrativo extendido y migracion revisable; no ejecutar apply real.

## Slice 2. Transicion administrativa y notificacion

**Fase:** 2. **Resultado:** `PATCH /v1/customer-service-records/:recordId/billing-status` bajo `customer_service_records:UPDATE`.

Artefactos: DTO, command/handler/caso de uso administrativos, puerto sender, adaptador de correo, error y traducciones, configuracion `TO`/`CC`, `.env.example` sin direcciones reales, wiring y endpoint de `06`. Validar estado anterior y destino; si destino `SUBMITTED` y anterior distinto, enviar primero; en aceptacion persistir `SUBMITTED` y `SENT` juntos. En rechazo conocido, conservar estado anterior y registrar `FAILED` con causa sanitizada; devolver `502` y codigo dedicado. No enviar en no-op, migracion, adjuntos ni cambios a otros estados. No crear endpoint de reenvio.

Validacion: build/lint y matriz de transiciones, multiples equipos, fallo del proveedor, fallo de persistencia despues de aceptacion, permisos, i18n y variables invalidas. Cierre: contrato HTTP y semantica de fallo comprobados sin tocar otros segmentos.

## Slice 3. Lectura de facturacion

**Fase:** 3. **Resultado:** listado y detalle propios bajo `BILLING_CUSTOMER_SERVICE_RECORDS:READ`, con filtro y opciones locales de estado en ambos listados.

Artefactos: catalogo/i18n de permisos, puerto/repositorio de lectura billing, DTO/mapper, queries/handlers/casos de uso, presenter, controller y registros de composicion de `06`. Extender el listado administrativo con filtro `billing_status` y GET local de opciones bajo su `READ`; agregar el GET local de opciones de facturacion bajo su `READ`. Los dos casos de uso de opciones devuelven conjuntos distintos desde el mismo enum; no crear capability auxiliar derivada. El filtro `ACTIVE` + `SUBMITTED`/`INVOICED` de facturacion se aplica antes de count, skip/limit y detalle, y el parametro opcional solo lo estrecha. Reutilizar `PaginationRequestDto`/`PaginationDefaultConfig`; valor de estado no permitido responde `400`. La respuesta preserva paridad de campos con el listado/detalle administrativo respectivos; `invoice` queda solo en detalle. No reutilizar caso de uso ni presenter administrativo. No crear escritura aun.

Validacion: 200/400/401/403/404, vacios, paginacion (pagina 1/10 filas por defecto y maximo 100), busqueda, tres opciones/valores administrativos frente a dos de facturacion, paridad de campos y exclusion de `NOT_SUBMITTED`/`DELETED` en facturacion. Cierre: permiso independiente, endpoints locales y fronteras de filtro/visibilidad comprobados en repositorio y HTTP.

## Slice 4. Escritura de facturacion

**Fase:** 4. **Resultado:** estado e invoice editables solo dentro del alcance de facturacion.

Artefactos: DTO, commands/handlers/casos de uso, controlador y registros `UPDATE` de `06`. Estado admite `SUBMITTED`/`INVOICED`; la transicion de `INVOICED` a `SUBMITTED` invoca el sender, mientras un no-op no lo hace. Actualizacion de invoice acepta referencia y lista completa de IDs, reutiliza reconciliacion de adjuntos y solo cambia `invoice`/conteos relacionados. Rechazar IDs no visibles, `NOT_SUBMITTED` y tipos de documento distintos a invoice. No modificar los endpoints documentales administrativos.

Validacion: permisos, limites de estado, adjuntos validos/invalidos, sustitucion/eliminacion, referencia vacia, conteos y ausencia de mutacion de otros documentos. Cierre: dos escrituras independientes y sin escape a edicion operativa.

## Slice 5. Contratos y validacion

**Fase:** 5. **Resultado:** integracion documentada y evidencia de desarrollo registrada.

Artefactos: handoff de frontend, catalogo vivo de autorizacion, coleccion Postman, tareas/progreso. Verificar que `.env.example` ya documente la configuracion agregada en la slice 2. Documentar siete rutas nuevas, filtro extendido del listado administrativo, opciones locales, envelopes, permisos, error `502`, estado de aviso y el limite de correo aceptado con escritura fallida. Verificar build, lint, matriz de `06` y revisar diff; no ejecutar operaciones reales de datos sin aprobacion.

**Pasos del usuario, en orden:**

1. Confirmar base de datos destino y ventana sin nuevas altas durante el backfill; si aparecen altas, repetir dry-run/apply para los pendientes antes de cerrar la validacion. Si las variables de destinatarios ya forman parte del `envSchema` al ejecutar la migracion, configurarlas en su `.env`; el script no envia correos.
2. `npm run db:migrate:customer-service-record-billing:dry-run`. Precondiciones: entorno y variables exigidas por el schema vigente correctos; revisar conteos. Riesgo: lectura de la base objetivo. Evidencia: clasificacion por estado y casos de referencia sola. Si el resultado no cuadra, detenerse sin aplicar.
3. `npm run db:migrate:customer-service-record-billing:apply` tras aprobar dry-run. Precondiciones: ventana operativa y entorno confirmados, reporte dry-run aprobado; no se exige respaldo adicional. Riesgo: escritura masiva. Evidencia: integridad OK, timestamps y `updated_by` sin cambios.
4. Repetir `npm run db:migrate:customer-service-record-billing:dry-run` para demostrar idempotencia; evidencia: cero pendientes.
5. Ejecutar `npm run db:seed:roles` desde este checkout con `MONGO_URI` del entorno objetivo confirmada. El script toma el catalogo del codigo local y conecta directamente a MongoDB. Riesgo: recalculo de roles de sistema. Evidencia: seed reportado, permisos disponibles; roles personalizados revisados por administracion.

Cierre: confirmacion manual del usuario, `05-progress.md` actualizado, documentacion viva consistente y estados formales de `00` completados solo con evidencia suficiente.
