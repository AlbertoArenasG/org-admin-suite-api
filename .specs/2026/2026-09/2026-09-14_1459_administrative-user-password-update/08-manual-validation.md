# Validación Manual

**Estado:** validada el 2026-09-14.

## Preparación

1. Ejecutar `npm run db:seed:roles`.
2. Iniciar sesión de nuevo con un `MASTER_ADMIN` o `ADMIN` para renovar el JWT
   y su contexto efectivo de permisos.
3. Consultar `GET /v1/auth/me/permissions` y confirmar `USERS/UPDATE_PASSWORD`.

## Casos

1. `PATCH /v1/users/:userId/password` con `{ "password": "secreto-valido" }`
   como objetivo permitido debe devolver `200` y `USER.UPDATED`, sin datos de
   usuario, hash ni contraseña.
2. El mismo actor debe poder usar su propio `userId` si tiene
   `USERS/UPDATE_PASSWORD`.
3. Un actor sin `USERS/UPDATE_PASSWORD` debe recibir rechazo de autorización.
4. Un `ADMIN` no debe poder cambiar la contraseña de un `MASTER_ADMIN`; un
   actor `USER` con la capability solo puede operar sobre otro `USER`.
5. Un usuario eliminado debe responder como no encontrado; uno inactivo debe
   aceptar el cambio.
6. Una contraseña menor a `UserPasswordPolicy.MIN_PASSWORD_LENGTH` debe
   conservar el error de validación de contraseña existente.
7. Si el objetivo tiene un token de recuperación pendiente, ese token debe
   quedar inválido después del cambio y no permitir un reset posterior.

## Límite Del Seed

El seed sincroniza los roles de sistema. No agrega `USERS/UPDATE_PASSWORD` a
roles custom existentes.
