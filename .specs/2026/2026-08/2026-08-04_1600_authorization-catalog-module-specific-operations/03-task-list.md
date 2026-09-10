# Task List

## Phase 1. Analysis

- [x] Analizar módulo por módulo el catálogo actual de autorización
      Status: completed

- [x] Clasificar qué módulos siguen siendo cercanos a CRUD y cuáles requieren operaciones de dominio
      Status: completed

- [x] Identificar capacidades que pertenecen a plataforma y no al catálogo general
      Status: completed

Notas de avance:

- `USERS` ya fue analizado y se decidió sacar `USERS/CREATE` del catálogo de negocio
- `ROLES` ya fue analizado y se decidió introducir `ROLES/ACTIVATE` para el cambio de estado
- `CUSTOMERS` ya fue analizado y se confirmó que el flujo público por token queda fuera del catálogo autenticado

## Phase 2. Definition

- [x] Cerrar la decisión sobre el modelo objetivo del catálogo
      Status: completed

- [x] Cerrar la decisión sobre el vocabulario global de operaciones
      Status: completed

- [x] Definir impacto en validaciones, seeds y contratos HTTP
      Status: completed

## Phase 3. Implementation

- [x] Ajustar el catálogo backend al modelo aprobado
      Status: completed

- [x] Actualizar documentación permanente de autorización
      Status: completed

- [x] Registrar el handoff necesario para frontend
      Status: completed

## Phase 4. Validation

- [x] Verificar coherencia del catálogo final contra los módulos reales del sistema
      Status: completed

- [x] Actualizar progreso y breakdown al cierre
      Status: completed
