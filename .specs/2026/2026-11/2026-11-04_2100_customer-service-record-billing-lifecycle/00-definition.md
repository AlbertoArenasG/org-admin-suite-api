# Ciclo de factura y cobranza de registros de servicio (backend)

## Estado

- Initiative: `customer-service-record-billing-lifecycle`
- Date: `2026-11-04`
- Definition status: completed
- Implementation ready: yes
- Implementation status: pending
- Validation status: pending
- Spec status: in_progress

## Resultado

Ampliar el módulo de facturación existente para registrar la factura vigente, su estado de pago, complementos, facturas archivadas, fechas, instrucciones y comentarios propios de facturación, conservando separado el flujo `billingStatus` del registro. La interfaz se especificará aparte; este documento define el contrato y comportamiento del backend.

## Alcance acordado

- `billingStatus` conserva `NOT_SUBMITTED`, `SUBMITTED` e `INVOICED`. Un nuevo `invoiceStatus` representa el ciclo de pago: `PENDING`, `IN_PROCESS_PAYMENT`, `PAID`, `OVERDUE`, `CANCELLED`, `REJECTED`. Están separados de los estatus técnicos y operativos. Antes del envío a facturación el nuevo estado puede ser nulo; tras el primer envío comienza en `PENDING`.
- La factura vigente mantiene referencia y adjuntos. Admite complementos de pago, cada uno con referencia opcional y colección propia de adjuntos y removidos, sin imponer PDF/XML ni un límite de negocio. `purchaseOrder` conserva su estructura existente y puede editarse desde facturación.
- Una factura puede cancelarse o rechazarse sin archivarse ni crear otra. El archivado es una acción explícita disponible en cualquier estado y mueve **toda** la factura vigente a un historial del registro, junto con estado, fechas, plazo y complementos. No hay archivado parcial ni motivo de archivado. Después del archivado, la factura vigente queda vacía y su estado vuelve a `PENDING`. Las instrucciones y los comentarios del registro permanecen.
- Los comentarios son de facturación a nivel registro, separados de observaciones técnicas y de la factura vigente. Son ilimitados por regla de negocio e inmutables en esta fase. Cada comentario tiene contenido, visibilidad `INTERNAL`/`EXTERNAL`, `createdBy`, `updatedBy`, `createdAt`, `updatedAt`; al crearlo coinciden ambos pares de auditoría. Inicialmente solo el módulo de facturación puede leerlos y crearlos; `EXTERNAL` prepara una posible exposición futura, pero no habilita el portal de clientes.
- El objeto de facturación a nivel registro contiene instrucciones para facturación, fechas de emisión, entrega, pago estimado y pago real, y plazo en años/meses/semanas/días. Administración puede capturar y editar las instrucciones al enviar el registro; el aviso inicial por correo incluye las instrucciones actuales. Editarlas después no reenvía correo. Una futura transición explícita a `SUBMITTED` usa su valor actual.
- Capturar fecha de emisión pone el estado de factura en `IN_PROCESS_PAYMENT`; quitarla lo regresa a `PENDING`. El usuario de facturación puede editar manualmente `invoiceStatus` en cualquier momento, incluso poner `PAID` sin fecha de pago. Capturar o borrar la fecha de pago no modifica por sí mismo el estado. Un evento posterior que cambie automáticamente el estado puede sustituir un estado manual; no se almacena prioridad ni origen manual.
- La fecha estimada de pago **puede capturarse y editarse manualmente sin importar el estado de la fecha de entrega o del plazo**. Cuando fecha de entrega y plazo están disponibles y cualquiera de ellos cambia, se recalcula la fecha estimada y se sustituye su valor anterior, aunque fuera manual. Si falta uno de esos insumos, se conserva la fecha estimada existente salvo que el usuario la edite o limpie expresamente. No se guarda bandera de origen manual.
- Un job interno dedicado marca `OVERDUE` desde el día siguiente a la fecha estimada de pago, con fecha local de Ciudad de México, salvo si la factura está `PAID`, `CANCELLED` o `REJECTED`. Si una factura `OVERDUE` recibe una fecha estimada futura, vuelve a `IN_PROCESS_PAYMENT`. El endpoint se invocará manualmente en esta fase; no se crea scheduler ni correo de vencimiento.
- Al devolver el `billingStatus` a `NOT_SUBMITTED` no se limpian factura, datos de facturación, comentarios ni historial. La lectura actual de facturación continúa limitada a `SUBMITTED` e `INVOICED`.
- Migración con `dry-run`, `apply` idempotente y verificación: los históricos `NOT_SUBMITTED` reciben estado de factura nulo, los `SUBMITTED`/`INVOICED` reciben `PENDING`; nuevas fechas, plazo, instrucciones, comentarios y archivos históricos comienzan vacíos. No inferir pagos o vencimientos, no mandar correos y no alterar `updatedAt`/`updatedBy`.

## Fuera de alcance

- Vista de frontend, portal de clientes, facturación automática con SAT, emisión de CFDI, captura de importes o parcialidades, scheduler y alertas por vencimiento.
- Archivado automático por cancelación/rechazo, archivado parcial, motivo de archivado, motivo separado de cancelación/rechazo y edición o eliminación de comentarios.
- Crear permisos nuevos o permitir que el módulo de facturación edite datos técnicos del registro.

## Restricciones y compatibilidad

- Mantener el pipeline controller → DTO → CQRS → caso de uso → puertos/adaptadores → presenter; rutas actuales y su semántica conservadas salvo extensiones documentadas de contrato.
- Reutilizar `billing_customer_service_records:READ/UPDATE`, el guard de internal jobs y los helpers existentes de fechas y conciliación de archivos.
- Documentar endpoints y cambios de contrato en el handoff frontend, Postman y documentación viva durante sus slices de implementación.
- Las operaciones de migración y cualquier escritura en base de datos las ejecuta el usuario; la sesión de IA no crea ni ejecuta pruebas automatizadas sin solicitud expresa.

## Decisiones abiertas

Ninguna decisión de producto bloqueante. Las rutas, DTO, persistencia e invariantes propuestos están en `06-technical-design.md`. El usuario autorizó expresamente marcar `Implementation ready: yes` el 2026-11-04. La codificación requiere su autorización de inicio por separado.
