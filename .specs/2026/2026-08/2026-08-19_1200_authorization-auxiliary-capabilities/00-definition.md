# Definition

## Purpose

Esta iniciativa existe para definir cómo modelar en backend las capacidades auxiliares reutilizables que no encajan limpiamente en el catálogo funcional actual de `module + operation`, pero que tampoco deben resolverse como acceso libre por inercia ni como sobrecarga de permisos administrativos existentes.

Esta iniciativa no se limita al módulo `internal_asset_maintenance_records`.

Su objetivo es definir e implementar un approach uniforme para todo el backoffice protegido de negocio, de modo que no queden conviviendo dos enfoques distintos para endpoints auxiliares reutilizables.

Regla de trabajo:

- no arrancar implementación estructural mientras existan decisiones críticas en estado `pending`
- tú tomas la decisión final
- aquí solo se registran contexto, opciones, recomendación e impacto
- las decisiones se aterrizan una por una

## Overall Status

- Initiative: `authorization-auxiliary-capabilities`
- Definition status: `completed`
- Implementation ready: `yes`

---

## Decision 01. Modelo base para capacidades auxiliares reutilizables

### Context

El sistema ya tiene un modelo operativo claro para autorización ordinaria:

- `module + operation`
- `PermissionsGuard`
- catálogo funcional en código

Ese modelo funciona bien para capacidades visibles de negocio o backoffice administrativo.

El problema nuevo aparece con módulos consumidores como `internal_asset_maintenance_records`, que necesitan acceder a endpoints auxiliares de otros módulos reutilizables, por ejemplo:

- catálogos de `expiration_status_policies`
- catálogos de `expiration_notification_policies`
- potencialmente options o lookups de `recipient_groups`

La dificultad es que esos endpoints auxiliares:

- no equivalen al acceso administrativo completo del módulo proveedor
- pueden ser reutilizados por más de un módulo consumidor futuro
- no conviene resolverlos mediante combinaciones ad hoc de permisos de consumidores
- tampoco conviene hardcodear esa lógica en frontend

### Options

1. Seguir usando solo el catálogo actual de `module + operation` y absorber estos accesos en permisos administrativos existentes como `READ`
2. Abrir todos los endpoints auxiliares de bajo riesgo a cualquier usuario autenticado
3. Agregar una segunda capa explícita de capacidades auxiliares, separada del catálogo funcional principal

### Recommendation

Opción 3.

Permite conservar limpio el significado del catálogo funcional principal, sin regalar acceso administrativo completo a módulos proveedores ni abrir un refactor mayor del sistema de autorización ordinario.

### Implications

- el backend mantendría dos tipos de autorización:
  - permisos funcionales ordinarios por `module + operation`
  - capacidades auxiliares reutilizables
- la derivación de capacidades auxiliares podría resolverse al mutar roles
- endpoints auxiliares sensibles o reutilizables podrían evaluarse con un guard separado
- frontend no tendría que convertirse en fuente de verdad de dependencias

### Decision Final

Se aprueba introducir una segunda capa explícita de autorización para capacidades auxiliares reutilizables, separada del catálogo funcional principal de `module + operation`.

La frontera queda así:

- permisos funcionales ordinarios:
  - representan capacidades visibles de negocio o backoffice
  - siguen gobernados por `module + operation`
  - siguen evaluándose con `PermissionsGuard`
- capacidades auxiliares reutilizables:
  - representan accesos de soporte consumidos por uno o más módulos funcionales
  - no equivalen a acceso administrativo completo del módulo proveedor
  - se evaluarán con una capa separada

También se aprueba que esta nueva capa:

- no sustituye al catálogo funcional actual
- no redefine el significado de `READ`, `CREATE`, `UPDATE` o `DELETE`
- no se resuelve por combinaciones ad hoc de permisos de módulos consumidores
- no debe convertir a frontend en fuente de verdad de dependencias

El objetivo de esta capa es resolver casos como:

- catálogos o lookups reutilizables
- endpoints auxiliares necesarios para que un módulo consumidor funcione sin abrir acceso administrativo completo al módulo proveedor

También queda explícito que:

- esta iniciativa no terminará en una implementación parcial limitada a `internal_asset_maintenance_records`
- el rollout objetivo será uniforme dentro del backoffice protegido de negocio
- no se busca dejar conviviendo en código un enfoque legacy para ciertos auxiliares reutilizables y uno nuevo para otros

Queda abierto para decisiones posteriores:

- qué auxiliares serán autenticados de bajo riesgo
- cuáles requerirán capacidad auxiliar gobernada
- cómo se representarán exactamente en el modelo `Role`
- cómo se derivarán durante mutaciones del rol

### Status

approved

---

## Decision 05. Shape de cada elemento de `auxiliaryCapabilities[]`

### Context

Ya quedó aprobado que:

- `auxiliaryCapabilities[]` será un campo persistido dentro de `Role`
- no será un `string[]`
- será un arreglo de objetos
- cada elemento debe quedar anclado a un módulo proveedor

Falta cerrar el shape exacto de cada elemento para mantener consistencia con el modelo actual de permisos sin mezclar semánticas.

### Options

1. Objeto mínimo con:
   - `module`
   - `capability`
2. Objeto con naming más explícito:
   - `moduleKey`
   - `capabilityKey`
3. Objeto tipo permission-like con:
   - `module`
   - `action`

### Recommendation

Opción 1.

Mantiene el shape simple, coherente con el lenguaje actual de módulos y deja claro que la segunda dimensión ya no es una `operation`, sino una `capability`.

### Implications

- cada elemento de `auxiliaryCapabilities[]` tendrá identidad natural por el par `module + capability`
- la nueva capa conserva cercanía conceptual con `permissions[]`, pero sin reaprovechar el nombre `action`
- el catálogo futuro de auxiliary capabilities podrá expresarse con la misma convención
- el guard/decorator auxiliar podrá evaluar un shape pequeño y explícito
- más adelante se podrían agregar nuevos campos al objeto sin migrar desde `string[]`

### Decision Final

Se aprueba que cada elemento de `auxiliaryCapabilities[]` sea un objeto pequeño con este shape conceptual:

- `module`
- `capability`

También se aprueba que:

1. no se usará el nombre `action` para esta segunda dimensión
2. el propósito del listado ya queda suficientemente claro por el nombre del campo `auxiliaryCapabilities`
3. el par `module + capability` funcionará como identidad natural de cada elemento
4. si en el futuro hicieran falta más propiedades, se agregarán sobre este objeto en lugar de migrar desde un `string[]`

### Status

approved

---

## Decision 06. Ubicación del catálogo, derivación y piezas HTTP de la nueva capa

### Context

Ya quedaron aprobados:

- la existencia de una segunda capa explícita para `auxiliary capabilities`
- su derivación en backend
- su persistencia en `Role`
- el shape de cada elemento como `{ module, capability }`

Falta cerrar dónde vivirán estructuralmente:

- el catálogo maestro de `auxiliary capabilities`
- el mapa de derivación
- el guard y decorator nuevos

También hay que evitar refactors innecesarios de reubicación sobre piezas existentes que ya siguen un patrón estable.

### Options

1. Reubicar las piezas existentes de permisos para crear una nueva estructura unificada desde cero
2. Mantener las piezas existentes en su ubicación actual y agregar las nuevas piezas cerca del patrón vigente
3. Repartir catálogo y derivación dentro de módulos de negocio proveedores

### Recommendation

Opción 2.

Permite introducir la nueva capa sin refactor estructural amplio, respetando la arquitectura actual y manteniendo la autorización transversal en `authz`.

### Implications

- no se moverán `permissions.decorator.ts` ni `permissions.guard.ts` solo por esta iniciativa
- el catálogo maestro y el mapa de derivación vivirán en la capa de autorización `authz`
- el decorator y guard nuevos vivirán junto a sus equivalentes actuales
- se conserva un criterio claro de ownership:
  - definición y derivación en `authz`
  - enforcement HTTP junto al patrón actual de decorators/guards

### Decision Final

Se aprueba un enfoque conservador de ubicación y ownership:

1. las piezas existentes de permisos no se reubican
2. las nuevas piezas de `auxiliary capabilities` se agregan junto a los patrones ya existentes
3. el catálogo maestro de `auxiliary capabilities` vivirá en la capa de autorización `authz`
4. el mapa de derivación de `auxiliary capabilities` también vivirá en `authz`, separado del catálogo maestro
5. el decorator nuevo vivirá en la misma zona donde ya vive `permissions.decorator.ts`
6. el guard nuevo vivirá en la misma zona donde ya vive `permissions.guard.ts`
7. no se distribuirá esta responsabilidad dentro de módulos de negocio proveedores

Estructura objetivo sugerida:

- `src/internal/application/services/authz/authorization.catalog.ts`
- `src/internal/application/services/authz/authorization-operations.catalog.ts`
- `src/internal/application/services/authz/auxiliary-capabilities/auxiliary-capabilities.catalog.ts`
- `src/internal/application/services/authz/auxiliary-capabilities/auxiliary-capabilities-derivation.catalog.ts`
- `src/internal/application/services/authz/auxiliary-capabilities/auxiliary-capabilities.types.ts`
- `src/internal/application/services/authz/auxiliary-capabilities/auxiliary-capabilities.service.ts`
- `src/common/decorators/permissions.decorator.ts`
- `src/common/decorators/auxiliary-capabilities.decorator.ts`
- `src/internal/infra/api/guards/permissions.guard.ts`
- `src/internal/infra/api/guards/auxiliary-capabilities.guard.ts`

### Status

approved

---

## Decision 07. Shape del catálogo maestro de `auxiliary capabilities`

### Context

Ya quedó aprobada la ubicación del catálogo maestro dentro de `authz`.

Antes de definir el mapa de derivación, conviene cerrar el shape de cada entry del catálogo, para que la derivación refiera una fuente de verdad explícita y estable.

También conviene evitar mezclar en el catálogo responsabilidades que pertenecen a otras piezas, como:

- consumidores automáticos
- detalles HTTP
- clasificación de sensibilidad

### Options

1. Entry mínimo con:
   - `module`
   - `capability`
2. Entry base con:
   - `module`
   - `capability`
   - `description`
3. Entry más rico con metadata adicional como:
   - `endpoint`
   - `method`
   - `consumerModules`
   - `sensitive`

### Recommendation

Opción 2.

Mantiene el catálogo declarativo y suficientemente expresivo para lectura humana, sin mezclar responsabilidades que corresponden al mapa de derivación o al layer HTTP.

### Implications

- el catálogo maestro responderá únicamente qué `auxiliary capabilities` existen
- cada entry conservará consistencia con el shape persistido en `Role`
- `description` aportará legibilidad, documentación interna y soporte de debugging
- el mapa de derivación quedará libre para resolver por separado quién recibe automáticamente cada capability
- no se acoplará prematuramente el catálogo al transporte HTTP

### Decision Final

Se aprueba que cada entry del catálogo maestro de `auxiliary capabilities` tenga este shape base:

- `module`
- `capability`
- `description`

También se aprueba que:

1. el catálogo maestro será declarativo
2. el catálogo maestro no incluirá, por ahora:
   - `consumerModules`
   - `endpoint`
   - `method`
   - `sensitive`
   - `derivedBy`
3. la responsabilidad del catálogo será responder qué capabilities auxiliares existen, no quién las recibe automáticamente

### Status

approved

---

## Decision 08. Shape del mapa de derivación de `auxiliary capabilities`

### Context

Ya quedaron aprobados:

- el catálogo maestro de `auxiliary capabilities`
- su persistencia en `Role`
- el shape persistido de cada capability como `{ module, capability }`

Falta cerrar cómo se expresará el mapa de derivación que backend utilizará durante `create-role` y `update-role`.

La duda principal es cuál será la unidad que dispara la derivación:

- permiso específico
- módulo consumidor completo
- algún enfoque híbrido

### Options

1. Derivación por permiso específico del módulo consumidor
2. Derivación por módulo consumidor
3. Derivación híbrida con reglas especiales por operación

### Recommendation

Opción 2.

Mantiene el modelo simple, evita granularidad innecesaria y encaja mejor con el objetivo de que el usuario del editor de roles no tenga que entender dependencias técnicas.

### Implications

- cada regla del mapa de derivación quedará anclada a un `consumerModule`
- cada regla listará las `auxiliaryCapabilities` que ese módulo necesita para operar correctamente
- la derivación no dependerá de combinaciones finas de operaciones como `READ`, `CREATE` o `UPDATE`
- backend podrá recalcular la lista derivada con una regla simple y legible
- se reduce el riesgo de generar roles funcionalmente incompletos por configuraciones parciales difíciles de anticipar

### Decision Final

Se aprueba que el mapa de derivación de `auxiliary capabilities` se exprese por `consumerModule`.

Shape conceptual aprobado para cada regla:

- `consumerModule`
- `auxiliaryCapabilities`

Donde `auxiliaryCapabilities` será una lista de objetos con el shape ya aprobado:

- `module`
- `capability`

También se aprueba que:

1. la derivación se activará si el rol tiene al menos un permiso funcional directo del `consumerModule`
2. no será necesario distinguir, para esta derivación base, entre `READ`, `CREATE`, `UPDATE` u otra operación específica del módulo consumidor
3. el mapa de derivación responderá qué capabilities auxiliares requiere un módulo consumidor para operar correctamente, no qué endpoint individual usa cada pantalla
4. los casos excepcionales más granulares no se diseñarán por adelantado; si en el futuro aparecen, deberán evaluarse explícitamente como extensión del modelo

### Status

approved

---

## Decision 09. Estrategia de recálculo de `auxiliaryCapabilities[]`

### Context

Ya quedó aprobado que backend deriva y persiste `auxiliaryCapabilities[]`.

Falta cerrar cómo se comporta esa derivación durante las mutaciones del rol:

- si se recalcula completo
- si se hace merge incremental
- si se preservan elementos manualmente

### Options

1. Recalcular y reemplazar completo en cada mutación
2. Hacer merge incremental
3. Preservar ciertos elementos manualmente

### Recommendation

Opción 1.

Es la más simple y consistente con el hecho de que `auxiliaryCapabilities[]` es un campo derivado y controlado por backend.

### Implications

- no existirán auxiliary capabilities “arrastradas” desde estados previos del rol
- no habrá lógica especial de merge o preservación manual
- el estado final de `auxiliaryCapabilities[]` siempre reflejará exactamente el estado actual de `permissions[]` y del mapa de derivación

### Decision Final

Se aprueba que `auxiliaryCapabilities[]` se recalculará desde cero y se reemplazará completo en ambas mutaciones:

- `create-role`
- `update-role`

No habrá merge incremental ni preservación manual de elementos previos.

### Status

approved

---

## Decision 10. Validación de integridad entre catálogo y mapa de derivación

### Context

La nueva capa tendrá al menos dos piezas declarativas distintas:

- catálogo maestro de `auxiliary capabilities`
- mapa de derivación por `consumerModule`

Existe el riesgo de que el mapa de derivación referencie una capability inexistente o mal escrita respecto al catálogo maestro.

Falta cerrar cuándo debe detectarse esa inconsistencia.

### Options

1. Validar al arrancar la aplicación
2. Validar solo cuando se derive durante `create-role` o `update-role`
3. No validarlo explícitamente

### Recommendation

Opción 1.

Permite fallar temprano y evitar que una configuración rota sobreviva hasta runtime funcional.

### Implications

- una inconsistencia entre mapa y catálogo fallará de manera temprana
- no se dependerá de que el error aparezca solo al crear o editar un rol
- no se agregará costo repetido de validación en cada derivación funcional

### Decision Final

Se aprueba validar la integridad entre el catálogo maestro y el mapa de derivación al arrancar la aplicación.

En particular:

1. toda capability referenciada por el mapa de derivación deberá existir en el catálogo maestro
2. una inconsistencia de naming o referencia deberá provocar falla temprana de inicialización
3. no se confiará únicamente en revisión manual o tests para garantizar esa integridad

### Status

approved

---

## Decision 11. Exposición de `auxiliaryCapabilities` en responses de roles

### Context

`auxiliaryCapabilities[]` existirá en persistencia y será evaluado por backend, pero todavía falta cerrar si debe formar parte de los contratos HTTP de salida de roles.

Hoy frontend no necesita esta capa para rendering ni para comportamiento de interfaz.

Exponerla ahora agregaría superficie de contrato e implicaría trabajo de integración/documentación que hoy no aporta valor funcional directo.

### Options

1. Exponer `auxiliaryCapabilities` ya en responses de roles
2. No exponerlo por ahora
3. Exponerlo solo en endpoints administrativos específicos

### Recommendation

Opción 2.

Mantiene esta primera implementación enfocada en backend y evita complejidad contractual innecesaria.

### Implications

- `auxiliaryCapabilities[]` seguirá siendo una preocupación interna de backend en esta primera fase
- no será necesario ajustar frontend por esta capa en la implementación inicial
- si en el futuro frontend necesitara renderizar o inspeccionar esta capa, eso podrá resolverse con una spec posterior más pequeña y explícita

### Decision Final

Se aprueba no exponer `auxiliaryCapabilities` por ahora en los responses ordinarios de roles.

También se aprueba que:

1. esta primera implementación no forzará una spec equivalente en frontend
2. la capa seguirá siendo interna de backend mientras frontend no tenga una necesidad real de consumo
3. si en el futuro se requiriera exponerla, eso se trabajará en una spec posterior específica

### Status

approved

---

## Decision 12. Catálogo maestro inicial de `auxiliary capabilities`

### Context

Ya quedó aprobado el shape del catálogo maestro.

Falta cerrar el inventario inicial exacto de capabilities que existirán en esta primera implementación, sin mezclar todavía la parte de derivaciones por módulo consumidor.

### Options

1. Definir un catálogo inicial mínimo con solo las capabilities hoy consumidas de forma transversal
2. Intentar incluir desde ahora capabilities potenciales futuras
3. Mantener el catálogo abierto sin cerrarlo todavía

### Recommendation

Opción 1.

Mantiene la primera implementación acotada a necesidades reales ya observables en código.

### Implications

- la primera fase implementará únicamente capabilities ya justificadas por consumo real
- las capabilities futuras no se inventarán por anticipado
- el siguiente paso podrá enfocarse solo en derivaciones iniciales sobre este catálogo ya cerrado

### Decision Final

Se aprueba que el catálogo maestro inicial de `auxiliary capabilities` incluya exactamente estas entries:

1. `CONTACTS + SEARCH`
2. `COMMUNICATION_CHANNELS + READ_OPTIONS`
3. `EXPIRATION_STATUS_POLICIES + READ_OPTIONS`
4. `EXPIRATION_NOTIFICATION_POLICIES + READ_OPTIONS`

También se aprueba que:

1. este inventario corresponde al catálogo maestro inicial, no al mapa de derivaciones
2. cualquier capability adicional futura deberá incorporarse explícitamente en una ampliación posterior del catálogo

### Status

approved

---

## Decision 13. Mapa inicial de derivaciones por módulo consumidor

### Context

Ya quedó aprobado:

- el catálogo maestro inicial de `auxiliary capabilities`
- el shape del mapa de derivación por `consumerModule`

Falta cerrar el inventario inicial exacto de derivaciones que esta primera implementación aplicará.

### Options

1. Derivar solo las relaciones ya observables hoy en código
2. Anticipar desde ahora derivaciones futuras probables
3. Dejar el mapa inicial abierto para decidirlo durante implementación

### Recommendation

Opción 1.

Mantiene la primera implementación acotada a dependencias reales ya identificadas.

### Implications

- la primera fase no inventará derivaciones futuras sin consumo real
- el mapa inicial quedará pequeño, explícito y verificable
- futuras derivaciones se agregarán de forma consciente en ampliaciones posteriores

### Decision Final

Se aprueba que el mapa inicial de derivaciones por `consumerModule` incluya exactamente estas reglas:

1. `RECIPIENT_GROUPS` deriva:
   - `CONTACTS + SEARCH`
   - `COMMUNICATION_CHANNELS + READ_OPTIONS`
2. `INTERNAL_ASSET_MAINTENANCE_RECORDS` deriva:
   - `EXPIRATION_STATUS_POLICIES + READ_OPTIONS`
   - `EXPIRATION_NOTIFICATION_POLICIES + READ_OPTIONS`

También se aprueba que:

1. este inventario corresponde al mapa inicial de derivaciones, no al catálogo maestro
2. cualquier derivación futura deberá agregarse explícitamente en una ampliación posterior

### Status

approved

---

## Decision 14. Patrón del guard y decorator auxiliar

### Context

La nueva capa de `auxiliary capabilities` necesita su propio mecanismo de enforcement HTTP.

Falta cerrar si ese enforcement debe:

- reutilizar y extender `PermissionsGuard`
- o existir como guard y decorator separados

### Options

1. Reutilizar `PermissionsGuard` con lógica adicional
2. Crear un decorator y un guard separados para `auxiliary capabilities`
3. Resolverlo con una mezcla de ambos enfoques

### Recommendation

Opción 2.

Mantiene la semántica clara y evita ensuciar `PermissionsGuard` con una segunda responsabilidad.

### Implications

- los endpoints dejarán explícito qué tipo de autorización requieren
- `PermissionsGuard` conservará intacta su responsabilidad actual
- la nueva capa tendrá su propio punto de enforcement

### Decision Final

Se aprueba que la nueva capa se implemente con piezas separadas:

1. un decorator específico, con patrón conceptual:
   - `@RequireAuxiliaryCapability(module, capability)`
2. un guard específico:
   - `AuxiliaryCapabilitiesGuard`

También se aprueba que:

1. `PermissionsGuard` no absorberá esta lógica
2. `@RequirePermission(...)` conservará su semántica actual sin mezclar `auxiliary capabilities`

### Status

approved

---

## Decision 02. Frontera entre catálogos autenticados abiertos y capacidades auxiliares gobernadas

### Context

No todos los endpoints auxiliares tienen el mismo nivel de sensibilidad.

Algunos parecen suficientemente inocuos para permitir acceso a cualquier usuario autenticado, por ejemplo:

- tipos fijos
- statuses controlados por código
- catálogos mínimos de bajo riesgo

Otros sí exponen información operativa que no conviene abrir indiscriminadamente, por ejemplo:

- grupos de destinatarios
- potencialmente contactos u otros recursos reutilizables futuros

Antes de definir guards o derivaciones, hay que cerrar si existirá una frontera explícita entre:

- catálogos autenticados abiertos por bajo riesgo
- capacidades auxiliares todavía gobernadas

### Options

1. Mantener todos los auxiliares bajo permiso gobernado
2. Abrir todos los auxiliares a cualquier autenticado
3. Separar explícitamente entre auxiliares de bajo riesgo y auxiliares gobernados

### Recommendation

Ninguna de las tres opciones tal como están redactadas ya refleja del todo la frontera que terminó apareciendo durante el análisis.

La recomendación actual es una variante más precisa:

- no clasificar por sensibilidad momentánea del payload
- clasificar por naturaleza arquitectónica:
  - auxiliar local del módulo proveedor
  - capability auxiliar reutilizable del backoffice

Y, bajo esa frontera:

- toda capability auxiliar reutilizable del backoffice debe quedar gobernada por la nueva capa auxiliar
- todo auxiliar local del módulo proveedor debe quedar fuera de esa capa

### Implications

- la nueva capa no se aplicará a cualquier endpoint helper por defecto
- solo se aplicará a auxiliares reutilizables dentro del backoffice
- los auxiliares locales del módulo proveedor no migrarán a esta capa
- la clasificación deberá quedar apoyada en un inventario explícito y documentado
- no se usará una mezcla runtime de:
  - algunos auxiliares reutilizables abiertos
  - otros gobernados
  dentro del mismo backoffice

### Decision Final

Se aprueba que la frontera relevante para esta iniciativa no será:

- sensible vs no sensible
- abierto vs gobernado

La frontera aprobada será arquitectónica:

- auxiliar local del módulo proveedor
- capability auxiliar reutilizable del backoffice

Reglas aprobadas:

1. toda capability auxiliar reutilizable del backoffice quedará gobernada por la nueva capa auxiliar
2. todo auxiliar local del módulo proveedor quedará fuera de esa capa
3. los endpoints públicos/tokenizados y la frontera `MASTER_ADMIN` siguen fuera de esta iniciativa
4. los catálogos locales de enums, statuses o tipos fijos para create/edit del propio módulo no entran a la nueva capa
5. los lookups resumidos de instancias reales reutilizables entre módulos sí son candidatos naturales a esta capa

Aplicación inicial ya aclarada durante el análisis:

- quedan fuera:
  - `GET /v1/roles/modules`
  - `GET /v1/users/roles`
  - `GET /v1/expiration-status-policies/catalog`
  - `GET /v1/expiration-notification-policies/catalog`
- entran como candidatos claros:
  - `GET /v1/contacts/search`
  - `GET /v1/communication-channels`
  - `GET /v1/expiration-status-policies/options`
  - `GET /v1/expiration-notification-policies/options`

### Status

approved

---

## Decision 02.a. Frontera de autorización para auxiliares locales fuera de la nueva capa

### Context

Al aprobar la decisión 02 quedó claro qué entra y qué no entra a la nueva capa auxiliar.

Pero todavía faltaba cerrar qué pasa, dentro del backoffice protegido de negocio, con los endpoints auxiliares que queden fuera de esa nueva capa.

Si no se define explícitamente, aparecería una tercera categoría ambigua:

- endpoints protegidos por `module + operation`
- endpoints protegidos por `auxiliary capability`
- endpoints que solo requieren autenticación

Esa tercera vía haría más difícil mantener un modelo uniforme y legible a futuro.

### Options

1. Tratar los auxiliares locales fuera de la nueva capa como endpoints solo autenticados
2. Mantener los auxiliares locales fuera de la nueva capa bajo la frontera funcional existente de `module + operation`
3. Mezclar ambos enfoques según conveniencia del endpoint

### Recommendation

Opción 2.

Permite mantener una frontera explícita de autorización para todo el backoffice protegido, sin introducir un tercer carril informal basado solo en autenticación.

### Implications

- `module + operation` deja de entenderse como mapeo rígido `1 permiso = 1 endpoint exacto`
- pasa a entenderse como frontera funcional del módulo
- esa frontera puede cubrir:
  - endpoints operativos principales
  - endpoints auxiliares locales del mismo módulo
- la nueva capa auxiliar queda reservada únicamente para capacidades auxiliares reutilizables del backoffice
- el modo `authenticated-only` queda desaconsejado dentro del backoffice, salvo excepción estructural explícita y documentada

### Decision Final

Se aprueba que, dentro del backoffice protegido de negocio:

1. todo endpoint no público debe pertenecer explícitamente a una de estas dos fronteras:
   - permiso funcional `module + operation`
   - `auxiliary capability`
2. los auxiliares locales que queden fuera de la nueva capa auxiliar permanecerán protegidos por la frontera funcional existente de `module + operation`
3. `module + operation` no se interpretará como un mapeo estricto `1 permiso = 1 endpoint exacto`, sino como la frontera funcional del módulo
4. esa frontera funcional puede cubrir:
   - el endpoint operativo equivalente a la capacidad principal
   - endpoints auxiliares locales del mismo módulo que solo soportan ese dominio
5. el modo `solo autenticación` no se adopta como patrón normal para el backoffice; solo podrá existir como excepción estructural explícita, documentada y justificada

Ejemplos que quedan alineados con esta regla:

- `ROLES.READ` puede seguir cubriendo `GET /v1/roles/modules` como auxiliar local del dominio `roles`
- el módulo `users` puede seguir cubriendo `GET /v1/users/roles` como auxiliar local del flujo de invitaciones
- las `auxiliary capabilities` quedan reservadas para endpoints reutilizables entre módulos, no para helpers locales del módulo proveedor

### Status

approved

---

## Decision 03. Lugar de la derivación automática de capacidades auxiliares

### Context

Ya quedó claro que frontend no debe ser la fuente de verdad de dependencias entre módulos consumidores y capacidades auxiliares.

También quedó claro que los usuarios finales del editor de roles no deben tener que entender dependencias técnicas para evitar crear roles rotos.

Falta cerrar dónde debe vivir la derivación automática de capacidades auxiliares.

### Options

1. Derivar en frontend antes de enviar el payload del rol
2. Derivar en backend durante `create-role` y `update-role`
3. Persistir solo permisos directos y resolver capacidades auxiliares on-the-fly en runtime

### Recommendation

Opción 2.

Mantiene al backend como fuente de verdad, evita que el editor de roles dependa de conocimiento técnico embebido y permite reutilizar el mismo patrón de evaluación explícita en runtime para capacidades auxiliares ya derivadas.

### Implications

- `create-role` y `update-role` deberán normalizar permisos directos y derivar capacidades auxiliares
- las capacidades auxiliares derivadas deberán quedar persistidas en el rol o en una representación equivalente explícita
- el usuario podrá seguir editando solo permisos directos
- la evaluación en runtime no dependerá de derivación dinámica a partir de permisos funcionales
- la capa auxiliar podrá reutilizar el mismo patrón general de evaluación explícita ya usado para permisos directos
- la evaluación de `auxiliary capabilities` quedará como preocupación de backend y no como una nueva dimensión de rendering o gating de controles en frontend

### Decision Final

Se aprueba que la derivación automática de `auxiliary capabilities` viva exclusivamente en backend.

La derivación se ejecutará durante las mutaciones del rol, principalmente:

- `create-role`
- `update-role`

También se aprueba que las capacidades auxiliares derivadas no se resolverán solo on-the-fly en runtime, sino que quedarán persistidas en el rol o en una representación persistida equivalente.

También se aprueba que, bajo este approach, la evaluación de `auxiliary capabilities` será una preocupación de backend.

Eso implica que:

- frontend no se convertirá en consumidor directo de esta capa para decidir si muestra o no selects, inputs o controles equivalentes
- frontend seguirá gobernando visibilidad de módulos, vistas y acciones funcionales directas con los mecanismos ya existentes
- la capa de `auxiliary capabilities` no se introduce para agregar una nueva matriz de rendering condicional en interfaz
- si un módulo funcional ya está visible para el usuario, los datos auxiliares que necesite para operar correctamente deberán venir resueltos por backend mediante los endpoints autorizados correspondientes

Eso se aprueba por estas razones:

- backend conserva la fuente de verdad de la derivación
- frontend no necesita conocer dependencias técnicas ni mapas de derivación
- frontend tampoco necesita evaluar esta nueva capa para rendering fino de controles auxiliares
- el editor de roles sigue trabajando solo con permisos funcionales directos
- se evita crear roles funcionalmente incompletos por omisión humana
- la evaluación en runtime puede reutilizar el mismo patrón de lectura explícita de capacidades ya concedidas, en lugar de recalcular dependencias cada vez

Queda pendiente para la siguiente decisión:

- la forma exacta de representación persistida dentro del modelo `Role`
- si esa persistencia será un arreglo separado, un subdocumento u otra estructura equivalente

### Status

approved

---

## Decision 04. Representación persistida de capacidades auxiliares en roles

### Context

Si backend deriva capacidades auxiliares, hay que decidir cómo representarlas dentro del modelo de rol sin ensuciar el listado actual de `permissions`.

La decisión importa porque afectará:

- entidad de dominio
- esquema de Mongo
- contratos HTTP de roles
- guards auxiliares

### Options

1. Mezclar capacidades auxiliares dentro del mismo arreglo `permissions`
2. Persistir un arreglo separado como `auxiliaryCapabilities`
3. No persistirlas y recalcularlas siempre desde permisos directos

### Recommendation

Opción 2.

Separa mejor semánticamente lo funcional visible de lo auxiliar derivado, sin obligar a recalcular todo en cada evaluación runtime.

### Implications

- `permissions[]` seguirá representando únicamente permisos funcionales directos por `module + operation`
- `auxiliaryCapabilities[]` representará únicamente capabilities auxiliares derivadas
- ambas capas vivirán dentro del mismo `Role`, pero con responsabilidad separada
- backend controlará la escritura de `auxiliaryCapabilities[]`
- los DTO públicos de create/update role no deberían aceptar escritura libre de ese campo
- el contrato de salida del rol podrá decidir más adelante si expone o no esa metadata al frontend
- el guard auxiliar podrá evaluar directamente sobre esa lista
- queda pendiente definir la forma exacta de cada elemento dentro de `auxiliaryCapabilities[]`

### Decision Final

Se aprueba agregar en `Role` un campo persistido separado para `auxiliaryCapabilities`.

Reglas aprobadas:

1. `permissions[]` conserva intacta su responsabilidad actual:
   - solo permisos funcionales directos por `module + operation`
2. `auxiliaryCapabilities[]` almacenará únicamente capabilities auxiliares derivadas
3. no se mezclarán auxiliary capabilities dentro de `permissions[]`
4. la escritura de `auxiliaryCapabilities[]` será controlada por backend como parte de la derivación automática aprobada en la decisión 03
5. los clientes no editarán directamente ese campo en los contratos públicos ordinarios de creación o actualización de roles
6. la evaluación en runtime de esta capa se resolverá con una guardia específica para auxiliary capabilities, separada de `PermissionsGuard`

Queda pendiente para una siguiente decisión:

- la forma exacta de cada elemento dentro de `auxiliaryCapabilities[]`
- si cada elemento será un string identifier simple o una estructura con más campos
- el naming final del campo si durante el diseño técnico hubiera que ajustar convenciones internas sin cambiar su intención

### Status

approved
