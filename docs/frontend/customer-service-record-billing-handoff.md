# Handoff frontend: facturación de registros de servicio a clientes

**Fecha:** 2026-10-24  
**Estado:** Contrato implementado y validación manual confirmada por el usuario.
**Spec:** [Facturación de registros de servicio a clientes](../../.specs/2026/2026-10/2026-10-22_1909_customer-service-record-billing/00-definition.md).

## Alcance y permisos

Backend conserva el registro de servicio a clientes como un solo agregado, con
dos módulos de permisos independientes. El agrupador visual «Facturación» es
decisión de frontend; no existe un módulo padre de permisos en la API.

| Módulo | Permiso | Uso |
| --- | --- | --- |
| `CUSTOMER_SERVICE_RECORDS` | `READ` | Listado, detalle y opciones administrativos. |
| `CUSTOMER_SERVICE_RECORDS` | `UPDATE` | Cambio administrativo de estado; permite los tres valores. |
| `BILLING_CUSTOMER_SERVICE_RECORDS` | `READ` | Listado, detalle y opciones de facturación. |
| `BILLING_CUSTOMER_SERVICE_RECORDS` | `UPDATE` | Estado e invoice de registros visibles en facturación. |

Todas las rutas de esta página requieren Bearer JWT y el permiso indicado.
`READ` de un módulo no concede `READ` del otro. La API responde `401` sin
autenticación y `403` sin el permiso requerido. No se asignan permisos de
facturación a roles personalizados automáticamente: se deben configurar tras
ejecutar el seed de roles contra la base del entorno objetivo.

## Endpoints

| Método y ruta | Permiso | Resultado |
| --- | --- | --- |
| `GET /v1/customer-service-records` | administrativo `READ` | Listado existente; agrega filtro `billing_status`. |
| `GET /v1/customer-service-records/:recordId` | administrativo `READ` | Detalle existente con estado y último aviso. |
| `GET /v1/customer-service-records/billing-statuses/options` | administrativo `READ` | Tres opciones localizadas. |
| `PATCH /v1/customer-service-records/:recordId/billing-status` | administrativo `UPDATE` | Cambia estado; admite los tres valores. |
| `GET /v1/billing/customer-service-records` | facturación `READ` | Listado paginado visible para facturación. |
| `GET /v1/billing/customer-service-records/billing-statuses/options` | facturación `READ` | Dos opciones localizadas. |
| `GET /v1/billing/customer-service-records/:recordId` | facturación `READ` | Detalle visible o `404`. |
| `PATCH /v1/billing/customer-service-records/:recordId/billing-status` | facturación `UPDATE` | Cambia a `SUBMITTED` o `INVOICED`. |
| `PUT /v1/billing/customer-service-records/:recordId/invoice` | facturación `UPDATE` | Reemplaza referencia y conjunto vigente de archivos de factura. |

El endpoint administrativo `PUT /v1/customer-service-records/:recordId/documents/invoice`
permanece disponible con su permiso administrativo. Las escrituras de
facturación no permiten editar cliente, equipos, servicio ni otros documentos.

## Estados y filtros

`billing_status` es independiente de `operational_status` y del estado técnico
del registro. Sus códigos son `NOT_SUBMITTED`, `SUBMITTED` e `INVOICED`.
`billing_notification` informa solo el último intento de aviso: `NOT_REQUESTED`,
`SENT` o `FAILED`. `SENT` significa que el proveedor de correo aceptó el mensaje;
no garantiza entrega en el buzón.

Los dos listados admiten `page`, `limit` o `items_per_page`; la página inicial es
1, el límite inicial 10 y el máximo 100. El listado administrativo conserva sus
filtros y ordenamientos previos y acepta `billing_status` con los tres códigos.
El listado de facturación acepta `search` y `billing_status` opcional, este
último solo `SUBMITTED` o `INVOICED`. El backend restringe siempre el listado y
el detalle de facturación a registros `ACTIVE` con uno de esos dos estados;
`NOT_SUBMITTED` y los eliminados no aparecen. Un valor de filtro no permitido
responde `400`. Un listado sin coincidencias responde `200` con `data: []`.

El orden inicial del listado de facturación es creación descendente, con ID
técnico ascendente como desempate. La búsqueda cubre consecutivo, tipo de
servicio, cliente, proveedor y nombre, identificador o marca de equipos.
Los GET de opciones son locales a cada módulo y devuelven todos sus valores
permitidos, independientemente de los registros existentes.

## Respuestas

El envelope usa `success`, `success_message`, `status_code` y `data`. Los
listados agregan `pagination: { page, per_page, total, total_pages }`.
Las respuestas de facturación mantienen los mismos campos que las respuestas
administrativas correspondientes: el listado conserva su proyección de filas,
y el detalle incluye equipos con adjuntos, `quotation`, `purchase_order`,
`invoice` y `other_files`. `invoice` no se agrega a las filas del listado.
El contrato de acceso de clientes externos no cambia.

Ambos módulos exponen, tanto en fila como en detalle:

```json
{
  "billing_status": {
    "code": "SUBMITTED",
    "name": "Enviado a facturación",
    "name_key": "CUSTOMER_SERVICE_RECORD.BILLING_STATUS.SUBMITTED"
  },
  "billing_notification": {
    "status": {
      "code": "SENT",
      "name": "Enviado",
      "name_key": "CUSTOMER_SERVICE_RECORD.BILLING_NOTIFICATION_STATUS.SENT"
    },
    "attempted_at": "2026-10-24T18:00:00.000Z",
    "sent_at": "2026-10-24T18:00:01.000Z",
    "failure_reason": null
  }
}
```

Los nombres cambian con el idioma de la solicitud; los códigos y las claves
son estables. Las fechas y `failure_reason` pueden ser `null`. En detalle,
`invoice` tiene `reference_number` y `files`; cada archivo incluye `file_id`,
`original_name`, `mime_type`, `size`, `download_url` y `preview_url`, igual que
los adjuntos administrativos. Las URLs apuntan a `/v1/files/:fileId/download`;
la variante de previsualización añade `?disposition=inline`.

## Escrituras y errores

Cambio de estado administrativo:

```json
{ "billing_status": "SUBMITTED" }
```

Admite también `NOT_SUBMITTED` e `INVOICED`. El cambio de estado de facturación
usa el mismo cuerpo, pero solo admite `SUBMITTED` e `INVOICED`. Las escrituras
de facturación sobre un ID inexistente, eliminado o `NOT_SUBMITTED` responden
`404`. Un no-op devuelve `200` sin escritura ni correo.

Una transición real hacia `SUBMITTED`, desde cualquiera de los dos módulos,
intenta enviar el aviso antes de persistir el nuevo estado. Si el proveedor
rechaza el envío, el estado anterior se conserva, se guarda
`billing_notification.status = FAILED` y la API devuelve `502` con
`error_details.error_code = BILLING_NOTIFICATION.DELIVERY_FAILED` y mensaje
localizado. El usuario puede repetir la misma transición; no hay endpoint de
reenvío. Si el proveedor acepta el mensaje pero falla la escritura posterior,
un reintento podría enviar un segundo correo. Pasar a `INVOICED` no envía aviso.

Actualización de factura en facturación:

```json
{ "reference_number": "FAC-2026-001", "file_ids": ["file-id"] }
```

`reference_number` es obligatorio, acepta cadena o `null`; `file_ids` es la
lista completa de archivos vigentes, y `[]` los retira todos. El backend
recorta espacios de la referencia y guarda una cadena vacía como `null`. También
reconcilia IDs de archivo existentes, conserva historial de relaciones
retiradas y recalcula conteos. No cambia automáticamente `billing_status` ni
otros documentos. El cuerpo no admite `document_type` o `documentType`.
Como el reconciliador actual, valida existencia de archivos, no autoría ni
procedencia. El frontend puede cargar archivos mediante el flujo de `files`
existente y enviar sus IDs en este PUT.

Valores inválidos devuelven `400`; un archivo inexistente devuelve `404`; una
transición concurrente que cambia el estado entre lectura y escritura devuelve
`409` con `STATE_CONFLICT.CUSTOMER_SERVICE_RECORD.BILLING_STATUS_CHANGED`.
Los errores usan `success: false`, `status_code` y
`error_details: { message, error_code, validation_errors, ... }`.

## Configuración y operación

El sender usa las listas CSV `BILLING_NOTIFICATION_RECIPIENTS_TO` y
`BILLING_NOTIFICATION_RECIPIENTS_CC`; el `.env.example` muestra el formato
con valores de ejemplo. Las direcciones reales pertenecen al entorno, no a
este contrato. El responsable puede ejecutar `npm run db:seed:roles` desde el
checkout actualizado contra la base objetivo antes del despliegue de la API.
La migración histórica ya se ejecutó y verificó en la base objetivo según la
spec. La publicación y supervisión del backend se gestionan fuera de esta
spec de desarrollo.
