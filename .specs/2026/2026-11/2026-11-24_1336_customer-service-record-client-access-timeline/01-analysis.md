# Análisis

- El portal ya tiene listado, detalle y opciones de filtros bajo `CUSTOMER_SERVICE_RECORDS_CLIENT_ACCESS/READ`. `CustomerServiceRecordClientAccessVisibilityService` resuelve `isInternalStaff` y relaciones; el repositorio exige además `customer.users.user_id` para externos.
- La consulta administrativa `/v1/customer-service-records/timeline` tiene el patrón de rango/paginación y proyección liviana, pero exige otro permiso e incluye proveedor. No se consume desde portal.
- El módulo de portal cuenta y pagina después de filtrar por visibilidad. La nueva consulta debe preservar ese orden; filtrar después de paginar introduciría fugas en `total` y páginas incompletas.
- El presenter del portal ya localiza estado operativo y materialización; la consulta administrativa ya define la forma del timeline. Se replica la forma pertinente sin abrir datos de proveedor.
- La validación de fechas y el máximo de 42 días se mantienen iguales al endpoint administrativo; no se altera su contrato.
- No hay escritura ni campo nuevo. No se requiere migración, seed ni cambio de catálogo de permisos.

## Riesgos

- Rango que atraviesa meses o tramos incompletos: aplicar condiciones inclusivas equivalentes a las administrativas únicamente para el cliente.
- Escalabilidad: consultar y contar en base de datos, proyectar campos mínimos, paginar con orden estable; el consumidor deberá solicitar todas las páginas necesarias.
- Visibilidad: no confiar en IDs o flags del request para determinar alcance.
