# Plan

## Objective

Diseñar e implementar en backend el módulo `internal-asset-control` para registrar historial operativo sobre acciones requeridas o realizadas a activos internos, con vigencia configurable, status operativo manual, políticas reutilizables de expiración y seguimiento opcional a provider.

## Target Design

- módulo de negocio independiente `internal-asset-control`
- recurso principal `internal-asset-maintenance-record`
- captura directa del activo dentro del registro en `v1`
- catálogo en código de `assetMaintenanceType`
- `status` persistido separado de `OVERDUE` derivado
- dos entidades reutilizables separadas desde `v1`:
  - `expiration-status-policy`
  - `expiration-notification-policy`
- subflujo opcional de provider dentro del registro
- subbloque `provider_follow_up` separado de las políticas de expiración

## Phases

### Phase 1. Domain Framing

- consolidar el entendimiento del recurso principal
- cerrar nomenclatura estable de módulo y recurso
- separar registro histórico, vigencia, status operativo y seguimiento de provider

### Phase 2. Contract And Model Design

- definir shape del `internal-asset-maintenance-record`
- definir catálogo de `assetMaintenanceType`
- definir `status` persistido y reglas de derivación visual
- definir shape y alcance de:
  - `expiration-status-policy`
  - `expiration-notification-policy`
- cerrar contratos HTTP del módulo principal y de ambos módulos de políticas

### Phase 3. Backend Implementation

- implementar dominio, persistencia, CQRS y controllers del módulo principal
- implementar dominio, persistencia, CQRS y controllers de:
  - `expiration-status-policy`
  - `expiration-notification-policy`
- integrar cálculo de vencimiento, semáforo, `OVERDUE` y follow-up opcional a provider

### Phase 4. Validation And Handoff

- validar contratos y reglas de derivación
- actualizar documentación viva cuando ya existan contratos implementados
- dejar lista la base backend para el módulo frontend consumidor futuro

## Sequencing Notes

- primero debe cerrarse por completo la definición backend
- no debe introducirse todavía un catálogo maestro de activos
- no deben introducirse jobs para mutación automática de `status` en `v1`
- `expiration-status-policy` y `expiration-notification-policy` deben quedar listas desde el inicio como capabilities administrables reutilizables
- `provider_follow_up` no debe mezclarse con las políticas de expiración

## Exit Criteria

- `internal-asset-control` queda definido con fronteras claras
- `internal-asset-maintenance-record` queda implementado y usable
- existe catálogo de `assetMaintenanceType`
- existe `status` persistido separado de `OVERDUE` derivado
- existen:
  - `expiration-status-policy`
  - `expiration-notification-policy`
- la base backend queda lista para consumo de frontend desde un módulo futuro
