# Analysis

## Functional Problem

Negocio necesita visibilidad compartida sobre qué debe hacerse a ciertos activos internos y cuándo debe realizarse.

El cliente inicialmente describió una sola tabla, pero el análisis posterior mostró que esa tabla mezcla:

- identificación del activo referenciado por el registro
- la acción o mantenimiento documentado
- la vigencia derivada de esa acción
- seguimiento opcional a provider
- alertamiento preventivo

## Current Understanding

Hoy el problema real se entiende mejor así:

- cada fila representa un registro histórico
- el activo puede repetirse en el tiempo
- el registro documenta una acción concreta o un hito de mantenimiento sobre el activo
- la fecha principal del registro representa la fecha real de esa acción documentada
- la fecha de vencimiento se autocalcula por defecto a partir de la fecha del registro y un intervalo configurable, pero puede ajustarse manualmente por negocio
- algunos registros entran en un subflujo opcional de provider
- negocio necesita alertas preventivas y visibilidad operativa del estado del registro

## Domain Clarifications Already Confirmed

- el módulo no modela todavía servicios prestados a clientes
- el módulo aplica a activos internos
- el recurso principal no es el activo, sino un registro histórico asociado al activo
- el activo se capturará directo en `v1`
- mantenimiento preventivo no se manejará como bloque especial separado; será un tipo más de registro
- el mismo patrón de alertamiento base puede reutilizarse entre tipos
- `observaciones` corresponde al registro histórico concreto
- el flujo hacia provider, cuando aplique, necesitará al menos fecha de envío, nombre del provider y tiempo estimado del trabajo
- el seguimiento a provider será concern separado del alertamiento preventivo
- el seguimiento a provider reutilizará `recipient-groups` y podrá contemplar grupos internos en copia

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
- catálogo maestro de providers

Hay que preservar esa frontera para que `v1` no se infle de alcance.

### 4. Riesgo de que la política de alertas quede demasiado rígida

Como negocio probablemente evolucionará rápido, el diseño de políticas no debe quedar encerrado a un único caso en semanas o a un solo color hardcodeado.

## Architectural Consequences

La modelación backend deberá separar al menos estos concerns:

- `internal-asset-maintenance-record`
- catálogo de `assetMaintenanceType`
- `status` persistido
- estado derivado de UI
- políticas reutilizables de expiración
- subflujo opcional de provider
- subbloque de seguimiento a provider separado de las políticas de expiración

También deberá dejarse margen a futuro para una UX que permita generar un nuevo registro tomando como base uno previo, sin asumir eso como parte obligatoria de `v1`.

## Questions Still Open

No quedaron preguntas críticas abiertas de definición.

Los siguientes pasos ya pertenecen a implementación y validación del módulo.
