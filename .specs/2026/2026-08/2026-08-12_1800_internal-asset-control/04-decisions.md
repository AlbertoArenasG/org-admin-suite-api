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
