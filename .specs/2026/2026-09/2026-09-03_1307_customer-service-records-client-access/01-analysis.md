# Analysis

Actualizacion de alcance aprobada: la frontera relacional descrita abajo
corresponde a usuarios externos. Staff interno se identifica mediante
IUserReadRepository.findById en cada consulta y omite ambas restricciones
relacionales, conservando READ, ACTIVE y la proyeccion de Client Access.

## Current State

- `CustomerServiceRecord` ya contiene `customer`, `assets`,
  `customerDelivery`, `provider`, estatus tecnico y estatus operativo.
- El modulo administrativo expone `GET /v1/customer-service-records` y
  `GET /v1/customer-service-records/:recordId` bajo el permiso
  `customer_service_records:READ`.
- La consulta administrativa filtra registros tecnicamente activos, pero no
  restringe por usuario autenticado ni por Cliente asociado.
- Las relaciones usuario-cliente se representan como documentos existentes;
  una relacion esta vigente mientras exista y se revoca al disociarla.

## Access Boundary

La visibilidad se evaluara en backend y no dependera de filtros enviados por
cliente. Para cada registro se requiere:

```text
record.status = ACTIVE
AND record.customer.users.user_id = actorUserId
AND record.customer.customer_id pertenece a las relaciones vigentes del actor
```

El detalle debe usar la misma frontera que el listado. Si no se cumple, debe
responder como recurso inexistente para no revelar su existencia.

## Existing Reusable Pieces

- `ICustomerServiceRecordReadRepository` y su implementacion Mongoose para
  listado, conteo, ordenamiento y filtros del aggregate.
- `IUserCustomerRelationshipReadRepository` para obtener los Clientes vigentes
  de un usuario.
- `CustomerServiceRecordMapper` para convertir persistencia a DTO de dominio.
- Catalogo central de autorizacion y `system-roles` seed, que deriva los
  permisos de Master Admin y Administrador a partir del catalogo.
- Guards `JwtAuthGuard` y `PermissionsGuard`, junto con `RequirePermission`.

## Risks

- Reutilizar el presenter administrativo puede filtrar campos de `provider` o
  de politicas internas hacia la respuesta.
- Aplicar la restriccion de usuario solo despues de paginar produciria totales
  incorrectos y paginas vacias.
- Consultar solo por la relacion usuario-cliente permitiria ver registros del
  Cliente que no estan asociados al usuario en el registro.
- Incluir campos de Proveedor en `search`, filtros u ordenamientos revelaria
  informacion interna aunque el presenter los omita.

## Constraints

- No cambiar la semantica ni los contratos del modulo administrativo actual.
- Mantener el contrato de fechas `date only` del aggregate.
- La operacion de seed se documenta, pero la ejecuta el usuario responsable del
  entorno.
