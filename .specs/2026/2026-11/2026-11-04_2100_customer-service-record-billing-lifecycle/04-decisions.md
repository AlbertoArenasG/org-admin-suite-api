# Decisiones

1. Separar `billingStatus` del registro y `invoiceStatus` de la factura. El envío a facturación y el avance del pago son procesos distintos.
2. Mantener una factura vigente; cancelar y rechazar son estados de ella. Archivarla es una acción explícita, completa y posible en cualquier estado. El historial conserva snapshots; no existe motivo de archivado.
3. Los complementos de pago forman parte de la factura vigente y de su snapshot archivado. Usan colecciones abiertas de archivos con auditoría de removidos. Se difiere la captura de importes/parcialidades.
4. Los comentarios son del registro, exclusivos del módulo de facturación por ahora, inmutables y marcados internos/externos para una posible exposición posterior. No se archivan con la factura.
5. La fecha de pago real es informativa: no cambia automáticamente a `PAID`; `PAID` no exige fecha. La fecha de emisión sí dispara `IN_PROCESS_PAYMENT` y su eliminación `PENDING`.
6. La fecha estimada admite edición manual independiente de la entrega y el plazo. Un cambio posterior de alguno de esos insumos recalcula cuando están ambos presentes; si falta alguno, se preserva el valor actual. No se priorizan ediciones manuales sobre eventos futuros.
7. Vencimiento por job interno dedicado y ejecución manual inicial. `OVERDUE` empieza el día local posterior al vencimiento y excluye `PAID`, `CANCELLED`, `REJECTED`. Scheduler y avisos quedan para otra iniciativa.
8. `NOT_SUBMITTED` retiene íntegramente factura, datos, comentarios e historial; la visibilidad en facturación sigue la regla existente de `SUBMITTED`/`INVOICED`.
9. Migración histórica sin inferencia ni mutación de auditoría. `NOT_SUBMITTED` → estado de factura nulo; `SUBMITTED`/`INVOICED` → `PENDING`.
