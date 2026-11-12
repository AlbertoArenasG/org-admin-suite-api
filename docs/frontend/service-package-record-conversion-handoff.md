# Conversión de recolección a registros de servicio a cliente

## Acceso y catálogos

La acción del backoffice usa `SERVICE_PACKAGES.CONVERT` y envía `POST /v1/service-packages/records/:recordId/customer-service-records` con JWT. La lectura del origen sigue usando `SERVICE_PACKAGES.READ`. Los lookups auxiliares son `GET /v1/customers/options`, `GET /v1/customers/:customerId/users/options` y `GET /v1/customer-service-record-service-types/options`; el seed de roles debe recalcular sus derivaciones antes de probarlas con roles persistidos.

El listado y detalle de recolecciones incluyen `converted_to_customer_service_records: boolean`. La UI puede deshabilitar la acción cuando sea `true`; el servidor también rechaza otra conversión con 409. El booleano se mantiene aunque después se eliminen los destinos.

## Contrato de creación

```json
{
  "records": [
    {
      "equipment_index": 0,
      "customer": { "customer_id": "ID_CLIENTE", "customer_user_ids": [] },
      "service_type_code": "CODIGO_TIPO",
      "requested_at": "2026-11-11",
      "received_at": "2026-11-10",
      "asset": {
        "name": "Equipo",
        "identifier": "ID-1",
        "brand": "Marca",
        "model": "Modelo",
        "serial_number": "Serie",
        "observations": null
      },
      "photo_file_ids": ["ID_FOTO_ORIGEN"]
    }
  ]
}
```

`records` contiene exactamente una entrada por índice del arreglo `details.equipment` del origen, empezando en 0. El usuario elige cliente, usuarios, tipo y datos de cada equipo. `requested_at` es obligatorio. `received_at` puede omitirse; entonces el servidor usa `visit_date` del origen y exige que exista. Las fechas se envían como `YYYY-MM-DD`. `photo_file_ids` puede estar vacío; cada ID debe pertenecer a una imagen del origen. Una foto puede asignarse a varios equipos, creando una entidad File independiente por asignación. La conversión es completa, sin confirmaciones parciales.

La respuesta 201 contiene `data: { source_record_id, service_order, records: [{ equipment_index, customer_service_record_id, service_number, service_number_display }] }` dentro del envelope habitual. La lista y detalle administrativos y de facturación de cada destino exponen `source_service_package_record_id` y `source_service_order`; los registros creados manualmente tienen `null`.

Errores: origen inexistente 404; origen eliminado o convertido 409; cobertura de equipos o selección de fotos inválida 400; clientes, usuarios o tipos inválidos según los errores de catálogo existentes. Tras un error se debe conservar el formulario y consultar de nuevo el origen antes de repetir, especialmente si la respuesta de red fue incierta.

## Límite de este backend

Este contrato no define la vista ni sus pasos. Cada foto elegida se registra como una entidad `File` con ID propio que conserva la clave S3 original de la recolección. Si una foto se asigna a varios equipos, cada registro recibe su propio ID de `File`, pero todos apuntan al mismo objeto S3. La conversión no duplica objetos ni cambia la carga ZIP de la PWA. Antes de introducir limpieza física de objetos de recolección, deberá considerarse que pueden estar referenciados por registros de servicio a clientes.
