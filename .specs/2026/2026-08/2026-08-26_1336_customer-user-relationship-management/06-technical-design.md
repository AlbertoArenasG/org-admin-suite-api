# Technical Design

## Approved Design 01. Servicio compartido de escritura relacional

Se creara un servicio de aplicacion compartido denominado `UserCustomerRelationshipManagerService`.

### Responsibilities

- Validar reglas de relacion entre Usuarios y Clientes.
- Ejecutar transacciones para reemplazar, asociar y desasociar relaciones.
- Persistir cambios mediante puertos de repositorio.
- Resolver y sincronizar los `company_names` del Contacto afectado.
- Aplicar la regla de Clientes `INACTIVE`: conservar relaciones existentes, impedir nuevas.

### Consumers

- `UpdateUserUseCase` delega el reemplazo completo de relaciones.
- El nuevo caso de uso de asociacion desde Clientes delega el alta puntual.
- El nuevo caso de uso de desasociacion desde Clientes delega la baja puntual.

### Boundaries

- La autorizacion `CUSTOMERS/*` y `USERS/*` permanece en infraestructura mediante guards y decoradores.
- El servicio no conoce HTTP, controllers, decorators ni detalles Mongoose.
- Los casos de uso conservan responsabilidad de orquestacion y presentacion de resultados.
- Los nombres respetan sufijos explicitos de la API: `Service`, `UseCase`, `Controller`, `Repository`, `Query`, `Command`, `Presenter` y `Dto` segun corresponda.

### Operations

- `replaceForUser`: reemplaza el conjunto completo solicitado por `PATCH /v1/users/:userId`; permite conservar Clientes `INACTIVE` ya relacionados, pero no agregar nuevos.
- `associate`: agrega una relacion puntual desde Clientes; valida Usuario `USER` activo/no eliminado, Cliente `ACTIVE` y ausencia de duplicado con el Cliente objetivo.
- `disassociate`: elimina una relacion puntual existente desde Clientes; valida el contexto operativo y resincroniza el Contacto afectado.

Los tres flujos ejecutan escritura relacional y sincronizacion de Contacto dentro de la misma transaccion. `UpdateUserUseCase` deja de escribir directamente en el repositorio pivote.

### Ports And Concurrency

- El puerto de lectura incorpora consulta de relacion puntual.
- El puerto de escritura incorpora alta y baja puntuales, ademas del reemplazo existente.
- El indice unico compuesto de MongoDB permanece como proteccion final de concurrencia.
- Infraestructura traduce una colision de indice a la excepcion de conflicto de relacion aprobada; una baja que no afecte registros se traduce al conflicto de relacion inexistente.

## Approved Design 07. Validacion de contexto Cliente

Se crea `CustomerContextValidationService` como servicio de aplicacion reutilizable.

- `ensureReadable(customerId)`: acepta Clientes `ACTIVE` e `INACTIVE`; un Cliente inexistente o eliminado produce `404`.
- `ensureMutable(customerId)`: acepta solo Clientes `ACTIVE`; uno `INACTIVE` produce `400` y uno inexistente/eliminado produce `404`.
- Las Queries contextuales usan `ensureReadable`.
- `UserCustomerRelationshipManagerService` usa `ensureMutable` antes de asociar o desasociar.
- La validacion de elegibilidad de Usuario permanece en `UserCustomerRelationshipManagerService`.

## Approved Design 08. Sincronizacion ante cambios de Cliente

- `UserCustomerCompanyNamesResolverService` excluye Clientes `DELETED` al resolver `company_names`.
- `DeleteCustomerUseCase` se vuelve transaccional: marca el Cliente como eliminado, lo persiste y ejecuta `CustomerContactCompanyNamesSynchronizerService` para las relaciones conservadas.
- `UpdateCustomerUseCase` conserva la resincronizacion cuando cambia `company_name`.
- No se agrega ruta de restauracion en esta spec. Si se incorpora en el futuro, debe ejecutar el mismo sincronizador tras restaurar el Cliente.
- La relacion pivote no se elimina durante la eliminacion logica del Cliente.

## Approved Design 09. Excepcion de conflicto de estado

Se crea `StateConflictException` en `domain/exceptions`, con `StateConflictExceptionCode`:

- `USER_CUSTOMER_RELATIONSHIP_ALREADY_EXISTS`
- `USER_CUSTOMER_RELATIONSHIP_NOT_FOUND`

El filtro global de excepciones la mapea a `409 Conflict`. El repositorio Mongoose la usa al traducir una colision del indice unico; `UserCustomerRelationshipManagerService` la usa cuando una baja puntual no encuentra relacion. La excepcion no depende de HTTP ni de MongoDB.

## Validation Strategy

- Esta spec no incorpora pruebas automatizadas.
- La validacion se realizara manualmente con Postman y verificaciones dirigidas en MongoDB cuando corresponda.
- Se documentaran escenarios, resultados esperados y comandos manuales sin ejecutarlos desde Codex.

## Approved Design 02. Consultas relacionales explicitas

`IUserReadRepository` incorporara metodos de lectura con semantica explicita para evitar que `findAll` se convierta en un punto de ramificaciones relacionales:

- usuarios relacionados a un Cliente, paginados
- usuarios globales relacionados a un Cliente, paginados
- usuarios globales sin relaciones con Clientes, paginados
- usuarios elegibles sin relaciones con Clientes, no paginados y compactos

`GetUsersUseCase` seleccionara el metodo adecuado segun `customer_id` o `customer_relationship=UNASSIGNED`. Las consultas contextuales de Clientes consumiran los metodos dedicados correspondientes.

Los `$lookup`, agregaciones, indices y cualquier optimizacion MongoDB permanecen en infraestructura. Los puertos exponen entidades y resultados de lectura, nunca `ObjectId` ni estructuras de agregacion.

## Approved Design 03. Casos de uso y CQRS contextual

Se agregaran casos de uso independientes para la frontera de Clientes:

- `GetCustomerRelatedUsersUseCase`: consulta paginada de relaciones visibles.
- `GetCustomerAvailableUsersUseCase`: lookup compacto no paginado de usuarios sin Clientes.
- `AssociateCustomerUserUseCase`: asocia puntualmente un Usuario al Cliente.
- `DisassociateCustomerUserUseCase`: elimina puntualmente una relacion existente.

Cada caso de uso tendra su `Query` o `Command`, adapter CQRS y DTO de aplicacion propios. `GetUsersUseCase` no se reutiliza por estas rutas; solo evoluciona para los filtros globales `customer_id` y `customer_relationship=UNASSIGNED`.

## Approved Design 04. Contratos HTTP y DTOs

- `GET /v1/customers/:customerId/users` acepta `page`, `limit`, `search` y `sort` con el formato existente de Usuarios.
- `GET /v1/customers/:customerId/available-users` no acepta paginacion ni parametros; devuelve el lookup compacto completo, ordenado por apellido y nombre.
- `POST /v1/customers/:customerId/users` recibe `{ "user_id": string }`.
- `DELETE /v1/customers/:customerId/users/:userId` no recibe body.
- `GET /v1/users` reemplaza `has_customer_relationship` por `customer_relationship=UNASSIGNED` y rechaza su combinacion con `customer_id`.

Los DTOs de infraestructura validan formato, limites y exclusiones de parametros. Los DTOs de aplicacion traducen `snake_case` a los nombres internos sin exponer detalles HTTP.

## Cross-cutting Rule. Localizacion en presenters

Los presenters son responsables de entregar todos los campos localizados necesarios para UI. Frontend consume y pinta valores listos para mostrar; no debe traducir enums de sistema ni reconstruir copys de rol, estado u otras propiedades presentables.

## Approved Design 05. Presenters de Usuarios

- La tabla de usuarios relacionados y la respuesta de asociacion reutilizan `UserPresenter`.
- `UserPresenter` se amplia con `system_role_name` para localizar uniformemente ese enum en cualquier respuesta administrativa de Usuario.
- Se crea `UserLookupPresenter` reutilizable para respuestas compactas de lookup, con `id`, `name`, `lastname`, `full_name` y `email`.
- El lookup de candidatos no necesita enums presentables porque solo retorna usuarios `USER` activos; futuros consumidores podran reutilizar el presenter sin acoplamiento a Clientes.
- Los mensajes de exito de asociacion y desasociacion se agregan al servicio i18n de backend.

## Approved Design 06. Controller contextual y autorizacion

Se crea `CustomerUserRelationshipController` con base `v1/customers`, separado de `CustomerController`.

- Contiene exclusivamente las cuatro rutas de relaciones contextuales.
- Usa `JwtAuthGuard` y `PermissionsGuard`.
- `GET /:customerId/users` requiere `CUSTOMERS/READ`.
- `GET /:customerId/available-users`, `POST /:customerId/users` y `DELETE /:customerId/users/:userId` requieren `CUSTOMERS/UPDATE`.
- Delega en `CommandBus` y `QueryBus`; presenta respuestas mediante `UserPresenter` y `UserLookupPresenter`.
- No evalua permisos `USERS/*` ni capabilities auxiliares.
