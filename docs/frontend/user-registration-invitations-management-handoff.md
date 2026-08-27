# Handoff Frontend: Gestión De Invitaciones De Registro

## Propósito

Este documento describe la integración frontend para administrar invitaciones de registro de usuarios de alcance ordinario.

La fuente de verdad es la API implementada por la spec `user-registration-invitations-management`.

## Alcance

- Solo administra invitaciones con `scope: APPLICATION`.
- No expone listado, reenvío ni revocación de invitaciones `MASTER`.
- La creación existente permanece en `POST /v1/user-registration-invitations`.

Para una invitación `USER`, el request de creación debe incluir
`is_internal_staff: boolean`. Es una clasificación de negocio independiente de
los clientes relacionados. Para `ADMIN`, el valor efectivo es siempre `true` y
enviar `false` es inválido.

## Permisos

| Acción UI | Permiso requerido |
| --- | --- |
| Ver listado | `USER_REGISTRATION_INVITATIONS/READ` |
| Crear invitación | `USER_REGISTRATION_INVITATIONS/CREATE` |
| Reenviar | `USER_REGISTRATION_INVITATIONS/RESEND` |
| Revocar | `USER_REGISTRATION_INVITATIONS/REVOKE` |
| Ver detalle | `USER_REGISTRATION_INVITATIONS/READ` |

`UPDATE` no participa en esta funcionalidad. Los permisos de reenvío y revocación son delegados: backend permite operar cualquier invitación `APPLICATION` cuando el actor posee la operación.

## Listado

```text
GET /v1/user-registration-invitations
```

Query params:

- `page`, `limit`
- `search`: coincidencia por email
- `status`: `PENDING`, `CONSUMED` o `REVOKED`
- `sort[]`: únicamente `status` y `created_at`; admite orden compuesto

Sin `sort[]`, backend usa `created_at DESC`.

Respuesta de cada fila:

```json
{
  "invitation_id": "...",
  "email": "user@example.com",
  "status": "PENDING",
  "status_name": "Pendiente",
  "system_role": "USER",
  "system_role_name": "Usuario",
  "role_id": "...",
  "role_name": "...",
  "is_internal_staff": false,
  "user_data": {},
  "invited_by_user_id": "...",
  "created_at": "...",
  "consumed_at": null,
  "revoked_at": null,
  "revoked_by_user_id": null,
  "email_delivery": {
    "last_attempt_at": "...",
    "last_attempt_status": "ACCEPTED"
  },
  "resend_count": 0
}
```

No existen token, hash, URL de invitación ni respuesta del proveedor en esta API.

## Detalle

```text
GET /v1/user-registration-invitations/:invitationId
```

- Requiere `USER_REGISTRATION_INVITATIONS/READ`.
- Resuelve exclusivamente invitaciones `APPLICATION`; una invitación `MASTER` responde `404` igual que un ID inexistente.
- Mantiene el mismo shape administrativo de una fila y agrega `customers` solo en esta respuesta.

```json
{
  "customers": [
    {
      "customer_id": "...",
      "company_name": "Cliente Ejemplo",
      "status": "ACTIVE",
      "status_name": "Activo"
    }
  ]
}
```

Las respuestas de creación, listado, reenvío y revocación no incluyen `customers`.

## Acciones

### Reenviar

```text
POST /v1/user-registration-invitations/:invitationId/resend
```

- No recibe body.
- Solo una invitación `PENDING` puede reenviarse.
- Rota el token; el enlace anterior queda inválido.
- Devuelve `200` con la fila administrativa actualizada.
- Si el proveedor falla, responde el error correspondiente, pero la invitación queda pendiente con `email_delivery.last_attempt_status: FAILED` y puede reenviarse después.

### Revocar

```text
POST /v1/user-registration-invitations/:invitationId/revoke
```

- No recibe body.
- Solo una invitación `PENDING` puede revocarse.
- Devuelve `200` con la fila actualizada, `status: REVOKED`, `revoked_at` y `revoked_by_user_id`.
- `REVOKED` es terminal. Para corregir email, rol o datos se crea una nueva invitación; pueden coexistir invitaciones revocadas históricas y una pendiente para el mismo email.

## Reglas De UI

- Mostrar acciones de reenvío y revocación solo para filas `PENDING` y cuando el usuario tenga el permiso correspondiente.
- Reemplazar la fila local con la respuesta de `200`; no es necesario relistarla.
- Tratar `email_delivery.last_attempt_status: ACCEPTED` como aceptación del proveedor de correo, no confirmación de entrega o lectura.
- No implementar evaluación de capabilities auxiliares: no intervienen en este flujo y backend resuelve sus propias autorizaciones.
- Manejar `404` como invitación inexistente o fuera del scope ordinario, y `409` como estado ya no operable o carrera concurrente. Tras cualquiera de esos casos, refrescar el listado si sigue visible.

## Compatibilidad

Invitaciones históricas sin metadata se devuelven con:

```json
{
  "email_delivery": {
    "last_attempt_at": null,
    "last_attempt_status": null
  },
  "resend_count": 0,
  "revoked_at": null,
  "revoked_by_user_id": null
}
```
