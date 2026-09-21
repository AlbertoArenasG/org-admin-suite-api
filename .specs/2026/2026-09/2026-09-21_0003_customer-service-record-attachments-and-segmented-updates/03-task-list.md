# Task List

## Phase 1. Definition And Design

- [x] Cerrar contratos, persistencia, visibilidad y estrategia de actualizacion segmentada.
  Status: done
  Closure: contratos y registro de artefactos documentados; la persona usuaria
  autorizo explicitamente `Implementation ready: yes`.

## Phase 2. Domain, Persistence And Shared Reconciliation

- [x] Incorporar modelo de adjuntos, snapshots, historial y conteos.
  Status: done
  Closure: dominio, schema y mapper persisten las estructuras aprobadas sin
  alterar campos existentes; los repositorios estandar reutilizan el mapper
  comun y la reconciliacion compartida queda disponible para los PUT futuros.

## Phase 3. Segmented Write Operations

- [ ] Reemplazar el PATCH amplio por POST minimo y cinco PUT cohesionados.
  Status: done
  Closure: rutas, DTOs, CQRS y casos de uso aplican autorizacion, auditoria y
  materializaciones correspondientes; el PATCH amplio fue retirado.

## Phase 4. Reads And Generic File Contract

- [ ] Exponer conteos y adjuntos activos segun visibilidad, y extender descarga/carga generica.
  Status: done
  Closure: admin y Client Access cumplen sus proyecciones; descarga soporta
  disposicion aprobada y carga aplica limites.

## Phase 5. Migration And Documentation

- [ ] Implementar migracion idempotente y handoff vigente.
  Status: pending
  Closure: dry-run/apply, integridad, comandos y contrato de integracion estan documentados.

## Phase 6. Manual Validation And Formal Closure

- [ ] Ejecutar validacion tecnica y manual acordada.
  Status: pending
  Closure: persona usuaria confirma escenarios manuales y se registra evidencia.
