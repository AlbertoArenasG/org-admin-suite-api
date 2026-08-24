# User Registration Invitations Management

## Status

- Definition: completed
- Technical design: completed
- Implementation: pending

## Objective

Incorporar capacidades de backoffice para consultar el estado de las invitaciones de registro de usuarios y reenviar las invitaciones de aplicación que aún no han sido consumidas.

## Scope

- Listar invitaciones con `scope: APPLICATION`, incluidas `PENDING`, `CONSUMED` y `REVOKED`.
- Reenviar únicamente invitaciones pendientes no consumidas mediante rotación de token.
- Revocar invitaciones pendientes por una acción explícita de backoffice.
- Exponer operaciones directas `READ` y `RESEND` para el módulo `user_registration_invitations`.
- Registrar metadatos de los intentos de envío de correo.
- Documentar el contrato backend para una spec frontend posterior.

## Out Of Scope

- Expiración, eliminación física o estados de invitación adicionales a `REVOKED`.
- Modificar la frontera pública de consulta y consumo de invitaciones.
- Incluir invitaciones `MASTER` en el backoffice ordinario.
- Confirmación de entrega en la bandeja de correo del destinatario.
- Asociaciones entre usuarios y clientes; se definirán en una spec futura de alcance transversal.

## Existing Behavior

Una invitación nueva genera un token aleatorio, persiste únicamente su hash SHA-256 y envía el token original por correo. La persistencia no permite reconstruir el token. Una invitación `PENDING` no consumida bloquea otra creación para el mismo email y scope.

## Approved Decisions

Las decisiones aprobadas viven en [04-decisions.md](./04-decisions.md).
