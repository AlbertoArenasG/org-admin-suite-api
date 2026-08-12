# Technical Design

## Current State

Esta iniciativa todavía está en etapa de definición. El diseño técnico aquí será incremental y solo debe endurecer lo que ya haya sido aprobado en `00-definition.md` y `04-decisions.md`.

## Approved Base So Far

### Module

- backend module slug:
  - `internal-asset-control`

### Primary Resource

- backend resource slug:
  - `internal-asset-maintenance-record`

### Modeling Direction

- cada registro será histórico
- el activo se capturará directo dentro del registro
- el recurso principal no depende todavía de un catálogo maestro de activos
- existirá un catálogo en código de `interventionType`
- existirá `status` persistido separado de estados derivados de UI
- existirá capability administrable de políticas de alerta

## Provisional Resource Shape

El shape exacto sigue pendiente, pero ya se asumen como mínimos conceptuales:

- identidad técnica del registro
- referencia capturada del activo:
  - nombre
  - identificador de negocio
- `interventionType`
- fecha base del registro
- intervalo de vigencia
- fecha de vencimiento derivada
- observaciones
- `status` persistido
- bloque opcional de laboratorio
- referencia a política de alerta o estrategia equivalente

## Provisional Derived Logic

### Vencimiento

La fecha de vencimiento deberá derivarse a partir de:

- fecha base del registro
- intervalo de vigencia

### Alertamiento

El semáforo o nivel de alerta deberá derivarse con base en:

- fecha actual
- fecha de vencimiento
- política aplicable

### Overdue

`OVERDUE` no será persistido en `v1`.

Se calculará para UI cuando:

- el registro siga operativo para trabajo pendiente
- la fecha de vencimiento ya haya quedado en el pasado

## Pending Design Areas

- shape exacto del intervalo de vigencia
- shape exacto del bloque de laboratorio
- modelado de políticas de alerta
- relación entre registro y política
- contratos HTTP iniciales
- reglas exactas de derivación de semáforo y `OVERDUE`

