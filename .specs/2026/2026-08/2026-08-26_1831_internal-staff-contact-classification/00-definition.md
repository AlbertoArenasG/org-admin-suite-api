# Internal Staff Contact Classification

## Status

- Definition: complete
- Technical design: complete
- Implementation: complete
- Validation: complete

## Objective

Separar la pertenencia interna de un usuario respecto a Implementos Cientificos de sus relaciones con Clientes, para clasificar correctamente sus contactos como internos o externos y sincronizar sus nombres de empresa sin inferencias ambiguas.

## Initial Scope

- Agregar una propiedad de negocio al flujo de invitaciones y al usuario materializado.
- Usar esa propiedad como fuente de verdad para la clasificacion interna o externa de contactos vinculados a usuarios.
- Ajustar la sincronizacion de `company_names` para representar exclusivamente Clientes relacionados.
- Definir compatibilidad y migracion de usuarios, invitaciones y contactos existentes.
- Documentar el contrato necesario para una spec posterior de frontend.

## Confirmed Decisions

- La propiedad se llamara `is_internal_staff`.
- `User.is_internal_staff` sera la fuente de verdad para determinar si el contacto vinculado es interno o externo.
- Las relaciones `UserCustomerRelationship` son independientes de la pertenencia interna.
- `company_names` de contactos vinculados a Usuarios representara exclusivamente los Clientes relacionados vigentes.
- La propiedad aplica a todos los `SystemRole`, incluido `MASTER_ADMIN`.
- La migracion temporal de datos existentes normalizara `is_internal_staff: true`.
- Las nuevas invitaciones requeriran `is_internal_staff` explicitamente.
- `Contact.is_internal_staff` materializara la propiedad del Usuario vinculado.
- Los Contactos vinculados a Usuarios seran inmutables desde la frontera administrativa de Contactos.
- `SyncUserContactService` sera el unico escritor de Contactos vinculados a Usuarios.
- Los cambios de relaciones o de nombres de Clientes resincronizaran solo `company_names`, sin modificar identidad ni auditoria del Contacto.
- Los Usuarios e invitaciones `ADMIN` y `MASTER_ADMIN` se clasificaran siempre como personal interno.
- Los Contactos manuales administraran explicitamente su propia clasificacion interna o externa.

## Out Of Scope For Now

- Implementacion de frontend.
- Reglas de alcance de datos por Cliente en modulos futuros.
- Atributos adicionales de empleo, puesto o sucursal.

## Implementation Notes

- La migracion temporal queda pendiente de ejecucion y validacion manual antes de eliminarse del repositorio.
