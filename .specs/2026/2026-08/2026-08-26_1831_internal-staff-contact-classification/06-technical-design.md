# Technical Design

## Domain Model

- `UserProps` incorporara `isInternalStaff: boolean` obligatorio.
- `ContactProps` incorporara `isInternalStaff: boolean` obligatorio.
- La entidad `Contact` aceptara la bandera en `updateDetails` solo para contactos manuales. `syncFromUser` la recibira desde el Usuario vinculado.
- Una politica de dominio reutilizable resolvera y validara la clasificacion segun el `SystemRole` final: `ADMIN` y `MASTER_ADMIN` siempre internos; `USER` acepta ambos valores.

## Invitation And User Contracts

- Los records, DTOs, mappers y schemas de invitacion persistiran `isInternalStaff`.
- Las solicitudes de invitacion de `USER` requeriran el valor. Para `ADMIN` y `MASTER_ADMIN` sera opcional, pero `false` sera invalido y backend materializara `true`.
- `UpdateUserDto` y su request DTO aceptaran el campo opcionalmente. La regla se evaluara tras resolver el rol final.
- Las respuestas protegidas de Usuario e Invitacion incluiran el campo, incluso las colecciones. Los presenters publicos no lo incluiran.

## Contact Contracts

- La creacion y actualizacion de Contacto manual requeriran o aceptaran respectivamente `isInternalStaff`.
- Los presenters protegidos de Contactos incluiran el campo en detalle, coleccion y busqueda.
- `PATCH` y `DELETE` de un Contacto con `userId` continuaran rechazando cualquier mutacion administrativa.

## Synchronization Design

- `UserCustomerCompanyNamesResolverService` mantendra la responsabilidad exclusiva de resolver nombres vigentes de Clientes y sera la unica fuente para `company_names` de Contactos vinculados.
- `SyncUserContactService` sera el unico escritor de Contactos vinculados y usara el resolver de Clientes. Tendra dos operaciones:
  - `syncFromUser(user)` para identidad, estatus, clasificacion y empresas.
  - `syncCompanyNamesForUsers(userIds)` para actualizar solamente empresas derivadas.
- `UserCustomerRelationshipManagerService` y `CustomerContactCompanyNamesSynchronizerService` delegaran al segundo metodo. El sincronizador intermedio dedicado a escribir empresas se eliminara.
- La actualizacion tecnica exclusiva de `company_names` se implementara en Infra con `timestamps: false`; no modificara `updated_at` ni `updated_by`.

## Persistence

- Se agregara `is_internal_staff` obligatorio a los schemas Mongoose de `users`, `contacts` y `user_registration_invitations`.
- Los mappers Mongoose y los puertos de persistencia reflejaran el campo sin filtrar detalles de MongoDB hacia Dominio o Aplicacion.
- No se requieren cambios de indices ni de seeds de roles.
- El seed `contacts-from-users` se ajustara para copiar `is_internal_staff` desde el Usuario y dejar de agregar `ICSACV` a `company_names`.

## Temporary Migration

- Se creara una migracion manual temporal dentro de `src/internal/infra/persistence/mongoose/migrations/`.
- En modo de aplicacion normalizara Usuarios e Invitaciones existentes con `is_internal_staff: true`.
- Para Contactos existentes asignara `true` cuando tengan `user_id` y `false` cuando sean manuales. Tambien dejara `company_names: []` en todos los Contactos vinculados, sin consultar relaciones ni ejecutar resincronizacion durante la migracion temporal.
- Seguira el patron existente de `dry-run`, `apply` y verificacion de integridad.
- Sus actualizaciones directas no modificaran `createdAt`, `updatedAt`, `created_by` ni `updated_by`.
- El usuario ejecutara y validara la migracion manualmente. Tras ello, la implementacion eliminara su archivo y cualquier entrada temporal asociada.

## Validation

- No se agregaran pruebas automatizadas en esta spec.
- La validacion sera manual mediante Postman y MongoDB, incluyendo Usuarios internos y externos, Contactos manuales, Contactos vinculados, invitaciones, relaciones con Clientes y la migracion temporal.
