# Role Options Auxiliary Capability

## Estado

- Definition status: completed
- Implementation ready: yes
- Implementation status: completed
- Validation status: completed
- Spec status: closed

## Problema

El lookup de roles asignables está duplicado bajo rutas del módulo `USERS`:

- `GET /v1/users/roles`, consumido por invitaciones y protegido por
  `USER_REGISTRATION_INVITATIONS/CREATE`.
- `GET /v1/users/creation-roles`, consumido por creación directa y protegido
  por `USERS/CREATE`.

Ambos reutilizan la misma consulta y el mismo contrato, pero el recurso
consultado pertenece al dominio `ROLES`. Además, edición de usuario necesita
el mismo lookup sin depender del permiso de invitaciones o creación.

## Resultado esperado

Exponer un lookup transversal, no paginado, de opciones asignables:

```text
GET /v1/roles/options
```

Su acceso estará gobernado por la capability auxiliar:

```text
ROLES / READ_OPTIONS
```

La capability autoriza el lookup; no concede la facultad de asignar cualquier
rol. El resultado se filtra siempre con las reglas estructurales del
`systemRole` del actor.

## Reglas de jerarquía que debe preservar el lookup

| `systemRole` del actor | Opciones devueltas |
| --- | --- |
| `MASTER_ADMIN` | default `MASTER_ADMIN`, default `ADMIN` y roles custom `USER` |
| `ADMIN` | default `ADMIN` y roles custom `USER` |
| `USER` | solo roles custom `USER` |

Invariantes:

- `MASTER_ADMIN` solo puede ser consistente con su rol default.
- `ADMIN` solo puede ser consistente con su rol default.
- `USER` debe usar un rol custom de `scope = USER`.
- Los roles custom existen solo en `scope = USER`.

## Alcance incluido

- Registrar `ROLES / READ_OPTIONS` en el catálogo de capabilities auxiliares.
- Derivarla para los módulos consumidores `USERS` y
  `USER_REGISTRATION_INVITATIONS`.
- Exponer `GET /v1/roles/options` desde el módulo dueño `ROLES`.
- Reutilizar la consulta de roles asignables y conservar el contrato de opción
  actual, sin paginación.
- Proteger la ruta con `JwtAuthGuard` y `AuxiliaryCapabilitiesGuard`.
- Reconciliar roles persistidos mediante el seed de roles existente.
- Mantener temporalmente las dos rutas legacy para no romper consumidores.
- Actualizar la documentación backend de autorización y el catálogo de
  endpoints cuando el contrato esté implementado.

## Alcance excluido

- Migrar consumidores, thunks, formularios o documentación de frontend.
- Reestructurar los formularios de usuarios del frontend.
- Cambiar las reglas de creación, edición o invitación de usuarios.
- Exponer o permitir editar `auxiliaryCapabilities` desde frontend.
- Retirar rutas legacy antes de que el frontend haya migrado sus consumidores.
- Crear o ejecutar pruebas unitarias: el proyecto las mantiene fuera de alcance
  hasta una instrucción explícita de la persona usuaria.

## Decisiones cerradas

1. El módulo dueño es `ROLES`, no `USERS` ni
   `USER_REGISTRATION_INVITATIONS`.
2. El nombre es `ROLES / READ_OPTIONS` y conserva el patrón de capabilities
   auxiliares `{ module, capability }`.
3. El endpoint será `GET /v1/roles/options`, no paginado.
4. La capability se deriva por los módulos consumidores `USERS` y
   `USER_REGISTRATION_INVITATIONS`.
5. La jerarquía de `systemRole` filtra las opciones incluso después de aprobar
   la capability.

## Reconciliación de roles existentes

Las capabilities auxiliares se persisten en cada rol. Después de desplegar un
cambio de catálogo o de derivación, la persona responsable ejecuta el seed
existente:

```bash
npm run db:seed:roles
```

`system-roles.seed.ts` recalcula las capabilities derivadas de
`MASTER_ADMIN_DEFAULT`, `ADMIN_DEFAULT` y todos los roles custom persistidos.
Solo escribe `auxiliary_capabilities` cuando difiere de la derivación vigente y
preserva `updatedAt` y `updatedBy` durante esa reconciliación técnica.

## Criterios de aceptación

- Un actor con `ROLES / READ_OPTIONS` derivada obtiene `200` en
  `GET /v1/roles/options` con un arreglo sin envelope de paginación.
- Un actor sin la capability obtiene el rechazo de autorización estándar.
- El resultado de cada `systemRole` coincide con la matriz de jerarquía.
- Los roles existentes que correspondan a módulos consumidores reciben la
  capability tras ejecutar el seed de roles existente.
- Las rutas legacy continúan operativas durante la migración de consumidores.
- No se modifica ningún artefacto de frontend dentro de esta iniciativa.
