# Decisions

## Decision 01. Source Of Truth For Internal Contacts

### Context

Un contacto generado desde un Usuario no debe clasificarse como interno o externo a partir de sus nombres de empresa ni de sus relaciones con Clientes. Ambos datos pueden cambiar por motivos distintos.

### Decision Final

Se aprueba agregar `is_internal_staff` como propiedad de negocio del flujo de invitacion y del `User` materializado.

- Si `User.is_internal_staff` es `true`, el contacto vinculado al Usuario es interno.
- Si `User.is_internal_staff` es `false`, el contacto vinculado al Usuario es externo.
- La relacion con uno o varios Clientes no modifica esa clasificacion.
- Frontend no debera inferir la clasificacion desde `user_id` ni desde `company_names`.

### Status

approved

## Decision 02. Company-Name Derivation

### Decision Final

`Contact.companyNames` de un contacto vinculado a Usuario representara exclusivamente los Clientes relacionados vigentes:

- Usuario interno sin Clientes: `[]`.
- Usuario interno con Clientes: `customerCompanyNames`.
- Usuario externo sin Clientes: `[]`.
- Usuario externo con Clientes: `customerCompanyNames`.

Los Clientes eliminados logicamente se excluiran de la derivacion, conforme a la regla vigente. Los Clientes inactivos permaneceran mientras su relacion exista.

El orden sera determinista por nombre e ID de Cliente. La sincronizacion reemplazara la lista completa para evitar nombres obsoletos.

La pertenencia interna se expresara exclusivamente mediante `is_internal_staff`; `Implementos Cientificos` no se agregara como nombre derivado de empresa. Los Contactos manuales conservaran los nombres de empresa que se administren explicitamente, independientemente de su clasificacion.

### Status

approved

## Decision 03. Scope And Administration Of Internal Staff

### Decision Final

`is_internal_staff` aplica a todos los `SystemRole` y fronteras de registro, incluidos `USER`, `ADMIN` y `MASTER_ADMIN`.

- Las invitaciones de `USER` y los flujos que materialicen ese Usuario deben recibir el valor explicitamente.
- `ADMIN` y `MASTER_ADMIN` se materializaran siempre como internos, conforme a la validacion por rol final.
- `PATCH /v1/users/:userId` podra actualizar el valor con la operacion administrativa vigente `USERS/UPDATE`.
- Cada cambio explicito resincronizara el contacto vinculado dentro de la misma unidad atomica.
- La propiedad no concede permisos, no determina el `SystemRole` y no modifica relaciones con Clientes.

### Status

approved

## Decision 04. Existing Data Migration

### Decision Final

La base actual contiene exclusivamente Usuarios e invitaciones de personal interno de Implementos Cientificos. La migracion temporal normalizara `is_internal_staff: true` para todos los documentos existentes de `User` y de invitaciones de registro aplicables.

La migracion tambien resincronizara los contactos vinculados a Usuarios con la nueva regla de derivacion de `company_names`.

No se disena como mecanismo permanente ni generico: debe ejecutarse manualmente una sola vez, validarse en MongoDB y eliminarse del repositorio dentro de esta misma spec. La eliminacion evita que se aplique por error en una base futura que ya contenga Usuarios externos.

### Status

approved

## Decision 05. API Contracts And Mutation Semantics

### Decision Final

`PATCH /v1/users/:userId` aceptara `is_internal_staff` como campo opcional de una actualizacion parcial:

- Si se omite, conserva el valor persistido.
- Si se incluye, debe ser booleano valido y se validara contra el rol final del Usuario.
- Un cambio efectivo resincroniza el contacto dentro de la misma unidad atomica.

Las respuestas protegidas de detalle y listado de Usuario e Invitacion expondran `is_internal_staff`. Los endpoints publicos no lo expondran en esta entrega.

### Status

approved

## Decision 06. Contact Classification Materialization

### Decision Final

Se agregara `is_internal_staff: boolean` tambien a `Contact`, con el mismo nombre que en `User` para expresar una semantica inequivoca.

- Un contacto creado manualmente recibira `is_internal_staff` explicitamente desde su creacion y podra actualizarlo mientras permanezca sin `user_id`.
- Un contacto vinculado a un Usuario materializara el valor de `User.is_internal_staff`.
- Un cambio efectivo de `User.is_internal_staff` resincronizara `Contact.is_internal_staff` y `company_names` dentro de la misma unidad atomica.
- Presenters, filtros y consumidores de Contactos usaran el campo materializado; no inferiran la clasificacion desde `user_id` ni desde `company_names`.
- Cualquier contacto con `user_id` sera inmutable desde la frontera administrativa de Contactos. `PATCH /v1/contacts/:contactId` rechazara toda mutacion sobre esos contactos; sus ediciones solo podran ocurrir mediante la sincronizacion de su Usuario vinculado.

### Status

approved

## Decision 07. User-Contact Synchronization Events

### Decision Final

`SyncUserContactService` sera el unico escritor de Contactos vinculados a Usuarios. Expondra operaciones de aplicacion aisladas para cubrir los dos alcances de sincronizacion:

- `syncFromUser(user)`: sincroniza identidad, estatus, `is_internal_staff` y `company_names`.
- `syncCompanyNamesForUsers(userIds)`: recalcula exclusivamente `company_names`, sin modificar identidad, estatus ni auditoria del Contacto.

Los disparadores seran:

- Consumo de una invitacion: sincronizacion integral del nuevo Usuario.
- Edicion administrativa de Usuario o actualizacion del perfil: sincronizacion integral.
- Cambio efectivo de `is_internal_staff`: sincronizacion integral dentro de la misma transaccion.
- Agregar, remover o reemplazar relaciones Usuario-Cliente: recalculo exclusivo de `company_names`.
- Renombrar o eliminar logicamente un Cliente: recalculo exclusivo de `company_names` de los Usuarios relacionados.
- Eliminacion logica de Usuario: se conserva el comportamiento vigente, marcando tambien como eliminado su Contacto vinculado.

Los casos de uso permanecen como orquestadores y delegan la regla de materializacion a servicios de aplicacion especializados.

### Status

approved

## Decision 08. API Contracts And Temporary Migration

### Decision Final

Las invitaciones y Usuarios persistiran `is_internal_staff` como propiedad de negocio. La API aplicara las siguientes reglas:

- Las invitaciones y Usuarios con `SystemRole.ADMIN` o `SystemRole.MASTER_ADMIN` seran siempre internos. Backend forzara `is_internal_staff: true` y no permitira clasificarlos como externos.
- Las invitaciones de `SystemRole.USER` requeriran `is_internal_staff` explicitamente al crearse.
- El consumo de una invitacion materializara el valor persistido en el Usuario.
- `PATCH /v1/users/:userId` aceptara `is_internal_staff` de forma opcional, con la restriccion de que `ADMIN` y `MASTER_ADMIN` permanecen internos.
- Las respuestas protegidas de detalle y listado de Usuarios e Invitaciones incluiran `is_internal_staff`. Los endpoints publicos no lo expondran.
- La creacion manual de Contactos requerira `is_internal_staff` explicitamente. La actualizacion de Contactos manuales tambien podra modificarlo.
- Los Contactos vinculados a Usuarios mantienen la prohibicion de cualquier mutacion administrativa, incluida esta bandera.
- Todas las respuestas protegidas de Contactos, incluidos listado, detalle y busqueda, incluiran `is_internal_staff`.

La migracion temporal normalizara Usuarios e Invitaciones existentes como internos. Tambien materializara `is_internal_staff: true` en Contactos vinculados a Usuarios y `false` en Contactos manuales. Como los datos actuales aun no tienen relaciones Usuario-Cliente desplegadas, dejara `company_names: []` en todos los Contactos vinculados, sin resolver ni resincronizar relaciones. Debe ejecutarse y validarse manualmente una sola vez, y despues eliminarse del repositorio dentro de esta spec.

La migracion no modificara `createdAt`, `updatedAt`, `created_by` ni `updated_by`. Sus escrituras directas de Infra limitaran los cambios a los campos de clasificacion y materializacion estrictamente necesarios.

### Status

approved

## Decision 09. Internal-Staff Validation By Final System Role

### Decision Final

La clasificacion interna se validara contra el `SystemRole` final del Usuario o de la invitacion:

- Para `USER`, `is_internal_staff` sera obligatorio al crear una invitacion y podra ser `true` o `false`.
- Para `ADMIN` y `MASTER_ADMIN`, el campo sera opcional en la creacion y backend materializara siempre `true`.
- Si un consumidor envia explicitamente `false` para `ADMIN` o `MASTER_ADMIN`, API respondera una validacion `400`; no ignorara el valor silenciosamente.
- En `PATCH /v1/users/:userId`, la misma regla se evaluara con el rol resultante despues de aplicar el cambio parcial. Un Usuario promovido a `ADMIN` o `MASTER_ADMIN` se volvera interno. Un Usuario que permanezca o cambie a `USER` podra actualizar explicitamente su clasificacion.

La regla vivira en una politica de dominio reutilizable para evitar condiciones duplicadas en DTOs, casos de uso y servicios.

### Status

approved
