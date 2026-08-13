# Definition

## Purpose

Esta iniciativa existe para diseñar en backend el módulo `internal-asset-control`, orientado a dar visibilidad compartida sobre qué acciones necesitan recibir los activos internos de la empresa y cuándo deben realizarse.

El objetivo no es modelar todavía un catálogo maestro de activos internos, sino un historial operativo de registros asociados a esos activos para controlar vencimientos, seguimiento y alertamiento.

Regla de trabajo:

- no arrancar implementación estructural mientras existan decisiones críticas en estado `pending`
- tú tomas la decisión final
- aquí solo se registran contexto, opciones, recomendación e impacto

## Overall Status

- Initiative: `internal-asset-control`
- Definition status: `in_progress`
- Implementation ready: `no`

## Scope Summary

La iniciativa queda acotada a diseñar e implementar en backend:

- el módulo `internal-asset-control`
- el recurso principal `internal-asset-maintenance-record`
- captura directa del activo dentro de cada registro en `v1`
- tipificación de registros por catálogo en código
- cálculo de vencimiento y alertamiento
- separación entre `status` persistido y estados derivados para UI
- un módulo administrable de políticas de alerta desde `v1`
- soporte opcional para seguimiento de laboratorio dentro del registro cuando aplique

Queda fuera de esta spec:

- catálogo maestro de activos internos
- catálogo maestro de laboratorios o proveedores para este flujo
- automatizaciones batch o jobs que persistan cambios de estado
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
- `interventionType` existirá desde `v1` y vendrá de catálogo en código
- el intervalo de vigencia se persistirá como estructura compuesta por unidades
- `maintenance` se usará como término paraguas del recurso en inglés, aunque el tipo concreto pueda ser calibración, verificación, mantenimiento preventivo u otro
- el flujo de laboratorio será opcional y no aplicará a todos los registros
- la fecha base del registro representará la fecha real de la acción realizada o documentada sobre el activo
- `observaciones` corresponderá al registro concreto, no al activo en abstracto
- el semáforo o nivel de alerta convivirá con el `status` operativo
- `OVERDUE` será derivado para UI, no persistido automáticamente por backend
- desde `v1` existirá un módulo administrable de políticas de alerta
- cada registro referenciará directamente una política de alerta reutilizable

## Implementation Readiness Notes

La definición ya dejó cerrados varios fundamentos importantes, pero aún faltan decisiones críticas de modelado y fronteras entre:

- `internal-asset-maintenance-record`
- políticas de alerta
- estados derivados
- seguimiento de laboratorio
- eventuales catálogos futuros que se mantienen fuera de alcance en `v1`

Los detalles ejecutables vivirán principalmente en:

- [04-decisions.md](/Users/alberto/projects/icsacv/org-admin-suite-api/.specs/2026/2026-08/2026-08-12_1800_internal-asset-control/04-decisions.md)
- [06-technical-design.md](/Users/alberto/projects/icsacv/org-admin-suite-api/.specs/2026/2026-08/2026-08-12_1800_internal-asset-control/06-technical-design.md)

---

## Decision 01. Naming del módulo y del recurso principal

### Context

La conversación inicial con negocio partió de una tabla descrita informalmente como `control de equipos y patrones internos`.

Con la iteración posterior ya quedó claro que:

- el módulo no modela servicios prestados a clientes
- el módulo sirve para dar visibilidad compartida sobre qué necesita cada activo interno y cuándo
- el dominio incluye activos heterogéneos:
  - equipos de medición
  - patrones internos
  - vehículos
  - otros activos operativos
- cada fila no representa el activo en abstracto, sino un registro histórico asociado a acciones o necesidades sobre ese activo

Además, ya existe otro módulo de `services` en la aplicación y se quiere evitar colisión semántica.

### Options

1. Nombrar el módulo alrededor de `maintenance`
2. Nombrar el módulo alrededor de `assets`
3. Nombrar el módulo como control operativo de activos, separando el nombre del módulo del nombre del recurso

### Recommendation

Opción 3.

### Implications

- el módulo puede describir correctamente su propósito de negocio sin confundirlo con un catálogo maestro de activos
- el recurso principal puede ser más preciso que el nombre visible del módulo
- se evita colisión con `services`
- se deja margen a futuro para un posible dominio más amplio de `internal-assets`

### Decision Final

Se aprueba:

- módulo:
  - español: `control de activos internos`
  - inglés: `internal-asset-control`
- recurso principal:
  - español: `registro de mantenimiento de activo interno`
  - inglés: `internal-asset-maintenance-record`

El término `maintenance` se acepta como término paraguas en inglés para el recurso, aunque el tipo concreto del registro pueda ser calibración, verificación, mantenimiento preventivo u otro.

### Status

approved

---

## Decision 02. Naturaleza histórica del recurso principal

### Context

La principal ambigüedad inicial era si cada fila representaría:

- un activo único
- o un evento/registro repetible asociado al mismo activo

La retroalimentación posterior de negocio confirmó que el mismo activo puede volver a aparecer en nuevos registros cuando tenga una nueva calibración, verificación o mantenimiento.

### Options

1. Cada fila representa un activo interno único
2. Cada fila representa un registro histórico asociado a un activo que puede repetirse en el tiempo

### Recommendation

Opción 2.

### Implications

- el recurso principal no es un catálogo maestro de activos
- el activo puede repetirse en múltiples registros históricos
- observaciones, vigencia y seguimiento pertenecen al registro concreto
- la fecha base del registro representa la acción concreta realizada o documentada
- la fecha de vencimiento sirve como referencia operativa, pero no genera por sí sola el siguiente registro

### Decision Final

Se aprueba que cada `internal-asset-maintenance-record` sea un registro histórico asociado a un activo interno.

El mismo activo podrá aparecer en múltiples registros a lo largo del tiempo.

`v1` no modelará todavía un catálogo maestro de activos internos.

La fecha principal del registro corresponderá a la acción concreta realizada o documentada sobre el activo.

`observaciones` pertenecerá al registro concreto y no al activo general.

### Status

approved

---

## Decision 03. Captura directa del activo en v1

### Context

Ya se discutió si desde `v1` debía existir un catálogo separado de activos internos para seleccionar el activo dentro del registro.

Por alcance, costo y necesidad inmediata, se prefiere resolver primero el problema operativo del cliente antes de introducir un catálogo maestro reusable.

### Options

1. Crear desde `v1` un catálogo maestro de activos internos
2. Capturar directamente nombre e identificador del activo dentro de cada registro

### Recommendation

Opción 2.

### Implications

- se resuelve el problema inmediato sin bloquear el módulo
- se evita sobrediseñar un dominio que todavía no está completamente entendido
- queda abierta la posibilidad de introducir un catálogo maestro más adelante

### Decision Final

Se aprueba que `v1` capture directamente el activo dentro de cada `internal-asset-maintenance-record`, al menos por:

- nombre del activo
- identificador de negocio del activo

No existirá por ahora un catálogo maestro de activos internos.

### Status

approved

---

## Decision 04. Tipificación de registros por catálogo

### Context

Aunque el ejemplo inicial del cliente giraba alrededor de calibraciones, después quedó claro que también existirán registros de:

- verificación
- mantenimiento preventivo
- otros casos futuros

No conviene asumir que todo registro es calibración.

### Options

1. Tratar todos los registros implícitamente como calibraciones
2. Guardar el tipo como texto libre
3. Tipificar el registro por catálogo en código desde `v1`

### Recommendation

Opción 3.

### Implications

- se evita amarrar el modelo a calibración
- se habilita diferenciación explícita de reglas y UI por tipo
- se reduce riesgo de inconsistencias por texto libre

### Decision Final

Se aprueba que cada `internal-asset-maintenance-record` tenga `interventionType` desde `v1`, proveniente de un catálogo definido en código.

Ese catálogo deberá soportar al menos:

- `CALIBRATION`
- `VERIFICATION`
- `PREVENTIVE_MAINTENANCE`
- `OTHER`

### Status

approved

---

## Decision 05. Separación entre status operativo y alertamiento

### Context

Negocio necesita visibilidad preventiva por cercanía al vencimiento, pero también necesita saber si la acción sigue pendiente, ya empezó o ya terminó.

Esto obliga a separar:

- la alerta preventiva
- el estado operativo del registro

### Options

1. Usar un solo campo para representar tanto vencimiento como avance operativo
2. Separar semáforo/alerta de `status` operativo

### Recommendation

Opción 2.

### Implications

- el semáforo conserva naturaleza preventiva
- el `status` operativo puede editarse por usuario
- se evita mezclar severidad temporal con estado real del trabajo

### Decision Final

Se aprueba que el `internal-asset-maintenance-record` tenga:

- lógica de alerta o semáforo por cercanía al vencimiento
- `status` operativo persistido separado

El semáforo no sustituye al `status` operativo.

### Status

approved

---

## Decision 06. Estados persistidos y estado derivado OVERDUE

### Context

Se quiere que el usuario pueda editar el `status`, pero no se quiere introducir todavía jobs o procesos automáticos que persistan cambios de estado por vencimiento.

La solución debe permitir una lectura visual severa cuando el registro sigue pendiente y la fecha de vencimiento ya pasó, sin automatizar escrituras en base de datos.

### Options

1. Persistir también `OVERDUE` y automatizarlo con jobs o procesos backend
2. Mantener un conjunto de `status` persistidos y derivar `OVERDUE` solo para UI

### Recommendation

Opción 2.

### Implications

- se evita complejidad temprana en automatizaciones
- backend no reescribe datos solo por el paso del tiempo
- UI puede mostrar una lectura más útil y severa

### Decision Final

Se aprueba:

- `status` persistidos iniciales:
  - `PENDING`
  - `IN_PROGRESS`
  - `COMPLETED`
  - `CANCELLED`
- `OVERDUE` existirá como estado derivado para UI

`OVERDUE` no será persistido automáticamente por backend en `v1`.

### Status

approved

---

## Decision 07. Políticas de alerta administrables desde v1

### Context

Negocio empezó describiendo ejemplos simples en semanas, pero ya existe una expectativa alta de que las reglas de alerta tendrán que evolucionar rápidamente.

No conviene dejar la lógica de alertamiento hardcodeada ni limitada a una sola configuración fija global imposible de administrar.

### Options

1. Una sola regla global fija en código
2. Una sola regla global persistida
3. Un módulo administrable de políticas de alerta desde `v1`

### Recommendation

Opción 3.

### Implications

- el sistema nace preparado para administrar políticas sin refactor posterior grande
- se podrán modelar reglas reutilizables de alerta desde el inicio
- el semáforo y los correos podrán gobernarse desde políticas configurables

### Decision Final

Se aprueba que exista desde `v1` un módulo administrable de políticas de alerta para `internal-asset-control`.

Las políticas deberán poder usarse para gobernar:

- semáforo o nivel de alerta preventivo
- correos o alertas disparadas por cercanía a vencimiento

`OVERDUE` no forma parte de la política; se deriva por regla separada.

### Status

approved

---

## Decision 08. Shape del intervalo de vigencia

### Context

El negocio necesita configurar intervalos flexibles para el vencimiento de un registro.

Los ejemplos ya mencionados incluyen combinaciones como:

- `12 meses`
- `3 meses`
- `1 semana`
- `1 año + 6 meses + 3 semanas + 3 días`

También se discutió si ese intervalo podía resolverse solo en UI y persistir únicamente la fecha de vencimiento derivada.

### Options

1. Persistir solo `expirationDate` y tratar el intervalo como concern de UI
2. Persistir el intervalo como texto libre
3. Persistir el intervalo como estructura compuesta por unidades y además persistir `expirationDate` derivada

### Recommendation

Opción 3.

### Implications

- la UI podrá reconstruir y editar correctamente la configuración original
- backend conservará la intención de negocio que originó la fecha de vencimiento
- se evita perder trazabilidad si más adelante se requiere recalcular o explicar el vencimiento

### Decision Final

Se aprueba que el intervalo de vigencia se persista como estructura compuesta por unidades, al menos con:

- `years`
- `months`
- `weeks`
- `days`

Cada unidad podrá existir con valor `0`, pero al menos una deberá ser mayor que `0`.

Además de ese intervalo estructurado, backend también persistirá la `expirationDate` derivada.

### Status

approved

---

## Decision 09. Shape del subflujo externo opcional

### Context

Inicialmente el cliente habló de `laboratorio`, pero después quedó claro que no siempre se tratará estrictamente de un laboratorio.

El mismo patrón puede aplicar a:

- laboratorio
- taller
- proveedor externo
- tercero que realiza la acción

No conviene amarrar el modelo a `laboratory` si el objetivo real es representar un flujo externo opcional para algunos registros.

### Options

1. Modelarlo explícitamente como `laboratory`
2. Modelarlo de forma neutral como `provider`
3. Crear desde `v1` una subentidad separada para el flujo externo

### Recommendation

Opción 2.

### Implications

- el modelo queda más neutral y reusable
- se evita amarrar el dominio a calibraciones en laboratorio
- `v1` conserva alcance simple al mantenerlo embebido dentro del registro

### Decision Final

Se aprueba que el subflujo externo opcional dentro de `internal-asset-maintenance-record` use semántica de `provider` y no de `laboratory`.

En `v1` se modelará como un bloque opcional embebido dentro del registro, al menos con:

- `sentToProvider`
- `providerName`
- `sentToProviderAt`
- `providerLeadTime`
- `providerNotes`

`providerLeadTime` seguirá el mismo enfoque estructurado por unidades aprobado para los intervalos de vigencia.

No existirá todavía catálogo maestro de providers ni subentidad independiente para este flujo en `v1`.

### Status

approved

---

## Decision 10. Relación entre registro y política de alerta

### Context

Ya se aprobó que las políticas de alerta existirán como capability administrable desde `v1`.

Faltaba decidir si:

- existiría una política global `default`
- o si cada registro referenciaría explícitamente una política reutilizable

Aunque hoy negocio probablemente empiece usando una sola política, se quiere evitar un diseño rígido que luego obligue a introducir overrides o refactors tempranos.

### Options

1. Política global única para todos los registros
2. Política global `default` con excepciones por registro
3. Política reutilizable asignada directamente a cada registro

### Recommendation

Opción 3.

### Implications

- el modelo nace flexible desde el inicio
- no hace falta introducir semántica especial de `default`
- si negocio solo necesita una política al principio, simplemente reutiliza una sola en todos los registros

### Decision Final

Se aprueba que cada `internal-asset-maintenance-record` referencie directamente una política de alerta reutilizable.

`v1` no asumirá una política global `default`.

Si negocio inicialmente solo necesita una política, podrá crear una única política y asignarla a todos los registros que correspondan.

### Status

approved

---

## Decision 11. Shape base de las reglas de alerta

### Context

Ya se aprobó que:

- cada registro referencia directamente una política reutilizable
- los `recipient-groups` ya son dueños de los canales habilitados

Por eso no conviene duplicar canales dentro de cada regla.

También se quiere permitir que una regla exista solo para semáforo visual, sin obligar notificación.

### Options

1. Cada regla define canales propios y exige grupos destinatarios
2. Cada regla reutiliza `recipient-groups` y puede existir sin grupos
3. Toda regla debe notificar siempre a algún grupo

### Recommendation

Opción 2.

### Implications

- se evita duplicar lógica que ya vive en `recipient-groups`
- una regla puede servir solo para semáforo visual
- la notificación efectiva se resuelve usando grupos cuando existan

### Decision Final

Se aprueba que cada regla de una política de alerta tenga, como base conceptual:

- `offset`
- `severity`
- `recipientGroupIds[]`

`recipientGroupIds[]` no será obligatorio.

Si una regla no tiene grupos asociados, seguirá siendo válida como regla puramente visual para semáforo o severidad en UI.

Los canales no se declararán dentro de la regla; se resolverán implícitamente desde los `recipient-groups` asociados.

### Status

approved

---

## Decision 12. Shape de `offset` en reglas de alerta

### Context

Cada regla de alerta necesita expresar con cuánta anticipación respecto al vencimiento debe activarse.

Ya se aprobó un shape estructurado para el intervalo de vigencia del registro, por lo que introducir un segundo formato distinto para duraciones de alerta agregaría complejidad innecesaria.

### Options

1. Modelar `offset` como texto libre
2. Modelar `offset` con un shape simplificado distinto al intervalo principal
3. Reutilizar exactamente el mismo shape estructurado del intervalo de vigencia

### Recommendation

Opción 3.

### Implications

- el dominio reutiliza una sola convención de duración estructurada
- UI y backend no tendrán que soportar dos formatos distintos para tiempos compuestos
- las reglas de alerta podrán expresar combinaciones ricas sin introducir otro modelo paralelo

### Decision Final

Se aprueba que `offset` en cada regla de alerta reutilice exactamente el mismo shape estructurado del intervalo de vigencia, con:

- `years`
- `months`
- `weeks`
- `days`

Al menos una unidad deberá ser mayor que `0`.

### Status

approved

---

## Decision 13. Shape de severidad en reglas de alerta

### Context

Se evaluó usar un catálogo fijo de severidades o introducir una prioridad manual por regla.

Eso se descartó porque:

- negocio probablemente querrá personalizar nombres y colores
- exponer una prioridad numérica en UI podría resultar confuso
- ya existe una jerarquía natural dada por la cercanía al vencimiento

### Options

1. Catálogo fijo de severidades en código
2. Severidad configurable con prioridad manual
3. Severidad configurable por regla, sin prioridad manual, resolviendo dominancia por cercanía al vencimiento

### Recommendation

Opción 3.

### Implications

- cada regla podrá tener identidad visual propia sin hardcode de niveles
- frontend no tendrá que pedir al usuario una prioridad numérica
- la severidad dominante podrá resolverse naturalmente por el `offset`

### Decision Final

Se aprueba que cada regla de alerta defina su severidad con al menos:

- `severityLabel`
- `severityColorHex`

No existirá `severityPriority` configurable en `v1`.

La severidad dominante se resolverá por cercanía al vencimiento, usando el `offset` de las reglas aplicables.

`OVERDUE` seguirá teniendo prioridad visual superior por regla derivada del sistema y no por configuración de severidad.

### Status

approved

---

## Decision 14. Unicidad de `offset` dentro de una política

### Context

Se evaluó si debía exigirse que cada regla de una política tuviera un `offset` único.

Aunque eso simplificaría algunas validaciones, también podría limitar composiciones legítimas donde múltiples comportamientos compartan el mismo umbral.

### Options

1. Exigir unicidad estricta de `offset` por política
2. No forzar unicidad y permitir múltiples reglas con el mismo `offset`

### Recommendation

Opción 2.

### Implications

- el modelo queda más flexible para composiciones futuras
- la resolución exacta de múltiples reglas con el mismo `offset` deberá manejarse sin asumir conflicto automático
- no se introduce una restricción de negocio que el cliente no pidió

### Decision Final

No se forzará unicidad de `offset` dentro de una política de alerta.

Una política podrá contener múltiples reglas con el mismo `offset`.

### Status

approved

---

## Decision 15. Shape base de la política de alerta

### Context

Ya se cerró gran parte del shape interno de las reglas:

- `offset`
- `severityLabel`
- `severityColorHex`
- `recipientGroupIds[]` opcional

Faltaba cerrar el shape base de la entidad política y una regla operativa importante sobre el orden de sus reglas antes de persistirlas.

### Options

1. Política mínima sin `status` ni `description`
2. Política con metadata base, ciclo de vida explícito y reglas ordenadas antes de persistir

### Recommendation

Opción 2.

### Implications

- la política nace como entidad administrable real
- `code` técnico no queda en manos del usuario
- backend conserva orden consistente de reglas sin depender del orden accidental del payload

### Decision Final

Se aprueba que la política de alerta tenga como shape base:

- `name`
- `code` autogenerado desde `name`
- `description` opcional
- `status`
- `rules[]`

El catálogo inicial de `status` para políticas será:

- `ACTIVE`
- `INACTIVE`
- `DELETED`

Además, `rules[]` deberá ordenarse por `offset` antes de persistirse.

### Status

approved

---

## Decision 16. Contrato HTTP base de `alert-policies`

### Context

Ya se aprobó que las políticas de alerta serán una capability administrable desde `v1`.

Para que eso sea real y no solo conceptual, el módulo necesita nacer con contratos HTTP suficientes para administración completa desde backend.

### Options

1. Exponer solo lectura y creación inicial
2. Exponer CRUD completo desde `v1`

### Recommendation

Opción 2.

### Implications

- el módulo de políticas nace administrable de verdad
- frontend futuro no quedará bloqueado por faltantes básicos de escritura
- la spec puede aterrizar el resto del contrato sobre una base estable

### Decision Final

Se aprueba que `alert-policies` tenga CRUD completo desde `v1`.

Como mínimo deberá existir:

- `GET /v1/alert-policies`
- `GET /v1/alert-policies/:policyId`
- `POST /v1/alert-policies`
- `PATCH /v1/alert-policies/:policyId`
- `DELETE /v1/alert-policies/:policyId`

Además, `v1` deberá contemplar dos formas de lectura:

- un listado paginado administrativo para gestión
- una colección simple no paginada para selección o reutilización en otros recursos

### Status

approved
