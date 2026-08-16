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

Se necesitaba separar el nombre visible del módulo del nombre técnico del recurso histórico para no colisionar con `services` ni con un posible futuro catálogo maestro de activos.

### Impact

- el módulo conserva semántica de negocio estable
- el recurso principal queda explícitamente histórico
- queda margen para un futuro dominio más amplio de `internal-assets`

## 2026-08-12

### Decision

Cada `internal-asset-maintenance-record` será histórico y el mismo activo podrá aparecer en múltiples registros.

### Reason

Negocio confirmó que cada fila documenta una calibración, verificación, mantenimiento u otra atención concreta realizada o requerida sobre un activo, y que ese mismo activo puede volver a aparecer en el tiempo.

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

- se evita amarrar el modelo a calibración
- el backend podrá tipificar reglas y presentación desde el inicio
- el catálogo inicial deberá contemplar al menos:
  - `CALIBRATION`
  - `VERIFICATION`
  - `PREVENTIVE_MAINTENANCE`
  - `OTHER`

## 2026-08-12

### Decision

El semáforo por vencimiento vivirá separado del `status` operativo del registro.

### Reason

El semáforo responde a cercanía de vencimiento, mientras el `status` refleja el estado real del trabajo pendiente, en proceso o terminado.

### Impact

- el modelo no mezclará alertamiento preventivo con workflow operativo
- la UI podrá mostrar ambas lecturas sin ambigüedad

## 2026-08-12

### Decision

`status` persistidos iniciales:

- `PENDING`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`
- `DELETED`

`OVERDUE` será derivado para UI y no se persistirá automáticamente en `v1`.

### Reason

Se quiere evitar complejidad temprana con jobs o procesos automáticos que muten datos persistidos por paso del tiempo.

### Impact

- el usuario conserva control sobre el `status` persistido
- el sistema puede mostrar `OVERDUE` visualmente cuando corresponda
- backend no necesitará automatizar escrituras para reflejar vencimiento

## 2026-08-13

### Decision

Todas las transiciones entre `PENDING`, `IN_PROGRESS`, `COMPLETED` y `CANCELLED` serán manuales en `v1`.

### Reason

El módulo nace como control operativo flexible y negocio todavía está explorando el flujo real. Endurecer un workflow rígido desde ahora generaría fricción innecesaria.

### Impact

- backend no cambiará automáticamente `status` por fecha, semáforo, vencimiento ni follow-up
- `DELETED` solo podrá alcanzarse mediante borrado lógico
- `COMPLETED` y `CANCELLED` excluyen semáforo y `OVERDUE`

## 2026-08-13

### Decision

La fecha principal del registro se llamará `last_maintenance_at` y las fechas de negocio del módulo se tratarán como `date-only` bajo la referencia funcional `America/Mexico_City`.

### Reason

Estas fechas representan días de negocio y no instantes con precisión horaria; si se tratan como timestamps puros puede aparecer el bug clásico de cambio de día por UTC.

### Impact

- `last_maintenance_at` y `expiration_date` deben entenderse como campos `date-only`
- cualquier evaluación futura de alertas o procesos diarios deberá calcular `today` con esa misma zona horaria

## 2026-08-13

### Decision

El intervalo de vigencia se persistirá como estructura compuesta por unidades y backend también persistirá la `expiration_date` vigente.

### Reason

Negocio necesita intervalos flexibles y la UI debe poder reconstruir la configuración original del registro sin depender solo de una fecha derivada.

### Impact

- el modelo conservará la intención original del usuario
- se podrán soportar combinaciones como años, meses, semanas y días
- la entidad deberá contemplar un value object estructurado para el intervalo

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
- la lógica de semáforo y `OVERDUE` se evaluará contra la `expiration_date` persistida vigente

## 2026-08-13

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
- no habrá catálogo maestro de providers en `v1`

## 2026-08-14

### Decision

Existirán dos entidades separadas y reutilizables desde `v1`:

- `expiration-status-policy`
- `expiration-notification-policy`

### Reason

Se descartó mantener una sola política genérica de alertamiento porque mezclaba dos preocupaciones distintas:

- el estado preventivo o semáforo visual del vencimiento
- la programación de notificaciones antes o después del vencimiento

Además, backend no debe usar `visual` como concepto central de dominio, pero sí necesita modelar una política reutilizable de estados por expiración.

### Impact

- desaparece el enfoque genérico previo de una sola política de alertamiento
- cada `internal-asset-maintenance-record` podrá referenciar:
  - `expiration_status_policy_id` opcional
  - `expiration_notification_policy_id` opcional
- el semáforo y las notificaciones evolucionan de forma independiente
- `provider_follow_up` permanece como subbloque separado

## 2026-08-14

### Decision

`expiration-status-policy` será una capability administrable reusable desde `v1`.

### Reason

La lectura preventiva del vencimiento debe poder reutilizarse entre múltiples registros y más adelante entre otros módulos, sin quedar hardcodeada dentro del recurso principal.

### Impact

- la política tendrá como base:
  - `name`
  - `code` autogenerado desde `name`
  - `description` opcional
  - `status`
  - `rules[]`
- catálogo inicial de `status`:
  - `ACTIVE`
  - `INACTIVE`
  - `DELETED`
- cada regla tendrá al menos:
  - `start_offset`
  - `label`
  - `color_hex`
- no existirá prioridad manual configurable
- `rules[]` se ordenará por cercanía al vencimiento antes de persistirse

## 2026-08-14

### Decision

`expiration-notification-policy` será una capability administrable reusable desde `v1`.

### Reason

Negocio ya identificó casos donde una notificación no debe dispararse solo una vez al entrar a un umbral, sino repetirse diaria o semanalmente antes o después del vencimiento.

### Impact

- la política tendrá como base:
  - `name`
  - `code` autogenerado desde `name`
  - `description` opcional
  - `status`
  - `rules[]`
- catálogo inicial de `status`:
  - `ACTIVE`
  - `INACTIVE`
  - `DELETED`
- cada regla tendrá al menos:
  - `anchor`
  - `start_offset`
  - `trigger_mode`
  - `recipient_group_ids[]`
- `recipient_group_ids[]` no será obligatorio
- si `trigger_mode = RECURRING`, podrá definir:
  - `repeat_every`
  - `repeat_until`
  - `repeat_for` opcional cuando `repeat_until = FIXED_DURATION`
- `anchor` podrá ser:
  - `BEFORE_EXPIRATION`
  - `AFTER_EXPIRATION`
- `trigger_mode` podrá ser:
  - `ONE_TIME`
  - `RECURRING`
- `repeat_until` podrá ser:
  - `EXPIRATION_DATE`
  - `STATUS_CHANGES`
  - `FIXED_DURATION`

## 2026-08-14

### Decision

`start_offset`, `repeat_every`, `repeat_for` y `provider_follow_up.rules[].offset` reutilizarán exactamente el mismo shape estructurado del intervalo de vigencia.

### Reason

No conviene introducir varios formatos diferentes para duraciones dentro del mismo dominio si todos representan composiciones de años, meses, semanas y días.

### Impact

- backend reutiliza una sola convención de duración estructurada
- UI no necesitará aprender formatos distintos
- las reglas podrán expresar offsets complejos sin texto libre

## 2026-08-14

### Decision

No se forzará unicidad de umbral dentro de ninguna política de expiración.

### Reason

No conviene introducir una restricción de negocio no pedida si más adelante puede ser útil componer múltiples comportamientos sobre el mismo umbral.

### Impact

- una política podrá tener múltiples reglas con el mismo umbral
- la validación backend no asumirá conflicto automático por repetición de offset

## 2026-08-14

### Decision

`expiration-status-policy` tendrá CRUD completo desde `v1` y doble lectura para administración y selección.

### Reason

Si será una capability administrable real, no conviene dejarla con contratos parciales ni obligar a reutilizar un endpoint paginado para selects.

### Impact

- existirán al menos:
  - `GET /v1/expiration-status-policies`
  - `GET /v1/expiration-status-policies/:policyId`
  - `POST /v1/expiration-status-policies`
  - `PATCH /v1/expiration-status-policies/:policyId`
  - `DELETE /v1/expiration-status-policies/:policyId`
  - `GET /v1/expiration-status-policies/options`
- tendrá:
  - listado paginado administrativo
  - colección simple no paginada para selección reusable

## 2026-08-14

### Decision

`expiration-notification-policy` tendrá CRUD completo desde `v1` y doble lectura para administración y selección.

### Reason

Su propósito reusable exige contratos completos y diferenciados para gestión administrativa y asociación ligera desde otros recursos.

### Impact

- existirán al menos:
  - `GET /v1/expiration-notification-policies`
  - `GET /v1/expiration-notification-policies/:policyId`
  - `POST /v1/expiration-notification-policies`
  - `PATCH /v1/expiration-notification-policies/:policyId`
  - `DELETE /v1/expiration-notification-policies/:policyId`
  - `GET /v1/expiration-notification-policies/options`
- tendrá:
  - listado paginado administrativo
  - colección simple no paginada para selección reusable

## 2026-08-14

### Decision

El shape paginado administrativo de ambas políticas incluirá al menos:

- `id`
- `name`
- `code`
- `status`
- `rules_count`
- `created_at`
- `updated_at`

La colección simple no paginada incluirá al menos:

- `id`
- `name`
- `code`
- `status`

Por defecto devolverá solo políticas `ACTIVE`.

### Reason

Se necesita una respuesta apropiada para tabla de gestión y otra ligera para selects y asociaciones simples.

### Impact

- frontend podrá filtrar y buscar sin cargar detalle completo
- otros módulos futuros podrán reutilizar un lookup liviano y estable

## 2026-08-14

### Decision

El detalle de `expiration-status-policy` devolverá la política completa con sus reglas.

### Reason

Frontend necesitará mostrar y editar la política sin recomponer el shape desde múltiples consultas.

### Impact

- `GET /v1/expiration-status-policies/:policyId` devolverá al menos:
  - `id`
  - `name`
  - `code`
  - `description`
  - `status`
  - `rules[]`
  - `created_at`
  - `updated_at`
- cada regla incluirá al menos:
  - `start_offset`
  - `label`
  - `color_hex`

## 2026-08-14

### Decision

El detalle de `expiration-notification-policy` devolverá la política completa con sus reglas y `recipient_groups` expandidos de forma ligera.

### Reason

Frontend necesitará mostrar y editar la política sin resolver aparte los grupos asociados a cada regla solo para renderizar el detalle.

### Impact

- `GET /v1/expiration-notification-policies/:policyId` devolverá al menos:
  - `id`
  - `name`
  - `code`
  - `description`
  - `status`
  - `rules[]`
  - `created_at`
  - `updated_at`
- cada regla incluirá al menos:
  - `anchor`
  - `start_offset`
  - `trigger_mode`
  - `repeat_every`
  - `repeat_until`
  - `repeat_for`
  - `recipient_groups`

## 2026-08-14

### Decision

`POST`, `PATCH` y `DELETE` de ambas políticas seguirán edición completa, `code` no editable y borrado lógico.

### Reason

Se quiere administrar ambas capabilities de punta a punta, preservando la estabilidad del identificador técnico y evitando borrar físicamente información de negocio antes de tiempo.

### Impact

- `POST` y `PATCH` aceptarán:
  - `name`
  - `description`
  - `status`
  - `rules[]`
- `code` no será editable
- `DELETE` moverá la política a `DELETED`

## 2026-08-14

### Decision

`expiration_status_materialization` tendrá un shape mínimo orientado a render, sorting y trazabilidad de la regla aplicada.

### Reason

Frontend y futuros consumidores necesitan suficiente información para mostrar el semáforo efectivo sin recalcular la policy completa, pero no conviene duplicar dentro del record todo el shape de la policy reusable.

### Impact

- backend podrá exponer dentro del detalle o respuestas enriquecidas:
  - `expiration_status_materialization`
- ese bloque incluirá al menos:
  - `effective_start_date`
  - `label`
  - `color_hex`
  - `matched_rule`
- `matched_rule` será una proyección ligera y no el shape completo persistido de la policy
- `matched_rule` incluirá al menos:
  - `source_rule_id`
  - `start_offset`
- no se devolverá la policy completa dentro de `expiration_status_materialization`

## 2026-08-14

### Decision

`expiration_status_materialization.matched_rule` también conservará `source_rule_id` para mantener simetría con notificaciones.

### Reason

No conviene tener dos criterios distintos de trazabilidad entre el lado de status y el lado de notificaciones si ambos nacen de reglas reusables dentro de policies.

### Impact

- `matched_rule` dentro de `expiration_status_materialization` incluirá:
  - `source_rule_id`
  - `start_offset`
- backend podrá trazar con exactitud qué regla de `expiration-status-policy` produjo el estado visual efectivo
- se mantiene consistencia entre:
  - `expiration_status_materialization.matched_rule.source_rule_id`
  - `expiration_notification_materialization.materialized_rules[].source_rule_id`

## 2026-08-14

### Decision

`expiration_status_materialization` usará un contrato uniforme tanto para estados visuales derivados del sistema como para reglas provenientes de `expiration-status-policy`.

### Reason

Frontend no debería tener que renderizar dos shapes distintos dependiendo de si el estado visual viene de una regla reusable o de una regla implícita del sistema.

### Impact

- `expiration_status_materialization` incluirá al menos:
  - `source`
  - `code`
  - `label`
  - `label_key`
  - `color_hex`
  - `effective_start_date` opcional
  - `matched_rule` opcional
- `source` podrá ser:
  - `SYSTEM`
  - `POLICY`
- cuando `source = POLICY`:
  - `code` vendrá de la regla o de su proyección efectiva
  - `matched_rule` vendrá informada
  - `effective_start_date` podrá venir informada
- cuando `source = SYSTEM`:
  - `code` vendrá de un catálogo neutral del sistema
  - `matched_rule` vendrá `null`
  - `effective_start_date` podrá venir `null`
- `label` y `label_key` deberán venir listos para localización backend en inglés y español

## 2026-08-14

### Decision

Existirán estados visuales derivados del sistema para cubrir los casos fuera de umbrales configurados y los cierres operativos del registro.

### Reason

Si no se define un comportamiento del sistema, un registro podría quedar sin lectura visual útil antes del primer umbral o después de cambiar a un estado operativo terminal.

### Impact

- cuando `status` sea `PENDING` o `IN_PROGRESS`:
  - si no está en `OVERDUE`
  - y todavía no entra a ninguna regla de `expiration-status-policy`
  - backend devolverá un estado visual derivado del sistema:
    - `code`: `ON_TIME`
    - `label`: `En tiempo`
- cuando `status` sea `COMPLETED`:
  - backend devolverá un estado visual derivado del sistema:
    - `code`: `COMPLETED`
    - `label`: `Completado`
- cuando `status` sea `CANCELLED`:
  - backend devolverá un estado visual derivado del sistema:
    - `code`: `CANCELLED`
    - `label`: `Cancelado`
- `OVERDUE` seguirá siendo un estado visual derivado del sistema con:
  - `code`: `OVERDUE`
  y mayor dominancia que cualquier regla de policy
- `expiration-status-policy` solo participa en la franja preventiva entre:
  - `En tiempo`
  - `OVERDUE`
- estos estados del sistema deberán tener:
  - código neutral estable
  - `label`
  - `label_key`
  localizados en backend al menos para español e inglés

## 2026-08-14

### Decision

Los estados visuales derivados del sistema tendrán `color_hex` fijo definido desde spec.

### Reason

No conviene dejar estos colores a interpretación de implementación porque forman parte de la semántica visual base del módulo y deben mantenerse consistentes entre backend y frontend.

### Impact

- los colores del sistema quedarán fijados así:
  - `ON_TIME`
    - `color_hex`: `#22C55E`
  - `OVERDUE`
    - `color_hex`: `#EF4444`
  - `COMPLETED`
    - `color_hex`: `#2563EB`
  - `CANCELLED`
    - `color_hex`: `#6B7280`
- backend deberá devolver esos `color_hex` cuando el estado visual efectivo provenga del sistema
- frontend no tendrá que inferir ni remapear estos colores

## 2026-08-14

### Decision

`provider_follow_up` vivirá como subbloque opcional del registro con estado de activación, reglas propias y marca de último envío.

### Reason

El seguimiento programable al provider no representa una política global reutilizable ni conviene mezclarlo con las políticas de expiración, porque responde a otra intención de negocio: preguntar por estatus al tercero externo.

### Impact

- `provider_follow_up` tendrá al menos:
  - `enabled`
  - `rules[]`
  - `last_sent_at`
- cada regla tendrá al menos:
  - `offset`
  - `recipient_group_ids`
  - `cc_recipient_group_ids` opcional
- a diferencia de `expiration-notification-policy`, `provider_follow_up` mantiene `offset` simple en `v1`
- el bloque será opcional dentro del registro principal

## 2026-08-14

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
  - `expiration_status_policy`
  - `expiration_notification_policy`
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
  - filtro por `expiration_status_policy_id`
  - filtro por `expiration_notification_policy_id`
  - filtro por `sent_to_provider`

## 2026-08-14

### Decision

`GET /v1/internal-asset-maintenance-records/:recordId` devolverá detalle completo con relaciones ligeras y auditoría enriquecida.

### Reason

La pantalla de detalle/edición necesitará suficiente información para renderizar el registro completo, incluyendo follow-up a provider y trazabilidad de quién lo creó o actualizó.

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
  - `expiration_status_policy`
  - `expiration_notification_policy`
  - `provider`
  - `provider_follow_up`
  - `created_at`
  - `updated_at`
  - `created_by`
  - `updated_by`
- `expiration_status_policy` vendrá expandida de forma ligera y opcional
- `expiration_notification_policy` vendrá expandida de forma ligera y opcional
- `provider_follow_up` vendrá con reglas configuradas y `recipient_groups` expandidos de forma ligera

## 2026-08-14

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
  - `expiration_date` opcional
  - `observations`
  - `status`
  - `expiration_status_policy_id` opcional
  - `expiration_notification_policy_id` opcional
  - `provider` opcional
  - `provider_follow_up` opcional
- backend derivará:
  - `derived_status` para UI

## 2026-08-14

### Decision

`PATCH /v1/internal-asset-maintenance-records/:recordId` permitirá edición completa del shape base del registro.

### Reason

No conviene fragmentar la edición del recurso si negocio necesita poder corregir o actualizar datos base, provider, follow-up y políticas desde un mismo flujo.

### Impact

- permitirá editar al menos:
  - `asset_name`
  - `asset_identifier`
  - `asset_maintenance_type`
  - `last_maintenance_at`
  - `interval`
  - `expiration_date` opcional
  - `observations`
  - `status`
  - `expiration_status_policy_id` opcional
  - `expiration_notification_policy_id` opcional
  - `provider` opcional
  - `provider_follow_up` opcional
- backend recalculará o validará `expiration_date` cuando corresponda

## 2026-08-14

### Decision

`DELETE /v1/internal-asset-maintenance-records/:recordId` será borrado lógico.

### Reason

No conviene eliminar físicamente registros de negocio que forman parte del historial operativo de activos internos.

### Impact

- `DELETE` moverá el registro a `DELETED`
- `OVERDUE` seguirá siendo exclusivamente derivado para UI

## 2026-08-14

### Decision

La acción manual de follow-up a provider se expondrá como endpoint explícito del recurso principal.

### Reason

Negocio necesita un botón que dispare una consulta inmediata de estatus al provider. Esa ejecución puntual no debe mezclarse con edición del registro ni con la configuración programable del follow-up.

### Impact

- existirá:
  - `POST /v1/internal-asset-maintenance-records/:recordId/provider-follow-up/send`
- esa acción usará la configuración vigente del subbloque `provider_follow_up`
- no creará un nuevo registro ni modificará políticas de expiración

## 2026-08-14

### Decision

El semáforo y `OVERDUE` se derivarán exclusivamente contra la `expiration_date` persistida vigente, usando `today` en `America/Mexico_City`.

### Reason

Se necesitaba una regla única y predecible para saber cuándo un registro entra a alertamiento preventivo y cuándo pasa a vencido, sin mezclar eso con el `status` persistido.

### Impact

- `OVERDUE` aplica cuando:
  - `status` es `PENDING` o `IN_PROGRESS`
  - `expiration_date` es menor que `today`
- `OVERDUE` domina visualmente sobre cualquier regla de `expiration-status-policy`
- el semáforo solo se evalúa cuando:
  - `status` es `PENDING` o `IN_PROGRESS`
  - el registro no cayó en `OVERDUE`
- una regla de `expiration-status-policy` aplica cuando:
  - `today >= expiration_date - start_offset`
- si varias reglas aplican, gana la más cercana al vencimiento
- si ninguna regla aplica, no hay semáforo activo

## 2026-08-14

### Decision

Las fechas absolutas derivadas de las reglas de expiración vivirán en materializaciones técnicas persistidas por registro y no dentro de la policy abstracta.

### Reason

`start_offset` es una configuración relativa. Solo adquiere una fecha absoluta cuando se materializa contra la `expiration_date` de un `internal-asset-maintenance-record` concreto.

### Impact

- `start_offset` sigue siendo la fuente de verdad en:
  - `expiration-status-policy`
  - `expiration-notification-policy`
- backend podrá persistir por registro materializaciones técnicas con fechas absolutas derivadas
- para status por vencimiento se usará:
  - `expiration_status_materialization.effective_start_date`
- para notificaciones por vencimiento se usará:
  - `expiration_notification_materialization.next_trigger_date`
- esas fechas derivadas sirven para:
  - evaluación runtime
  - sorting
  - filtros
  - futuros procesos automáticos de notificación
- esas fechas no se modelan como parte persistida de la policy reusable

## 2026-08-14

### Decision

`expiration_notification_materialization` materializará eventos de disparo por regla y no se limitará a persistir solo `next_trigger_date`.

### Reason

El dato verdaderamente útil para ejecución barata de procesos diarios, trazabilidad y evitación de recálculo no es únicamente la siguiente fecha, sino el conjunto de eventos materializados por regla que ya deben considerarse procesables según la configuración vigente.

### Impact

- `next_trigger_date` seguirá existiendo como resumen útil
- pero la base operativa real será:
  - `expiration_notification_materialization.materialized_rules[]`
- `expiration_notification_materialization` también conservará:
  - `last_triggered_at`
  - `last_materialized_at`
- cada regla materializada incluirá al menos:
  - referencia estable a la regla fuente
  - `anchor`
  - `start_offset`
  - `trigger_mode`
  - `repeat_every`
  - `repeat_until`
  - `repeat_for`
  - `trigger_events[]`
- `trigger_events[]` contendrá las fechas absolutas derivadas para esa regla en el contexto del registro junto con su estado de procesamiento
- el mecanismo diario no dependerá de recalcular reglas completas por fila
- `next_trigger_date` se podrá derivar desde el conjunto materializado de `trigger_events[]`

## 2026-08-14

### Decision

`expiration_notification_materialization` conservará `last_triggered_at`.

### Reason

Se necesita trazabilidad operativa sobre el último disparo efectivo de notificación y una referencia simple para procesos diarios, auditoría y depuración.

### Impact

- `expiration_notification_materialization` incluirá:
  - `last_triggered_at`
- `last_triggered_at` representará el último disparo efectivo procesado para ese record en el contexto de la policy vigente
- este campo no sustituye a `trigger_events[]`
- este campo complementa:
  - `next_trigger_date`
  - `materialized_rules[]`

## 2026-08-14

### Decision

Cada item de `expiration_notification_materialization.materialized_rules[]` también conservará su propio `last_triggered_at`.

### Reason

Una policy puede tener múltiples reglas con calendarios distintos. Un único `last_triggered_at` global del record no basta para trazar qué regla disparó por última vez ni para soportar correctamente reprocesos o diagnósticos por regla.

### Impact

- seguirá existiendo:
  - `expiration_notification_materialization.last_triggered_at`
  como resumen global del record
- además, cada item de `materialized_rules[]` incluirá:
  - `last_triggered_at`
- el `last_triggered_at` por regla representará el último disparo efectivo procesado para esa regla materializada
- esto mejora:
  - trazabilidad por regla
  - depuración
  - soporte futuro para reprocesos más finos

## 2026-08-14

### Decision

Las materializaciones de expiración conservarán `last_materialized_at`.

### Reason

Se necesita trazabilidad simple para saber cuándo backend recalculó por última vez la materialización persistida del record.

### Impact

- `expiration_status_materialization` incluirá:
  - `last_materialized_at`
- `expiration_notification_materialization` incluirá:
  - `last_materialized_at`
- `last_materialized_at` representará la fecha-hora del último recálculo persistido de esa materialización
- este campo facilita:
  - auditoría técnica
  - depuración
  - validación operativa de recálculos

## 2026-08-14

### Decision

Cada regla materializada dentro de `expiration_notification_materialization.materialized_rules[]` conservará una referencia estable hacia su regla fuente en la policy.

### Reason

Se necesita trazabilidad para saber de qué regla reusable provino cada conjunto de eventos materializados, facilitar depuración, auditoría y futuros reprocesos sin depender del orden accidental del array.

### Impact

- cada item de `materialized_rules[]` incluirá una referencia estable a la regla fuente
- esa referencia se resolverá con un `rule_id` técnico del rule item dentro de la policy
- no se dependerá solo de la posición del array para relacionar:
  - regla reusable
  - regla materializada
  - `trigger_events[]`
- backend podrá reconstruir con claridad qué materialización debe actualizar o invalidar cuando cambie una regla específica

## 2026-08-14

### Decision

La referencia estable a la regla fuente se modelará como `rule_id` técnico por regla dentro de la policy.

### Reason

No conviene depender de índices de array ni de nombres editables para enlazar reglas reusables con reglas materializadas.

### Impact

- cada regla dentro de:
  - `expiration-status-policy.rules[]`
  - `expiration-notification-policy.rules[]`
  tendrá `rule_id`
- cada item de `expiration_notification_materialization.materialized_rules[]` apuntará a ese `rule_id`
- si en el futuro hace falta materializar también referencias finas del lado de status, se reutilizará el mismo criterio

## 2026-08-14

### Decision

`trigger_events[]` materializará todos los disparos aplicables de la regla dentro del horizonte permitido, y las reglas recurrentes tendrán un límite explícito de repeticiones.

### Reason

Para ejecución barata, trazabilidad y consultas eficientes, la materialización debe representar realmente el calendario operativo de la regla. Sin embargo, en reglas recurrentes abiertas no conviene permitir crecimiento ilimitado del arreglo.

### Impact

- para reglas `ONE_TIME`, `trigger_events[]` contendrá todos los disparos aplicables, que normalmente será uno solo
- para reglas `RECURRING`, `trigger_events[]` contendrá todos los disparos aplicables dentro del límite permitido
- el sistema deberá imponer un límite explícito de repeticiones para reglas recurrentes
- el límite aprobado en `v1` será de:
  - `10` repeticiones materializadas por regla recurrente
- ese límite existe como frontera de diseño para evitar crecimiento descontrolado de materializaciones
- `next_trigger_date` seguirá derivándose del conjunto materializado resultante

## 2026-08-15

### Decision

Los disparos materializados de notificación se modelarán como `trigger_events[]` y no como un arreglo plano de fechas.

### Reason

Para operación real no basta con saber qué fechas existen; también se necesita saber si cada disparo está pendiente, ya se procesó o falló.

### Impact

- dentro de cada item de `expiration_notification_materialization.materialized_rules[]` existirá:
  - `trigger_events[]`
- cada `trigger_event` incluirá al menos:
  - `trigger_date`
  - `status`
  - `triggered_at`
  - `failure_reason`
- el catálogo inicial de `status` por `trigger_event` será:
  - `PENDING`
  - `TRIGGERED`
  - `FAILED`
- `triggered_at` será `null` mientras el evento no se haya disparado exitosamente
- `failure_reason` será `null` cuando no exista fallo
- `next_trigger_date` seguirá existiendo como resumen útil derivado del conjunto de `trigger_events[]`

## 2026-08-16

### Decision

Los `trigger_events[]` de cada regla materializada se persistirán ordenados ascendentemente por `trigger_date`.

### Reason

No conviene depender de orden accidental del cálculo o del almacenamiento. Un orden estable simplifica lectura, depuración, derivación de `next_trigger_date` y procesamiento del mecanismo diario.

### Impact

- dentro de cada item de `expiration_notification_materialization.materialized_rules[]`
  - `trigger_events[]` se persistirá ordenado de la fecha más antigua a la más futura
- `next_trigger_date` podrá resolverse tomando el primer `trigger_event` elegible en ese orden
- frontend y procesos internos no tendrán que reordenar para consumo básico

## 2026-08-15

### Decision

En `v1` no existirán reintentos automáticos para `trigger_events` en estado `FAILED`.

### Reason

El presupuesto actual no justifica introducir todavía la complejidad de reintentos automáticos, políticas de backoff, contadores de intento o recuperación diferida.

### Impact

- el catálogo inicial de estados por `trigger_event` se mantiene en:
  - `PENDING`
  - `TRIGGERED`
  - `FAILED`
- cuando un `trigger_event` falle:
  - permanecerá en `FAILED`
  - conservará su `failure_reason`
- `v1` no implementará:
  - reintentos automáticos
  - backoff
  - creación automática de nuevos eventos de reintento
- cualquier tratamiento posterior de eventos fallidos quedará fuera del alcance actual y requerirá una spec futura

## 2026-08-15

### Decision

El mecanismo diario de notificaciones procesará todos los `trigger_events` pendientes cuyo `trigger_date` sea menor o igual a `today` en `America/Mexico_City`.

### Reason

No conviene depender de que el proceso corra exactamente el día previsto para no perder disparos válidos. También se necesita absorber eventos atrasados sin recalcular rules completas.

### Impact

- el proceso diario filtrará eventos con:
  - `status = PENDING`
  - `trigger_date <= today`
- esto incluye:
  - eventos del día actual
  - eventos atrasados no procesados
- cuando el disparo sea exitoso:
  - `status = TRIGGERED`
  - `triggered_at` se informará
- cuando el disparo falle:
  - `status = FAILED`
  - `failure_reason` se informará
- en una misma corrida, el proceso deberá intentar todos los `PENDING <= today`
- `v1` no limitará la corrida al evento más antiguo por record

## 2026-08-15

### Decision

Si un `internal-asset-maintenance-record` cambia a `COMPLETED`, `CANCELLED` o `DELETED`, los `trigger_events` pendientes de expiración se invalidarán.

### Reason

Una vez que el registro deja de requerir seguimiento operativo por vencimiento, no tiene sentido conservar disparos pendientes para notificaciones futuras de expiración.

### Impact

- cuando el record pase a:
  - `COMPLETED`
  - `CANCELLED`
  - `DELETED`
  backend invalidará los `trigger_events` que sigan en estado `PENDING`
- esos eventos invalidados ya no deberán ser elegibles para el mecanismo diario
- esta invalidación aplica al ámbito de `expiration_notification_materialization`
- no afecta eventos ya:
  - `TRIGGERED`
  - `FAILED`

## 2026-08-15

### Decision

La invalidación de `trigger_events` se modelará con un `status` explícito y no mediante borrado del evento materializado.

### Reason

Se necesita conservar trazabilidad y además contemplar que el record pueda volver después a `PENDING` o `IN_PROGRESS`, caso en el cual la materialización deberá regenerarse sin perder historia de eventos previamente invalidados.

### Impact

- el catálogo inicial de `status` por `trigger_event` se amplía a:
  - `PENDING`
  - `TRIGGERED`
  - `FAILED`
  - `INVALIDATED`
- cuando un record pase a:
  - `COMPLETED`
  - `CANCELLED`
  - `DELETED`
  los `trigger_events` en `PENDING` pasarán a `INVALIDATED`
- `INVALIDATED` no será elegible para el mecanismo diario
- los eventos materializados no se borrarán solo por invalidación
- si el record vuelve después a:
  - `PENDING`
  - `IN_PROGRESS`
  backend recalculará `expiration_notification_materialization` y regenerará los eventos aplicables según la policy vigente

## 2026-08-14

### Decision

Las materializaciones de expiración se recalcularán cada vez que cambie cualquiera de sus inputs efectivos, tanto en el record como en las policies asociadas.

### Reason

No conviene permitir drift entre:

- los datos fuente del record
- las policies reusables
- las materializaciones técnicas persistidas

Si cambian los inputs y no se recalcula, los listados, filtros, conteos y procesos diarios se volverían inconsistentes.

### Impact

- al crear un `internal-asset-maintenance-record`, backend recalculará:
  - `expiration_status_materialization`
  - `expiration_notification_materialization`
- al editar un record, backend recalculará esas materializaciones si cambia cualquiera de estos campos:
  - `last_maintenance_at`
  - `interval`
  - `expiration_date`
  - `status`
  - `expiration_status_policy_id`
  - `expiration_notification_policy_id`
- eso incluye explícitamente:
  - asignar una nueva `expiration-status-policy`
  - desasignar la `expiration-status-policy` vigente
  - asignar una nueva `expiration-notification-policy`
  - desasignar la `expiration-notification-policy` vigente
- cambios en `provider` o `provider_follow_up` no recalculan materializaciones de expiración, salvo que en el futuro exista una dependencia explícita
- al editar una `expiration-status-policy`, backend recalculará `expiration_status_materialization` de todos los records que la usen
- al editar una `expiration-notification-policy`, backend recalculará `expiration_notification_materialization` de todos los records que la usen
- al inactivar o borrar lógicamente cualquiera de esas policies, backend también recalculará los records afectados
- en `v1`, el criterio de negocio queda cerrado aunque la estrategia técnica de ejecución pueda ser:
  - inmediata
  - o diferida
  según el volumen de records afectados
