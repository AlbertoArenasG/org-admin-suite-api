# Plan de backend

## Resultado esperado

Un registro conserva estados tecnico, operativo y de facturacion independientes. La administracion puede cambiar el estado de facturacion; la superficie de facturacion tiene permiso propio, lectura filtrada y escritura limitada a estado y factura. Una transicion explicita a `SUBMITTED` intenta primero el aviso. El API expone el estado del ultimo intento y mantiene paridad de campos de lectura entre ambos modulos.

## Fases

1. Modelo, persistencia, internacionalizacion y migracion idempotente. La migracion solo clasifica historicos por archivo vigente de factura y no toca auditoria.
2. Transicion administrativa y aviso. Nuevo comando/caso de uso propio; sender por puerto y adaptador; error internacionalizado. No cambiar los otros segmentos operativos.
3. Lecturas y opciones de estados. Modulo de permisos `BILLING_CUSTOMER_SERVICE_RECORDS`, puerto y repositorio de lectura propios, listado y detalle acotados a `ACTIVE` y `SUBMITTED`/`INVOICED`; filtro `billing_status` y opciones auxiliares locales en ambos listados, con tres valores en administracion y dos en facturacion; respuesta de campos equivalente a administracion.
4. Escritura de facturacion. Comandos/casos de uso separados para estado y factura; `UPDATE` del modulo nuevo no permite modificar otros campos. Reutilizar reconciliacion de adjuntos, no el caso de uso documental administrativo.
5. Documentacion, validacion y pasos operativos. Actualizar catalogo de permisos, handoff de frontend, coleccion Postman y ejemplos de entorno. Solicitar ejecucion humana del dry-run/apply de migracion y seed de roles con evidencia antes de cierre.

## Compatibilidad y limites

- Los GET administrativos mantienen sus rutas y campos previos; agregan `billing_status` y `billing_notification`.
- El listado administrativo agrega filtro opcional `billing_status`; cada modulo agrega un GET local de opciones bajo su propio `READ`. No se crea capability auxiliar derivada.
- El GET de acceso de clientes externos queda sin cambios.
- `PUT /v1/customer-service-records/:recordId/documents/:documentType` conserva su comportamiento y permiso actuales. La nueva escritura de facturacion no lo reutiliza.
- El seed agrega los nuevos permisos directos de facturacion a los roles de sistema, pero no los concede automaticamente a roles personalizados. La asignacion del nuevo modulo a roles personalizados queda bajo control administrativo.
- No se toca frontend en esta iniciativa. La integracion visual se definira en una spec independiente.

## Orden de despliegue previsto

1. Configurar las dos variables de destinatarios en el `.env` desde el que se ejecutara la migracion y en el entorno desplegado, sin registrar direcciones en la spec. La migracion no envia correos; las variables se requieren porque el loader compartido valida todo `envSchema` antes de conectarse a MongoDB.
2. Confirmar entorno destino y verificar que no se creen registros nuevos durante la ventana entre migracion y despliegue. El usuario planea realizarla en un dia sin actividad operativa. Si esa condicion deja de cumplirse, ejecutar de nuevo dry-run y aplicar el backfill pendiente antes de dar el despliegue por validado.
3. Validar `dry-run` de migracion y sus conteos; si la clasificacion no cuadra, detenerse sin ejecutar `apply`. Ejecutar `apply` solo tras revisar y aprobar el reporte; despues verificar integridad, auditoria e idempotencia. El script es independiente de la app nueva y puede ejecutarse antes de desplegarla. No se exige un respaldo adicional como precondicion de esta spec.
4. Desplegar API con las variables ya configuradas. Mongoose crea el indice declarado en el schema al iniciar con `autoIndex` habilitado en la configuracion actual; verificar su presencia despues del arranque. La migracion no crea ese indice.
5. Ejecutar `npm run db:seed:roles` para actualizar roles de sistema; verificar permisos de `READ` y `UPDATE`. Los roles personalizados requieren asignacion explicita.
6. Validar API con datos de prueba, permisos, envio y error. La UI se implementara mas adelante.

No ejecutar migracion, seed, envio real ni despliegue sin autorizacion operativa expresa. El orden se revisa antes de la implementacion y se ajusta si aparece una incompatibilidad real.
