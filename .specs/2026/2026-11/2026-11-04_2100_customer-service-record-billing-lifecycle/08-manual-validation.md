# Matriz de validación manual propuesta

**Responsable:** usuario. Ningún caso está marcado como ejecutado; se registrará evidencia real en `05-progress.md`.

| Escenario | Resultado esperado |
| --- | --- |
| Migración dry-run, apply y segundo dry-run | Históricos clasificados `null`/`PENDING` según billingStatus, cero pendientes al final, auditoría intacta; sin correos. |
| Enviar a `SUBMITTED` con instrucciones; sin destinatarios y con fallo de correo | Instrucciones en aviso cuando se envía; no-op/edición no envía; fallo conocido conserva estado/instrucciones y devuelve error; sin destinatarios se conserva la semántica resiliente. |
| Editar fecha estimada sin entrega o plazo | Se guarda; cambiar luego ambos insumos la recalcula; limpiar un insumo conserva valor hasta edición explícita. |
| Editar entrega/plazo y estimada en la misma llamada | Valor manual explícito prevalece en esa llamada; un cambio posterior de fuente recalcula. |
| Emisión y estado | Poner/quitar fecha dispara `IN_PROCESS_PAYMENT`/`PENDING`; PATCH manual admite seis estados; la fecha de pago no fuerza `PAID`; `PAID` admite fecha nula. |
| Vencimiento | Día de vencimiento aún no `OVERDUE`; día local siguiente sí. Excluir `PAID`, `CANCELLED`, `REJECTED`; mover fecha a hoy/futuro revierte `OVERDUE`; reejecutar no duplica cambios. |
| Referencia, archivos y complementos | Edición administrativa o billing de factura preserva complementos; orden de compra editable en billing; `removedFiles` y conteos correctos; archivos archivados siguen descargables. |
| Archivado | Disponible en cualquier estado; snapshot completo, factura nueva `PENDING`; instrucciones/comentarios/billingStatus intactos; reintento/concurrencia sin duplicación. |
| Comentarios | Alta con auditoría y visibilidad; paginación estable; sin endpoint de edición; no aparecen en administración ni portal. |
| Seguridad/errores | 401 sin token, 403 sin permiso, 404 por registro fuera de billing, 400 para DTO inválido, 409 en conflicto de versión; job exige token interno. |
| Contrato entre repositorios | Campos viejos y rutas existentes conservados; nuevos campos/localización en facturación; Postman y handoff coinciden con respuesta real. |

## Evidencia por riesgo

| Riesgo | Nivel y evidencia esperada | Responsable |
| --- | --- | --- |
| Migración sobre datos históricos | Dry-run con conteos; apply y segundo dry-run sin pendientes; comparación de `updatedAt`/`updatedBy` anterior y posterior. | Usuario. |
| Pérdida o duplicación de factura al archivar | Validación manual de dos intentos y de dos escrituras concurrentes; un solo snapshot y versión coherente. | Usuario. |
| Cálculo de fechas y vencimiento | Casos manuales de fin de mes, día local de Ciudad de México y fecha manual independiente; respuesta y estado persistido. | Usuario. |
| Archivos y compatibilidad de rutas actuales | Edición de factura en ambos módulos, descarga de archivados, conteo visible y respuesta previa compatible. | Usuario. |
| Seguridad y datos no expuestos | Peticiones con/sin permisos y revisión de proyección administrativa/portal para ausencia de comentarios. | Usuario. |
| Código y composición Nest | Build, lint enfocado, revisión del diff y de registros CQRS/DI tras cada slice. | Agente. |

La colección Postman registra ejemplos de éxito/error por endpoint durante su slice. No se crean ni ejecutan suites de pruebas automatizadas en esta iniciativa.
