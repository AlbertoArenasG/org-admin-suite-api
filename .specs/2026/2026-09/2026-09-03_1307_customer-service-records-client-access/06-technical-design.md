# Technical Design

## Module Identity

- Catalog module: `CUSTOMER_SERVICE_RECORDS_CLIENT_ACCESS`.
- Initial operation: `READ`.
- Authorization copy: `Acceso de clientes a registros de servicio`.
- UI copy: `Seguimiento de servicios`.

## Read Flows

### List

El listado recibe `actorUserId`, filtros visibles, pagina y ordenamientos. La
consulta de persistencia aplica la frontera de acceso junto con todos los
filtros permitidos antes de ejecutar `countDocuments`, `skip` y `limit`.

### Detail

El detalle recibe `actorUserId` y `recordId`, aplica la misma frontera y
devuelve not found cuando no existe, esta eliminado o no es visible para el
actor.

### Customer Lookup

El lookup recibe la misma busqueda y filtros visibles del listado y devuelve
Clientes distintos que aparezcan en los registros activos y visibles resultantes
para el actor. No consulta las relaciones usuario-cliente como fuente
independiente de opciones.

## Visible Projection

La respuesta dedicada puede incluir:

- identificador y folio de servicio;
- tipo de servicio y estatus operativo;
- fecha de solicitud y observaciones permitidas;
- snapshot de Cliente;
- usuarios asociados al registro;
- equipos;
- `customer_delivery.received_at`, `estimated_delivery_at`,
  `delivered_to_customer_at` y `status_materialization`.

La respuesta no puede incluir `provider`, referencias de politicas,
materializaciones de notificacion ni sus eventos.

## Filters And Sorting

Se soportaran filtros por Cliente, tipo de servicio, estatus operativo y rangos
de `requested_at`, `received_at` y `estimated_customer_delivery_at`. El search
considerara folio, tipo de servicio y campos de equipo. Los ordenamientos se
limitan a campos visibles del mismo conjunto.

No se aceptan ni se ejecutan filtros, busquedas, rangos u ordenamientos de
Proveedor.

## Authorization And Seed

El catalogo incorpora el modulo y el seed `system-roles` asigna sus permisos a
Master Admin y Administrador al derivar permisos desde el catalogo. El comando
manual, que no ejecuta Codex, es:

```bash
npm run db:seed:roles
```

Debe solicitarse despues de integrar el cambio de catalogo y antes de validar
roles de sistema contra un entorno con datos persistidos.

## Validation

- Usuario con permiso, relacion vigente y asociacion al registro: puede listar
  y ver detalle.
- Usuario con permiso pero sin relacion vigente: no ve registros ni opciones.
- Usuario con permiso y relacion vigente, pero sin asociacion al registro: no
  ve ese registro.
- Registro eliminado: no aparece ni responde en detalle.
- Ninguna respuesta ni campo de filtro revela datos de Proveedor.
