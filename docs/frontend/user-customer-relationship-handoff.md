# Handoff Frontend: Relaciones Usuario-Cliente

## Alcance

La API permite asociar usuarios de aplicación con cero, uno o varios clientes mediante una relación interna. No agrega un nuevo `system_role`: la relación solo se acepta para `USER`; `ADMIN` y `MASTER_ADMIN` no aceptan `customer_ids`.

La fuente de verdad de las relaciones es backend. Frontend no calcula permisos ni sincroniza contactos.

## Catálogo De Clientes

Para selects de creación de invitaciones y edición de usuarios, usar:

```text
GET /v1/customers/options
```

La respuesta no es paginada y contiene únicamente clientes `ACTIVE`, ordenados por nombre:

```json
[
  {
    "customer_id": "...",
    "company_name": "Cliente Ejemplo"
  }
]
```

No usar `GET /v1/customers` para este propósito: es la lectura administrativa paginada. El acceso al catálogo se resuelve mediante capabilities auxiliares derivadas exclusivamente en backend.

Antes de habilitar este flujo para roles ya existentes, backend debe ejecutar manualmente `npm run db:seed:roles`; el seed recalcula las capabilities derivadas de roles default y custom sin cambiar su auditoría administrativa, sin ejecutar otros seeds de catálogos.

## Invitaciones

`POST /v1/user-registration-invitations` acepta `is_internal_staff` y el campo opcional `customer_ids`:

```json
{
  "is_internal_staff": false,
  "customer_ids": ["CUSTOMER_ID_A", "CUSTOMER_ID_B"]
}
```

- Para invitaciones `USER`, `is_internal_staff` es obligatorio.
- Para invitaciones `ADMIN`, el valor efectivo siempre es `true`; enviar `false` es inválido.
- Si se omite, la invitación conserva una selección vacía.
- Los IDs deben ser únicos y corresponder a clientes `ACTIVE`.
- Al consumir la invitación, backend materializa las relaciones y deriva `company_names` del contacto vinculado exclusivamente desde los Clientes relacionados.
- Reenviar o revocar una invitación no modifica su selección.

`GET /v1/user-registration-invitations/:invitationId` expone el detalle administrativo con:

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

Solo aplica a invitaciones `APPLICATION`; un ID de una invitación `MASTER` responde `404`.

## Usuarios

`PATCH /v1/users/:userId` acepta opcionalmente `is_internal_staff` y `customer_ids`:

- si `is_internal_staff` se omite, se conserva; para `ADMIN` o `MASTER_ADMIN`, el valor efectivo siempre es `true` y `false` es inválido;
- el valor se expone como `is_internal_staff` en respuestas protegidas de Usuarios e Invitaciones;
- no se expone en endpoints públicos de consumo de invitación;
- `customer_ids` solo se acepta para el usuario objetivo `USER`:

  - campo omitido: conserva las relaciones existentes;
  - `[]`: elimina todas las relaciones;
  - arreglo poblado: reemplaza el conjunto completo;
  - `ADMIN` y `MASTER_ADMIN`: backend rechaza el campo.

`GET /v1/users` conserva filas ligeras y admite filtros mutuamente excluyentes:

```text
customer_id=:customerId
customer_relationship=UNASSIGNED
```

- `customer_id`: solo usuarios `USER` relacionados con ese cliente;
- `customer_relationship=UNASSIGNED`: usuarios `USER` y `ADMIN` sin relación con ningún cliente; excluye `MASTER_ADMIN`;
- un `customer_id` inexistente o eliminado devuelve `404`;
- enviar ambos parámetros devuelve `400`;
- `has_customer_relationship` fue retirado sin compatibilidad temporal.

`GET /v1/users/:userId` agrega `customers` con el mismo resumen localizado del detalle de invitación. `GET /v1/users/me`, listados y respuestas de actualización no incluyen ese campo.

## Administración Contextual Desde Clientes

Estas rutas permiten administrar relaciones desde el contexto de un Cliente. No requieren permisos `USERS/*` ni capabilities auxiliares.

| Ruta | Permiso | Comportamiento |
| --- | --- | --- |
| `GET /v1/customers/:customerId/users` | `CUSTOMERS/READ` | Lista paginada usuarios `USER` no eliminados relacionados; permite Cliente activo o inactivo. |
| `GET /v1/customers/:customerId/available-users` | `CUSTOMERS/UPDATE` | Lookup no paginado de usuarios `USER` activos sin relación con ningún Cliente. |
| `POST /v1/customers/:customerId/users` | `CUSTOMERS/UPDATE` | Asocia `{ "user_id": "..." }`; devuelve `201 Created`. Puede asociar a un Usuario ya relacionado con otro Cliente. |
| `DELETE /v1/customers/:customerId/users/:userId` | `CUSTOMERS/UPDATE` | Elimina solo esa relación; devuelve `204 No Content`. |

Las mutaciones contextuales solo operan sobre Clientes `ACTIVE`. Clientes `INACTIVE` permiten consultar sus relaciones, pero no asociar ni desasociar. Clientes eliminados no se exponen como contexto.

La respuesta administrativa de Usuario incluye `system_role_name` y `status_name` localizados. El lookup devuelve `id`, `name`, `lastname`, `full_name` y `email`.

## Contactos

El contrato de contactos reemplaza definitivamente `company_name` por `company_names: string[]`.

- Todo Contacto expone `is_internal_staff`; es la unica clasificacion de contacto expuesta por la API. Ya no existe el query ni el campo derivado `type`, y frontend no debe inferir la clasificacion por `user_id` ni por `company_names`.
- Los contactos manuales deben enviar `is_internal_staff` al crearse, pueden modificarlo y pueden enviar una lista vacía o varios nombres.
- Los contactos vinculados a usuarios copian `is_internal_staff` desde el Usuario y mantienen nombres derivados exclusivamente de sus relaciones; su actualización administrativa directa está bloqueada por backend.
- Cuando cambia el nombre de un cliente o se elimina lógicamente, backend recalcula y sincroniza los contactos vinculados en la misma transacción. La eliminación conserva la relación como historial, pero excluye ese Cliente de `company_names`.

## Despliegue Coordinado

Antes de desplegar el backend y frontend que usan `company_names`, ejecutar manualmente durante la ventana de despliegue:

```bash
npm run db:migrate:contact-company-names:dry-run
npm run db:migrate:contact-company-names:apply
```

La migración convierte el campo legado, elimina `company_name` y reemplaza el índice de texto. No se conserva un campo temporal de compatibilidad.
