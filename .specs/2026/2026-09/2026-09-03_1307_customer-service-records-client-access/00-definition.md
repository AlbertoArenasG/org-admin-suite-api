# Customer Service Records Client Access

## Status

- Initiative: `customer-service-records-client-access`
- Date: `2026-09-03`
- Definition status: completed
- Implementation ready: yes
- Implementation status: completed
- Closed at: `2026-09-04`
- Validation: confirmacion del usuario para todos los escenarios; evidencia en `05-progress.md`.

## Objective

Crear un modulo independiente y de solo lectura para que un usuario consulte
los registros de servicio a los que tiene acceso como usuario relacionado con
un Cliente, sin exponer informacion operativa interna sobre Proveedores.

El nombre visible propuesto para navegacion e interfaz es `Seguimiento de
servicios`. El nombre de permisos y administracion de roles sera `Acceso de
clientes a registros de servicio`.

## Decision Governance

- Ningun gap funcional, tecnico, de contrato, persistencia, autorizacion o
  validacion se resuelve por inferencia durante esta iniciativa.
- Todo gap se documenta con su contexto, opciones, recomendacion e impacto
  antes de continuar la fase afectada.
- Solo el usuario responsable aprueba la decision final. La implementacion no
  inicia ni avanza sobre una decision critica mientras permanezca pendiente.

## Initial Scope

- Listado paginado de registros visibles para el usuario autenticado.
- Detalle de un registro visible para el usuario autenticado.
- Lookups contextuales de Clientes y tipos de servicio para los filtros del
  listado.
- Permiso independiente bajo el modulo tecnico
  `CUSTOMER_SERVICE_RECORDS_CLIENT_ACCESS`, inicialmente con operacion `READ`.
- Datos visibles: folio, tipo de servicio, datos generales, equipos, usuarios
  asociados al registro y bloque de compromiso con el
  Cliente. Las observaciones se exponen en listado y detalle; el semaforo
  materializado queda fuera del contrato inicial.
- Filtros por Cliente, tipo de servicio, busqueda por folio y equipos, y rangos
  de fechas de recepcion y entrega estimada al Cliente.
- Lookup de Clientes calculado como `distinct` sobre los registros que cumplen
  la visibilidad del usuario y la consulta activa; no se deriva directamente
  de las relaciones usuario-cliente.
- Actualizacion del catalogo de autorizacion, traducciones y seed de roles de
  sistema.

## Confirmed Decisions

Actualizacion aprobada: staff interno con READ consulta todos los registros ACTIVE
sin relacion usuario-cliente ni asociacion al registro. Las condiciones relacionales
que siguen se aplican solo a externos. Se conserva la proyeccion limitada, filtros
y lookups contextuales. El flag se resuelve desde el usuario persistido, no del JWT.

- El modulo no reutiliza los endpoints administrativos de
  `CUSTOMER_SERVICE_RECORDS`; tendra controladores, queries y presenters de
  consulta propios.
- El permiso del modulo es necesario, pero no suficiente para acceder a un
  registro.
- Para usuarios externos, un registro es visible solo si cumple simultaneamente:
  - el usuario autenticado tiene una relacion vigente con el Cliente del
    registro;
  - el usuario autenticado esta incluido en `customer.users` del registro;
  - el registro tiene estatus tecnico `ACTIVE`.
- Para externos, la perdida de la relacion usuario-cliente revoca inmediatamente la
  visibilidad, incluso para registros historicos.
- El presenter de este modulo omitira por contrato todo el bloque `provider`:
  identidad, fechas, estimaciones, semaforos, politicas, seguimiento y eventos.
- El bloque `customer_delivery` expone recepcion, entrega estimada y entrega
  real; no expone semaforo, politicas ni eventos de notificacion.
- Los filtros, ordenamientos y busquedas de Proveedor quedan fuera de alcance.
- Los roles de sistema recibiran el permiso nuevo mediante el seed de roles;
  el alcance depende del flag de staff persistido: staff sin restricciones
  relacionales y externos sujetos a la frontera de Cliente y usuario.

## Resolved Decisions

### Decision 01. Ruta HTTP del modulo

La ruta del modulo sera independiente:

```text
GET /v1/customer-service-records-client-access
GET /v1/customer-service-records-client-access/:recordId
```

Status: approved

### Decision 02. Contexto del lookup de Clientes

El lookup se calcula como `distinct` sobre los registros activos y autorizados
despues de aplicar la busqueda y los filtros activos de listado. Por tanto, sus
opciones se reducen junto con las coincidencias de la consulta y no muestran
Clientes que ya no tengan resultados visibles.

Status: approved

## Out Of Scope For Now

- Crear, editar, eliminar o cambiar el estatus operativo de registros.
- Mostrar informacion, filtros, lookups o materializaciones de Proveedor.
- Mostrar politicas aplicadas o eventos de notificacion.
- Reutilizar el controlador o presenter administrativo como superficie externa.
- Cambios de frontend; se planificaran en una spec propia cuando exista el
  contrato de API cerrado.
