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

El registro tendrá `assetMaintenanceType` desde `v1`, tomado de catálogo en código.

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

El intervalo de vigencia se persistirá como estructura compuesta por unidades y backend también persistirá la `expiration_date` vigente.

### Reason

Negocio necesita intervalos flexibles y la UI debe poder reconstruir la configuración original del registro sin depender solo de una fecha derivada.

### Impact

- el modelo conservará la intención original del usuario
- se podrán soportar combinaciones como años, meses, semanas y días
- la entidad deberá contemplar un value object estructurado para el intervalo
- `expiration_date` seguirá existiendo como dato persistido de negocio

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

## 2026-08-13

### Decision

`GET /v1/alert-policies` devolverá un listado paginado administrativo resumido.

### Reason

Se necesita una respuesta apropiada para tabla de gestión, sin cargar detalle completo de cada política.

### Impact

- cada item incluirá al menos:
  - `id`
  - `name`
  - `code`
  - `status`
  - `rules_count`
  - `created_at`
  - `updated_at`
- el endpoint soportará:
  - paginación estándar
  - búsqueda por `name` o `code`
  - filtro por `status`

## 2026-08-13

### Decision

La colección simple no paginada de `alert-policies` devolverá un shape ligero orientado a selección.

### Reason

Su propósito principal será servir como fuente reusable para selects y asociaciones desde `internal-asset-maintenance-records` y futuros recursos.

### Impact

- cada item incluirá al menos:
  - `id`
  - `name`
  - `code`
  - `status`
- por defecto solo devolverá políticas `ACTIVE`

## 2026-08-13

### Decision

`GET /v1/alert-policies/:policyId` devolverá detalle completo de la política con reglas y grupos expandidos de forma ligera.

### Reason

Frontend necesitará mostrar y editar la política sin verse obligado a resolver aparte los grupos asociados a cada regla solo para renderizar el detalle.

### Impact

- el detalle incluirá al menos:
  - `id`
  - `name`
  - `code`
  - `description`
  - `status`
  - `rules[]`
  - `created_at`
  - `updated_at`
- cada regla incluirá al menos:
  - `offset`
  - `severityLabel`
  - `severityColorHex`
  - `recipient_groups`
- `recipient_groups` vendrá expandido de forma ligera

## 2026-08-13

### Decision

`POST`, `PATCH` y `DELETE` de `alert-policies` seguirán un modelo de edición completa sin permitir cambios manuales de `code` y con borrado lógico.

### Reason

Se quiere que la política sea administrable de punta a punta, pero preservando la estabilidad de su identificador técnico y evitando borrar físicamente información de negocio antes de tiempo.

### Impact

- `POST /v1/alert-policies` aceptará:
  - `name`
  - `description`
  - `status`
  - `rules[]`
- `PATCH /v1/alert-policies/:policyId` aceptará:
  - `name`
  - `description`
  - `status`
  - `rules[]`
- `code` no será editable
- `DELETE /v1/alert-policies/:policyId` será borrado lógico hacia `DELETED`

## 2026-08-13

### Decision

`GET /v1/internal-asset-maintenance-records` devolverá un listado paginado administrativo resumido con resumen de follow-up a provider.

### Reason

La vista administrativa necesita visibilidad operativa suficiente del registro y del subflujo de provider sin depender de consultas de detalle para cada fila.

### Impact

- cada item incluirá al menos:
  - `id`
  - `asset_name`
  - `asset_identifier`
  - `asset_maintenance_type`
  - `last_maintenance_at`
  - `expiration_date`
  - `status`
  - `derived_status`
  - `alert_policy`
  - `sent_to_provider`
  - `provider_name`
  - `provider_lead_time`
  - `provider_follow_up_enabled`
  - `provider_follow_up_rules_count`
  - `provider_follow_up_last_sent_at`
  - `created_at`
  - `updated_at`
- soportará:
  - paginación estándar
  - búsqueda por `asset_name` o `asset_identifier`
  - filtro por `asset_maintenance_type`
  - filtro por `status`
  - filtro por `alert_policy_id`
  - filtro por `sent_to_provider`

## 2026-08-13

### Decision

`GET /v1/internal-asset-maintenance-records/:recordId` devolverá detalle completo con relaciones ligeras y auditoría enriquecida.

### Reason

La pantalla de detalle/edición necesitará suficiente información para renderizar el registro completo, incluyendo follow-up a provider y trazabilidad de quién lo creó o actualizó, sin obligar a múltiples consultas adicionales.

### Impact

- el detalle incluirá al menos:
  - `id`
  - `asset_name`
  - `asset_identifier`
  - `asset_maintenance_type`
  - `last_maintenance_at`
  - `interval`
  - `expiration_date`
  - `observations`
  - `status`
  - `derived_status`
  - `alert_policy`
  - `provider`
  - `provider_follow_up`
  - `created_at`
  - `updated_at`
  - `created_by`
  - `updated_by`
- `alert_policy` vendrá expandida de forma ligera y opcional
- `provider_follow_up` vendrá con reglas configuradas y `recipient_groups` expandidos de forma ligera
- `created_by` y `updated_by` vendrán enriquecidos para presentación

## 2026-08-13

### Decision

`POST /v1/internal-asset-maintenance-records` permitirá creación completa del registro con sus bloques opcionales.

### Reason

Se quiere que el backend soporte desde `v1` la captura real del registro, incluyendo provider y follow-up cuando apliquen, sin obligar a pasos de creación fragmentados.

### Impact

- aceptará al menos:
  - `asset_name`
  - `asset_identifier`
  - `asset_maintenance_type`
  - `last_maintenance_at`
  - `interval`
  - `observations`
  - `status`
  - `alert_policy_id` opcional
  - `provider` opcional
  - `provider_follow_up` opcional
- backend derivará:
  - `expiration_date`
  - `derived_status` para UI

## 2026-08-13

### Decision

`PATCH /v1/internal-asset-maintenance-records/:recordId` permitirá edición completa del shape base del registro.

### Reason

No conviene fragmentar la edición del recurso si negocio necesita poder corregir o actualizar datos base, provider, follow-up y política desde un mismo flujo de edición.

### Impact

- permitirá editar al menos:
  - `asset_name`
  - `asset_identifier`
  - `asset_maintenance_type`
  - `last_maintenance_at`
  - `interval`
  - `observations`
  - `status`
  - `alert_policy_id` opcional
  - `provider` opcional
  - `provider_follow_up` opcional
- backend recalculará:
  - `expiration_date`
  - `derived_status` para UI

## 2026-08-13

### Decision

`DELETE /v1/internal-asset-maintenance-records/:recordId` será borrado lógico.

### Reason

No conviene eliminar físicamente registros de negocio que forman parte del historial operativo de activos internos.

### Impact

- el catálogo persistido de `status` del recurso incluirá:
  - `PENDING`
  - `IN_PROGRESS`
  - `COMPLETED`
  - `CANCELLED`
  - `DELETED`
- `DELETE` moverá el registro a `DELETED`
- `OVERDUE` seguirá siendo exclusivamente derivado para UI

## 2026-08-13

### Decision

El follow-up manual a provider se expondrá como acción explícita del recurso principal.

### Reason

Negocio necesita un botón que dispare una consulta inmediata de estatus al provider. Esa ejecución puntual no debe mezclarse con edición del registro ni con la configuración programable del follow-up.

### Impact

- existirá:
  - `POST /v1/internal-asset-maintenance-records/:recordId/provider-follow-up/send`
- esa acción usará la configuración vigente del subbloque `provider_follow_up`
- no creará un nuevo registro ni modificará `alert-policies`

## 2026-08-13

### Decision

`provider_follow_up` vivirá como subbloque opcional del registro con estado de activación, reglas propias y marca de último envío.

### Reason

El seguimiento programable al provider no representa una política global reutilizable ni conviene mezclarlo con `alert-policies`, porque responde a otra intención de negocio: preguntar por estatus al tercero externo.

### Impact

- `provider_follow_up` tendrá al menos:
  - `enabled`
  - `rules[]`
  - `last_sent_at`
- cada regla tendrá al menos:
  - `offset`
  - `recipient_group_ids`
  - `cc_recipient_group_ids` opcional
- `offset` reutilizará el mismo shape estructurado de duración aprobado para intervalos y alertas
- `recipient_group_ids` seguirá resolviendo canales desde `recipient-groups`
- el bloque será opcional dentro del registro principal

## 2026-08-13

### Decision

La fecha principal del registro se llamará `last_maintenance_at` y las fechas de negocio del módulo se tratarán como `date-only` bajo la referencia funcional `America/Mexico_City`.

### Reason

`performed_at` resultaba demasiado genérico para el dominio. Además, estas fechas representan días de negocio y no instantes con precisión horaria; si se tratan como timestamps puros puede aparecer el bug clásico de cambio de día por UTC.

### Impact

- `performed_at` se reemplaza por `last_maintenance_at`
- `last_maintenance_at` representa la fecha de la última calibración, verificación, mantenimiento u otra atención registrada
- `last_maintenance_at` y `expiration_date` deben entenderse como campos `date-only`
- la referencia funcional del módulo queda fijada en `America/Mexico_City`
- cualquier evaluación futura de alertas o procesos diarios deberá calcular `today` con esa misma zona horaria

## 2026-08-13

### Decision

`expiration_date` será autocalculada por defecto, pero editable por negocio.

### Reason

El intervalo funciona como referencia operativa, pero en la práctica el siguiente servicio puede retrasarse o ajustarse manualmente. Negocio necesita que el sistema ayude calculando la fecha automáticamente, sin perder la posibilidad de corregirla.

### Impact

- en `POST` y `PATCH`, backend podrá recibir `expiration_date`
- si `expiration_date` no llega, backend la calculará a partir de:
  - `last_maintenance_at`
  - `interval`
- frontend podrá precalcularla para UX, pero backend seguirá siendo la fuente de verdad
- el intervalo estructurado se sigue persistiendo aunque `expiration_date` sea editable
- la lógica de semáforo y `OVERDUE` se evaluará contra la `expiration_date` persistida vigente

## 2026-08-13

### Decision

Todas las transiciones entre `PENDING`, `IN_PROGRESS`, `COMPLETED` y `CANCELLED` serán manuales en `v1`.

### Reason

El módulo nace como control operativo flexible y negocio todavía está explorando el flujo real. Endurecer un workflow rígido desde ahora generaría fricción innecesaria y futuras excepciones.

### Impact

- backend no cambiará automáticamente `status` por fecha, semáforo, vencimiento ni follow-up
- cualquier cambio entre:
  - `PENDING`
  - `IN_PROGRESS`
  - `COMPLETED`
  - `CANCELLED`
  dependerá de una acción manual del usuario
- `DELETED` solo podrá alcanzarse mediante borrado lógico
- `COMPLETED` y `CANCELLED` excluyen semáforo y `OVERDUE`

## 2026-08-13

### Decision

El semáforo y `OVERDUE` se derivarán exclusivamente contra la `expiration_date` persistida vigente, usando `today` en `America/Mexico_City`.

### Reason

Se necesitaba una regla única y predecible para saber cuándo un registro entra a alertamiento preventivo y cuándo pasa a vencido, sin mezclar eso con el `status` persistido.

### Impact

- `OVERDUE` aplica cuando:
  - `status` es `PENDING` o `IN_PROGRESS`
  - `expiration_date` es menor que `today`
- `OVERDUE` domina visualmente sobre cualquier severidad de política
- el semáforo solo se evalúa cuando:
  - `status` es `PENDING` o `IN_PROGRESS`
  - el registro no cayó en `OVERDUE`
- una regla de `alert_policy` aplica cuando:
  - `today >= expiration_date - offset`
- si varias reglas aplican, gana la más cercana al vencimiento
- si ninguna regla aplica, no hay semáforo activo
- `COMPLETED` y `CANCELLED` no muestran semáforo ni `OVERDUE`
