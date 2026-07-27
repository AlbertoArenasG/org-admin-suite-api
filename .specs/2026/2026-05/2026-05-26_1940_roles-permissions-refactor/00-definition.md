# Definition

## Purpose

Este documento existe para cerrar todas las decisiones criticas del refactor antes de empezar implementacion.

Regla de trabajo:

- no arrancar el refactor estructural mientras existan decisiones criticas en estado `pending`
- tu tomas la decision final
- aqui solo se registran contexto, opciones, recomendacion e impacto

## Overall Status

- Initiative: `roles-permissions-refactor`
- Definition status: `completed`
- Implementation ready: `yes`

---

## Decision 01. User authorization model

### Context

Hoy `User.role` mezcla identidad y autorizacion. El refactor necesita separar privilegios estructurales del sistema de permisos de negocio.

### Options

1. `User.systemRole + User.roleId`
2. solo `User.roleId`
3. `User.systemRole + User.roleIds[]`

### Recommendation

Opcion 1.

Permite conservar una frontera fuerte entre privilegios estructurales del sistema y permisos configurables de negocio, sin meter complejidad de multiples roles por usuario en esta primera version.

### Implications

- cambia la entidad `User`
- cambia JWT y actor context
- cambia creacion, actualizacion e invitaciones de usuario
- obliga a modelar entidad `Role`
- todo usuario tendra exactamente un `roleId`
- no habra excepciones para `MASTER_ADMIN` ni `ADMIN`

### Decision Final

Se aprueba el modelo `User.systemRole + User.roleId`.

Reglas aprobadas:

- todo usuario tiene exactamente un `systemRole`
- todo usuario tiene exactamente un `roleId`
- no existiran usuarios sin `roleId`
- `roleId` sera la base comun para resolver permisos operativos
- `systemRole` se reserva para reglas estructurales del sistema

### Status

approved

---

## Decision 02. Structural system roles

### Context

Hay que definir cuantos `systemRole` existiran y que representa cada uno. El objetivo es evitar que el modelo vuelva a crecer por necesidades de negocio que realmente deben resolverse con roles configurables.

### Options

1. `MASTER_ADMIN`, `ADMIN` y `USER` como unicos `systemRole`
2. `MASTER_ADMIN` y `ADMIN` como unicos `systemRole`
3. conservar roles legacy temporalmente dentro del nuevo modelo

### Recommendation

Opcion 1.

Es la opcion mas clara y mas alineada con la definicion cerrada:

- `MASTER_ADMIN` como actor estructural de plataforma
- `ADMIN` como actor administrativo del negocio
- `USER` como categoria amplia y flexible para cualquier usuario no administrativo estructuralmente

La variabilidad del negocio se mueve a `roleId`, no a nuevos `systemRole`.

### Implications

- desaparecen `MASTER_STAFF`, `STAFF` y `CUSTOMER` como roles estructurales
- hay que definir migracion de usuarios legacy
- hay que redefinir reglas de creacion y asignacion de usuarios
- `USER` no reemplaza semanticamente a `CUSTOMER`
- `USER` puede representar usuarios internos o externos
- el comportamiento de `USER` depende de su `roleId`

### Decision Final

Se aprueban los siguientes `systemRole`:

- `MASTER_ADMIN`
- `ADMIN`
- `USER`

Semantica aprobada:

- `MASTER_ADMIN` es un actor estructural de plataforma, mantenimiento, soporte y desarrollo
- `MASTER_ADMIN` no forma parte de la logica de negocio del cliente
- solo `MASTER_ADMIN` conserva privilegios estructurales especiales de plataforma
- `ADMIN` pertenece al negocio y representa autoridad administrativa del cliente
- `ADMIN` no debe diversificarse en mas `systemRole`
- si el negocio necesita un "admin secundario" u otra variante, eso se resuelve con un rol configurable, no con otro `systemRole`
- `USER` es una categoria estructural amplia, interna o externa, cuyo comportamiento depende de su `roleId`

### Status

approved

---

## Decision 03. Role entity shape

### Context

Necesitamos definir exactamente que es un rol configurable y que atributos persiste.

### Options

1. Rol con campos minimos: `id`, `name`, `status`, `permissions`
2. Rol con campos operativos: `id`, `name`, `code`, `scope`, `isSystem`, `status`, `permissions`
3. Rol muy flexible con metadata libre adicional

### Recommendation

Opcion 2.

Da estructura suficiente para asignacion, control de alcance y siembra de roles iniciales sin abrir un modelo demasiado laxo.

### Implications

- requiere enums o catalogos para `scope` y `status`
- permite distinguir roles seed/inmutables de roles creados por usuarios
- facilita reglas de asignacion y administracion
- debe contemplar roles default del sistema
- `MASTER_ADMIN` y `ADMIN` usaran solo su rol default del sistema
- `USER` podra usar roles configurables

### Decision Final

Se aprueba la siguiente forma base para la entidad `Role`:

- `Role` vivira en la misma coleccion para roles del sistema y roles custom
- existira un rol default del sistema para `MASTER_ADMIN`
- existira un rol default del sistema para `ADMIN`
- no existira un rol default del sistema para `USER`
- los roles default del sistema aplican solo a `MASTER_ADMIN` y `ADMIN`
- los roles default del sistema son permanentes, no solo iniciales
- los roles default del sistema son inmutables
- solo `MASTER_ADMIN` puede modificar roles default del sistema si alguna vez hiciera falta
- `MASTER_ADMIN` solo usa su rol default del sistema
- `ADMIN` solo usa su rol default del sistema
- `USER` siempre usa un rol configurable
- `Role` tendra `name` unico e inmutable
- `Role` tendra `code` unico e inmutable
- `code` se genera una sola vez desde `name`
- la normalizacion de `code` sera en mayusculas, sin acentos, sin caracteres especiales y usando `_` para separar palabras
- `Role` tendra `scope`
- `Role` tendra `isSystem`
- `Role` tendra `isImmutable`
- `Role` tendra `isDefault`
- `Role` tendra `status`
- `Role` tendra `permissions`
- `Role` tendra `createdAt`, `updatedAt`, `createdBy` y `updatedBy`
- `Role.permissions` puede ser un arreglo vacio
- `Role.permissions` debe tener unicidad estricta por par `module + operation`
- si un rol tiene usuarios vinculados, no se puede eliminar; solo desactivar
- cualquier rol custom con `scope = USER` puede asignarse a cualquier usuario `USER`

### Status

approved

---

## Decision 04. Permission storage shape

### Context

Hay que decidir como modelar los permisos CRUD por modulo.

### Options

1. Lista normalizada de pares `module + operation`
2. Lista agrupada por modulo con flags `create/read/update/delete`
3. Matriz libre de acciones por modulo

### Recommendation

Opcion 1.

Es mas simple para validar, consultar, comparar, deduplicar y evolucionar. Tambien evita estructuras anidadas innecesarias en esta primera iteracion.

### Implications

- permisos mas verbosos en almacenamiento
- repos y guards mas simples
- futura extension a acciones no CRUD mas directa

### Decision Final

Se aprueba que `Role.permissions` se persista como lista normalizada de pares:

- `module`
- `operation`

Reglas aprobadas:

- `module` sera un codigo controlado, no un string libre
- `operation` sera un codigo controlado, no un string libre
- ambos catalogos viviran persistidos en Mongo
- ambos catalogos se sembraran por scripts idempotentes versionados en el repo
- los permisos guardaran `module` y `operation` por `code`, no por `id`
- la UI puede representarlos como matriz por modulo, aunque la persistencia sea normalizada
- el modelo debe permitir operaciones no CRUD en el futuro
- no se permiten permisos duplicados dentro del mismo rol
  - un mismo par `module + operation` no puede repetirse
  

### Status

approved

---

## Decision 05. Initial module catalog

### Context

Los permisos necesitan un catalogo formal de modulos. Aun no esta cerrado.

### Options

1. Catalogo minimo solo para backoffice actual
2. Catalogo amplio incluyendo modulos futuros
3. Catalogo derivado implicitamente de controllers

### Recommendation

Opcion 1.

Conviene arrancar con el catalogo real que el sistema ya opera, no con modulos especulativos ni con nombres derivados automaticamente del HTTP layer.

### Implications

- hay que definir un catalogo estable y de negocio
- el nombre del modulo no debe depender del nombre del controller

### Proposed Initial Modules

- `users`
- `roles`
- `customers`
- `providers`
- `service_entries`
- `service_entry_surveys`
- `files`
- `service_packages`
- `user_registration_invitations`

### Decision Final

Se aprueba el siguiente catalogo inicial de modulos de permisos, alineado a las features actuales del repo:

- `users`
- `roles`
- `customers`
- `providers`
- `service_entries`
- `service_entry_surveys`
- `files`
- `service_packages`
- `user_registration_invitations`

Notas:

- `auth` no se considera modulo de permisos de negocio
- `health` no se considera modulo de permisos de negocio
- los controllers `public/*` no forman parte del catalogo de permisos internos del backoffice
- el modulo `roles` se agrega aunque aun no exista como feature implementada, porque es parte directa del refactor

### Status

approved

---

## Decision 06. Operation catalog

### Context

Necesitamos decidir si el sistema arranca con CRUD puro o con operaciones extendidas.

### Options

1. solo `create`, `read`, `update`, `delete`
2. CRUD mas acciones como `assign`, `manage`, `download`, `submit`
3. acciones completamente libres por modulo

### Recommendation

Opcion 1 para la base del modelo, con posibilidad de extension despues.

Si desde el dia 1 intentamos capturar todas las acciones especiales, el diseño se ensucia antes de cerrar la base. Primero conviene cerrar CRUD y luego decidir excepciones.

### Implications

- algunos endpoints no CRUD quedaran mapeados temporalmente al permiso CRUD mas cercano
- mas adelante podriamos introducir acciones adicionales controladas

### Decision Final

Se aprueba un catalogo controlado de operaciones, persistido en Mongo y sembrado por scripts idempotentes.

Reglas aprobadas:

- `operation` no sera un string libre
- el catalogo inicia con base CRUD
- el modelo debe permitir agregar operaciones especiales en el futuro
- las operaciones especiales se agregaran de forma controlada por codigo y seeders

Direccion aprobada:

- CRUD base:
  - `CREATE`
  - `READ`
  - `UPDATE`
  - `DELETE`
- operaciones especiales futuras, por ejemplo:
  - `SEND_EMAIL`
  - `EXPORT`
  - `ASSIGN`
  - otras que el negocio necesite

Nota:

- no se intentara modelar hoy todas las acciones especiales del futuro; solo se deja el modelo preparado para soportarlas

### Status

approved

---

## Decision 07. Authorization execution model

### Context

Hoy la autorizacion vive repartida entre policies, guards y controllers.

### Options

1. guard central + decorator por permiso requerido
2. validaciones en cada controller y use case
3. autorizacion solo en use cases

### Recommendation

Opcion 1.

La autorizacion debe centralizarse para evitar duplicacion, pero los use cases todavia pueden conservar validaciones defensivas donde el negocio lo requiera.

### Implications

- hay que crear decorators y guard nuevos
- controllers deben perder `ensureAuthorized()`
- algunas invariantes sensibles podrian seguir validadas en application

### Decision Final

Se aprueba un modelo de autorizacion centralizado basado en:

- guard central
- decorator por permiso requerido
- validaciones defensivas adicionales en application cuando la regla sea sensible

Reglas estructurales cerradas:

- `MASTER_ADMIN` puede ver todos los usuarios y todos los roles
- solo `MASTER_ADMIN` puede ver usuarios `MASTER_ADMIN`
- solo `MASTER_ADMIN` puede ver el rol del sistema `MASTER_ADMIN`
- `ADMIN` puede ver el rol del sistema `ADMIN`, pero bloqueado
- `ADMIN` no puede ver ni tocar nada relacionado con `MASTER_ADMIN`
- `MASTER_ADMIN` puede crear cualquier usuario y cambiar cualquier `systemRole`
- `ADMIN` puede crear `USER` y `ADMIN`
- `ADMIN` puede promover `USER -> ADMIN`
- `ADMIN` puede degradar `ADMIN -> USER`
- `ADMIN` no puede crear, ver, promover ni tocar nada de `MASTER_ADMIN`
- al promover `USER -> ADMIN`, el sistema asigna automaticamente el rol default `ADMIN`
- al degradar `ADMIN -> USER`, se debe exigir explicitamente un `roleId` custom valido de `USER`
- no se puede crear un `USER` sin `roleId` custom valido
- `MASTER_ADMIN` puede asignar cualquier rol del sistema y cualquier rol custom
- `ADMIN` puede asignar el rol del sistema `ADMIN` y cualquier rol custom
- un `USER` con permiso delegado puede asignar cualquier rol custom a otro `USER`
- `MASTER_ADMIN` y `ADMIN` pueden crear roles custom por defecto
- los permisos para crear, listar, editar y eliminar roles custom tambien pueden delegarse a roles custom
- roles custom solo se administran con el permiso adecuado
- los unicos roles que no se modifican libremente son los roles del sistema inmutables
- el rol default `ADMIN` tiene todos los permisos de negocio posibles, excepto cualquier capacidad reservada a `MASTER_ADMIN`

### Status

approved

---

## Decision 09. MASTER_ADMIN exclusive capabilities

### Context

Aunque `ADMIN` tiene todos los permisos de negocio posibles, sigue existiendo una capa exclusiva de plataforma reservada a `MASTER_ADMIN`. Esa frontera no debe quedar implícita; hay que dejarla listada y separada del dominio de negocio.

### Recommendation

Mantener un conjunto explícito de capacidades exclusivas de `MASTER_ADMIN` y agrupar sus endpoints bajo el dominio HTTP `master-admin`.

### Decision Final

Se aprueba que las capacidades exclusivas de `MASTER_ADMIN` incluyan, como minimo:

- ver usuarios `MASTER_ADMIN`
- ver detalle de usuarios `MASTER_ADMIN`
- crear usuarios `MASTER_ADMIN`
- promover cualquier usuario a `MASTER_ADMIN`
- degradar usuarios `MASTER_ADMIN`
- cambiar `systemRole` hacia o desde `MASTER_ADMIN`
- ver el rol del sistema `MASTER_ADMIN`
- modificar roles del sistema inmutables
- modificar roles default del sistema
- administrar catalogos controlados del sistema:
  - `modules`
  - `operations`
- ejecutar futuras acciones reservadas de soporte, mantenimiento o plataforma

Reglas estructurales asociadas:

- `MASTER_ADMIN` puede ver todos los roles del sistema
- `ADMIN` solo puede ver el rol del sistema `ADMIN`, bloqueado
- `ADMIN` no puede ver ni tocar nada relacionado con `MASTER_ADMIN`
- el rol `MASTER_ADMIN` es un concepto fuera de negocio, reservado para soporte y desarrollo

Regla arquitectonica aprobada:

- toda feature exclusiva de `MASTER_ADMIN` debe vivir bajo `src/internal/infra/api/controllers/master-admin`

Ejemplos esperados:

- administracion de usuarios `MASTER_ADMIN`
- administracion de roles del sistema
- administracion de catalogos `modules` y `operations`
- futuras acciones de mantenimiento o soporte reservadas

### Status

approved

---

## Decision 08. JWT payload strategy

### Context

Hay que decidir que viaja en el token y que se resuelve en runtime.

### Options

1. `sub + systemRole + roleId`
2. `sub + systemRole + roleId + permissions`
3. `sub + roleId` y resolver todo en runtime

### Recommendation

Opcion 1.

Es el mejor balance entre simplicidad y control. Evita meter permisos detallados en el token y evita depender de que `roleId` por si solo represente autoridad estructural.

### Implications

- el guard o servicio de autorizacion debera resolver permisos efectivos
- cambios de rol no requeriran invalidar tokens por lista de permisos embebida

### Decision Final

Se aprueba que el JWT lleve solo:

- `sub`
- `systemRole`
- `roleId`

Reglas aprobadas:

- el JWT no llevara permisos efectivos
- el JWT no se revocara activamente cuando cambien permisos, `roleId` o `systemRole`
- el token actual seguira valido hasta expirar
- existira un endpoint especifico para consultar los permisos efectivos del usuario autenticado
- ese endpoint devolvera tambien metadatos del rol actual y del `systemRole`

Evolucion aprobada del patron de contexto autenticado:

- el proyecto ya usa un `authContext` en request
- ese patron no se reemplaza, se evoluciona
- el nuevo `authContext` debe dejar de depender de:
  - `role`
  - `isMaster`
- el nuevo `authContext` debe migrar hacia:
  - `userId`
  - `systemRole`
  - `roleId`
  - metadata del rol resuelto cuando haga falta
- el `JwtAuthGuard` debe validar el token y cargar el contexto autenticado actualizado en cada request
- el decorador `@CurrentUser()` y el tipado de Express deben alinearse al nuevo `authContext`

### Status

approved

---

## Decision 10. Role assignment rules

### Context

No basta con definir roles; hay que definir quien puede crear, editar y asignar cada uno.

### Options

1. `MASTER_ADMIN` crea y asigna todo; `ADMIN` solo asigna roles permitidos
2. `MASTER_ADMIN` y `ADMIN` crean roles dentro de su scope
3. solo `MASTER_ADMIN` administra roles y `ADMIN` nunca toca roles

### Recommendation

Mantener reglas jerárquicas explícitas por `systemRole`, pero permitiendo delegación de ciertas capacidades operativas a roles custom mediante permisos.

### Implications

- impacta endpoints de roles
- impacta reglas de asignacion a usuarios
- impacta si `scope` de rol es obligatorio

### Decision Final

Se aprueban las siguientes reglas de asignación y administración:

Administración de roles custom:

- `MASTER_ADMIN` puede crear roles custom por defecto
- `ADMIN` puede crear roles custom por defecto
- roles custom también pueden incluir permisos para:
  - crear roles custom
  - listar roles custom
  - editar roles custom
  - eliminar roles custom
- cualquier actor con permiso adecuado puede administrar cualquier rol custom
- los únicos roles no modificables libremente son los roles del sistema inmutables

Asignación de roles:

- `MASTER_ADMIN` puede asignar cualquier rol del sistema y cualquier rol custom
- `ADMIN` puede asignar el rol del sistema `ADMIN` y cualquier rol custom
- `ADMIN` no puede asignar `MASTER_ADMIN`
- un `USER` con permiso delegado puede asignar cualquier rol custom a otro `USER`
- cualquier rol custom con `scope = USER` puede asignarse a cualquier usuario `USER`

Cambio de `systemRole`:

- `MASTER_ADMIN` puede crear cualquier usuario y cambiar cualquier `systemRole`
- `ADMIN` puede crear `USER` y `ADMIN`
- `ADMIN` puede promover `USER -> ADMIN`
- `ADMIN` puede degradar `ADMIN -> USER`
- `ADMIN` no puede crear, ver, promover ni tocar nada de `MASTER_ADMIN`
- un `USER` con permisos delegados no puede cambiar `systemRole`

Reglas de reasignación automática:

- al promover `USER -> ADMIN`, el sistema asigna automáticamente el rol default `ADMIN`
- al degradar `ADMIN -> USER`, se debe enviar explícitamente un `roleId` custom válido de `USER`
- no se puede crear un `USER` sin `roleId` custom válido

Alcance de roles custom:

- los roles custom solo existen para `scope = USER`
- `MASTER_ADMIN` solo usa su rol default del sistema
- `ADMIN` solo usa su rol default del sistema
- `USER` siempre usa un rol configurable

### Status

approved

---

## Decision 11. Legacy migration policy

### Context

Existen usuarios y flujos acoplados a `MASTER_STAFF`, `STAFF` y `CUSTOMER`.

### Options

1. mapear todos los roles legacy a combinaciones nuevas
2. desactivar algunos roles legacy y migrar manualmente casos especiales
3. convivir temporalmente con legacy y nuevo modelo

### Recommendation

Opcion 1, si el inventario de usuarios y flujos es controlable.

Convivir con ambos modelos por mucho tiempo casi siempre duplica complejidad y prolonga deuda tecnica.

### Implications

- hay que definir mapping exacto por rol legacy
- hay que revisar endpoints y validaciones que hoy tratan distinto a `CUSTOMER`

### Decision Final

Se aprueba una migracion legacy pragmatica basada en el estado real de datos del sistema.

Mapping aprobado:

- usuarios actuales `MASTER_ADMIN`
  - migran a `systemRole = MASTER_ADMIN`
  - con el rol default del sistema `MASTER_ADMIN`

- usuarios actuales `ADMIN`
  - migran a `systemRole = ADMIN`
  - con el rol default del sistema `ADMIN`

- usuarios actuales `STAFF`
  - migran a `systemRole = USER`
  - con un rol custom seed `STAFF_LEGACY`

- `CUSTOMER`
  - sin migracion por ahora
  - no existio en datos reales ni en uso efectivo del frontend

- `MASTER_STAFF`
  - sin migracion por ahora
  - no existio en datos reales ni en uso efectivo del frontend

Reglas aprobadas:

- no se diseñara migracion para roles que solo existieron conceptualmente en codigo pero no en datos reales
- `STAFF_LEGACY` existe para que ningun usuario migrado quede sin `roleId`
- despues de la migracion, el cliente podra crear roles custom nuevos y reasignar usuarios `USER` gradualmente
- no se permitiran usuarios sin `roleId` en el nuevo modelo

### Status

approved

---

## Ready Checklist

- [x] El modelo final de `User` esta aprobado
- [x] Los `systemRole` finales estan aprobados
- [x] La estructura de `Role` esta aprobada
- [x] La estructura de `Permission` esta aprobada
- [x] El catalogo inicial de modulos esta aprobado
- [x] El catalogo inicial de operaciones esta aprobado
- [x] La estrategia de JWT esta aprobada
- [x] Las reglas de asignacion de roles estan aprobadas
- [x] La politica de migracion legacy esta aprobada

## Implementation Gate

Estado actual: `ready_for_technical_design`

La definicion funcional critica ya esta cerrada. El siguiente paso es diseño tecnico detallado e implementacion por fases.
