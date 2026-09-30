# Task List

## Phase 1. Contract And Delivery Query

- [x] Crear el contrato HTTP de `disposition=attachment|inline` y los DTOs de
  aplicacion para solicitar y devolver el stream.
  Status: done
  Depends on: definition, artifact register and HTTP contract approved.
  Closure: request/application DTOs and their barrels compile with the exact
  contract documented in `06-technical-design.md`.

- [x] Implementar y registrar el query/handler y caso de uso de entrega de
  archivo embebido.
  Status: done
  Depends on: delivery DTOs.
  Closure: the flow validates an active owner and file membership before
  calling storage, and `GlobalCqrsModule` resolves the handler.

## Phase 2. HTTP Composition And Read Projection

- [x] Exponer el subrecurso publico con headers `Content-Type`,
  `Content-Length` y `Content-Disposition` codificado en UTF-8.
  Status: done
  Depends on: delivery query and use case.
  Closure: controller route follows the defined order, does not require
  guards and streams the result with attachment/inline semantics.

- [x] Adaptar el presenter compartido al descriptor publico de
  documentos y retirar `s3_key` de esa respuesta.
  Status: done
  Depends on: final route and `API_BASE_URL` URL construction.
  Closure: detail `files[]` exposes the six common fields and optional
  `relative_path`; las respuestas de listado y detalle se normalizan sin
  modificar el shape persistido.

## Phase 3. Handoff And Verification

- [x] Actualizar Postman, catalogo de permisos y handoff de frontend.
  Status: done
  Depends on: implemented endpoint and presenter contract.
  Closure: all three documents reflect method, URL, public delivery, descriptor,
  query, representative errors and frontend action.

- [x] Ejecutar validacion estatica y registrar la evidencia de validacion
  manual acordada. No se agregan ni ejecutan pruebas unitarias.
  Status: done
  Depends on: endpoint, presenter and documentation updates.
  Closure: `npm run build` and `git diff --check` passed; the user confirmed
  the documented manual scenarios.
