# Actualización Administrativa de Contraseña de Usuario

**Definition status:** completed  
**Implementation status:** completed

## Problema

La administración de Usuarios puede actualizar datos y relaciones, pero no
puede establecer la contraseña de una cuenta existente. `PATCH /v1/users/me`
permite cambio propio bajo autenticación, pero no representa la capacidad
administrativa sobre un `userId` arbitrario.

## Resultado Esperado

Exponer `PATCH /v1/users/:userId/password` para reemplazar la contraseña de un
usuario existente mediante una capability funcional independiente:
`USERS/UPDATE_PASSWORD`.

## Alcance Incluido

- Operación `UPDATE_PASSWORD` bajo el módulo dueño `USERS`.
- Registro del permiso en el catálogo y actualización mediante el seed
  idempotente de roles del sistema.
- Endpoint administrativo con body `{ password }`.
- Validación de política de contraseña, hash y persistencia de la nueva
  credencial.
- Autorización por capability y jerarquía estructural vigente.
- Invalidación de tokens pendientes de recuperación de contraseña del usuario
  objetivo.

## Alcance Excluido

- Modificar `PATCH /v1/users/me`, su contrato o su autorización actual.
- Solicitar contraseña actual, confirmación de contraseña o enviar credenciales
  por correo. La confirmación pertenece a la UI.
- Notificar por correo el cambio de contraseña.
- Revocar sesiones JWT activas, ya que no existe una infraestructura de sesión
  revocable en el alcance actual.
- Cambios de esquema, migraciones de datos o nuevos modelos de persistencia.
- Cambios frontend o migración de la vista de Usuarios.

## Decisiones Cerradas

- La capability es `USERS/UPDATE_PASSWORD`, independiente de `USERS/UPDATE`.
- El endpoint admite objetivo propio si el actor posee esa capability. El flujo
  self-service existente permanece disponible y no requiere la capability.
- La jerarquía actual no cambia: `MASTER_ADMIN` administra todos los roles;
  `ADMIN`, todos salvo `MASTER_ADMIN`; `USER` con la capability puede operar a
  otro `USER`.
- Usuarios eliminados responden como no encontrados; usuarios activos e
  inactivos pueden recibir una nueva contraseña.
- El éxito devuelve `200` y el mensaje localizado existente `USER.UPDATED`,
  sin exponer secretos ni requerir una representación completa del usuario.

Los roles de sistema reciben la nueva operación mediante el seed idempotente.
Los roles custom no reciben permisos funcionales directos por ese mecanismo;
`USERS/UPDATE_PASSWORD` queda ausente hasta que se asigne explícitamente a un
rol custom. Un backfill futuro, si se requiere, usará un seed dedicado y no
forma parte de esta iniciativa.

## Criterios de Aceptación

- Un actor con `USERS/UPDATE_PASSWORD` puede actualizar la contraseña propia o
  de un objetivo permitido por jerarquía.
- La operación rechaza al actor sin capability antes de ejecutar el caso de uso.
- La operación rechaza una jerarquía no permitida y usuarios eliminados.
- Una contraseña inválida conserva la política y error canónico existentes.
- Los tokens pendientes de recuperación del objetivo quedan invalidados tras
  un cambio exitoso.
- El seed agrega la operación a roles de sistema sin cambios de esquema.
