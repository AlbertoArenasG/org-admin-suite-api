# Implementation Breakdown

## Ampliacion de alcance - Staff interno

Slice adicional aprobada antes del cierre: modificar servicio de visibilidad,
puerto, cuatro casos de uso y repositorio para separar alcance staff/externo.
Actualizar handoff, Postman y catalogo de permisos sin agregar rutas o permisos.
Reutilizar IUserReadRepository; resolver el flag desde persistencia por consulta.
Validar lint, build y manualmente ambos alcances, filtros y registros eliminados.
Validacion HTTP confirmada por el usuario en Slice 3 el 2026-09-04;
ampliacion completada, sin repetir seed.

## Slice 1. Authorization And Read Foundation

**Phase:** 3, tasks 1 and 2. **Goal:** establish the dedicated read boundary
without exposing HTTP routes. **Artifacts:** authorization catalog, i18n,
client-access port, Mongoose repository, visibility service, DTOs, mapper,
use cases, barrels and DI registrations listed in `06`.

Steps: register `READ`; add translations; create the visibility service; create
the dedicated port/repository and the four use cases; register DI and exports.
The repository must apply `ACTIVE`, actor snapshot and active customer IDs
before count or pagination. No schema, index, route, Postman or handoff change
occurs in this slice.

Validation: typecheck and focused manual code review of the three-part fence.
Close only when all artifacts compile and administrative read artifacts remain
unchanged.

## Slice 2. HTTP Contract And Consumer Documentation

Estado: completed. Validacion local completada el 2026-09-04; validacion HTTP
confirmada por el usuario en Slice 3 en la misma fecha.

**Phase:** 3, task 3. **Goal:** expose list, detail and contextual options.
**Artifacts:** request DTOs, four CQRS handlers, presenter, controller, API and
CQRS registrations, Postman collection, frontend handoff and permission catalog.

Steps: add four routes with options before `:recordId`; wire `READ`; implement
the approved projections, filters and errors; create/update the handoff draft;
update the four Postman requests and representative examples.

Compatibility: does not modify administrative routes or their presenter. Close
only when endpoint behavior, handoff and Postman reflect the same contract.

## Slice 3. Verification And Operational Seed

Estado: completed (2026-09-04). El usuario confirmo el seed mediante captura:
system-roles created=0 updated=2 unchanged=4; custom_roles=4 updated=0 unchanged=4.
La ejecucion finalizo y cerro la conexion MongoDB sin errores reportados.
Esto confirma la ejecucion del seed, no la validacion funcional de los endpoints.

Validacion completa confirmada por el usuario el 2026-09-04: acceso staff y
externo, permisos, revocacion, detalle, proyecciones, busqueda, filtros,
paginacion, ordenamientos, errores y lookups contextuales. Tambien confirma
compatibilidad administrativa y contratos de handoff/Postman.
Fuente: confirmacion explicita del usuario en la sesion para toda la lista;
sin capturas ni payloads HTTP adicionales. No son ejecuciones HTTP del agente.
Evidencia consolidada en `05-progress.md`. Slice 3 y spec cerradas.

**Phase:** 3 task 4 and Phase 4. **Goal:** verify observable behavior and
record operational evidence. **Artifacts:** `03-task-list.md`, `05-progress.md`,
final handoff, Postman and authorization catalog documentation.

Validation: build/typecheck, lint (review diff because it fixes files), manual
Postman scenarios from the behavior matrix, and absence of Provider/internal
fields. No automated tests by approved scope; this limitation is recorded.

User command: after catalog deployment and before validating system roles,
execute `npm run db:seed:roles`. Preconditions: target environment and catalog
change are deployed. Risk: it recalculates default-role permissions. Evidence:
Master Admin and Administrator receive the new `READ` permission; user shares
the result before this slice is closed.

Close only after validation evidence, final handoff/Postman, progress entries
and the seed result are recorded.

## Evidencia de Slice 2

- Cuatro rutas, DTOs, handlers tipados, presenter y registros implementados.
- ESLint del modulo y GlobalCqrsModule correcto; build correcto.
- Inspeccion local con ValidationPipe: rango invertido y sort invalido retornan
  400; parametros desconocidos se eliminan siguiendo la configuracion vigente.
- Inspeccion de metadata: cuatro rutas con READ y dependencias heredadas resueltas.
- Invocacion local del presenter: listado sin users/created_at; detalle los agrega;
  provider, requested_at y materializaciones no aparecen.
- Consulta inspeccionada: customer_id conserva la interseccion con clientes vigentes.
- Postman parseable: una carpeta, cuatro requests, ejemplos 200/400/401/403/404.
- Handoff y catalogo de permisos actualizados.
- Pendiente de entorno: respuesta HTTP real, datos, revocacion y seed de roles.
  No se iniciaron servidores ni se ejecutaron operaciones sobre datos.
