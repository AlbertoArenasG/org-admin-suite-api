# Specs

`.specs` guarda el historial de analisis, planes, tareas y decisiones de features, refactors y cambios estructurales del proyecto.

## Objetivo

- Tener trazabilidad tecnica de cambios importantes.
- Registrar decisiones antes de implementar.
- Mantener una lista de tareas estable, sin reordenarla segun avance.

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

## Convencion de cambios

- Crear una nueva carpeta por iniciativa relevante.
- Si una iniciativa dura varias sesiones, se sigue usando la misma carpeta.
- Si el alcance cambia de forma importante, registrar la decision en `04-decisions.md`.

## Diferencia entre definition y decisions

- `00-definition.md` se usa mientras el diseño aun tiene decisiones abiertas.
- `04-decisions.md` registra decisiones ya tomadas y su impacto historico.
- No se empieza implementacion estructural hasta tener cerradas las decisiones criticas del `00-definition.md`.
