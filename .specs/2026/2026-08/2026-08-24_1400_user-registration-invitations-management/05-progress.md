# Progress

## 2026-08-24

- Se creó la spec de backend para administrar invitaciones de registro de usuarios.
- Se confirmó que el token de invitación se persiste únicamente como hash y que el reenvío requiere rotación de token.
- Se aprobaron el alcance, operaciones directas, listado, reenvío, metadata de entrega, manejo de fallos y compatibilidad de invitaciones existentes.
- Se aprobó la actualización condicional atómica para evitar reenvíos concurrentes y carreras contra el consumo.
- Se aprobaron respuestas diferenciadas para invitación inexistente, no reenviable y fallo recuperable del proveedor de correo.
- Se definió validación manual por Postman, sin pruebas automatizadas en esta versión.
- Se definieron defaults explícitos para metadata de invitaciones existentes y el estado inicial seguro de invitaciones nuevas.
- Se cerró formalmente la fase de definición.
- Se agregó revocación administrativa de invitaciones pendientes como estado terminal `REVOKED`, con trazabilidad e invalidación del enlace público, sin eliminación física.
- Se definió gestión delegada para `RESEND` y `REVOKE`; la jerarquía existente solo aplica a `CREATE`.
- Se descartó motivo textual de revocación para esta versión.
- Se confirmó que invitaciones históricas no requerirán migración masiva; el mapper Mongoose normalizará sus metadata ausentes al contrato de dominio.
- Se excluyeron explícitamente las asociaciones usuario-cliente; se resolverán en una spec futura antes de integrarlas a invitaciones.
- Se confirmó que `REVOKED` es terminal: las correcciones se resuelven creando una nueva invitación pendiente, que puede coexistir con el historial revocado del mismo email.
