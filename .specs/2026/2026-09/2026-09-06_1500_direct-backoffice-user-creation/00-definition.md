# Direct Backoffice User Creation

## Status

- Definition status: completed
- Implementation ready: yes

## Objective

Permitir que backoffice cree directamente un usuario de aplicacion sin una
invitacion previa y, de forma opcional, lo relacione con un Cliente activo en
la misma operacion transaccional.

## Scope

Included:

- `POST /v1/users`, protegido exclusivamente por `USERS:CREATE`.
- Usuario activo con contrasena definida por el actor.
- `customer_id` singular y opcional; solo valido para `system_role=USER`.
- `GET /v1/users/creation-roles`, protegido por `USERS:CREATE`, para obtener
  los roles asignables sin depender del permiso de invitaciones.
- Actualizacion del catalogo `USERS`, seed de roles, Postman, handoff frontend
  y documentacion de autorizacion.

Excluded:

- Reemplazar, retirar o alterar el flujo de invitaciones.
- Crear `MASTER_ADMIN` desde backoffice ordinario.
- Asociar varios Clientes al crear; la edicion posterior conserva
  `PATCH /v1/users/:userId` con `customer_ids`.
- Cambiar la politica, canales o tolerancia a errores de bienvenida vigente.
- Construir la pantalla frontend en esta iniciativa backend.

## Approved Rules

- El campo `customer_id` se omite para crear un usuario sin Cliente.
- Si se envia `customer_id`, el usuario debe ser `USER` y el Cliente debe
  existir y estar `ACTIVE`.
- La creacion del Usuario, su relacion opcional y la sincronizacion de su
  Contacto se confirman o revierten juntas.
- El endpoint no acepta `MASTER_ADMIN`; conserva la jerarquia de roles ya
  aplicada por `AuthorizationService`.
- El unico permiso funcional requerido es `USERS:CREATE`. No se agrega
  capability auxiliar ni se exige `CUSTOMERS:UPDATE`.
- La bienvenida conserva el comportamiento de `CreateUserAndNotifyUseCase`:
  ocurre despues de confirmar la escritura y no cambia su politica de error.

## Acceptance Criteria

| Flow | Preconditions and input | Observable result |
| --- | --- | --- |
| Direct user without customer | JWT with `USERS:CREATE`; valid `ADMIN` or `USER` payload; omitted `customer_id` | `201`, active user; no user-customer relationship |
| Direct external user with customer | Same permission; valid `USER` and active `customer_id` | `201`, active user and exactly one new relationship |
| Invalid customer role pairing | `customer_id` with `ADMIN` | `400`; neither user nor relationship persists |
| Missing or inactive customer | `customer_id` does not exist, is deleted, or is inactive | existing `404`/`400`; neither user nor relationship persists |
| Duplicate email | Existing user email | existing conflict response; no relationship persists |
| Insufficient permission | JWT without `USERS:CREATE` | existing `403` authorization response |
| Roles lookup | JWT with `USERS:CREATE` | `200` with roles assignable to actor's system role |

## Dependencies And Compatibility

- Reuses `CreateUserAndNotifyUseCase`, `UserCustomerRelationshipManagerService`,
  `GetUserRolesQuery`, the existing user presenter and the current notification
  flow.
- No schema, migration, backfill or new domain aggregate is required.
- Existing invitation endpoints and their `USER_REGISTRATION_INVITATIONS:*`
  permissions remain unchanged.
