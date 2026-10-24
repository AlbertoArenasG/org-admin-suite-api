# Task List

## Fase 1. Modelo y datos

- [x] Incorporar estado y ultimo aviso en dominio, DTO, mappers, schemas, presenters e i18n de lecturas administrativas.
  Status: completed. Cierre: nuevos registros usan defaults; listado y detalle administrativos exponen los dos campos sin alterar campos previos.
- [x] Crear migracion idempotente con dry-run, apply y verificacion sin cambio de auditoria.
  Status: completed. Cierre: conteos por clasificacion, referencia sola y archivos removidos; verificacion codificada tras apply y segunda ejecucion sin cambios comprobada con fixtures aisladas. La ejecucion en la base objetivo sigue pendiente en la fase operativa.

## Fase 2. Transicion administrativa y correo

- [x] Implementar el endpoint de cambio de estado administrativo y el aviso sincrono por puerto/adaptador.
  Status: completed. Dependencia: fase 1. Cierre: solo transicion a `SUBMITTED` envia; `SENT` se persiste con el estado y `FAILED` conserva el estado previo con error traducido. Build, lint y fixtures aisladas pasaron; `envSchema`, `.env` local y `.env.example` tienen las dos listas. La validacion manual de correo/HTTP y la configuracion desplegada siguen pendientes en la fase 5.

## Fase 3. Lectura de facturacion

- [ ] Registrar modulo de permiso y pipeline independiente de listado/detalle.
  Status: pending. Dependencia: fase 1. Cierre: permiso `READ`, filtro backend aplicado antes de count/paginacion/detalle y paridad de campos con administracion.
- [ ] Agregar filtro de estado y endpoint local de opciones en ambos listados.
  Status: pending. Dependencia: fase 1. Cierre: administracion ofrece y acepta tres valores; facturacion solo `SUBMITTED`/`INVOICED`, rechaza valores invalidos con `400` y excluye `NOT_SUBMITTED` aun sin filtro; cada endpoint de opciones usa el `READ` de su modulo sin capability derivada nueva.

## Fase 4. Escritura de facturacion

- [ ] Implementar actualizacion de estado y de factura bajo `BILLING_CUSTOMER_SERVICE_RECORDS:UPDATE`.
  Status: pending. Dependencia: fases 2 y 3. Cierre: solo `SUBMITTED`/`INVOICED`, referencia y archivos de factura; otros segmentos no editables; adjuntar factura no cambia estado.

## Fase 5. Validacion y operacion

- [ ] Actualizar documentacion viva, handoff y coleccion Postman; verificar el ejemplo de variables agregado en la fase 2.
  Status: pending. Dependencia: fases 1-4. Cierre: contrato, permisos y configuracion coinciden con codigo y matriz de comportamiento.
- [ ] Validar build, lint y escenarios HTTP/permisos/error de correo, y registrar evidencia.
  Status: pending. Dependencia: fases 1-4. Cierre: casos de `06` comprobados, fallos y limitaciones documentados.
- [ ] Confirmar entorno objetivo y ausencia de nuevas altas durante la ventana; configurar las dos variables de destinatarios antes del despliegue y tambien antes de la migracion si ya forman parte del `envSchema` vigente.
  Status: pending. Ejecuta: usuario. El script no envia correos; el loader compartido solo exige las variables presentes en el schema al ejecutarlo. Cierre: configuracion validada y ventana operativa confirmada; si aparece actividad, repetir backfill pendiente antes de cerrar.
- [x] Ejecutar `npm run db:migrate:customer-service-record-billing:dry-run` en el entorno objetivo.
  Status: completed. Ejecuta: usuario. Reporte revisado antes de apply: 57 registros, todos `NOT_SUBMITTED`, 0 `INVOICED`, 0 invalidos y sin escrituras. La persona usuaria procedio con apply tras revisar la clasificacion.
- [x] Ejecutar `npm run db:migrate:customer-service-record-billing:apply` y luego dry-run de verificacion.
  Status: completed. Ejecuta: usuario. Apply: 57 actualizados, 0 pendientes, auditoria intacta y resultado SUCCESS. Segundo dry-run: 57 estados existentes, 0 estados o avisos pendientes y 0 registros invalidos; no hubo escrituras. No se exige respaldo adicional.
- [ ] Desplegar API y verificar el indice de facturacion declarado en el schema.
  Status: pending. Ejecuta: usuario, tras backfill y con variables desplegadas. Cierre: arranque correcto e indice presente; Mongoose lo crea automaticamente con la configuracion actual, no el script de migracion.
- [ ] Ejecutar `npm run db:seed:roles`.
  Status: pending. Ejecuta: usuario, tras desplegar catalogo nuevo. Riesgo: recalculo de permisos de roles de sistema; el nuevo permiso no se asigna automaticamente a roles personalizados. Cierre: seed reportado y permisos `READ`/`UPDATE` verificados.
- [ ] Confirmar validacion manual final y cerrar spec/documentacion viva.
  Status: pending. Ejecuta: usuario y agente. Cierre: evidencia en `05-progress.md`, tasks y estados formales completos; no cerrar por compilacion solamente.
