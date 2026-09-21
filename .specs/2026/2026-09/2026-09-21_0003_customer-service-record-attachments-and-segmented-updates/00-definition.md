# Customer Service Record Attachments And Segmented Updates

## Status

- Initiative: `customer-service-record-attachments-and-segmented-updates`
- Date: `2026-09-21`
- Definition status: completed
- Implementation ready: yes
- Implementation status: pending
- Validation status: pending
- Spec status: in_progress

## Objective

Extender Customer Service Records con adjuntos flexibles, referencias de
trabajo/documentos y operaciones de actualizacion cohesionadas por bloque. La
API conservara los snapshots de archivo y su historial de remocion, sin
consultas de archivos durante las lecturas ni acoplamiento a una interfaz
cliente concreta.

## Included Scope

- `provider.work_order_reference` privado.
- Adjuntos por activo: `intake_condition_files`, `delivery_condition_files` y
  `reports`.
- Adjuntos raiz: `quotation`, `purchase_order`, `invoice` y `other_files`.
- `purchase_order` documenta una orden emitida por el cliente hacia Implementos
  Cientificos; es un documento del servicio, no una propiedad del cliente.
- Snapshots inmutables de archivo, auditoria de agregado/remocion, historial
  permanente de removidos y conteos materializados.
- `POST` minimo y cinco patrones de `PUT` por bloque.
- Retiro del `PATCH` amplio actual, sin periodo de compatibilidad temporal.
- Lecturas administrativas y Client Access con conteos; detalle con adjuntos
  activos, descarga y vista previa.
- Limites genericos de carga y disposicion de descarga `attachment|inline`.
- Migracion idempotente de datos existentes que conserve auditoria.
- Handoff vivo para aplicaciones cliente.

## Excluded Scope

- Restaurar adjuntos removidos en una aplicacion cliente.
- Crear, eliminar o editar multiples activos desde la actualizacion.
- Etiquetas para archivos u otras propiedades de negocio no aprobadas.
- Adjuntos privados del proveedor; solo se deja preparado el modelo de conteos.
- Endpoints protegidos dedicados por recurso para carga o descarga.
- Restricciones por MIME o extension; el limite inicial sera tecnico por tamano.
- Cambios en la aplicacion frontend o en su experiencia de usuario.
- Suites unitarias: la politica vigente del repositorio no las incorpora.

## Confirmed Decisions

- Los archivos se relacionan con el registro mediante snapshots embebidos; la
  coleccion `files` no se consulta al leer un registro.
- Los archivos de condicion del activo documentan su estado al ingreso y en la
  etapa de entrega; admiten cualquier archivo aunque su uso principal sean
  fotos. `reports` pertenece al activo y no se limita a calibracion.
- El nombre original del archivo aporta contexto inicial. No se persiste
  `label`, estado, bucket, storage key ni URL dentro de la relacion.
- Cada coleccion mantiene `files` activos y `removed_files` historicos. El
  request solo envia IDs activos. Una ausencia frente a los activos persistidos
  archiva la relacion con `removed_at` y `removed_by`.
- Los snapshots activos preservan `added_at` y `added_by`; los nuevos IDs se
  consultan en lote y se snapshottean una sola vez. IDs duplicados existentes
  se aceptan y cuentan tal como llegan.
- Los cinco patrones de actualizacion son `details`, `customer`, `provider`,
  `assets/:assetId` y `documents/:documentType`. Cada `PUT` recibe el bloque
  completo y responde el detalle administrativo completo actualizado.
- `documentType` admite `quotation`, `purchase-order`, `invoice` y
  `other-files`.
- El `POST` solo exige datos minimos: tipo, fecha solicitada, cliente, usuarios
  de cliente, observaciones y al menos un activo inicial. Puede aceptar varios
  activos al crear, aunque el cliente actual envia uno; la edicion no incorpora
  alta ni baja de activos. Inicializa los demas bloques sin adjuntos.
- Client Access recibe solo adjuntos activos visibles; por ahora todos los
  adjuntos nuevos son visibles salvo datos privados del proveedor. No se expone
  historial ni se altera el modulo generico de archivos para guardar visibilidad.
- Ambos listados exponen `attachments_count`. Internamente se mantienen
  `attachments_count` y `customer_visible_attachments_count` para soportar
  futuros adjuntos internos sin filtrar esa distincion al cliente.
- La descarga generica conservara `attachment` por defecto y aceptara
  `disposition=inline`; URLs de Customer Service Records no incluyen
  `service_entry_id`.
- Cargas genericas: maximo 10 archivos por request y 20 MiB por archivo, sin
  allowlist de MIME o extension en esta iniciativa.
- La migracion actualiza solo campos ausentes con `$set` y no toca
  `createdAt`, `updatedAt`, `created_by` ni `updated_by`.
- La persona usuaria ejecutara las validaciones manuales y las evidencias se
  registraran en esta spec; no se ejecutaran pruebas unitarias.

## Gate

La definicion y el registro tecnico estan completos. La persona usuaria autorizo
expresamente pasar la iniciativa a lista para implementacion. El codigo inicia
solo cuando autorice expresamente la iniciativa o una slice.
