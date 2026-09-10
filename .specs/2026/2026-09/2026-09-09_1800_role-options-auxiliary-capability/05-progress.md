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

## 2026-09-10

- Fases 1 a 3 implementadas: se creó `GetAssignableRoles` bajo `ROLES`, se
  registró `ROLES/READ_OPTIONS`, se derivó para `USERS` y
  `USER_REGISTRATION_INVITATIONS`, y se expuso `GET /v1/roles/options`.
- Las rutas legacy de `USERS` conservan path, contrato y autorización, pero ya
  delegan en la query y presenter dueños de `ROLES`.
- Se retiraron los DTOs, caso de uso, query y presenter duplicados de `USERS`.
- `npm run build`, ESLint sin autofix y `git diff --check` completaron sin
  errores.
- Pendiente: ejecución manual de `npm run db:seed:roles`, validación de la
  matriz por `systemRole` y actualización final de documentación viva.
- La persona usuaria ejecutó `npm run db:seed:roles` y confirmó que el
  resultado se ve correcto.
- Se actualizaron los documentos vivos de capabilities, reglas de autorización,
  catálogo de endpoints y deuda técnica. La deuda restante pertenece a la
  migración frontend de consumidores y al retiro posterior de rutas legacy.
- La spec queda cerrada formalmente. No se crearon ni ejecutaron pruebas
  unitarias por alcance aprobado.
