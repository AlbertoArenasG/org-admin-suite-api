# Handoff Frontend: Relaciones Usuario-Cliente

## Alcance

La API permite asociar usuarios de aplicación con cero, uno o varios clientes mediante una relación interna. No agrega un nuevo `system_role`: la relación solo se acepta para `USER`; `ADMIN` y `MASTER_ADMIN` no aceptan `customer_ids`.

La fuente de verdad de las relaciones es backend. Frontend no calcula permisos ni sincroniza contactos.

## Invitaciones

`POST /v1/user-registration-invitations` acepta el campo opcional:

```json
{
  "customer_ids": ["CUSTOMER_ID_A", "CUSTOMER_ID_B"]
}
```

- Si se omite, la invitación conserva una selección vacía.
- Los IDs deben ser únicos y corresponder a clientes `ACTIVE`.
- Al consumir la invitación, backend materializa las relaciones y deriva los nombres de empresa del contacto interno.
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

`PATCH /v1/users/:userId` acepta opcionalmente `customer_ids` únicamente si el usuario objetivo es `USER`:

- campo omitido: conserva las relaciones existentes;
- `[]`: elimina todas las relaciones;
- arreglo poblado: reemplaza el conjunto completo;
- `ADMIN` y `MASTER_ADMIN`: backend rechaza el campo.

`GET /v1/users` conserva filas ligeras. Para filtrar por un cliente se deben enviar siempre ambos parámetros:

```text
customer_id=:customerId
has_customer_relationship=true|false
```

- `true`: solo usuarios `USER` relacionados con ese cliente;
- `false`: solo usuarios `USER` no relacionados con ese cliente;
- un ID sintácticamente válido que no exista devuelve una lista vacía;
- enviar solo uno de los parámetros devuelve `400`.

`GET /v1/users/:userId` agrega `customers` con el mismo resumen localizado del detalle de invitación. `GET /v1/users/me`, listados y respuestas de actualización no incluyen ese campo.

## Contactos

El contrato de contactos reemplaza definitivamente `company_name` por `company_names: string[]`.

- Los contactos manuales pueden enviar una lista vacía o varios nombres.
- Los contactos vinculados a usuarios mantienen nombres derivados de sus relaciones; su actualización administrativa directa está bloqueada por backend.
- Cuando cambia el nombre de un cliente, backend recalcula y sincroniza los contactos vinculados en la misma transacción.

## Despliegue Coordinado

Antes de desplegar el backend y frontend que usan `company_names`, ejecutar manualmente durante la ventana de despliegue:

```bash
npm run db:migrate:contact-company-names:dry-run
npm run db:migrate:contact-company-names:apply
```

La migración convierte el campo legado, elimina `company_name` y reemplaza el índice de texto. No se conserva un campo temporal de compatibilidad.
