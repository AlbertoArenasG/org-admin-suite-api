# Implementation Breakdown

## Slice 1. Communication Channels Catalog

- Estado: completed
- Objetivo:
  - publicar un catálogo transversal de canales desde backend como fuente de verdad
  - seguir el patrón real del repo para catálogos en código con i18n en presenter
- Cambios realizados:
  - se creó el catálogo `communication-channels` en código
  - se agregó soporte utilitario para listar y validar canales
  - se dejó `EMAIL` como único canal vigente en esta primera versión funcional
  - se agregaron claves i18n necesarias en `enums.json`
- Validación realizada:
  - compilación satisfactoria con `npm run build`

## Slice 2. Contacts CRUD Base

- Estado: completed
- Objetivo:
  - implementar el catálogo reusable de `contacts` de punta a punta en backend
  - dejar disponibles listado, búsqueda, detalle, creación, edición y borrado lógico
- Cambios realizados:
  - se creó la entidad `Contact`
  - se agregaron puertos de lectura y escritura
  - se implementaron schema, mapper y repositorios mongoose
  - se implementaron DTOs y mapper de aplicación
  - se implementaron casos de uso:
    - `GetContactsUseCase`
    - `GetContactByIdUseCase`
    - `SearchContactsUseCase`
    - `CreateContactUseCase`
    - `UpdateContactUseCase`
    - `DeleteContactUseCase`
  - se implementaron DTOs HTTP de `contacts`
  - se implementaron presenter y controller autenticado
  - se implementaron handlers CQRS de commands y queries
  - se registró wiring en `GlobalCqrsModule`
- Reglas ya cubiertas:
  - solo se crean contactos externos manualmente
  - contactos ligados a `user` no se editan ni eliminan manualmente
  - al menos uno entre `emails`, `phones` o `cellPhones` debe existir
  - búsqueda no paginada para lookup
- Validación realizada:
  - compilación satisfactoria con `npm run build`

## Slice 3. Recipient Groups CRUD Base

- Estado: completed
- Objetivo:
  - implementar `recipient-groups` como agrupador reusable de `contacts`
- Cambios realizados:
  - se creó la entidad `RecipientGroup`
  - se agregaron puertos de lectura y escritura
  - se implementaron schema, mapper y repositorios mongoose
  - se implementaron DTOs y mapper de aplicación
  - se implementaron casos de uso:
    - `GetRecipientGroupsUseCase`
    - `GetRecipientGroupByIdUseCase`
    - `CreateRecipientGroupUseCase`
    - `UpdateRecipientGroupUseCase`
    - `DeleteRecipientGroupUseCase`
  - se implementaron DTOs HTTP de `recipient-groups`
  - se implementaron presenter y controller autenticado
  - se implementaron handlers CQRS de commands y queries
  - se registró wiring en `GlobalCqrsModule`
  - se extendió `contacts` con `findByIds` para expandir contactos en orden estable
- Reglas cubiertas:
  - `code` autogenerado desde `name`
  - `enabledChannels[]` con al menos un elemento válido del catálogo
  - `contactIds[]` con al menos un contacto existente y `ACTIVE`
  - rechazo de `contactIds` duplicados
  - preservación del orden recibido en `contactIds[]`
  - expansión ordenada de contactos en el detalle del grupo
- Validación realizada:
  - compilación satisfactoria con `npm run build`

## Slice 4. User To Contact Sync

- Estado: pending
- Objetivo:
  - conectar la sincronización automática `user -> contact` en runtime
- Alcance técnico:
  - materializar `contact` al crear usuario interno
  - actualizar campos base compartidos al actualizar usuario
  - reflejar borrado lógico del `contact` vinculado al eliminar usuario
- Reglas a cubrir:
  - sincronizar solo campos gobernados por `user`
  - no sobrescribir metadata ampliada de `contact`
  - mantener consistencia con estatus del usuario

## Slice 5. Bootstrap Seed For Existing Users

- Estado: pending
- Objetivo:
  - materializar y reconciliar `contacts` para usuarios ya existentes
- Alcance técnico:
  - seed idempotente
  - creación cuando no exista `contact` por `userId`
  - actualización parcial cuando ya exista
  - log de salida operativo sin persistencia adicional
- Reglas a cubrir:
  - incluir usuarios de cualquier estatus
  - reflejar estatus equivalente en `contact`
  - usar `ICSACV` como `companyName` inicial solo cuando falte
  - no tocar metadata ampliada ajena al `user`

## Slice 6. Validation And Docs Handoff

- Estado: pending
- Objetivo:
  - cerrar implementación con validación y actualización documental posterior al código
- Alcance técnico:
  - validar contratos mínimos de `recipient-groups`
  - validar sincronización `user -> contact`
  - validar seed inicial
  - actualizar `docs` relevantes cuando el código ya exista
  - dejar lista la base para el spec espejo de frontend
