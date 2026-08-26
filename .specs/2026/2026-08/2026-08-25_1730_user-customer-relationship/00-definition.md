# User Customer Relationship

## Status

- Definition: completed
- Technical design: completed
- Implementation: pending

## Objective

Permitir que un usuario de aplicación se relacione con uno o más clientes existentes durante su invitación de registro, de modo que la relación se materialice al completar el registro.

## Initial Scope

- Extender el modelo de usuario y el flujo de invitación de aplicación.
- Permitir seleccionar uno o más `Customer` existentes para una invitación.
- Persistir la relación mediante una entidad pivote cuando el invitado consume la invitación y se crea su usuario.
- Evolucionar el modelo de contactos para representar múltiples nombres de empresa y sincronizar los contactos vinculados a usuarios con sus relaciones de cliente.
- Migrar los contactos existentes al nuevo modelo de nombres de empresa.
- Preparar contratos administrativos y documentación para una integración posterior de frontend.

## Approved Scope

- No se agregará un `SystemRole` nuevo.
- La relación será opcional y aplicará solo a usuarios `USER` de `APPLICATION`.
- El rol custom seguirá definiendo los módulos y operaciones; la relación usuario-cliente no concede permisos por sí misma.
- La frontera `MASTER` queda fuera.
- La relación se modelará como una entidad pivote `UserCustomerRelationship`, sin atributos de negocio adicionales en esta entrega.
- Los clientes se validarán al emitir la invitación; el consumo materializará íntegramente la selección original aunque sus estados hayan cambiado.
- El contrato de creación recibirá IDs técnicos y las respuestas administrativas expondrán resúmenes legibles de clientes.
- La edición administrativa existente de usuario permitirá reemplazar el conjunto completo de relaciones con clientes.
- El listado existente de usuarios permitirá filtrar relaciones presentes o ausentes respecto a un cliente.
- Reenvío y revocación conservarán el comportamiento de invitaciones sin exponer relaciones a la frontera pública ni `MASTER`.
- `Contact.companyName` se reemplazará por `Contact.companyNames`; los contactos vinculados a usuarios se sincronizarán al crear o reemplazar sus relaciones de cliente.

## Definition Pending

- Ninguna decisión funcional pendiente.

## Out Of Scope For Now

- Implementación de frontend.
- Cambios a la frontera `MASTER` hasta que se determine expresamente su necesidad.

## Architectural Implementation Principle

Los casos de uso principales conservarán responsabilidad de orquestación. La validación y sincronización reutilizable de relaciones usuario-cliente, contactos y nombres de empresa se aislará en servicios compartidos pequeños, con responsabilidades explícitas. No se concentrará lógica de dominio adicional en controladores, casos de uso o servicios existentes que no sean dueños directos de esa responsabilidad.
