# Plan

## Objective

Diseñar e implementar en backend el módulo `internal-asset-control` para registrar historial operativo sobre acciones requeridas o realizadas a activos internos, con vigencia configurable, alertamiento configurable y seguimiento opcional a provider.

## Target Design

- módulo `internal-asset-control` como capability de negocio independiente
- recurso principal `internal-asset-maintenance-record`
- captura directa del activo dentro del registro en `v1`
- catálogo en código de `assetMaintenanceType`
- `status` persistido separado de `OVERDUE` derivado
- módulo administrable de políticas de alerta desde `v1`
- subflujo opcional de provider dentro del registro

## Phases

### Phase 1. Domain Framing

- consolidar el nuevo entendimiento del recurso principal
- separar registro histórico, activo capturado, alertamiento y seguimiento de provider
- aterrizar nomenclatura estable de módulo y recurso

### Phase 2. Contract And Model Design

- definir shape del `internal-asset-maintenance-record`
- definir catálogo de `assetMaintenanceType`
- definir `status` persistido y reglas de derivación visual
- definir shape y alcance del módulo de políticas de alerta
- cerrar contratos HTTP iniciales del módulo principal y del módulo de políticas

### Phase 3. Backend Implementation

- implementar dominio, persistencia, CQRS y controllers del módulo principal
- implementar dominio, persistencia, CQRS y controllers de políticas de alerta
- integrar cálculo de vencimiento, semáforo y estado derivado
- integrar subflujo opcional de provider

### Phase 4. Validation And Handoff

- validar contratos, reglas de derivación y alertamiento base
- actualizar documentación viva cuando haya catálogos o reglas permanentes
- dejar lista la base para el módulo frontend consumidor futuro

## Sequencing Notes

- primero debe cerrarse por completo la definición backend
- no debe introducirse todavía un catálogo maestro de activos
- no deben introducirse jobs para mutación automática de `status` en `v1`
- las políticas de alerta deben quedar listas desde el inicio como capability administrable

## Exit Criteria

- `internal-asset-control` queda definido con fronteras claras
- `internal-asset-maintenance-record` queda implementado y usable
- existe catálogo de `assetMaintenanceType`
- existe `status` persistido separado de `OVERDUE` derivado
- existe módulo administrable de políticas de alerta
- la base backend queda lista para consumo de frontend desde un módulo futuro
