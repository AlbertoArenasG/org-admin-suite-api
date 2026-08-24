# Analysis

## Current Flow

- `POST /v1/user-registration-invitations` crea invitaciones de aplicación con `USER_REGISTRATION_INVITATIONS/CREATE`.
- El token se genera mediante `UserRegistrationInvitationTokenService`; el documento guarda solo `token_hash`.
- `findActiveByEmail(email, scope)` bloquea invitaciones duplicadas con estado `PENDING` y `consumed_at: null`.
- El modelo actual solo contempla `PENDING` y `CONSUMED`; no hay expiración, revocación ni metadata de envío.
- Los endpoints públicos usan el token para consulta y consumo; no son parte de este cambio.

## Consequences

- Reenviar no puede recuperar el token original; debe emitir uno nuevo e invalidar el anterior.
- Un listado administrativo requiere una consulta paginada independiente de la consulta pública por token.
- El estado de un proveedor de correo representa aceptación para envío, no entrega en la bandeja del destinatario.
- Una revocación debe invalidar el enlace público sin borrar el historial administrativo.
