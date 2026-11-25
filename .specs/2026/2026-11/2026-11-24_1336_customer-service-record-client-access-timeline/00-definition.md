# Consulta por periodo para seguimiento de servicios (backend)

- Definition status: completed
- Implementation ready: yes — iniciativa y ciclo backend autorizados por el usuario el 2026-11-24.
- Implementation status: completed — código, handoff y Postman.
- Validation status: completed — usuario confirmó validación manual el 2026-11-24.
- Spec status: completed

## Resultado

El portal de seguimiento podrá consultar los registros visibles durante un periodo para alimentar posteriormente calendario y Gantt. El listado y detalle actuales no cambian.

## Alcance confirmado

- `GET /v1/customer-service-records-client-access/timeline`, JWT y `customer_service_records_client_access:READ`.
- `from`, `to`, `match=periods|customer_milestones`, `page`, `limit` e `items_per_page` con la semántica y límites de la consulta administrativa: días civiles reales, 42 días inclusivos como máximo y paginación hasta 100 elementos por página.
- Solo registros `ACTIVE`; staff interno puede verlos todos; usuario externo requiere relación con el cliente **y** pertenencia a `customer.users` del registro. La regla se aplica en MongoDB antes de contar/paginar.
- En `periods` coinciden los extremos del tramo cliente o su cruce con el rango; en `customer_milestones` solo recepción y entrega estimada al cliente. No participan fechas del proveedor. Los registros sin ninguna fecha relevante no aparecen.
- Proyección ligera con folio, tipo de servicio, cliente, equipos, estado operativo localizado, fecha de solicitud y `customer_delivery` (recepción, entrega estimada y materialización de estado). Sin `provider` ni información de proveedor.
- Orden estable por ID técnico ascendente; respuesta y errores con el envelope existente. Sin cambios de datos, permisos, roles, seed o migración.
- El diálogo de filtros del listado, su consumo por lista/Kanban y la composición de cinco vistas pertenecen a la futura spec frontend. El nuevo endpoint por periodo no recibe los filtros del listado.

## Criterios verificables

1. Con permiso y registro visible, rango coincidente devuelve el registro una vez y el total correcto, aunque un tramo coincida por más de un criterio.
2. Un usuario externo no obtiene ni cuenta registros de otros clientes o registros a los que no esté asignado; staff interno conserva la visibilidad actual de registros activos.
3. Un tramo que cruza el rango aparece en `periods`; con una sola fecha aparece cuando esa fecha está dentro; `customer_milestones` excluye cruces sin hito dentro.
4. Fechas inexistentes o invertidas, rango mayor de 42 días, `match` o paginación inválidos producen 400. Sin JWT: 401; sin READ: 403. Sin coincidencias: `data: []`, `total: 0`.
5. El payload no contiene campos de proveedor ni de facturación; lista, detalle y consulta administrativa mantienen su contrato.

## Validación

El usuario confirmó la validación manual el 2026-11-24, sin proporcionar resultados individuales por escenario. Compilación y lint enfocado fueron verificaciones estáticas a cargo del agente.
