# Progress

## Current Phase

Implementation.

## Completed

- Se creo la spec.
- Se aprobo la frontera contextual y de autorizacion.
- Se aprobo la elegibilidad y visibilidad de usuarios.
- Se aprobaron mutaciones puntuales de asociacion y desasociacion.
- Se aprobo conservar los filtros globales como feature propia de Usuarios.
- Se aprobo que el listado paginado de relaciones sea un auxiliar local de Clientes.
- Se aprobo que el lookup de candidatos sea auxiliar local de Clientes.
- Se aprobo diferir la capability de opciones hasta contar con un consumidor.
- Se aprobo el contrato de filtros globales de Usuarios.
- Se aprobo el ciclo de vida del Cliente para rutas contextuales.
- Se aprobo devolver `409 Conflict` para relaciones repetidas o inexistentes.
- Se aprobaron contratos paginados y acotados para relaciones y candidatos.
- Se aprobaron presenters diferenciados para tabla y candidatos.
- Se aprobo la respuesta de asociacion y desasociacion contextual.
- Se aprobo que `UNASSIGNED` incluya usuarios `USER` y `ADMIN` de negocio.
- Se aprobo conservar relaciones inactivas existentes y bloquear nuevas asociaciones inactivas.
- Se aprobo conservar relaciones historicas y resincronizar Contactos al eliminar Clientes.
- Se aprobo una excepcion de dominio para conflictos de relacion `User-Customer`.
- Se aprobo el mapeo uniforme de rechazos contextuales.
- Se aprobo diferenciar el lookup simple de la asociacion contextual flexible.
- Se cerro formalmente la fase Definition con 19 decisiones aprobadas.
- Se aprobo el servicio compartido de escritura relacional para el diseno tecnico.
- Se aprobaron puertos de lectura explicitos para consultas relacionales.
- Se aprobaron casos de uso y componentes CQRS independientes para la frontera contextual.
- Se aprobaron contratos HTTP, DTOs y la regla transversal de localizacion en presenters.
- Se aprobaron presenters administrativos y un presenter compacto reutilizable para lookups.
- Se aprobo un controller contextual separado con permisos directos de Clientes.
- Se aprobaron operaciones, puertos puntuales y concurrencia de `UserCustomerRelationshipManagerService`.
- Se aprobo `CustomerContextValidationService` para reutilizar reglas de ciclo de vida contextual.
- Se aprobo resincronizar Contactos al eliminar logicamente un Cliente.
- Se aprobo `StateConflictException` y su mapeo uniforme a `409`.
- Se aprobo validacion manual sin pruebas automatizadas.
- Se cerro formalmente Technical design y se aprobo el breakdown de implementacion.
- Se implemento `StateConflictException` con codigos localizados ES/EN y mapeo global a `409`.
- Se extendieron puertos y repositorios Mongoose con operaciones relacionales puntuales y consultas dedicadas.
- Se implementaron `CustomerContextValidationService` y `UserCustomerRelationshipManagerService` para centralizar reglas contextuales, transacciones y sincronizacion de Contactos.
- Se normalizaron los nombres de los servicios de relaciones usuario-cliente y se excluyen Clientes eliminados de `company_names`.
- Se preservan relaciones existentes con Clientes no activos durante el reemplazo administrativo, sin permitir nuevas relaciones no activas.
- `UpdateUserUseCase` y el consumo de invitaciones reutilizan el servicio centralizado para sustituir relaciones y sincronizar Contactos.
- Se implementaron los cuatro casos de uso contextuales de Clientes para consultar, asociar y desasociar Usuarios, con DTOs de aplicacion y lookup compacto reutilizable.
- Se implementaron adapters CQRS, DTOs HTTP, presenters localizados y `CustomerUserRelationshipController` con las cuatro rutas contextuales protegidas por permisos de Clientes.
- Se reemplazo `has_customer_relationship` por `customer_relationship=UNASSIGNED` en el listado global de Usuarios, conservando `customer_id` como filtro positivo mutuamente excluyente.
- `DeleteCustomerUseCase` elimina logicamente el Cliente y resincroniza los Contactos relacionados dentro de la misma transaccion, preservando las relaciones historicas.

## Next

- Alinear los contratos HTTP restantes y actualizar documentacion, coleccion Postman y escenarios de validacion manual.
