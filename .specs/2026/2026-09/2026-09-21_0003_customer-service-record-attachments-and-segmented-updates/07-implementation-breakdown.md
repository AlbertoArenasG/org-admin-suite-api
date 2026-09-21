# Implementation Breakdown

## Slice 1. Model And Persistence

Implements Phase 2. Extiende entity, schema y mapper; crea el reconciliador.
Los puertos y repositorios estandar se reutilizan mediante el mapper comun. No
expone rutas ni modifica DTOs aun. Validar compilacion y que snapshots no
requieran read-time lookup.

## Slice 2. Write Contracts

Implements Phase 3. Adapta POST y crea los cinco PUT con CQRS, DTOs y casos de
uso. Retira PATCH y su flujo exclusivo. Mantiene permisos actuales. Validar
compilacion y contratos HTTP manualmente.

## Slice 3. Read And File Delivery

Implements Phase 4. Extiende presenters, proyecciones, limites genericos de
upload y `disposition`. No incorpora UI. Validar separacion admin/Client Access
y URLs sin `service_entry_id`.

## Slice 4. Migration And Handoff

Implements Phase 5. Agrega script idempotente, comandos, Postman y handoff.
La persona usuaria ejecuta primero dry-run, revisa evidencia y despues apply.
No usar `save` ni modificar auditoria.

## Slice 5. Validation And Closure

Implements Phase 6. Ejecuta `npm run build` y `git diff --check`. La persona usuaria
valida manualmente creacion, cada PUT, adjuntos, visibilidad, disposiciones y
migracion. Solo entonces se actualizan tareas, progreso y estados terminales.
