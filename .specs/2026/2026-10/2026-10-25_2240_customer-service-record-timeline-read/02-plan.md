# Plan

1. Definir contrato y consulta de lectura de los dos tramos (cliente y proveedor), independiente del listado paginado.
2. Implementar el pipeline CQRS completo con proyección ligera y autorización READ.
3. Entregar contrato vivo al frontend, actualizar catálogo de autorización y Postman, y validar el comportamiento HTTP.

No se modifican dominio de fechas, escrituras, datos históricos ni rutas existentes. La spec frontend posterior consumirá esta proyección y aislará las primitivas de Kibo.
