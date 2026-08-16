# Definition

## Purpose

Esta iniciativa existe para diseñar en backend el módulo `internal-asset-control`, orientado a dar visibilidad compartida sobre qué acciones necesitan recibir los activos internos de la empresa y cuándo deben realizarse.

El objetivo no es modelar todavía un catálogo maestro de activos internos, sino un historial operativo de registros asociados a esos activos para controlar vencimientos, seguimiento y alertamiento.

## Overall Status

- Initiative: `internal-asset-control`
- Definition status: `completed`
- Implementation ready: `yes`

## Scope Summary

La iniciativa queda acotada a diseñar e implementar en backend:

- el módulo `internal-asset-control`
- el recurso principal `internal-asset-maintenance-record`
- captura directa del activo dentro de cada registro en `v1`
- tipificación de registros por catálogo en código
- cálculo de vencimiento y alertamiento
- separación entre `status` persistido y estados derivados para UI
- dos módulos administrables reutilizables desde `v1`:
  - `expiration-status-policy`
  - `expiration-notification-policy`
- dos materializaciones técnicas persistidas por registro:
  - `expiration_status_materialization`
  - `expiration_notification_materialization`
- soporte opcional para seguimiento de provider dentro del registro cuando aplique

Queda fuera de esta spec:

- catálogo maestro de activos internos
- catálogo maestro de providers para este flujo
- automatizaciones batch o jobs que persistan cambios de estado
- el mecanismo técnico concreto de procesamiento automatizado diario de notificaciones:
  - scheduler
  - cron
  - comando programado por infraestructura
  - observabilidad operativa asociada
- UI frontend
- módulo espejo para activos externos o equipos de clientes

## Approved Foundations

Antes de implementación ya quedó aprobado que:

- el nombre del módulo será `internal-asset-control`
- el recurso principal será `internal-asset-maintenance-record`
- en español, el recurso principal se entenderá como `registro de mantenimiento de activo interno`
- cada registro será histórico
- el mismo activo podrá aparecer en múltiples registros
- `v1` capturará el activo directamente por nombre e identificador dentro del registro
- `assetMaintenanceType` existirá desde `v1` y vendrá de catálogo en código
- el intervalo de vigencia se persistirá como estructura compuesta por unidades
- `last_maintenance_at` y `expiration_date` serán `date-only`
- la referencia funcional del módulo será `America/Mexico_City`
- `expiration_date` se autocalcula por defecto, pero puede editarse
- el flujo de provider será opcional y no aplicará a todos los registros
- el semáforo o nivel de alerta convivirá con el `status` operativo
- `OVERDUE` será derivado para UI, no persistido automáticamente por backend
- desde `v1` existirán dos capabilities administrables reutilizables:
  - `expiration-status-policy`
  - `expiration-notification-policy`
- cada registro podrá referenciar ambas políticas de forma independiente
- cada registro persistirá además:
  - `expiration_status_materialization`
  - `expiration_notification_materialization`
- existirá un subbloque `provider_follow_up` desacoplado de las políticas de expiración

## Key Domain Rules

- `status` persistidos:
  - `PENDING`
  - `IN_PROGRESS`
  - `COMPLETED`
  - `CANCELLED`
  - `DELETED`
- `OVERDUE`:
  - no se persiste
  - solo aplica cuando `status` es `PENDING` o `IN_PROGRESS`
  - se calcula contra `expiration_date` usando `today` en `America/Mexico_City`
- todas las transiciones entre `PENDING`, `IN_PROGRESS`, `COMPLETED` y `CANCELLED` serán manuales en `v1`
- `DELETED` solo se alcanza por borrado lógico
- `expiration-status-policy` gobierna semáforo preventivo
- `expiration-notification-policy` gobierna notificaciones antes o después del vencimiento
- `expiration_status_materialization` evita recálculo por fila para lectura operativa del semáforo
- `expiration_notification_materialization` evita recálculo por fila y alimenta el mecanismo diario de notificaciones
- `provider_follow_up` no es una política reusable global

## Deferred Follow Up

Esta spec sí deja definida la base de datos, reglas y materializaciones necesarias para soportar envíos automáticos diarios, pero no cierra todavía el mecanismo técnico de ejecución.

Ese tema se trabajará en una spec backend posterior enfocada en:

- scheduler o estrategia de ejecución diaria
- procesamiento operativo de `trigger_events`
- observabilidad mínima del proceso
- manejo de fallos operativos
- consideraciones de despliegue e infraestructura

## HTTP Contract Summary

### Expiration Status Policies

- `GET /v1/expiration-status-policies`
- `GET /v1/expiration-status-policies/options`
- `GET /v1/expiration-status-policies/:policyId`
- `POST /v1/expiration-status-policies`
- `PATCH /v1/expiration-status-policies/:policyId`
- `DELETE /v1/expiration-status-policies/:policyId`

### Expiration Notification Policies

- `GET /v1/expiration-notification-policies`
- `GET /v1/expiration-notification-policies/options`
- `GET /v1/expiration-notification-policies/:policyId`
- `POST /v1/expiration-notification-policies`
- `PATCH /v1/expiration-notification-policies/:policyId`
- `DELETE /v1/expiration-notification-policies/:policyId`

### Internal Asset Maintenance Records

- `GET /v1/internal-asset-maintenance-records`
- `GET /v1/internal-asset-maintenance-records/:recordId`
- `POST /v1/internal-asset-maintenance-records`
- `PATCH /v1/internal-asset-maintenance-records/:recordId`
- `DELETE /v1/internal-asset-maintenance-records/:recordId`
- `POST /v1/internal-asset-maintenance-records/:recordId/provider-follow-up/send`

## Implementation Readiness Notes

La definición ya quedó cerrada sin huecos críticos bloqueantes.

La implementación deberá apegarse a lo ya aprobado para:

- `internal-asset-maintenance-record`
- `expiration-status-policy`
- `expiration-notification-policy`
- estados derivados y semáforo
- seguimiento opcional a provider
- fronteras explícitas de `v1`

Los detalles ejecutables viven principalmente en:

- [04-decisions.md](/Users/alberto/projects/icsacv/org-admin-suite-api/.specs/2026/2026-08/2026-08-12_1800_internal-asset-control/04-decisions.md)
- [06-technical-design.md](/Users/alberto/projects/icsacv/org-admin-suite-api/.specs/2026/2026-08/2026-08-12_1800_internal-asset-control/06-technical-design.md)
