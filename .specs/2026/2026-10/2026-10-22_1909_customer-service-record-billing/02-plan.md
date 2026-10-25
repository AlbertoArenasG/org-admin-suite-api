# Plan de backend

## Resultado esperado

Un registro conserva estados tecnico, operativo y de facturacion independientes. La administracion puede cambiar el estado de facturacion; la superficie de facturacion tiene permiso propio, lectura filtrada y escritura limitada a estado y factura. Una transicion explicita a `SUBMITTED` intenta primero el aviso. El API expone el estado del ultimo intento y mantiene paridad de campos de lectura entre ambos modulos.

## Fases

1. Modelo, persistencia, internacionalizacion y migracion idempotente. La migracion solo clasifica historicos por archivo vigente de factura y no toca auditoria.
2. Transicion administrativa y aviso. Nuevo comando/caso de uso propio; sender por puerto y adaptador; error internacionalizado. No cambiar los otros segmentos operativos.
3. Lecturas y opciones de estados. Modulo de permisos `BILLING_CUSTOMER_SERVICE_RECORDS`, puerto y repositorio de lectura propios, listado y detalle acotados a `ACTIVE` y `SUBMITTED`/`INVOICED`; filtro `billing_status` y opciones auxiliares locales en ambos listados, con tres valores en administracion y dos en facturacion; respuesta de campos equivalente a administracion.
4. Escritura de facturacion. Comandos/casos de uso separados para estado y factura; `UPDATE` del modulo nuevo no permite modificar otros campos. Reutilizar reconciliacion de adjuntos, no el caso de uso documental administrativo.
5. Documentacion, validacion y preparacion de datos. Actualizar catalogo de permisos, handoff de frontend y coleccion Postman; verificar el ejemplo de entorno agregado junto con el sender en la fase 2. Solicitar ejecucion humana del dry-run/apply de migracion y seed de roles con evidencia antes de cierre.

## Compatibilidad y limites

- Los GET administrativos mantienen sus rutas y campos previos; agregan `billing_status` y `billing_notification`.
- El listado administrativo agrega filtro opcional `billing_status`; cada modulo agrega un GET local de opciones bajo su propio `READ`. No se crea capability auxiliar derivada.
- El GET de acceso de clientes externos queda sin cambios.
- `PUT /v1/customer-service-records/:recordId/documents/:documentType` conserva su comportamiento y permiso actuales. La nueva escritura de facturacion no lo reutiliza.
- El seed agrega los nuevos permisos directos de facturacion a los roles de sistema, pero no los concede automaticamente a roles personalizados. La asignacion del nuevo modulo a roles personalizados queda bajo control administrativo.
- No se toca frontend en esta iniciativa. La integracion visual se definira en una spec independiente.

## Validacion de desarrollo y preparacion de datos

1. Confirmar las variables que exige el `envSchema` vigente en el momento de ejecutar la migracion. Si las variables de destinatarios ya se incorporaron al schema, configurarlas tambien en el `.env` de ejecucion; el script no envia correos.
2. Confirmar la base destino y la ventana sin altas nuevas durante el backfill. Si esa condicion deja de cumplirse, repetir dry-run y aplicar solo los registros pendientes.
3. Validar `dry-run` y sus conteos; si la clasificacion no cuadra, detenerse sin ejecutar `apply`. Ejecutar `apply` solo tras revisar el reporte; verificar integridad, auditoria e idempotencia. No se exige un respaldo adicional como precondicion de esta spec.
4. Ejecutar `npm run db:seed:roles` desde el checkout actualizado para sincronizar los roles de sistema; los roles personalizados requieren asignacion explicita.
5. Validar la API con datos de prueba, permisos, envio y error. La UI se implementara en una spec independiente.
