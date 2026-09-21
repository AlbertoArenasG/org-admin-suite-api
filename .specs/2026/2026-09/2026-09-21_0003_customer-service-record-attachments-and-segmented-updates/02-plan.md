# Plan

## Phase 1. Definition And Design

Cerrar contratos, modelo, visibilidad, migracion y registro de artefactos antes
de escribir codigo.

## Phase 2. Data Model And Shared Attachment Reconciliation

Extender dominio, schema, mapper y repositorios. Crear el servicio de
reconciliacion que conserva activos existentes, batch-fetch de nuevos archivos,
archiva ausencias y recalcula conteos.

## Phase 3. Segmented Write API

Reducir `POST` al contrato minimo. Reemplazar el PATCH amplio por los cinco
PUT, sus DTOs, commands, handlers y casos de uso. Reutilizar preparacion de
input y refrescadores tecnicos actuales.

## Phase 4. Read Contracts And Generic File Delivery

Proyectar conteos en ambos listados y adjuntos activos en detalles. Extender la
descarga generica para `inline` y configurar limites de carga.

## Phase 5. Data Migration And Handoff

Crear migracion idempotente con dry-run/apply, comandos npm, documento vivo de
integracion y actualizacion de Postman si corresponde al contrato publicado.

## Phase 6. Verification And Closure

Ejecutar build/lint aplicables. La persona usuaria ejecuta migracion,
validaciones manuales y confirma la evidencia antes del cierre formal.
