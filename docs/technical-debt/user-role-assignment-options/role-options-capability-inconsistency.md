# Inconsistencia de la Capability de Roles Asignables

## Estado

| Campo                   | Valor                                     |
| ----------------------- | ----------------------------------------- |
| Estado                  | Remediación backend completada; migración frontend pendiente |
| Prioridad               | Alta                                      |
| Fecha de identificación | 9 de septiembre de 2026                   |
| Última revisión         | 10 de septiembre de 2026                  |
| Área                    | Roles, usuarios, autorización y contratos HTTP |
| Alcance actual          | Migración de consumidores frontend y retiro de rutas legacy |

## Resumen

La lista de roles que un actor puede asignar es una capability auxiliar
transversal. Backend ya la normalizó bajo `ROLES/READ_OPTIONS`; permanece deuda
solo la migración de consumidores frontend y el retiro de rutas legacy.

## Estado Actual

| Ruta | Uso actual | Guard actual | Consulta |
| --- | --- | --- | --- |
| `GET /v1/roles/options` | Lookup transversal dueño | `ROLES/READ_OPTIONS` | `GetAssignableRolesQuery` |
| `GET /v1/users/roles` | Compatibilidad de invitación y edición | `user_registration_invitations:CREATE` | `GetAssignableRolesQuery` |
| `GET /v1/users/creation-roles` | Compatibilidad de creación directa | `users:CREATE` | `GetAssignableRolesQuery` |

Los consumidores frontend aún usan rutas legacy. Mientras no adopten
`GET /v1/roles/options`, edición conserva su dependencia temporal del permiso
de invitaciones.

## Impacto

- La migración frontend debe coordinar los flujos de invitación, creación y
  edición hacia la ruta transversal.
- El flujo de edición no quedará plenamente desacoplado del permiso de
  invitaciones hasta adoptar el nuevo contrato.
- Las rutas legacy deben retirarse solo cuando no tengan consumidores.

## Solución Objetivo

Normalizar la capability como una ruta auxiliar transversal:

- Exponer `GET /v1/roles/options`.
- Protegerla mediante la capability auxiliar `ROLES / READ_OPTIONS`.
- Derivar esa capability para los módulos consumidores `USERS` y
  `USER_REGISTRATION_INVITATIONS`.
- `GetAssignableRolesQuery` es la fuente de las reglas de jerarquía del actor
  y retorna únicamente los roles asignables.
- Mantener permisos de escritura separados en `POST /v1/users`,
  `PATCH /v1/users/:userId` y el endpoint de invitaciones.

No debe usarse el permiso de una operación de escritura concreta para proteger
esta consulta auxiliar compartida.

## Plan de Migración

1. Migrar los consumidores frontend de invitación, creación y edición hacia
   `GET /v1/roles/options`.
2. Validar manualmente los tres niveles de `systemRole` y la ausencia de
   consumidores legacy.
3. Eliminar las rutas `roles` y `creation-roles` al no tener consumidores.

## Criterios de Cierre

- Todos los consumidores frontend usan `GET /v1/roles/options`.
- Las rutas legacy ya no existen.
- Invitación, creación y edición reciben roles correctos para el mismo actor.
- Las rutas de escritura conservan sus permisos específicos.

## Historial

| Fecha                   | Estado       | Nota |
| ----------------------- | ------------ | ---- |
| 9 de septiembre de 2026 | Identificada | Detectada al revisar la creación directa de usuarios y la dependencia de edición respecto al permiso de invitaciones. |
| 10 de septiembre de 2026 | Backend remediado | Se implementaron `ROLES/READ_OPTIONS`, `GET /v1/roles/options`, derivación para módulos consumidores y reconciliación mediante el seed existente. |
