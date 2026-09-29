# Service Package Record File Delivery

## Status

- Initiative: `service-package-record-file-delivery`
- Date: `2026-09-29`
- Definition status: completed
- Implementation ready: yes
- Implementation status: not_started
- Validation status: not_started
- Spec status: active

## Objective

Entregar los archivos de un registro de paquete de servicio mediante URLs de
descarga y previsualizacion controladas por la API. El contrato habilita que el
detalle administrativo adopte las primitives documentales reutilizables sin
exponer claves ni URLs directas de S3.

## Included Scope

- Lectura de un archivo embebido que pertenezca a un registro de paquete activo.
- Ruta protegida para descargar o previsualizar en linea mediante
  `disposition=attachment|inline`.
- Descriptor de archivo del detalle alineado al contrato de adjunto activo de
  Customer Service Records: `file_id`, `original_name`, `mime_type`, `size`,
  `download_url` y `preview_url`.
- Conservacion de nombre original, MIME, tamano y ruta relativa como metadata
  de lectura.
- Actualizacion de Postman y handoff de contrato para consumidores.
- Validacion estatica y manual; no se agregan pruebas unitarias.

## Excluded Scope

- Ingesta ZIP y PWA Recoleccion.
- Listado, detalle visual, eliminacion o cualquier cambio de frontend.
- Migrar archivos de paquetes al agregado generico `files`.
- Cambiar el modelo persistido, reingestar paquetes o hacer backfill.
- Exponer `s3_key`, bucket, credenciales o URLs directas de almacenamiento.
- Permisos, capabilities, roles o politicas nuevas.

## Confirmed Decisions

- Los archivos de paquetes permanecen embebidos en `service_package_records`;
  no reutilizan `GET /v1/files/:fileId/download` porque no tienen una entidad
  generica `files` asociada.
- La ruta propuesta es:

  ```text
  GET /v1/service-packages/records/:recordId/files/:fileId/download
  ```

  Acepta el query `disposition=attachment|inline` y requiere
  `service_packages:READ`.
- El `fileId` se resuelve solo dentro del `recordId` solicitado. Un registro o
  archivo inexistente, eliminado o no relacionado conserva la respuesta
  estandar de recurso no encontrado.
- El presenter de detalle emite `download_url` y `preview_url`; no emite
  `s3_key` como contrato publico.
- `relative_path` puede conservarse como metadata especifica del paquete, pero
  no es dependencia del componente generico de documentos.
- La respuesta de listado conserva su proyeccion actual y no necesita URLs de
  archivo porque no entrega archivos.

## Acceptance Criteria

| Flow | Observable result |
| --- | --- |
| Descarga autorizada | La ruta entrega el stream, MIME, tamano y nombre original con `Content-Disposition: attachment`. |
| Vista previa autorizada | La misma ruta con `disposition=inline` conserva MIME y responde `Content-Disposition: inline`. |
| Archivo ajeno o ausente | No se lee S3 y responde el error estandar de recurso no encontrado. |
| Sin permiso | `JwtAuthGuard` y `PermissionsGuard` rechazan antes de acceder al archivo. |
| Detalle administrativo | Cada archivo expone metadata, `download_url` y `preview_url`, sin `s3_key`. |
| Compatibilidad de ingesta | La ingesta ZIP y el esquema persistido siguen sin cambios. |

## Gate

La definicion, diseno tecnico y tareas estan cerrados. La iniciativa puede
pasar a su unica slice de implementacion sin abrir decisiones nuevas.
