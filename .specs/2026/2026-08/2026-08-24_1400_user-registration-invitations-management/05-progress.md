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
- Se aceptó explícitamente la carrera rara entre reenvío y revocación; la revocación prevalece para acceso y no se agregará coordinación adicional de infraestructura.
- Se aprobó una excepción de dominio específica para estados no operables de invitaciones, mapeada a `409`.
- Se definió que reenvío y revocación devuelven la invitación administrativa actualizada para actualizar la tabla sin una consulta adicional.
- Se aprobó registrar metadata de entrega también al crear invitaciones `MASTER`, sin ampliar sus operaciones administrativas.
- Se aprobaron índices compuestos para sostener el listado administrativo conforme crezca el historial de invitaciones.
- Se aprobaron contratos de repositorio separados para el listado de aplicación y las escrituras atómicas de reenvío, confirmación de envío y revocación.
- Se aprobó la extensión del record compartido de invitaciones con estado `REVOKED`, metadata de entrega, contador de reenvíos y trazabilidad de revocación.
- Se aprobaron los flujos de creación, reenvío y revocación, incluido el ciclo de entrega `FAILED` a `ACCEPTED` y la invalidación pública de invitaciones revocadas.
- Se aprobaron los contratos HTTP, CQRS y de presentación administrativa para listado, reenvío y revocación.
- Se aprobaron autorización, seeders, documentación, Postman y validación manual; se agregó un barrido obligatorio de `docs/` antes del cierre.
- Se implementó el Slice 1: modelo compartido, schema Mongoose, mapper con defaults históricos, índices de listado e inicialización de metadata en las creaciones existentes.
- Se validó el Slice 1 con `npm run build`.
