# Analysis

## Current State

La spec `user-customer-relationship` introdujo `Contact.company_names` y una sincronizacion derivada desde `UserCustomerRelationship`. En ese modelo, una invitacion sin Clientes podia asignar `['ICSACV']` como fallback, mientras que la sustitucion de relaciones podia dejar una lista vacia.

Ese comportamiento mezcla dos conceptos distintos:

- Pertenencia al equipo interno de Implementos Cientificos.
- Relaciones operativas con uno o varios Clientes.

Como consecuencia, al relacionar a un usuario interno con un Cliente, la sincronizacion puede reemplazar el nombre interno por los nombres de Clientes. La clasificacion de contactos tambien depende actualmente de inferencias sobre `user_id` y `company_names`.

## Desired Model

`is_internal_staff` expresa una caracteristica propia del Usuario e Invitacion. La sincronizacion de contactos debe derivar tanto los nombres de empresa como la clasificacion interno/externo desde esa fuente, no desde la ausencia o presencia de relaciones con Clientes.

## Constraints

- Mantener arquitectura limpia y aislar sincronizaciones en servicios compartidos.
- No usar `ObjectId` ni detalles de Mongo fuera de infraestructura.
- La migracion y los seeds se ejecutaran manualmente por el usuario.
- No incluir pruebas automatizadas en esta API; se preparara validacion manual.
