# Progress

## 2026-09-17 - Spec created

- Se creó la iniciativa backend para el perfil semántico
  `sorting=work_priority`.
- Se documentó la prioridad aprobada para ambos listados, su uso exclusivo de
  `customer_delivery` y el requisito de ordenar antes de paginar.
- Se aprobó que `sort[]` prevalece sobre `sorting=work_priority` cuando ambos
  parámetros llegan; no se agrega un `400` ni código de error nuevo.
- Se verificó el refresher técnico: un compromiso de Cliente sin fecha se
  materializa como `SYSTEM/PENDING_ESTIMATED_DATE`; los abiertos con fecha se
  resuelven como `OVERDUE`, `POLICY` u `ON_TIME`.
- No se modificó código, contratos HTTP, Postman ni handoff.

## 2026-09-17 - Definition refinement

- La persona usuaria aprobó ubicar los abiertos con materialización de Cliente
  ausente o no reconocible después de `POLICY` y antes de `ON_TIME`.
- Se confirmó que la consulta no deriva ni persiste estatus a partir de la
  fecha; solo ordena con los campos materializados y la categoría fija de dato
  incompleto.
- Se revisó `docs/api-pipeline.md` y se registraron explícitamente los query
  adapters, handlers y composición CQRS reutilizados por ambos listados.
- Se corrigió el registro técnico: no existe un patrón de helpers dentro de
  repositorios Mongoose. La secuencia compartida se incorporará como método
  protegido del base repository ya extendido por ambos listados.
- La persona usuaria aprobó el patrón de agregación existente para los dos
  listados: `$match`, prioridad compartida, paginación, exclusión de la clave
  temporal y conteo paralelo. El mapper existente recibe el resultado crudo
  con el cast local ya usado por Service Entry Survey.
- La definición queda `completed`. `Implementation ready` permanece en `no` y
  no se modificó código, contratos HTTP, Postman ni handoff.

Next step: esperar autorización expresa de la persona usuaria para iniciar la
implementación.

## 2026-09-17 - Backend implementation completed

- La persona usuaria autorizó la implementación completa de backend.
- Se agregó `sorting=work_priority` a los DTOs, contratos de repositorio y a
  ambos repositorios de lectura.
- El perfil usa el método protegido compartido
  `buildWorkPriorityPipeline()` y una agregación previa a la paginación; no
  persiste la clave temporal ni deriva estatus.
- La ruta administrativa conserva su fallback histórico `createdAt desc` cuando
  no llega `sorting` ni `sort[]`; `sort[]` explícito prevalece sobre el perfil.
- Se actualizó el handoff y Postman para ambos endpoints.
- `npx tsc --noEmit`, ESLint de los archivos modificados y `git diff --check`
  finalizaron correctamente. Queda pendiente la validación manual de la
  persona usuaria.

Next step: la persona usuaria ejecuta los escenarios manuales de prioridad,
precedencia de `sort[]`, paginación, visibilidad Client Access y compatibilidad
sin `sorting`.

## 2026-09-17 - Backend validation and formal closure

- La persona usuaria confirmó la validación manual del contrato backend.
- Se confirmó el perfil de prioridad, la precedencia de `sort[]`, paginación,
  visibilidad de Client Access, compatibilidad sin `sorting` y rechazo de un
  perfil inválido.
- Se retiró la validación de vistas frontend de esta iniciativa: las specs
  backend son agnósticas a aplicaciones cliente. El handoff conserva solo el
  contrato y guía de integración para cualquier consumidor.
- La spec queda formalmente completada.
