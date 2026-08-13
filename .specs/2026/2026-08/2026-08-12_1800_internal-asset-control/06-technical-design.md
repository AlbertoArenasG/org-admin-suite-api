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

### Alert Policy Base Shape

- `name`
- `code` autogenerado desde `name`
- `description` opcional
- `status`
- `rules[]`

Estados iniciales de política:

- `ACTIVE`
- `INACTIVE`
- `DELETED`

Contratos HTTP mínimos aprobados para `alert-policies`:

- `GET /v1/alert-policies`
- `GET /v1/alert-policies/:policyId`
- `POST /v1/alert-policies`
- `PATCH /v1/alert-policies/:policyId`
- `DELETE /v1/alert-policies/:policyId`

Lecturas aprobadas:

- listado paginado administrativo
- colección simple no paginada para lookup o selección

## Provisional Resource Shape

El shape exacto sigue pendiente, pero ya se asumen como mínimos conceptuales:

- identidad técnica del registro
- referencia capturada del activo:
  - nombre
  - identificador de negocio
- `interventionType`
- fecha base del registro como fecha real de la acción documentada
- intervalo de vigencia estructurado:
  - `years`
  - `months`
  - `weeks`
  - `days`
- fecha de vencimiento derivada
- observaciones del registro concreto
- `status` persistido
- bloque opcional de provider
- referencia directa a política de alerta reutilizable

## Provisional Provider Subflow

Cuando aplique el flujo externo hacia provider, ya se asume como mínimo conceptual:

- indicador de que el registro entró a flujo externo hacia provider
- fecha de envío al provider
- nombre capturado del provider
- tiempo estimado del trabajo o servicio externo
- notas opcionales del flujo externo

Todavía sigue pendiente cerrar el shape exacto y si se requerirán más timestamps o campos de seguimiento dentro de `v1`.

## Provisional Derived Logic

### Vencimiento

La fecha de vencimiento deberá derivarse a partir de:

- fecha base del registro
- intervalo de vigencia

El intervalo no será texto libre y no será concern exclusivo de UI.

Backend persistirá:

- el intervalo estructurado original
- la `expirationDate` derivada

### Alertamiento

El semáforo o nivel de alerta deberá derivarse con base en:

- fecha actual
- fecha de vencimiento
- política aplicable

Las reglas de una política no declararán canales propios.

Cuando una regla tenga `recipientGroupIds[]`, la notificación efectiva se resolverá usando:

- los canales habilitados del grupo
- los datos disponibles por canal en sus contactos

Una regla podrá existir sin grupos y seguir siendo válida como regla visual de severidad.

`offset` de cada regla reutilizará el mismo shape estructurado de duración ya aprobado para el intervalo principal:

- `years`
- `months`
- `weeks`
- `days`

La severidad de cada regla será configurable con:

- `severityLabel`
- `severityColorHex`

No habrá `severityPriority` configurable.

Cuando varias reglas pudieran competir, la severidad dominante se resolverá por cercanía al vencimiento usando el `offset`.

No se asumirá unicidad obligatoria de `offset` dentro de una política.

Antes de persistir la política, backend ordenará `rules[]` por `offset`.

### Overdue

`OVERDUE` no será persistido en `v1`.

Se calculará para UI cuando:

- el registro siga operativo para trabajo pendiente
- la fecha de vencimiento ya haya quedado en el pasado

## Pending Design Areas

- contratos HTTP iniciales
- reglas exactas de derivación de semáforo y `OVERDUE`
