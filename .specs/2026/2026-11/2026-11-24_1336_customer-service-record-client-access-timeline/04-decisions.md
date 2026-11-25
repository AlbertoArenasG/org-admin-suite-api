# Decisiones

1. Ruta propia de client access con READ existente: evita otorgar permiso administrativo y reutiliza la política de visibilidad del portal.
2. No exponer proveedor: el portal actual no presenta esa información y el periodo consultado solo considera el compromiso al cliente.
3. Misma forma de consulta por rango y paginación que administración; los filtros interactivos del listado no se aplican al endpoint de calendario y Gantt en ninguno de los dos módulos.
4. Los endpoints actuales de clientes y tipos de servicio bastan para filtros del futuro frontend; no se crea capability auxiliar.
5. La implementación es solo backend; frontend y validación manual se realizan por separado, en ese orden.
