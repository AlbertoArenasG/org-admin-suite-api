# Progress

## 2026-09-14

- Se definió la operación administrativa de cambio de contraseña de Usuario.
- Se aprobaron capability, contrato HTTP, self-target, jerarquía, invalidación
  de tokens de recuperación y límites de notificación/sesiones.
- Se aprobó que roles custom existentes no reciben el permiso funcional de
  forma automática; cualquier backfill futuro requiere un seed dedicado.
- Se implementó `USERS/UPDATE_PASSWORD`, su etiqueta i18n, DTOs, caso de uso,
  command/handler y endpoint administrativo dedicado.
- El caso de uso conserva self-target con capability, aplica jerarquía solo a
  terceros, persiste bcrypt e invalida reset tokens pendientes.
- `npx eslint` sobre los archivos modificados y `npm run build` finalizaron sin
  errores.
- La colección Postman incluye `Update a User Password` bajo `Users`.
- La persona usuaria ejecutó el seed y validó el contrato funcionalmente.
- Iniciativa cerrada.
