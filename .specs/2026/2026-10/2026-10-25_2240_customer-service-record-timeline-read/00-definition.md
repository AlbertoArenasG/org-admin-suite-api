# Consulta temporal de registros de servicio a clientes (backend)

## Estado

- Initiative: `customer-service-record-timeline-read`
- Date: `2026-10-25`
- Definition status: completed
- Implementation ready: yes
- Implementation status: pending
- Validation status: pending
- Spec status: in_progress

## Problema y resultado esperado

La consulta administrativa actual pagina registros y filtra cada fecha de forma independiente. Una nueva ruta de Next Dashboard necesita consultar, por semana o mes visible, los periodos de servicio y sus tramos de proveedor que atraviesan ese rango. El resultado debe alimentar un calendario de hitos de recepción/entrega al cliente y un Gantt con ambos tramos sin depender de la paginación de la tabla.

## Alcance

- Nuevo `GET /v1/customer-service-records/timeline` con rango inclusivo `from`/`to` de fechas civiles `YYYY-MM-DD`, paginación estable y permiso `customer_service_records:READ`.
- Un registro por elemento de respuesta, con identificador, número de servicio, cliente, resumen de equipos, tipo de servicio, estado operativo, fechas de recepción/entrega estimada al cliente y de entrega/retorno del proveedor; incluir ambos estados materializados y sus colores cuando existan.
- En selección de periodos, incluir registros activos si algún extremo visible del periodo de servicio o del tramo del proveedor cae en el rango, o si uno de esos periodos lo cruza. Con una sola fecha de un tramo, incluirlo cuando cae en el rango. En selección de hitos, incluir únicamente registros con recepción o entrega estimada al cliente dentro del rango. Los registros sin fechas visibles permanecen disponibles en el listado administrativo.
- El contrato no expresa componentes Kibo ni agrega una ruta diferente para semana o mes: ambos consultan `from`/`to`. El parámetro `match` selecciona `periods` para el Gantt o `customer_milestones` para el calendario, sin modificar la forma de respuesta.
- Respetar el pipeline CQRS, la autorización y el envelope/paginación habituales. Documentar el handoff, actualizar el catálogo vivo de autorización y Postman durante la implementación.

## Decisiones funcionales confirmadas

- El Gantt muestra un tramo principal desde recepción hasta entrega estimada al cliente y, si hay proveedor con fechas, un tramo subordinado desde entrega al proveedor hasta retorno real, o retorno estimado mientras no exista el real. Ambos pertenecen al mismo registro y se agrupan por cliente; si solo hay fechas del proveedor, el registro conserva su fila y muestra ese único tramo. Con una sola fecha en un tramo, el frontend muestra ese tramo como un día. No se planifican jornadas de trabajo.
- Calendario: recepción y entrega estimada como eventos separados del mismo registro.
- Cinco vistas de solo lectura en una ruta nueva: Gantt, Calendario, Lista, Kanban por estado operativo y Tabla con la DataTable administrativa. Gantt/Calendario usan esta consulta; las otras vistas usan el listado paginado actual. La adaptación visual y la ruta pertenecen a una spec posterior de frontend.
- Gantt y Calendario podrán consultar una semana o un mes visible. El frontend adaptará la primitiva de calendario para semana y compondrá la escala diaria de Gantt para semana; esto no requiere endpoints adicionales.

## Fuera de alcance

- Cambiar la entidad, guardar nuevas fechas, migrar datos, editar por arrastre, crear registros desde estas vistas o modificar los endpoints de listado/detalle actuales.
- Integración Kibo, navegación, permisos de ruta y estado de frontend; quedan para la spec de frontend.
- Exponer datos de facturación o adjuntos en esta proyección.

## Contrato definido

- `from` y `to` obligatorios, fechas civiles válidas y ordenadas; máximo **aprobado de 42 días inclusivos** para cubrir un mes con semanas adyacentes. Rango inválido o superior: HTTP 400 según envelope vigente.
- Paginación `page`/`limit` (aceptando también `items_per_page` por el DTO compartido) compatible con el máximo global de 100 elementos y 10 000 páginas; `total` y `total_pages` permiten al frontend detectar si el conjunto excede ese límite y comunicarlo sin truncamiento silencioso. `match` es opcional y por defecto `periods`; acepta `periods` o `customer_milestones`. Orden estable por `customer_service_record_id` ascendente.
- Respuesta con `customer_service_record_id`, `service_number`, `service_number_display`, `service_type`, `customer`, `assets` reducidos a ID/nombre/identificador, `operational_status` localizado, `requested_at`, `customer_delivery.{received_at,estimated_delivery_at,status_materialization}` y `provider.{provider_id,name,delivered_to_provider_at,estimated_return_at,returned_from_provider_at,status_materialization}` cuando exista; las materializaciones incluyen `color_hex`.
- Solo registros con `status: ACTIVE`; no filtrar por estado operativo. Fechas de entrada/salida siguen siendo strings de día civil, sin conversión UTC.

## Gate de implementación resuelto

- La revisión técnica del contrato HTTP y la paginación quedó hecha; el límite inclusivo de 42 días fue aprobado el 2026-10-25. No quedan decisiones técnicas abiertas en la definición. El usuario aprobó explícitamente marcar `Implementation ready: yes` el 2026-10-27. Iniciar una slice de código requiere autorización separada según `.specs/SPEC_WORKFLOW.md`.

## Criterios de aceptación

- Si un hito o tramo coincide con el mismo día contenido en una consulta semanal y otra mensual, ambas devuelven ese registro con las mismas fechas; otros registros pueden pertenecer solo al mes si sus hitos o tramos caen fuera de la semana.
- `match=customer_milestones` incluye solo registros con recepción o entrega estimada al cliente dentro del rango: excluye tanto coincidencias exclusivas del proveedor como periodos de cliente que cruzan el rango sin hitos visibles. `match=periods` incluye los cruces de ambos tramos. El total y las páginas responden a la selección aplicada.
- Registro con ambas fechas de servicio dentro, con solo recepción, con solo entrega y con intervalo que atraviesa todo el rango aparecen una vez cada uno. También aparecen los registros cuyo único tramo visible es el del proveedor, incluidos retorno real y retorno estimado según corresponda. Sin fechas visibles o fuera del rango no aparecen.
- Varias páginas permiten recuperar el conjunto dentro del límite global de 10 000 páginas, sin duplicados ni cambios de orden si no hay escrituras concurrentes. Si `total_pages` supera ese máximo, el frontend puede detectar y señalar que no recuperó todo el periodo.
- Rango ausente, inválido, invertido o excesivo, valor `match` desconocido o paginación inválida devuelven 400. Sin token, 401; sin READ, 403. Rango sin coincidencias devuelve colección vacía, `total: 0` y `total_pages: 0`.
- La consulta no modifica registros ni produce efectos secundarios por solicitud; los índices nuevos son un cambio estructural del schema cuya creación efectiva se verifica por separado. El listado existente conserva su contrato.

## Validación prevista

Build y lint enfocado; revisión manual HTTP de matriz de fechas, paginación, errores y permisos. Sin nuevas suites automatizadas salvo solicitud expresa.
