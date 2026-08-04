# Plan

## Objective

Redefinir el catálogo de autorización backend para que cada módulo exprese operaciones reales de dominio sin quedar forzado a una lectura CRUD uniforme.

## Target Design

- catálogo backend explícito por módulo
- operaciones base compartidas solo donde aporten valor real
- operaciones específicas por módulo cuando el dominio lo requiera
- frontera explícita entre catálogo de negocio y capacidades de plataforma
- validación y contratos HTTP coherentes con ese modelo

## Phases

### Phase 1. Domain Analysis

- revisar módulo por módulo el significado real de sus permisos
- separar módulos CRUD genuinos de módulos con operaciones de dominio
- detectar operaciones que realmente pertenecen a plataforma y no al catálogo general

### Phase 2. Backend Model Definition

- cerrar decisiones sobre vocabulario global vs extensiones por módulo
- definir shape objetivo del catálogo y del contrato derivado
- decidir impacto en validación, seeds y docs operativas

### Phase 3. Backend Implementation

- ajustar catálogo, validaciones y wiring necesarios
- actualizar documentación permanente relevante

### Phase 4. Frontend Handoff

- dejar listo el contrato para abrir spec espejo en frontend

## Sequencing Notes

- primero se cierra backend como spec madre
- frontend no debe rediseñar semántica de operaciones por su cuenta
- el análisis módulo por módulo debe quedar registrado antes de cualquier implementación estructural

## Exit Criteria

- cada módulo queda clasificado según su semántica real
- el catálogo backend deja de depender conceptualmente de CRUD uniforme
- el catálogo general excluye capacidades que realmente son de plataforma
- la documentación deja clara la distinción entre operaciones base y operaciones específicas
