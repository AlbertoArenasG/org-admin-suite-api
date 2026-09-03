# Plan

## Phase 1. Definition

Completa. Se confirmaron la ruta HTTP, la frontera de visibilidad y el lookup
de Clientes que responde a la consulta activa.

## Phase 2. Technical Design

1. Definir queries, DTOs, repositorio de lectura restringida y presentadores
   exclusivos del modulo.
2. Definir catalogo de permisos, i18n, registro de controladores y handlers.
3. Definir indices o ajustes de consulta necesarios para la frontera compuesta.

## Phase 3. Implementation

1. Agregar el modulo de autorizacion y sus traducciones.
2. Implementar listado, detalle y lookup de Clientes con la frontera de acceso.
3. Registrar controladores, queries, handlers y dependencias.
4. Agregar pruebas de autorizacion, filtrado y omision de datos de Proveedor.

## Phase 4. Validation And Closure

1. Ejecutar validacion tecnica y documentar sus resultados.
2. Solicitar la ejecucion manual del seed de roles una vez integrado el catalogo.
3. Actualizar el indice, progreso y cualquier documento vivo que resulte
   necesario.

## Exit Criteria

- Ningun endpoint del modulo devuelve datos de Proveedor, politicas o eventos
  de notificacion.
- Listado, detalle y lookup aplican la misma frontera de acceso.
- Los roles de sistema reciben el permiso nuevo despues de ejecutar el seed.
- La spec conserva evidencia de pruebas y del seed manual solicitado.
