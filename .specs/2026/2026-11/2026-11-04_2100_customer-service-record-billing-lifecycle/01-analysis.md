# Análisis del estado actual

- `CustomerServiceRecord` mantiene `billingStatus` y `billingNotification` en raíz, y `invoice`/`purchaseOrder` como documentos con referencia y archivos. El schema, mapper y repositorio Mongo preservan esta estructura.
- Facturación ya tiene controlador, CQRS, casos de uso, presenter y repositorio de lectura independientes del módulo administrativo. `READ` filtra registros activos con `SUBMITTED`/`INVOICED`; `UPDATE` permite estado de envío y documento de factura.
- La conciliación de archivos y las URLs de descarga/previsualización ya existen; deben reutilizarse también para orden de compra y complementos.
- `invoice` comparte hoy el tipo genérico de documentos con cotización y orden de compra. Tanto la edición documental administrativa como la de facturación reconstruyen la factura con referencia/archivos; si se agrega `paymentComplements` sin adaptar ambas rutas, lo borrarían. `calculateCounts` tampoco incluye archivos de complementos. La especialización del tipo y la preservación de complementos son parte necesaria del cambio.
- El job de materializaciones operativas lee únicamente registros operativos. El vencimiento de facturas requiere consulta y job dedicados bajo `InternalJobsAuthGuard`, sin ampliar indebidamente el job operativo.
- Hay utilidad de intervalos y fecha local de Ciudad de México. Su comportamiento para fin de mes debe verificarse contra el plazo de pago antes de reutilizarla ciegamente; `Date#setUTCMonth` puede desbordar de mes si no se ajusta el día.
- Los comentarios y los snapshots archivados pueden crecer sin límite de negocio. Guardarlos como arrays ilimitados en el documento principal chocaría con el límite físico de MongoDB; conviene colecciones separadas con paginación e índices por `record_id`. El contrato los presenta como recursos del registro.
- Migración histórica anterior de `billingStatus` ya se ejecutó. Esta nueva migración solo inicializa los campos nuevos, sin reclasificar `billingStatus`, tocar auditoría ni enviar correos.

## Riesgos de diseño

1. Escrituras concurrentes entre edición de factura, archivado y job. Usar versión/estado esperado y actualizaciones condicionales; archivar con transacción para no duplicar o perder snapshots.
2. Archivos archivados: conservar referencias y metadatos; el archivado no elimina archivos de la colección `files` ni de S3.
3. Fechas `YYYY-MM-DD` sin conversión UTC para la regla de vencimiento; usar día local de Ciudad de México. En reintentos del job, evitar duplicar cambios de auditoría.
4. El `invoiceStatus` calculado puede sobrescribir una edición manual cuando ocurre un evento posterior, conforme a la decisión de producto. No almacenar una bandera de procedencia.
5. La interfaz requiere nuevos campos y recursos; documentar su contrato y permisos en el handoff, sin implementarla en esta spec.
