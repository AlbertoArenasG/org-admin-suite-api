# Task List

## Phase 1. Contract And Delivery Query

- [ ] Crear el contrato HTTP de `disposition=attachment|inline` y los DTOs de
  aplicacion para solicitar y devolver el stream.
  Status: pending
  Depends on: definition, artifact register and HTTP contract approved.
  Closure: request/application DTOs and their barrels compile with the exact
  contract documented in `06-technical-design.md`.

- [ ] Implementar y registrar el query/handler y caso de uso de entrega de
  archivo embebido.
  Status: pending
  Depends on: delivery DTOs.
  Closure: the flow validates an active owner and file membership before
  calling storage, and `GlobalCqrsModule` resolves the handler.

## Phase 2. HTTP Composition And Read Projection

- [ ] Exponer el subrecurso protegido con headers `Content-Type`,
  `Content-Length` y `Content-Disposition` codificado en UTF-8.
  Status: pending
  Depends on: delivery query and use case.
  Closure: controller route follows the defined order, reuses READ guards and
  streams the result with attachment/inline semantics.

- [ ] Adaptar solamente el presenter de detalle al descriptor publico de
  documentos y retirar `s3_key` de esa respuesta.
  Status: pending
  Depends on: final route and `API_BASE_URL` URL construction.
  Closure: detail `files[]` exposes the six common fields and optional
  `relative_path`; list and persisted shape remain unchanged.

## Phase 3. Handoff And Verification

- [ ] Actualizar Postman, catalogo de permisos y handoff de frontend.
  Status: pending
  Depends on: implemented endpoint and presenter contract.
  Closure: all three documents reflect method, URL, authorization, descriptor,
  query, representative errors and frontend action.

- [ ] Ejecutar validacion estatica y registrar la evidencia de validacion
  manual acordada. No se agregan ni ejecutan pruebas unitarias.
  Status: pending
  Depends on: endpoint, presenter and documentation updates.
  Closure: `npm run build` and `git diff --check` pass; the user confirms the
  documented manual scenarios before the spec is closed.
