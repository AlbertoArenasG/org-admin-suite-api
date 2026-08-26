# Analysis

## Current State

- `User` no contiene referencias a `Customer`.
- Las invitaciones `APPLICATION` persisten datos del usuario en `userData` y crean el usuario al consumirse en la frontera pública.
- Las invitaciones `MASTER` son una frontera separada y no forman parte del backoffice ordinario.
- `Customer` tiene identidad de dominio propia y estado (`ACTIVE`, `INACTIVE`, `DELETED`).
- La spec previa de administración de invitaciones dejó explícitamente la relación usuario-cliente fuera de alcance.

## Architectural Constraint

La relación `UserCustomerRelationship` debe usar los identificadores de dominio de `User` y `Customer`; no debe filtrar `ObjectId` de Mongo fuera de infraestructura. La definición deberá respetar los puertos, casos de uso, mappers, CQRS y fronteras HTTP existentes.

## Risks To Resolve

- Evitar que una invitación apunte a clientes inexistentes, eliminados o no elegibles.
- Evitar que datos de una invitación revocada o no consumida aparezcan como relaciones efectivas.
- Definir si el rol de sistema condiciona la relación y cómo se gestionará después de que el usuario exista.
