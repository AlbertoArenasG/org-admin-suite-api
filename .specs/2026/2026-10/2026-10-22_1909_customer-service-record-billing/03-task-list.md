# Task List

## Fase 1. Modelo y datos

- [ ] Incorporar estado y ultimo aviso en dominio, DTO, mappers, schemas, presenters e i18n de lecturas administrativas.
  Status: pending. Cierre: nuevos registros usan defaults; listado y detalle administrativos exponen los dos campos sin alterar campos previos.
- [ ] Crear migracion idempotente con dry-run, apply y verificacion sin cambio de auditoria.
  Status: pending. Cierre: conteos por clasificacion, referencia sola y archivos removidos; verificacion tras apply y segunda ejecucion sin cambios.

## Fase 2. Transicion administrativa y correo

- [ ] Implementar el endpoint de cambio de estado administrativo y el aviso sincrono por puerto/adaptador.
  Status: pending. Dependencia: fase 1. Cierre: solo transicion a `SUBMITTED` envia, `SENT` se persiste con el estado y `FAILED` conserva el estado previo con error traducido.

## Fase 3. Lectura de facturacion

- [ ] Registrar modulo de permiso y pipeline independiente de listado/detalle.
  Status: pending. Dependencia: fase 1. Cierre: permiso `READ`, filtro backend aplicado antes de count/paginacion/detalle y paridad de campos con administracion.
- [ ] Agregar filtro de estado y endpoint local de opciones en ambos listados.
  Status: pending. Dependencia: fase 1. Cierre: administracion ofrece y acepta tres valores; facturacion solo `SUBMITTED`/`INVOICED`, rechaza valores invalidos con `400` y excluye `NOT_SUBMITTED` aun sin filtro; cada endpoint de opciones usa el `READ` de su modulo sin capability derivada nueva.

## Fase 4. Escritura de facturacion

- [ ] Implementar actualizacion de estado y de factura bajo `BILLING_CUSTOMER_SERVICE_RECORDS:UPDATE`.
  Status: pending. Dependencia: fases 2 y 3. Cierre: solo `SUBMITTED`/`INVOICED`, referencia y archivos de factura; otros segmentos no editables; adjuntar factura no cambia estado.

## Fase 5. Validacion y operacion

- [ ] Actualizar documentacion viva, handoff, coleccion Postman y ejemplo de variables sin direcciones reales.
  Status: pending. Dependencia: fases 1-4. Cierre: contrato y permisos coinciden con codigo y matriz de comportamiento.
- [ ] Validar build, lint y escenarios HTTP/permisos/error de correo, y registrar evidencia.
  Status: pending. Dependencia: fases 1-4. Cierre: casos de `06` comprobados, fallos y limitaciones documentados.
- [ ] Configurar las dos variables de destinatarios en el entorno que ejecutara la migracion y en el despliegue; confirmar entorno objetivo y ausencia de nuevas altas durante la ventana.
  Status: pending. Ejecuta: usuario, antes del dry-run. Las variables son exigidas por el loader compartido, no porque la migracion envie correos. Cierre: configuracion validada y ventana operativa confirmada; si aparece actividad, repetir backfill pendiente antes de cerrar.
- [ ] Ejecutar `npm run db:migrate:customer-service-record-billing:dry-run` en el entorno objetivo.
  Status: pending. Ejecuta: usuario, tras configurar variables y verificar el entorno. Riesgo: lectura de datos reales. Cierre: reporte revisado y clasificacion aprobada antes de apply; si no cuadra, no ejecutar apply.
- [ ] Ejecutar `npm run db:migrate:customer-service-record-billing:apply` y luego dry-run de verificacion.
  Status: pending. Ejecuta: usuario, solo tras el dry-run aprobado y con entorno correcto. Riesgo: escritura masiva. Cierre: integridad OK, auditoria intacta y cero pendientes en segundo dry-run; no se exige respaldo adicional.
- [ ] Desplegar API y verificar el indice de facturacion declarado en el schema.
  Status: pending. Ejecuta: usuario, tras backfill y con variables desplegadas. Cierre: arranque correcto e indice presente; Mongoose lo crea automaticamente con la configuracion actual, no el script de migracion.
- [ ] Ejecutar `npm run db:seed:roles`.
  Status: pending. Ejecuta: usuario, tras desplegar catalogo nuevo. Riesgo: recalculo de permisos de roles de sistema; el nuevo permiso no se asigna automaticamente a roles personalizados. Cierre: seed reportado y permisos `READ`/`UPDATE` verificados.
- [ ] Confirmar validacion manual final y cerrar spec/documentacion viva.
  Status: pending. Ejecuta: usuario y agente. Cierre: evidencia en `05-progress.md`, tasks y estados formales completos; no cerrar por compilacion solamente.
