# Implementation Breakdown

## Slice 1. Authorization Foundation

- Agregar `CUSTOMER_SERVICE_RECORDS_CLIENT_ACCESS` al catalogo central con
  `READ`.
- Agregar copias i18n de autorizacion y registrar el efecto esperado del seed
  de roles de sistema.

## Slice 2. Restricted Read Model

- Definir parametros de consulta que incluyan `actorUserId`.
- Implementar metodos de repositorio que apliquen la frontera compuesta antes
  de paginar, contar o buscar detalle.
- Definir el lookup `distinct` de Clientes sobre registros visibles.

## Slice 3. HTTP And Presentation

- Agregar queries, handlers, DTOs y controlador de solo lectura.
- Crear presenter exclusivo con la proyeccion visible al Cliente.
- Restringir filtros y ordenamientos al contrato publico.

## Slice 4. Verification And Seed

- Agregar pruebas de autorizacion, visibilidad, paginacion y ausencia de datos
  internos.
- Ejecutar validaciones tecnicas.
- Solicitar y registrar la ejecucion manual de `npm run db:seed:roles`.
