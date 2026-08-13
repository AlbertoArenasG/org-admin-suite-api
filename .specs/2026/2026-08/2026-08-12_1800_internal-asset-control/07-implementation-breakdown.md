# Implementation Breakdown

## Slice 1. Domain Framing Closure

- Estado: completed
- Objetivo:
  - cerrar el naming base del módulo y del recurso principal
  - cerrar que el recurso es histórico y no catálogo maestro de activos
- Cambios realizados:
  - se aprobó `internal-asset-control` como módulo
  - se aprobó `internal-asset-maintenance-record` como recurso principal
  - se aprobó captura directa del activo en `v1`

## Slice 2. Record Typing And Status Rules

- Estado: completed
- Objetivo:
  - definir tipificación base del registro y separar status persistidos de estados derivados
- Cambios realizados:
  - se aprobó `interventionType` desde `v1`
  - se aprobó catálogo inicial en código
  - se aprobó separación entre semáforo y `status`
  - se aprobó `OVERDUE` como derivado para UI

## Slice 3. Alert Policies Capability

- Estado: in_progress
- Objetivo:
  - aterrizar la capability administrable de políticas de alerta desde `v1`
- Pendiente:
  - definir shape conceptual
  - definir relación con el recurso principal
  - definir implicaciones de alertamiento y colores

## Slice 4. Interval Structure Closure

- Estado: completed
- Objetivo:
  - cerrar el shape exacto del intervalo de vigencia
- Cambios realizados:
  - se aprobó persistir el intervalo como estructura compuesta
  - se aprobaron las unidades:
    - `years`
    - `months`
    - `weeks`
    - `days`
  - se aprobó persistir también la `expirationDate` derivada

## Slice 5. Provider Subflow Closure

- Estado: completed
- Objetivo:
  - cerrar el shape exacto del subflujo externo opcional
- Cambios realizados:
  - se reemplazó semántica de `laboratory` por `provider`
  - se aprobó mantener el flujo embebido dentro del registro
  - se aprobó el bloque mínimo:
    - `sentToProvider`
    - `providerName`
    - `sentToProviderAt`
    - `providerLeadTime`
    - `providerNotes`

## Slice 6. Record Shape And HTTP Contract

- Estado: pending
- Objetivo:
  - aterrizar el shape exacto del `internal-asset-maintenance-record`
  - definir contratos HTTP iniciales

## Slice 7. Backend Implementation

- Estado: pending
- Objetivo:
  - implementar módulos, catálogos, derivaciones y wiring backend

## Slice 8. Validation And Handoff

- Estado: pending
- Objetivo:
  - validar reglas mínimas, actualizar docs y dejar lista la base para frontend
