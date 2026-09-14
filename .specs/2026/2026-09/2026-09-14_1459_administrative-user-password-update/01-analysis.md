# Análisis

## Estado Actual

- `PATCH /v1/users/:userId` requiere `USERS/UPDATE` y su DTO excluye
  contraseña.
- `PATCH /v1/users/me` permite cambio propio y reutiliza `UserPasswordPolicy`
  y bcrypt.
- `User.updatePassword()` ya existe en dominio.
- `ResetUserPasswordUseCase` invalida tokens de recuperación pendientes tras
  actualizar una contraseña.
- `AuthorizationService.ensureCanManageTargetSystemRole()` ya modela la
  jerarquía estructural requerida.
- `AUTHORIZATION_CATALOG.USERS` alimenta `systemRolesSeed`; este seed es
  idempotente y actualiza roles de sistema existentes.

## Riesgos y Límites

- Reutilizar `USERS/UPDATE` mezclaría una credencial con edición general del
  perfil. Se evita mediante `USERS/UPDATE_PASSWORD`.
- Omitir la jerarquía permitiría a un actor con capability cambiar credenciales
  de un rol estructuralmente superior.
- Conservar tokens de recuperación permitiría que un enlace previo reemplace
  una contraseña recién establecida administrativamente.
- JWT actuales no pueden revocarse sin introducir infraestructura fuera de
  alcance; esta operación no simula esa revocación.
