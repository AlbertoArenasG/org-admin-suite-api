# Consulta temporal de registros de servicio a clientes

**Spec:** [Consulta temporal](../../.specs/2026/2026-10/2026-10-25_2240_customer-service-record-timeline-read/00-definition.md).

**Estado:** Contrato implementado; el usuario confirmó la matriz de validación manual el 2026-10-27.

## Ruta y acceso

`GET /v1/customer-service-records/timeline` requiere Bearer JWT y
`customer_service_records:READ`. No añade permiso ni capability auxiliar.
Las rutas de listado y detalle administrativos conservan su contrato.

| Parámetro | Uso |
| --- | --- |
| `from`, `to` | Obligatorios. Fechas civiles reales `YYYY-MM-DD`, inclusivas y ordenadas. Máximo 42 días inclusivos. |
| `match` | `periods` por defecto para Gantt; `customer_milestones` para Calendario. |
| `page` | Página inicial 1, máximo 10 000. |
| `limit` o `items_per_page` | Tamaño inicial 10, máximo 100; `limit` tiene prioridad. |

La respuesta usa el envelope habitual y `pagination: {page,per_page,total,total_pages}`.
El orden es por `customer_service_record_id` ascendente. La paginación no
garantiza snapshot si hay escrituras simultáneas; ante cambios durante la carga,
recargar el periodo. Si `total_pages > 10000`, el cliente debe indicar que no
pudo recuperar todo el conjunto. La respuesta incluye solo registros `ACTIVE`
y no filtra por estado operativo.

## Selección de registros

`match=customer_milestones` incluye registros cuya recepción o entrega
**estimada** al cliente cae en el rango. Un periodo que atraviesa el rango sin
ninguno de esos hitos dentro no aparece. Las fechas de proveedor tampoco hacen
coincidir esta selección.

`match=periods` incluye un registro si coincide cualquiera de los dos hitos de
cliente o si su periodo de cliente cruza el rango. También incluye el tramo de
proveedor: desde entrega al proveedor hasta retorno **real** cuando existe, o
retorno estimado en otro caso. Un solo extremo de un tramo permite mostrarlo
como un día. Un registro aparece una sola vez aunque coincidan ambos tramos.
El frontend agrupa por cliente y puede mostrar una fila solo con tramo de
proveedor. El backend devuelve ambas fechas de retorno; el frontend usa la real
si existe. No se corrigen fechas persistidas en orden inverso.

Una semana o mes visible se expresa con `from`/`to`; el endpoint no recibe una
escala visual. El frontend consulta todas las páginas para el periodo que
necesita. La futura ruta de cinco vistas usa esta consulta en Gantt y
Calendario; Lista, Kanban y Tabla conservan el listado paginado actual.

## Ejemplo de respuesta

Los valores son ilustrativos. Los nombres de estados se localizan con
`x-user-lang`; `source` de la materialización conserva el objeto localizado
del presenter administrativo.

```json
{
  "success": true,
  "success_message": "Consulta exitosa",
  "status_code": 200,
  "data": [
    {
      "customer_service_record_id": "record-id",
      "service_number": 42,
      "service_number_display": "0042",
      "service_type": { "service_type_code": "CALIBRATION", "name": "Calibración" },
      "requested_at": "2026-10-01",
      "customer": { "customer_id": "customer-id", "name": "Cliente" },
      "assets": [{ "asset_id": "asset-id", "name": "Equipo", "identifier": "EQ-1" }],
      "operational_status": { "code": "IN_PROGRESS", "name": "En progreso", "name_key": "CUSTOMER_SERVICE_RECORD.OPERATIONAL_STATUS.IN_PROGRESS" },
      "customer_delivery": {
        "received_at": "2026-10-02",
        "estimated_delivery_at": "2026-10-30",
        "status_materialization": null
      },
      "provider": {
        "provider_id": "provider-id",
        "name": "Proveedor",
        "delivered_to_provider_at": "2026-10-05",
        "estimated_return_at": "2026-10-20",
        "returned_from_provider_at": null,
        "status_materialization": null
      }
    }
  ],
  "pagination": { "page": 1, "per_page": 10, "total": 1, "total_pages": 1 }
}
```

`provider` es `null` cuando no existe. `status_materialization` de cliente o
proveedor es `null` cuando no hay materialización. Si existe, conserva
`{code,name,name_key,color_hex,source,effective_start_date}`. Las fechas
ausentes se devuelven como `null`. Sin coincidencias, `data: []`, `total: 0` y
`total_pages: 0`.

## Errores y compatibilidad

- `400`: falta fecha, fecha imposible, orden invertido, más de 42 días,
  `match` desconocido o paginación inválida. Usa el envelope común de validación.
- `401`: falta autenticación. `403`: falta `READ`. `500`: error interno según
  manejo central.

La ruta es aditiva; no modifica los contratos de lista o detalle. Las fechas
siguen siendo strings civiles, sin transformación UTC. El consumidor frontend
validará su integración en su propia spec.
