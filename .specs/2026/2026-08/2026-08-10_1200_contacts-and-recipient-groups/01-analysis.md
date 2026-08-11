# Analysis

## Initiative

- Name: `contacts-and-recipient-groups`
- Date: `2026-08-10`

## Current State

- el sistema hoy no tiene un catálogo reusable de contactos separado de `users`
- varios módulos futuros necesitarán configurar destinatarios para envíos o avisos
- si esos destinatarios se capturan directamente dentro de cada recurso o módulo, habrá duplicación operativa y mantenimiento repetitivo
- el sistema ya cuenta con arquitectura hexagonal, lo que facilita separar:
  - catálogo base de `contacts`
  - catálogo de `recipient-groups`
  - catálogo transversal de `communication-channels`
- el dominio actual de `users` ya contiene algunos datos base reutilizables:
  - `name`
  - `lastname`
  - `email`
  - `cellPhone`
- esos datos hoy no viven como capability reusable de contactos ni están preparados para composición en grupos

## Findings

- el problema real no es solo “enviar emails”, sino evitar captura repetitiva de destinatarios reutilizables
- `contacts` no debe nacer amarrado exclusivamente al caso de uso de destinatarios; también debe poder evolucionar a agenda, directorio o catálogo reutilizable general
- `recipient-groups` sí pertenece a una semántica más operativa y debe consumir `contacts`
- el modelo debe nacer multicanal desde `v1`, aunque el catálogo vivo inicial solo publique `EMAIL`
- el catálogo de canales no debe contaminar ni a `contacts` ni a `recipient-groups`; conviene exponerlo como recurso transversal
- un mismo contacto debe poder pertenecer a múltiples grupos, por lo que el modelo principal no debe embebir destinatarios dentro de cada grupo
- el orden de contactos dentro de un grupo sí puede importar visualmente, pero no justifica metadata adicional de orden en `v1`; basta con preservar el orden del arreglo `contactIds[]`
- los usuarios internos deben materializarse automáticamente como `contacts`
- el sistema necesitará una migración o seed inicial para convertir en `contacts` a los usuarios ya existentes
- `ICSACV` ya quedó definido como `companyName` inicial para contactos auto-generados a partir de usuarios internos

## Decisions Already Closed

- `contacts` será el catálogo base general y reutilizable
- `recipient-groups` será el módulo agrupador que consume `contacts`
- `v1` nace ya como modelo multicanal
- el catálogo publicado en `v1` tendrá inicialmente un solo canal habilitado: `EMAIL`
- el catálogo de canales vivirá en código, no persistido
- `recipient-groups` definirá canales habilitados por grupo
- `contacts` guardará identidad reusable y address values por canal
- el uso efectivo se resolverá por intersección entre:
  - canales habilitados del grupo
  - canales disponibles en el contacto
- `recipient-groups` referenciará `contacts` reutilizables, no destinatarios embebidos
- `recipient-groups` guardará `contactIds[]` preservando el orden recibido
- `recipient-groups` tendrá `status` desde `v1` con:
  - `ACTIVE`
  - `DELETED`
- `contacts` tendrá `status` desde `v1` con:
  - `ACTIVE`
  - `DELETED`
- `recipient-groups` tendrá `code` autogenerado a partir de `name` y no editable
- `enabledChannels[]` exigirá al menos un elemento
- `contactIds[]` exigirá al menos un elemento
- la distinción entre contacto vinculado a usuario y contacto externo se inferirá por `userId`
- los usuarios internos generarán automáticamente su `contact`
- habrá sincronización automática `user -> contact` en campos base compartidos

## Risks

- si no se define claramente la sincronización entre `user` y `contact`, puede aparecer inconsistencia entre perfiles internos y catálogo reusable
- si `contacts` nace demasiado acoplado a destinatarios, el módulo perderá valor para futuros casos de uso más generales
- si `recipient-groups` nace con demasiada lógica de orden o metadata innecesaria, se complejiza sin valor real de `v1`
- si se mezclan datos de contacto base con metadata contextual de negocio, el catálogo `contacts` puede contaminarse rápidamente
- si no se documenta bien el contrato HTTP preliminar, frontend podría anticipar formas de consumo distintas a las deseadas

## Constraints

- backend debe seguir siendo la fuente de verdad del modelo, contratos y catálogos base
- el catálogo de canales debe vivir en código
- agregar canales futuros no debe implicar abrir `/v2`; la evolución debe poder ocurrir dentro del mismo prefijo actual `/v1`
- la primera versión funcional debe mantenerse acotada a `EMAIL` como único canal habilitado
- la definición debe quedar suficientemente clara antes de pasar a diseño técnico e implementación

## Pending Technical Clarifications

- cómo se representarán exactamente `emails[]`, `phones[]` y `cellPhones[]` a nivel de entidad y persistencia
- qué shape mínimo tendrán los DTOs de `contacts`
- qué shape mínimo tendrán los DTOs de `recipient-groups`
- cómo se resolverá la sincronización exacta entre updates de `user` y updates permitidos en `contact`
- si ciertos endpoints de `contacts` requerirán filtros o búsquedas administrativas además del lookup liviano
