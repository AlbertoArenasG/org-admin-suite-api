# Progress

## 2026-09-29 - Definition and analysis created

- Se confirmó que la iniciativa de frontend migra solo listado, detalle y
  eliminacion; PWA Recoleccion e ingesta ZIP quedan fuera.
- Se verificó que los archivos de paquetes no pertenecen al agregado generico
  `files`: son snapshots embebidos y se almacenan directamente desde la
  ingesta.
- Se definió una ruta propia de descarga/previsualizacion bajo el registro y
  el descriptor compatible con `download_url` y `preview_url`.
- Se confirmó que el descriptor replica el nucleo de adjuntos de Customer
  Service Records; `relative_path` queda como metadata opcional del paquete.
- No se modificó codigo, contrato HTTP, Postman ni handoff.

## 2026-09-29 - Technical design and implementation plan completed

- Se documentaron el plan, tareas, diseño técnico y dos slices de entrega.
- La ruta de archivos reutiliza el pipeline `controller -> query -> use case
  -> storage`, sin cambios de entidad, schema, repositorio ni migración.
- La validación de registro activo ocurre en el caso de uso para no modificar
  la capa de persistencia; la normalización de respuesta ocurre en el
  presenter.
- Una auditoría contra `SPEC_WORKFLOW.md` precisó el registro de artefactos con
  nombres, rutas, dependencias, estados, impacto entre repositorios y
  verificación por riesgo.
- La iniciativa queda lista para implementar la slice 1.

Next step: implementar la slice 1 de entrega segura y descriptor público.

## 2026-09-29 - Slice 1 implemented

- Se creó el caso de uso de entrega de archivo, su DTO, query/handler CQRS y
  registro en `GlobalCqrsModule`.
- La ruta protegida `GET /v1/service-packages/records/:recordId/files/:fileId/download`
  valida registro activo y pertenencia antes de acceder a S3; soporta
  `attachment` e `inline` con headers UTF-8.
- El presenter compartido normaliza `files[]` de listado y detalle a
  `mime_type`, `download_url` y `preview_url`, sin exponer `s3_key` ni
  `content_type`. No se mantiene compatibilidad temporal por decision de
  despliegue conjunto.
- Se actualizaron Postman, el catalogo de permisos y el handoff de frontend.
- `npm run build` y `git diff --check` finalizaron correctamente. No se
  ejecutaron pruebas unitarias ni lint, de acuerdo con la politica vigente.

Next step: la persona usuaria valida manualmente descarga, preview, permisos y
casos de recurso no encontrado para cerrar la spec.

## 2026-09-29 - Manual validation and closure

- La persona usuaria confirmó la validación manual de descarga,
  previsualización, autorización y recursos no encontrados.
- No quedan tareas pendientes, decisiones abiertas ni riesgos residuales
  conocidos dentro del alcance aprobado.
- La iniciativa queda formalmente completada.
