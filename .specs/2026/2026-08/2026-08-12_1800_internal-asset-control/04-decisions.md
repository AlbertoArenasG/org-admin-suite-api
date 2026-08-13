# Decisions

## 2026-08-12

### Decision

El módulo se llamará:

- español: `control de activos internos`
- inglés: `internal-asset-control`

El recurso principal se llamará:

- español: `registro de mantenimiento de activo interno`
- inglés: `internal-asset-maintenance-record`

### Reason

Se necesitaba diferenciar claramente:

- el propósito visible de negocio del módulo
- del recurso histórico que documenta lo que necesita o recibió un activo interno

Además, se evitó:

- colisión con el módulo existente de `services`
- amarrar el dominio a calibración únicamente
- amarrar el módulo a un posible futuro catálogo maestro de activos

### Impact

- el naming del backend podrá construirse con una semántica estable
- el módulo conserva margen para convivir a futuro con un dominio más amplio de `internal-assets`
- `maintenance` se acepta como término paraguas en inglés para el recurso

## 2026-08-12

### Decision

Cada `internal-asset-maintenance-record` será histórico y el mismo activo podrá aparecer en múltiples registros.

### Reason

Negocio confirmó que cada fila documenta una calibración, verificación, mantenimiento u otra acción concreta realizada o registrada sobre un activo, y que el mismo activo puede volver a aparecer en el tiempo.

### Impact

- el recurso principal no será un catálogo maestro de activos
- observaciones, vencimiento y seguimiento pertenecen al registro concreto
- `v1` no necesita crear todavía una entidad maestra de activo interno

## 2026-08-12

### Decision

`v1` capturará el activo directamente dentro del registro por nombre e identificador.

### Reason

Se quiere resolver primero el problema operativo real sin expandir el alcance a un catálogo maestro de activos internos.

### Impact

- cada registro contendrá datos de referencia del activo
- el módulo queda libre para evolucionar después a un catálogo maestro si negocio lo pide

## 2026-08-12

### Decision

El registro tendrá `interventionType` desde `v1`, tomado de catálogo en código.

### Reason

Ya se confirmó que no todos los registros son calibración y que mantenimiento preventivo debe tratarse como otro tipo más del mismo flujo.

### Impact

- se evita amarrar el módulo a una sola clase de acción
- el backend podrá tipificar reglas y presentación desde el inicio
- el catálogo inicial deberá contemplar:
  - `CALIBRATION`
  - `VERIFICATION`
  - `PREVENTIVE_MAINTENANCE`
  - `OTHER`

## 2026-08-12

### Decision

El semáforo o alertamiento preventivo vivirá separado del `status` operativo del registro.

### Reason

El semáforo responde a cercanía de vencimiento, mientras el `status` refleja el estado real del trabajo pendiente, en proceso o terminado.

### Impact

- el modelo no mezclará severidad temporal con estado operativo
- la UI podrá mostrar ambas lecturas sin ambigüedad

## 2026-08-12

### Decision

`status` persistidos iniciales:

- `PENDING`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`

`OVERDUE` será derivado para UI y no se persistirá automáticamente en `v1`.

### Reason

Se quiere evitar complejidad temprana con jobs o procesos automáticos que muten datos persistidos por paso del tiempo.

### Impact

- el usuario conserva control sobre el `status` persistido
- el sistema puede mostrar `OVERDUE` visualmente cuando corresponda
- backend no necesitará automatizar escrituras para reflejar vencimiento

## 2026-08-12

### Decision

Las políticas de alerta existirán como capability administrable desde `v1`.

### Reason

Se anticipa una evolución rápida de reglas de alerta y no conviene hardcodear una sola lógica fija desde el inicio.

### Impact

- se deberá diseñar un módulo de políticas de alerta desde esta misma spec
- el semáforo y el envío de correos quedarán gobernados por políticas configurables
- `OVERDUE` seguirá siendo una regla derivada separada de esas políticas

## 2026-08-12

### Decision

El intervalo de vigencia se persistirá como estructura compuesta por unidades y backend también persistirá la `expirationDate` derivada.

### Reason

Negocio necesita intervalos flexibles y la UI debe poder reconstruir la configuración original del registro sin depender solo de una fecha derivada.

### Impact

- el modelo conservará la intención original del usuario
- se podrán soportar combinaciones como años, meses, semanas y días
- la entidad deberá contemplar un value object estructurado para el intervalo
- la `expirationDate` seguirá existiendo como dato derivado persistido

## 2026-08-12

### Decision

El subflujo externo opcional usará semántica de `provider` y se mantendrá embebido dentro del registro en `v1`.

### Reason

Aunque el cliente habló inicialmente de `laboratorio`, el dominio real también puede involucrar talleres u otros terceros externos. `provider` deja la frontera mejor definida y más reusable.

### Impact

- se evita acoplar el modelo a `laboratory`
- el bloque opcional mínimo del registro deberá contemplar:
  - `sentToProvider`
  - `providerName`
  - `sentToProviderAt`
  - `providerLeadTime`
  - `providerNotes`
- `providerLeadTime` seguirá el mismo patrón estructurado por unidades
- no habrá catálogo maestro de providers en `v1`

## 2026-08-12

### Decision

Cada `internal-asset-maintenance-record` referenciará directamente una política de alerta reutilizable.

### Reason

Se quiere que el sistema nazca flexible desde el inicio sin depender de una política global rígida ni de una semántica especial de `default`.

### Impact

- la relación entre registro y política será explícita
- si negocio solo necesita una política al principio, podrá reutilizar una sola
- el diseño queda preparado para múltiples políticas sin introducir overrides especiales

## 2026-08-12

### Decision

Las reglas de una política reutilizarán `recipient-groups` para resolver notificaciones y podrán existir sin grupos asociados.

### Reason

Los canales ya viven en `recipient-groups`, por lo que declararlos de nuevo en cada regla sería duplicación innecesaria. Además, una regla puede aportar solo severidad visual sin necesidad de enviar notificaciones.

### Impact

- la regla base se mantiene simple:
  - `offset`
  - `severity`
  - `recipientGroupIds[]`
- `recipientGroupIds[]` no será obligatorio
- la política podrá tener reglas solo visuales
- los canales se resolverán implícitamente desde los grupos asociados

## 2026-08-12

### Decision

`offset` en cada regla de alerta reutilizará exactamente el mismo shape estructurado del intervalo de vigencia.

### Reason

No conviene introducir dos formatos diferentes para duraciones dentro del mismo dominio si ambos representan composiciones de años, meses, semanas y días.

### Impact

- backend podrá reutilizar la misma convención de duración estructurada
- UI no necesitará aprender un segundo formato para configurar alertas
- las reglas podrán expresar offsets complejos sin texto libre

## 2026-08-12

### Decision

La severidad de cada regla será configurable por etiqueta y color, sin prioridad manual.

### Reason

Se quiere evitar un catálogo rígido de severidades y también evitar que el usuario tenga que entender o capturar prioridades numéricas que pueden resultar confusas.

### Impact

- cada regla podrá definir al menos:
  - `severityLabel`
  - `severityColorHex`
- no existirá `severityPriority` configurable en `v1`
- la dominancia entre reglas se resolverá por cercanía al vencimiento usando `offset`
- `OVERDUE` seguirá por encima de cualquier severidad configurada

## 2026-08-12

### Decision

No se forzará unicidad de `offset` dentro de una política de alerta.

### Reason

No conviene introducir una restricción de negocio no pedida si más adelante puede ser útil componer múltiples comportamientos sobre el mismo umbral.

### Impact

- una política podrá tener múltiples reglas con el mismo `offset`
- la validación backend no asumirá conflicto automático por repetición de umbral

## 2026-08-13

### Decision

La política de alerta tendrá metadata base administrable y `rules[]` se ordenará por `offset` antes de persistirse.

### Reason

Se quiere que la política sea una entidad administrable real y que backend mantenga un orden consistente de reglas sin depender del orden accidental en que lleguen desde UI.

### Impact

- la política tendrá como base:
  - `name`
  - `code`
  - `description`
  - `status`
  - `rules[]`
- `code` será autogenerado desde `name`
- el catálogo inicial de `status` será:
  - `ACTIVE`
  - `INACTIVE`
  - `DELETED`
- backend ordenará `rules[]` por `offset` antes de persistir

## 2026-08-13

### Decision

`alert-policies` tendrá CRUD completo desde `v1` y doble lectura para administración y selección.

### Reason

Si las políticas van a ser una capability administrable real, no conviene dejarlas con contratos parciales ni obligar a reutilizar un endpoint paginado para selects o relaciones simples.

### Impact

- se deberán definir al menos estos endpoints:
  - `GET /v1/alert-policies`
  - `GET /v1/alert-policies/:policyId`
  - `POST /v1/alert-policies`
  - `PATCH /v1/alert-policies/:policyId`
  - `DELETE /v1/alert-policies/:policyId`
- además deberá existir:
  - listado paginado administrativo
  - colección simple no paginada para selección reusable

## 2026-08-12

### Decision

El subflujo externo opcional usará semántica de `provider` y se mantendrá embebido dentro del registro en `v1`.

### Reason

Aunque el cliente habló inicialmente de `laboratorio`, el dominio real también puede involucrar talleres u otros terceros externos. `provider` deja la frontera mejor definida y más reusable.

### Impact

- se evita acoplar el modelo a `laboratory`
- el bloque opcional mínimo del registro deberá contemplar:
  - `sentToProvider`
  - `providerName`
  - `sentToProviderAt`
  - `providerLeadTime`
  - `providerNotes`
- `providerLeadTime` seguirá el mismo patrón estructurado por unidades
- no habrá catálogo maestro de providers en `v1`
