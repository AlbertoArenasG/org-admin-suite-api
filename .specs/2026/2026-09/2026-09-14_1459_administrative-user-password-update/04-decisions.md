# Decisiones

## Capability funcional independiente

**Status:** approved

La operación es `USERS/UPDATE_PASSWORD`, no `USERS/UPDATE` ni una capability
auxiliar. `USERS` es el dueño del recurso y la acción modifica una credencial
del usuario.

**Reason:** separa la edición ordinaria de perfil de una operación sensible.

## Endpoint dedicado

**Status:** approved

El contrato es `PATCH /v1/users/:userId/password` con `{ password }`.

**Reason:** la ruta identifica explícitamente el subrecurso sensible y evita
ampliar el payload de actualización general.

## Self-target autorizado con capability

**Status:** approved

El endpoint permite que `currentUser.userId === userId` si el actor posee
`USERS/UPDATE_PASSWORD`. `PATCH /v1/users/me` se conserva como self-service
sin capability administrativa.

**Reason:** un actor administrativo puede elegir cualquiera de sus flujos sin
eliminar el acceso ordinario de una persona que no posee permisos de backoffice.

## Jerarquía e invalidación de reset tokens

**Status:** approved

La operación reutiliza la jerarquía de `AuthorizationService` y, tras persistir
el hash, invalida los tokens pendientes de recuperación del objetivo.

**Reason:** preserva las fronteras de roles vigentes y evita que un token previo
sobrescriba una contraseña nueva.

## Sin email ni revocación de JWT

**Status:** approved

La operación responde solo con éxito localizado. No envía contraseña ni email y
no revoca JWT activos.

**Reason:** evita introducir comunicación de secretos o infraestructura de
sesiones revocables fuera de este alcance.

## Roles custom sin asignación automática

**Status:** approved

El seed general agrega `USERS/UPDATE_PASSWORD` a los roles de sistema
`MASTER_ADMIN_DEFAULT` y `ADMIN_DEFAULT`. No añade permisos funcionales directos
a roles custom existentes.

**Reason:** el seed general solo extiende capabilities auxiliares derivadas en
roles custom; otorgar un permiso funcional requiere una asignación explícita o,
si se justifica, un seed dedicado.
