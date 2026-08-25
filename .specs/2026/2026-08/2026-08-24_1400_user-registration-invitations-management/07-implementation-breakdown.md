# Implementation Breakdown

## Slice 1. Domain Contract And Persistence Model

- Estado: completed
- Objetivo:
  - extender el modelo compartido de invitaciones sin filtrar detalles Mongoose al dominio
- Cambios realizados:
  - agregar `REVOKED` y los enums de entrega
  - extender records de creación y lectura
  - extender schema, mapper y defaults históricos
  - agregar índices administrativos aprobados
- Validación:
  - `npm run build` satisfactoria
  - la inspección de documentos se cubrirá durante la validación manual integral

## Slice 2. Repository Contracts And Atomic Mutations

- Estado: completed
- Objetivo:
  - incorporar listado de aplicación y mutaciones seguras de token, entrega y revocación
- Cambios realizados:
  - puertos de lectura y escritura explícitos
  - listado paginado de `APPLICATION`
  - rotación, confirmación de entrega y revocación condicionales
- Validación:
  - `npm run build` satisfactoria
  - filtros administrativos limitados a `scope: APPLICATION` y compare-and-set por hash revisados

## Slice 3. Application Lifecycle And Public Invalidity

- Estado: completed
- Objetivo:
  - conectar metadata de envío y ciclo de vida en los casos de uso
- Cambios realizados:
  - inicialización y confirmación de entrega en creación de aplicación y `MASTER`
  - excepción específica y mapping `409`
  - casos de uso de listado, reenvío y revocación
  - rechazo público de invitaciones revocadas
- Validación:
  - `npm run build` satisfactoria
  - la validación de estados y token rotado queda programada para la fase manual integral

## Slice 4. CQRS, HTTP And Authorization

- Estado: completed
- Objetivo:
  - exponer administración mediante los patrones actuales de API y permisos
- Cambios realizados:
  - DTOs HTTP, query/commands, adapters y handlers
  - controller y presenter administrativo
  - catálogo `READ`, `RESEND`, `REVOKE`, i18n y seeder de roles de sistema
- Validación:
  - `npm run build` satisfactoria
  - JSON de locales ES/EN válido
  - la ejecución del seeder y la verificación de `MASTER_ADMIN`, `ADMIN` y roles custom quedan en el Slice 5 de validación manual

## Slice 5. Documentation, Postman And Manual Closure

- Estado: completed
- Objetivo:
  - dejar contrato integrable para frontend y validar funcionalmente la API
- Cambios realizados:
  - actualizar colección Postman
  - crear handoff en `docs/frontend/`
  - barrido y actualización relevante de `docs/`
- agregar checklist de validación manual
- Validación:
  - escenarios Postman ejecutados por el usuario, revisión final de docs y cierre formal

### Checklist De Validación Manual

- [x] Ejecutar el seeder de roles y confirmar que solo `MASTER_ADMIN_DEFAULT` y `ADMIN_DEFAULT` reciben `USER_REGISTRATION_INVITATIONS/READ`, `RESEND` y `REVOKE`.
- [x] Confirmar que roles custom existentes no se modifican ni eliminan.
- [x] Crear una invitación `APPLICATION` y comprobar `resend_count: 0`, `revoked_at: null` y metadata de entrega `ACCEPTED` cuando el proveedor responda correctamente.
- [x] Completar una invitación y confirmar que el usuario nuevo materializa automáticamente su `contact` vinculado por `user_id`.
- [x] Crear una invitación `MASTER` y comprobar que recibe la misma metadata de entrega, sin usar los endpoints administrativos nuevos.
- [x] Listar invitaciones de aplicación con paginación, `search`, filtro de los tres estados, orden por `created_at` y orden compuesto `status` más `created_at`.
- [x] Reenviar una invitación pendiente: comprobar incremento de `resend_count`, metadata del último intento y que el token anterior ya no funciona en la consulta pública ni en el consumo.
- [x] Simular o revisar un fallo de correo: la invitación debe permanecer `PENDING` con intento `FAILED` y permitir otro reenvío.
- [x] Revocar una invitación pendiente: comprobar `REVOKED`, `revoked_at`, `revoked_by_user_id`, rechazo de consulta/consumo público y creación posterior de una nueva invitación para el mismo email.
- [x] Confirmar `404` para IDs inexistentes o de scope `MASTER`, y `409` para invitaciones consumidas, revocadas o modificadas concurrentemente.
