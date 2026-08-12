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
- `maintenance` se usará como término paraguas del recurso en inglés, aunque el tipo concreto pueda ser calibración, verificación, mantenimiento preventivo u otro
- el flujo de laboratorio será opcional y no aplicará a todos los registros
- la fecha base del registro representará la fecha real de la acción realizada o documentada sobre el activo
- `observaciones` corresponderá al registro concreto, no al activo en abstracto
- el semáforo o nivel de alerta convivirá con el `status` operativo
- `OVERDUE` será derivado para UI, no persistido automáticamente por backend
- desde `v1` existirá un módulo administrable de políticas de alerta

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
