# Decisiones

- ID de origen: `servicePackageRecordId`, nunca `packageId`. `serviceOrder` se conserva para referencia humana y no determina unicidad.
- Campos de destino: `sourceServicePackageRecordId` y `sourceServiceOrder`, nullable. Campo de origen: `convertedToCustomerServiceRecords`, booleano.
- Migración previa al uso: false/null explícitos; no lógica de ausencia de campos en el flujo de conversión.
- Una operación cubre todos los equipos. El origen se marca una sola vez de forma condicional en transacción; la eliminación posterior de destinos no permite reusar el origen.
- Capability auxiliar de tipos para administración, facturación y conversión. Cliente externo no recibe las capabilities globales por alcance de datos.
- S3 no participa en MongoDB: copiar antes del commit e intentar limpiar claves creadas por esta solicitud ante fallo; registrar fallos de limpieza. Los números de secuencia reservados pueden dejar huecos, como en el patrón actual.
