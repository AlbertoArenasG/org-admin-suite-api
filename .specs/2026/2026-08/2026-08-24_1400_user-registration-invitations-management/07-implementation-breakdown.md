# Implementation Breakdown

## Slice 1. Domain Contract And Persistence Model

- Estado: pending
- Objetivo:
  - extender el modelo compartido de invitaciones sin filtrar detalles Mongoose al dominio
- Cambios esperados:
  - agregar `REVOKED` y los enums de entrega
  - extender records de creación y lectura
  - extender schema, mapper y defaults históricos
  - agregar índices administrativos aprobados
- Validación:
  - compilación e inspección de documentos existentes y nuevos

## Slice 2. Repository Contracts And Atomic Mutations

- Estado: pending
- Objetivo:
  - incorporar listado de aplicación y mutaciones seguras de token, entrega y revocación
- Cambios esperados:
  - puertos de lectura y escritura explícitos
  - listado paginado de `APPLICATION`
  - rotación, confirmación de entrega y revocación condicionales
- Validación:
  - compilación y revisión de filtros/condiciones Mongo

## Slice 3. Application Lifecycle And Public Invalidity

- Estado: pending
- Objetivo:
  - conectar metadata de envío y ciclo de vida en los casos de uso
- Cambios esperados:
  - inicialización y confirmación de entrega en creación de aplicación y `MASTER`
  - excepción específica y mapping `409`
  - casos de uso de listado, reenvío y revocación
  - rechazo público de invitaciones revocadas
- Validación:
  - compilación y validación manual de estados/token rotado

## Slice 4. CQRS, HTTP And Authorization

- Estado: pending
- Objetivo:
  - exponer administración mediante los patrones actuales de API y permisos
- Cambios esperados:
  - DTOs HTTP, query/commands, adapters y handlers
  - controller y presenter administrativo
  - catálogo `READ`, `RESEND`, `REVOKE`, i18n y seeder de roles de sistema
- Validación:
  - compilación; `MASTER_ADMIN` y `ADMIN` actualizados, roles custom intactos

## Slice 5. Documentation, Postman And Manual Closure

- Estado: pending
- Objetivo:
  - dejar contrato integrable para frontend y validar funcionalmente la API
- Cambios esperados:
  - actualizar colección Postman
  - crear handoff en `docs/frontend/`
  - barrido y actualización relevante de `docs/`
  - ejecutar validación manual aprobada
- Validación:
  - escenarios Postman ejecutados por el usuario, revisión final de docs y cierre formal
