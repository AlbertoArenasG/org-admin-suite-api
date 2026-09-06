# Handoff Frontend: Creacion Directa De Usuarios

**Fecha:** 2026-09-06
**Estado:** Contrato de backend implementado; pendiente de validacion manual y
seed de permisos por el responsable del entorno.
**Spec:** [Direct Backoffice User Creation](../../.specs/2026/2026-09/2026-09-06_1500_direct-backoffice-user-creation/00-definition.md).

## Scope And Authorization

La administracion ordinaria puede crear directamente usuarios activos sin
invitacion mediante `USERS:CREATE`. Esta capacidad no reemplaza invitaciones:
estas permanecen como el flujo para que una persona complete su propio registro.

La vista que cree usuarios requiere solo `USERS:CREATE` para crear y consultar
roles asignables. El modulo `USERS` ya deriva en backend la capability de
`GET /v1/customers/options`, por lo que el selector opcional de Cliente no
agrega un permiso que frontend deba administrar. No debe solicitar
`CUSTOMERS:UPDATE`, `ROLES:READ` ni permisos de invitaciones.

## Endpoints

### Roles asignables

```text
GET /v1/users/creation-roles
Authorization: Bearer JWT
Permission: USERS:CREATE
```

Devuelve el mismo arreglo localizado que `GET /v1/users/roles`, pero esta ruta
es exclusiva para creacion directa. No usar `/v1/users/roles` en esta vista:
esa ruta requiere `USER_REGISTRATION_INVITATIONS:CREATE`.

Cada opcion contiene `role_id`, `role_code`, `role_name`, `system_role`,
`role_scope`, `is_system` e `is_default`.

### Crear usuario

```text
POST /v1/users
Authorization: Bearer JWT
Permission: USERS:CREATE
Content-Type: application/json
```

```json
{
  "name": "Ana",
  "lastname": "Lopez",
  "email": "ana@example.com",
  "password": "A-secure-password",
  "system_role": "USER",
  "role_id": "ROLE_ID",
  "is_internal_staff": false,
  "cell_phone": {
    "country_code": "+52",
    "number": "5512345678"
  },
  "customer_id": "CUSTOMER_ID"
}
```

`customer_id` es opcional. Al omitirlo se crea un usuario sin relaciones con
Clientes. Si se envia, el backend crea exactamente una relacion en la misma
operacion que el Usuario. Solo `USER` acepta `customer_id`; para `ADMIN` el
frontend debe omitirlo. La administracion de multiples Clientes queda en la
edicion posterior de Usuario.

`role_id` es obligatorio para `USER`; para `ADMIN` se omite. `MASTER_ADMIN`
no es un valor aceptado por este endpoint. La contrasena se valida por la
politica vigente de backend; frontend no debe implementar una regla paralela.

La respuesta es `201 Created` con el envelope y proyeccion administrativa de
Usuario existentes: identidad, rol, estado, telefono y fecha de creacion. No
incluye `customers`; recargar detalle si la vista necesita esa relacion.

## Errors And UI Rules

| Scenario | Result |
| --- | --- |
| JWT absent or invalid | `401` estándar |
| Missing `USERS:CREATE` | `403` estándar |
| Invalid payload, invalid role/customer pairing, inactive customer | `400`; keep form values and show backend validation |
| Missing or deleted customer | `404`; keep form values and refresh customer options if appropriate |
| Existing email | conflicto estándar de email; do not retry automatically |

No hacer una segunda llamada a `POST /v1/customers/:customerId/users` después
de crear: cuando se envia `customer_id`, backend ya garantiza la asociación
atómica.

## Deployment Prerequisite

Tras desplegar el cambio de catálogo, el responsable ejecuta:

```bash
npm run db:seed:roles
```

La vista no debe habilitarse para roles de sistema hasta que el seed haya sido
confirmado. Los roles custom requieren asignar `USERS:CREATE` explícitamente
desde administración de roles.
