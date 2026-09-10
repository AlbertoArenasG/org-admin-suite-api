# Plan

## Fase 1. Consolidar el lookup en `ROLES`

Crear `GetAssignableRoles` dentro del módulo de aplicación y CQRS de `ROLES`.
Preservará la matriz estructural actual y el contrato HTTP de opciones. Las
piezas user-owned equivalentes se retiran; no habrá dos implementaciones de la
misma regla.

## Fase 2. Registrar y derivar la capability

Agregar `ROLES / READ_OPTIONS` al catálogo maestro y a las reglas de
derivación de `USERS` y `USER_REGISTRATION_INVITATIONS`. El seed existente
reconciliará las capabilities persistidas después del despliegue.

## Fase 3. Exponer la ruta y conservar compatibilidad

Agregar `GET /v1/roles/options` antes de `GET /v1/roles/:roleId`, protegido
con JWT y capability auxiliar. Las rutas legacy de usuario conservarán su
autorización funcional actual, pero delegarán en la query de `ROLES` hasta que
los consumidores frontend se migren en otra iniciativa.

## Fase 4. Documentar y validar

Actualizar los documentos backend de autorización, el catálogo de endpoints y
la deuda técnica. Ejecutar validaciones estáticas y validación manual; el seed
lo ejecutará exclusivamente la persona usuaria después del despliegue.
