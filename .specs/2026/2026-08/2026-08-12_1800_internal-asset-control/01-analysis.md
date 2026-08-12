# Analysis

## Functional Problem

Negocio necesita visibilidad compartida sobre qué debe hacerse a ciertos activos internos y cuándo debe realizarse.

El cliente inicialmente describió una sola tabla, pero el análisis posterior mostró que esa tabla mezcla:

- identificación del activo referenciado por el registro
- la acción o mantenimiento documentado
- la vigencia derivada de esa acción
- seguimiento opcional a laboratorio
- alertamiento preventivo

## Current Understanding

Hoy el problema real se entiende mejor así:

- cada fila representa un registro histórico
- el activo puede repetirse en el tiempo
- el registro documenta una acción concreta o un hito de mantenimiento sobre el activo
- la fecha principal del registro representa la fecha real de esa acción documentada
- la fecha de vencimiento se deriva a partir de la fecha del registro y un intervalo configurable
- algunos registros entran en un subflujo opcional de laboratorio
- negocio necesita alertas preventivas y visibilidad operativa del estado del registro

## Domain Clarifications Already Confirmed

- el módulo no modela todavía servicios prestados a clientes
- el módulo aplica a activos internos
- el recurso principal no es el activo, sino un registro histórico asociado al activo
- el activo se capturará directo en `v1`
- mantenimiento preventivo no se manejará como bloque especial separado; será un tipo más de registro
- el mismo patrón de alertamiento base puede reutilizarse entre tipos
- `observaciones` corresponde al registro histórico concreto
- el flujo de laboratorio, cuando aplique, necesitará al menos fecha de entrega además del laboratorio y el tiempo estimado del trabajo

## Risks

### 1. Riesgo de semántica demasiado amplia en `maintenance`

Aunque `maintenance` se aceptó como término paraguas en inglés, hay que cuidar que el catálogo de tipos y los copies visibles de negocio ayuden a que calibración, verificación y mantenimiento preventivo queden claramente diferenciados.

### 2. Riesgo de mezclar alertamiento con ciclo de vida

Si no se mantiene la separación entre:

- `status` persistido
- alerta preventiva
- estado derivado `OVERDUE`

el módulo puede terminar con lógica inconsistente y UI confusa.

### 3. Riesgo de sobrediseñar catálogos auxiliares antes de tiempo

Ya se decidió no crear todavía:

- catálogo maestro de activos internos
- catálogo maestro de laboratorios

Hay que preservar esa frontera para que `v1` no se infle de alcance.

### 4. Riesgo de que la política de alertas quede demasiado rígida

Como negocio probablemente evolucionará rápido, el diseño de políticas no debe quedar encerrado a un único caso en semanas o a un solo color hardcodeado.

## Architectural Consequences

La modelación backend deberá separar al menos estos concerns:

- `internal-asset-maintenance-record`
- catálogo de `interventionType`
- `status` persistido
- estado derivado de UI
- política de alerta reusable
- subflujo opcional de laboratorio

También deberá dejarse margen a futuro para una UX que permita generar un nuevo registro tomando como base uno previo, sin asumir eso como parte obligatoria de `v1`.

## Questions Still Open

Persisten preguntas críticas de definición que deberán cerrarse en decisiones posteriores, por ejemplo:

- shape exacto del intervalo de vigencia
- shape y alcance exacto de las políticas de alerta
- asignación entre registros y políticas
- catálogo definitivo de colores, severidades o niveles visuales
- cómo modelar exactamente el subflujo de laboratorio sin sobrecomplicar `v1`
