# Task List

## Fase 1. Modelo y datos

- [x] Incorporar estado y ultimo aviso en dominio, DTO, mappers, schemas, presenters e i18n de lecturas administrativas.
  Status: completed. Cierre: nuevos registros usan defaults; listado y detalle administrativos exponen los dos campos sin alterar campos previos.
- [x] Crear migracion idempotente con dry-run, apply y verificacion sin cambio de auditoria.
  Status: completed. Cierre: conteos por clasificacion, referencia sola y archivos removidos; verificacion codificada tras apply y segunda ejecucion sin cambios comprobada con fixtures aisladas y en la base objetivo.

## Fase 2. Transicion administrativa y correo

- [x] Implementar el endpoint de cambio de estado administrativo y el aviso sincrono por puerto/adaptador.
  Status: completed. Dependencia: fase 1. Cierre: solo transicion a `SUBMITTED` envia; `SENT` se persiste con el estado y `FAILED` conserva el estado previo con error traducido. Build, lint y fixtures aisladas pasaron; `envSchema`, `.env` local y `.env.example` tienen las dos listas. El usuario confirmo la validacion manual de correo/HTTP.

## Fase 3. Lectura de facturacion

- [x] Registrar modulo de permiso y pipeline independiente de listado/detalle.
  Status: completed. Dependencia: fase 1. Cierre: permiso `READ`, filtro backend aplicado antes de count/paginacion/detalle y paridad de campos con administracion; build, lint y comprobaciones aisladas pasaron. El usuario confirmo la validacion HTTP manual.
- [x] Agregar filtro de estado y endpoint local de opciones en ambos listados.
  Status: completed. Dependencia: fase 1. Cierre: administracion ofrece y acepta tres valores; facturacion solo `SUBMITTED`/`INVOICED`, rechaza valores invalidos con `400` y excluye `NOT_SUBMITTED` aun sin filtro; cada endpoint de opciones usa el `READ` de su modulo sin capability derivada nueva. DTOs y guards comprobados sin acceso a la base real.

## Fase 4. Escritura de facturacion

- [x] Implementar actualizacion de estado y de factura bajo `BILLING_CUSTOMER_SERVICE_RECORDS:UPDATE`.
  Status: completed. Dependencia: fases 2 y 3. Cierre: dos rutas con DTO, comandos, casos de uso y permisos propios; solo `SUBMITTED`/`INVOICED`, referencia y archivos de factura; escritura dirigida sin alterar otros segmentos ni cambiar el estado al adjuntar factura. Build, ESLint enfocado y comprobaciones aisladas pasaron; el usuario confirmo la validacion HTTP manual.

## Fase 5. Validacion y operacion

- [x] Actualizar documentacion viva, handoff y coleccion Postman; verificar el ejemplo de variables agregado en la fase 2.
  Status: completed. Dependencia: fases 1-4. Cierre: catalogo de permisos, handoff y requests/ejemplos Postman reflejan el contrato implementado de ambos modulos; `.env.example` conserva las dos listas CSV sin direcciones reales.
- [x] Validar build, lint y escenarios HTTP/permisos/error de correo, y registrar evidencia.
  Status: completed por confirmacion del usuario de las validaciones manuales; no se compartio reporte por escenario. `npm run build` y `npx eslint 'src/**/*.ts'` pasaron en esta revision sin modificar codigo.
- [x] Confirmar base objetivo, ventana sin nuevas altas y variables requeridas por el `envSchema` para los comandos de datos.
  Status: completed. El usuario confirmo la ventana sin nuevas altas y configuro las listas `BILLING_NOTIFICATION_RECIPIENTS_TO` y `BILLING_NOTIFICATION_RECIPIENTS_CC`. La migracion se ejecuto y verifico en la base objetivo; no se requiere repetirla bajo la condicion acordada. El script no envia correos.
- [x] Ejecutar `npm run db:migrate:customer-service-record-billing:dry-run` en el entorno objetivo.
  Status: completed. Ejecuta: usuario. Reporte revisado antes de apply: 57 registros, todos `NOT_SUBMITTED`, 0 `INVOICED`, 0 invalidos y sin escrituras. La persona usuaria procedio con apply tras revisar la clasificacion.
- [x] Ejecutar `npm run db:migrate:customer-service-record-billing:apply` y luego dry-run de verificacion.
  Status: completed. Ejecuta: usuario. Apply: 57 actualizados, 0 pendientes, auditoria intacta y resultado SUCCESS. Segundo dry-run: 57 estados existentes, 0 estados o avisos pendientes y 0 registros invalidos; no hubo escrituras. No se exige respaldo adicional.
- [x] Ejecutar `npm run db:seed:roles`.
  Status: completed por confirmacion del usuario. El reporte de ejecucion no se compartio, por lo que sus conteos no constan; la persona usuaria confirmo posteriormente las validaciones manuales. El seed recalcula los roles de sistema; los roles personalizados no reciben automaticamente el permiso nuevo.
