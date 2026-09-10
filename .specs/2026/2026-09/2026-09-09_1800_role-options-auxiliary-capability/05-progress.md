# Progreso

## 2026-09-09

- Se creó la spec backend para sustituir la frontera duplicada de lookup de
  roles por `ROLES / READ_OPTIONS`.
- Se confirmó que el lookup actual no es paginado y que su filtro jerárquico
  depende de `systemRole`.
- Se cerraron ownership, nombre, endpoint, consumidores y compatibilidad
  temporal de rutas legacy.
- Se corrigió la falsa decisión de backfill: el seed existente de roles ya
  reconcilia capabilities derivadas para roles default y custom. No se requiere
  migración ni reconciliador nuevo.
- Se cerraron definición, plan, registro de artefactos y slices. La iniciativa
  queda lista para implementar exclusivamente en backend.
