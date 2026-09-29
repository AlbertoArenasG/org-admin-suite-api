# Handoff Frontend: Entrega De Archivos De Service Package Records

## Alcance

La API entrega la coleccion plana `files[]` de los registros de paquetes de
servicio mediante URLs protegidas. Los archivos siguen embebidos en el registro;
no son recursos del agregado generico `files`.

## Lecturas Afectadas

Los endpoints actuales de listado y detalle devuelven el mismo descriptor para
cada elemento de `files[]`:

```text
GET /v1/service-packages/records
GET /v1/service-packages/records/:recordId
```

```json
{
  "file_id": "file-id",
  "relative_path": "evidencia/foto-inicial.jpg",
  "original_name": "foto inicial.jpg",
  "mime_type": "image/jpeg",
  "size": 248331,
  "download_url": "https://api.example/v1/service-packages/records/record-id/files/file-id/download",
  "preview_url": "https://api.example/v1/service-packages/records/record-id/files/file-id/download?disposition=inline"
}
```

`relative_path` es metadata propia del paquete. El descriptor compatible con
colecciones documentales es `file_id`, `original_name`, `mime_type`, `size`,
`download_url` y `preview_url`.

`s3_key` y `content_type` dejan de formar parte del contrato HTTP. El frontend
no debe construir URLs de S3 ni inferir rutas de descarga.

## Descarga Y Previsualizacion

```text
GET /v1/service-packages/records/:recordId/files/:fileId/download
Authorization: Bearer JWT
Permission: service_packages:READ
Query: disposition=attachment|inline
```

- Sin `disposition`, la respuesta descarga con `Content-Disposition:
  attachment`.
- `preview_url` usa `disposition=inline`; el navegador puede previsualizar PDF
  e imagenes compatibles.
- La respuesta es un stream, no un envelope JSON.
- MIME, tamano y nombre original se entregan con `Content-Type`,
  `Content-Length` y `Content-Disposition` UTF-8.

## Errores Y Reglas De UI

- JWT ausente o invalido: respuesta estandar de autenticacion.
- Sin `service_packages.READ`: respuesta estandar de autorizacion.
- Registro eliminado, archivo inexistente o archivo que pertenece a otro
  registro: respuesta estandar de recurso no encontrado.
- El frontend debe ocultar `application/json` cuando corresponda al archivo
  operativo `details.json`, igual que la vista legacy actual.
- Una unica coleccion visual, por ejemplo **Archivos recolectados**, agrupa
  todos los elementos visibles; no hay tipos documentales separados.

## Compatibilidad

Este es el contrato objetivo de desarrollo. No se conserva una URL directa de
S3 para compatibilidad temporal: backend y la migracion frontend se desplegaran
conjuntamente al completar la iniciativa.
