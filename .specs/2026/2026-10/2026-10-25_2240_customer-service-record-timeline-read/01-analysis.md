# Análisis

- `GET /v1/customer-service-records` usa `GetCustomerServiceRecordsRequestDto`, query/handler, caso de uso, repositorio de lectura y presenter; su máximo global es 100 por página. No garantiza todos los servicios de un mes por leer una página.
- `MongooseCustomerServiceRecordReadRepositoryImpl.buildFilter()` añade rangos de fechas a campos distintos con conjunción. La consulta temporal necesita unión de fechas puntuales y cruce de intervalos; no debe reutilizar esa semántica sin cambiarla.
- El schema almacena las fechas de cliente y proveedor como strings de fecha civil. Hay índices compuestos para entrega estimada al cliente y retorno estimado del proveedor; no los hay para recepción, entrega al proveedor ni retorno real. La nueva consulta debe evitar convertir fechas civiles a instantes UTC.
- El detalle ya contiene las fechas de entrega y retorno del proveedor. El listado expone las materializaciones de entrega al cliente y retorno del proveedor con `color_hex`. No se requiere un nuevo cálculo de estados ni persistencia.
- El mapper actual `CustomerServiceRecordMapper.toViewDto()` recibe una entidad completa y prepara adjuntos, facturación y otros campos ajenos a la consulta temporal. La proyección ligera necesita su propio mapeo tipado de read model a DTO de aplicación; reutilizar el mapper completo obligaría a cargar datos que la ruta no entrega.
- El bloque Kibo trae vista mensual de calendario y Gantt con rangos `daily`, `monthly`, `quarterly`, sin escala `weekly` nativa. La adaptación de semana corresponde al frontend. El backend solo necesita rango inclusivo.
- El módulo administrativo ya tiene permiso `READ`; un endpoint local bajo el mismo módulo y operación no crea permiso ni capability auxiliar nueva.

## Riesgos concretos

- Un periodo largo puede devolver muchos registros: acotar rango, paginar y exponer `total_pages` para detectar cuando se exceda el máximo global de 10 000 páginas.
- Si el calendario recibe coincidencias exclusivas del proveedor o periodos de cliente que cruzan el rango sin hitos dentro, paginará registros invisibles. `match=customer_milestones` selecciona exclusivamente los hitos dibujables; `match=periods` conserva la unión de periodos para el Gantt, con un solo endpoint y forma de respuesta.
- Cualquiera de los dos tramos puede empezar antes de `from` y terminar después de `to`: consulta por cruce, no solo fechas internas. Si existe retorno real, el estimado deja de ser el extremo efectivo del tramo del proveedor.
- Datos con fechas en orden inverso: devolver los valores persistidos sin inventar corrección; la respuesta conserva ambas fechas y el frontend decidirá cómo señalar la anomalía. Revisar ese caso en validación manual.
- Las fechas de recepción, entrega al proveedor y retorno real carecen de índices compuestos dedicados; revisar plan de consulta e índices antes de implementar.
