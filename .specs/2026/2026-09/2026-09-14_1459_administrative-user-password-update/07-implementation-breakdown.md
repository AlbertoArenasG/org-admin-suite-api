# Implementation Breakdown

## Slice 1. Capability y contrato de aplicación

- Añadir `UPDATE_PASSWORD` al catálogo `USERS`.
- Crear DTO, caso de uso y command/handler dedicados.
- Reutilizar jerarquía, política, hash y repositorios existentes; invalidar
  reset tokens tras persistir, como el flujo actual de recuperación.
- Cierre: typecheck y revisión de imports pasan; no se ejecuta seed.

## Slice 2. HTTP y composición

- Crear request DTO y registrar exports/providers/handler.
- Añadir `PATCH /v1/users/:userId/password` protegido por el permiso nuevo.
- Devolver mensaje localizado sin recurso completo.
- Cierre: typecheck, lint/build aplicables y contrato revisado.

## Slice 3. Seed y validación

- Actualizar catálogo funcional vivo y documentos de autorización relevantes.
- Entregar el comando de `db:seed:roles` a la persona usuaria; no ejecutarlo.
- Registrar la validación manual de éxito, capability, jerarquía, self-target,
  objetivo eliminado, contraseña inválida e invalidación de reset tokens.
