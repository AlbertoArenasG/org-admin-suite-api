# Plan

## Fase 1. Catálogo y Autorización

Añadir `UPDATE_PASSWORD` a `USERS`, registrar el permiso en el catálogo vivo y
preparar la actualización del seed de roles de sistema.

## Fase 2. Operación de Aplicación

Crear DTO, command, handler y caso de uso dedicados. Reutilizar política de
contraseña, hash bcrypt, `User.updatePassword()`, repositorios existentes y la
jerarquía de `AuthorizationService`. Tras persistir, invalidar los tokens de
recuperación pendientes siguiendo el flujo secuencial existente.

## Fase 3. API y Composición

Añadir el request DTO y `PATCH /v1/users/:userId/password`, protegido por la
nueva capability. Registrar los artefactos CQRS y providers necesarios.

## Fase 4. Verificación y Seed

Ejecutar validaciones estáticas disponibles. Preparar el comando del seed para
la persona usuaria; no ejecutarlo desde esta sesión. Validar manualmente los
casos de permiso, jerarquía, usuario propio, objetivo eliminado, contraseña
inválida y éxito.
