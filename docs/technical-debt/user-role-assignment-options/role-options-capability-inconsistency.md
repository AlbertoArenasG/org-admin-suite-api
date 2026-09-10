# Inconsistencia de la Capability de Roles Asignables

## Estado

| Campo                   | Valor                                     |
| ----------------------- | ----------------------------------------- |
| Estado                  | Identificada                              |
| Prioridad               | Alta                                      |
| Fecha de identificación | 9 de septiembre de 2026                   |
| Última revisión         | 9 de septiembre de 2026                   |
| Área                    | Usuarios, autorización y contratos HTTP   |
| Alcance actual          | Controller de usuarios y consumidores API |

## Resumen

La lista de roles que un actor puede asignar es una capability auxiliar
transversal. Actualmente se expone a través de dos rutas que ejecutan la misma
consulta, pero se protegen con permisos asociados a flujos distintos.

## Estado Actual

| Ruta | Uso actual | Guard actual | Consulta |
| --- | --- | --- | --- |
| `GET /v1/users/roles` | Invitación y edición | `user_registration_invitations:CREATE` | `GetUserRolesQuery` |
| `GET /v1/users/creation-roles` | Creación directa | `users:CREATE` | `GetUserRolesQuery` |

`GET /v1/users/roles` es consumido también por edición. Por ello, el permiso
de invitaciones se convierte erróneamente en requisito para que un actor pueda
obtener los roles necesarios al actualizar un usuario.

## Impacto

- Dos contratos HTTP duplican una consulta y presenter idénticos.
- La autorización de una capability compartida queda ligada a acciones de
  producto distintas.
- El flujo de edición puede perder sus opciones de rol si el actor tiene
  `users:UPDATE` sin `user_registration_invitations:CREATE`.
- Cada nuevo flujo de asignación de roles podría crear rutas duplicadas.

## Solución Objetivo

Normalizar la capability como una ruta auxiliar transversal:

- Exponer `GET /v1/roles/options`.
- Protegerla mediante la capability auxiliar `ROLES / READ_OPTIONS`.
- Derivar esa capability para los módulos consumidores `USERS` y
  `USER_REGISTRATION_INVITATIONS`.
- Mantener `GetUserRolesQuery` como la fuente de las reglas de jerarquía del
  actor y retornar únicamente los roles asignables.
- Mantener permisos de escritura separados en `POST /v1/users`,
  `PATCH /v1/users/:userId` y el endpoint de invitaciones.

No debe usarse el permiso de una operación de escritura concreta para proteger
esta consulta auxiliar compartida.

## Plan de Migración

1. Definir `ROLES / READ_OPTIONS` y su derivación para los módulos
   consumidores; actualizar catálogo, seeds y tipos de autorización.
2. Añadir la nueva ruta con `JwtAuthGuard` y
   `AuxiliaryCapabilitiesGuard`.
3. Migrar los consumidores frontend de invitación, creación y edición.
4. Añadir pruebas de autorización y de jerarquía para la nueva ruta.
5. Eliminar las rutas `roles` y `creation-roles` al no tener consumidores.

## Criterios de Cierre

- Solo existe una ruta para consultar roles asignables.
- La capability de esa ruta es transversal y no depende del flujo consumidor.
- Invitación, creación y edición reciben roles correctos para el mismo actor.
- Las rutas de escritura conservan sus permisos específicos.
- Existen pruebas automatizadas de autorización y jerarquía de roles.

## Historial

| Fecha                   | Estado       | Nota |
| ----------------------- | ------------ | ---- |
| 9 de septiembre de 2026 | Identificada | Detectada al revisar la creación directa de usuarios y la dependencia de edición respecto al permiso de invitaciones. |
