# Handoff Frontend: Adjuntos Y Actualizaciones Segmentadas De Registros De Servicio

## Alcance Del Contrato

Base administrativa: `/v1/customer-service-records`. Todas sus rutas requieren
Bearer JWT y los permisos existentes de `customer_service_records`.

La creacion es minima y no recibe adjuntos. Los adjuntos se cargan primero con
`POST /v1/files` y despues se asocian mediante el `PATCH` parcial del activo o
el `PUT` completo de su bloque documental.
Los arrays de `file_ids` expresan exclusivamente las relaciones activas
deseadas: pueden ser vacios, conservan orden y permiten IDs repetidos.

| Metodo | Ruta | Permiso | Responsabilidad |
| --- | --- | --- | --- |
| `POST` | base | `CREATE` | Crea el record con tipo, fecha solicitada, observaciones, customer, usuarios y activos iniciales. |
| `PUT` | `/:recordId/details` | `UPDATE` | Reemplaza details: tipo, fecha solicitada, observaciones y estatus operativo. |
| `PUT` | `/:recordId/customer` | `UPDATE` | Reemplaza customer y customer delivery completos. |
| `PUT` | `/:recordId/provider` | `UPDATE` | Reemplaza provider completo o lo elimina con `{ "provider": null }`. |
| `PATCH` | `/:recordId/assets/:assetId` | `UPDATE` | Actualiza campos y/o colecciones de adjuntos de un activo. |
| `PUT` | `/:recordId/documents/:documentType` | `UPDATE` | Reemplaza una coleccion documental raiz. |

No existe `PATCH /:recordId`. El `PATCH` de asset recibe al menos una propiedad
del activo o una coleccion de adjuntos y responde el detalle administrativo
actualizado.

## Adjuntos

Los tres grupos de adjuntos por activo son `intake_condition_files`,
`delivery_condition_files` y `reports`. Los documentos raiz son `quotation`,
`purchase_order`, `invoice` y `other_files`.

El `PATCH /:recordId/assets/:assetId` acepta cualquier subconjunto de los datos
del activo y de sus colecciones. Una propiedad ausente conserva su valor; un
array presente, incluido `[]`, reemplaza y reconcilia exclusivamente esa
coleccion:

```json
{
  "intake_condition_file_ids": ["file-id"],
  "delivery_condition_file_ids": [],
  "report_file_ids": ["file-id"]
}
```

`quotation`, `purchase-order` e `invoice` requieren `reference_number`, que
puede ser `null`, y `file_ids`. `other-files` acepta solo `file_ids` y rechaza
`reference_number`:

```json
{ "reference_number": "COT-2026-001", "file_ids": ["file-id"] }
```

```json
{ "file_ids": ["file-id"] }
```

El backend conserva el historial de relaciones retiradas y la auditoria de
agregado/remocion; esas estructuras no se envian ni se exponen a aplicaciones
cliente. La restauracion de adjuntos retirados no forma parte del contrato
actual.

Las cargas permiten hasta diez archivos por request y 20 MiB por archivo. No
hay allowlist de MIME ni extension. La carga autenticada registra quien subio
el archivo.

## Lecturas Y Entrega

Ambos listados, administrativo y Client Access, incluyen solo
`attachments_count`. El detalle administrativo entrega todas las relaciones
activas. El detalle de Client Access entrega solo las activas visibles y nunca
provider, historial, auditoria, bucket ni storage key.

Un descriptor de adjunto es:

```json
{
  "file_id": "file-id",
  "original_name": "informe.pdf",
  "mime_type": "application/pdf",
  "size": 248331,
  "download_url": "https://api.example/v1/files/file-id/download",
  "preview_url": "https://api.example/v1/files/file-id/download?disposition=inline"
}
```

`download_url` conserva `Content-Disposition: attachment`. `preview_url` usa
`disposition=inline`, adecuado para que el cliente intente previsualizar tipos
soportados por el navegador, como imagenes o PDF. Ninguna URL de este modulo
incluye `service_entry_id`.
