# Specs

`.specs` guarda el historial de analisis, planes, tareas, decisiones y diseño técnico de features, refactors y cambios estructurales del proyecto.

## Objetivo

- Tener trazabilidad tecnica de cambios importantes.
- Registrar decisiones antes de implementar.
- Mantener una lista de tareas estable, sin reordenarla segun avance.
- Permitir avanzar por microfases o slices pequeños sin perder contexto.
- Separar claramente documentos historicos de documentos vivos operativos.

## Estructura

Cada iniciativa vive en una carpeta con este formato:

```text
YYYY/MM/YYYY-MM-DD_HHMM_slug-del-tema/
```

Ejemplo:

```text
.specs/2026/2026-05/2026-05-26_1940_roles-permissions-refactor/
```

## Archivos recomendados por spec

- `00-definition.md`: documento activo para cerrar decisiones antes de implementar.
- `01-analysis.md`: estado actual, hallazgos, riesgos y contexto tecnico.
- `02-plan.md`: propuesta de solucion, fases y orden de implementacion.
- `03-task-list.md`: tareas en orden fijo por fase, con checkbox y status inline.
- `04-decisions.md`: decisiones tomadas, razon e impacto.
- `05-progress.md`: bitacora breve por sesion.
- `06-technical-design.md`: diseño técnico concreto del cambio.
- `07-implementation-breakdown.md`: subtareas o slices de implementación.

## Estado de definition

`00-definition.md` debe reflejar de forma explícita si una iniciativa ya está lista para pasar a implementación.

Campos esperados:

- `Definition status`
- `Implementation ready`

Valores típicos:

- `Definition status: in_progress`
- `Definition status: completed`
- `Implementation ready: no`
- `Implementation ready: yes`

Regla:

- no empezar implementación estructural mientras existan decisiones críticas abiertas
- cuando la definición ya no tenga gaps bloqueantes, actualizar esos flags

## Convencion de task list

Las tareas no se reordenan por status.

Formato sugerido:

```md
- [ ] Nombre de la tarea
  Status: pending
```

Estados sugeridos:

- `pending`
- `in_progress`
- `done`
- `blocked`
- `cancelled`

## Diferencia entre task list e implementation breakdown

- `03-task-list.md` conserva la vista macro por fases.
- `07-implementation-breakdown.md` baja el trabajo a slices o subtareas concretas.
- la task list no debe volverse una lista ruidosa de detalles técnicos.
- el breakdown sí puede refinarse conforme avance la implementación.

## Convencion de progreso

`05-progress.md` debe registrar:

- cierres de definición
- cambios importantes en diseño técnico
- creación de documentos permanentes en `docs/`
- avances de implementación
- hitos operativos relevantes

No debe limitarse solo a cambios de código.

## Convencion de cambios

- Crear una nueva carpeta por iniciativa relevante.
- Si una iniciativa dura varias sesiones, se sigue usando la misma carpeta.
- Si el alcance cambia de forma importante, registrar la decision en `04-decisions.md`.
- Avanzar por microfases cuando el cambio sea grande, para evitar pasos demasiado amplios.

## Documentos vivos fuera de `.specs`

Cuando una iniciativa produzca información que deba seguir viva más allá de la spec, crear o actualizar documentos permanentes en `docs/`.

Ejemplos:

- reglas permanentes del proyecto
- catálogos funcionales
- handoffs de integración
- documentación operativa para otros repos o sesiones

Regla:

- `.specs` conserva el historial y el razonamiento
- `docs/` conserva la referencia operativa vigente

## Diferencia entre definition y decisions

- `00-definition.md` se usa mientras el diseño aun tiene decisiones abiertas.
- `04-decisions.md` registra decisiones ya tomadas y su impacto historico.
- No se empieza implementacion estructural hasta tener cerradas las decisiones criticas del `00-definition.md`.

## Index

`.specs/index.md` debe servir como vista rápida de las iniciativas activas o relevantes.

Idealmente debe reflejar algo más útil que solo “in progress”, por ejemplo:

- `definition completed`
- `implementation in progress`
- `blocked`
- `completed`
