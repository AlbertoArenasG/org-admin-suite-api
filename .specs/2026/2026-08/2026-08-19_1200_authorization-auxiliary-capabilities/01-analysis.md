# Analysis

## Current Context

- backend ya tiene un modelo estable de autorización ordinaria por `module + operation`
- el catálogo funcional vive en código
- `PermissionsGuard` ya protege los endpoints funcionales visibles de negocio
- el CRUD de roles ya persiste permisos funcionales ordinarios

## Authorization Boundaries Already Present In The API

Antes de definir esta nueva capa auxiliar, hay que dejar explícito que la API ya opera con fronteras distintas y que esta iniciativa no pretende mezclarlas.

### 1. `MASTER_ADMIN`

- es una frontera estructural de plataforma, sistema o soporte
- no representa backoffice ordinario de negocio
- sus capacidades no deben confundirse con el catálogo funcional general del backoffice

### 2. Backoffice protegido de negocio

- aquí viven los actores autenticados con `systemRole = ADMIN` o `systemRole = USER`
- esta es la frontera donde ya opera el modelo de:
  - roles
  - permisos funcionales ordinarios
  - guards de negocio
- esta iniciativa pertenece a esta frontera

### 3. Endpoints públicos o tokenizados

- existen endpoints o flujos protegidos por tokens públicos/específicos
- esa frontera no pertenece al modelo ordinario de autorización del backoffice
- esta iniciativa tampoco pretende rediseñar esa capa

## Scope Boundary For This Initiative

La nueva capa de capacidades auxiliares que se está evaluando en esta spec:

- pertenece exclusivamente al backoffice protegido de negocio
- no redefine la frontera `MASTER_ADMIN`
- no rediseña autorización pública o tokenizada

Nota importante:

- aunque los roles default `MASTER_ADMIN_DEFAULT` y `ADMIN_DEFAULT` hoy acumulen todos los permisos por practicidad operativa, eso no cambia la frontera conceptual de esta iniciativa
- esta spec no diseña permisos de plataforma; diseña capacidades auxiliares para el backoffice ordinario de negocio

## New Pressure On The Model

`internal_asset_maintenance_records` es el primer módulo donde aparecen dependencias reales hacia endpoints auxiliares de otros módulos reutilizables.

Ejemplos inmediatos:

- `GET /v1/expiration-status-policies/catalog`
- `GET /v1/expiration-notification-policies/catalog`
- potencialmente options o lookups de `recipient_groups`

Sin embargo, esta iniciativa no debe entenderse como una solución local para ese módulo.

`internal_asset_maintenance_records` solo es el primer caso visible que evidencia el problema.

La decisión que se tome aquí debe servir como approach uniforme para todo el backoffice protegido de negocio y para futuros módulos consumidores reutilizables.

## Partial Inventory Notes Already Clarified

### `GET /v1/roles/modules`

- no se considera capability auxiliar reutilizable para esta iniciativa
- se considera auxiliar local del dominio `roles`
- su pertenencia natural sigue siendo el módulo `roles`
- por ahora debe seguir absorbido por `ROLES/READ`
- si en el futuro se necesitara una capability transversal distinta para exponer información más amplia del catálogo de módulos, esa capability debería diseñarse explícitamente como una feature nueva y no forzarse retroactivamente sobre este endpoint

### `GET /v1/users/roles`

- no se considera capability auxiliar reutilizable para esta iniciativa
- se considera auxiliar local del dominio `users` dentro del flujo ordinario de invitaciones de backoffice
- hoy la creación funcional de usuarios en backoffice ocurre por invitación
- este endpoint existe para seleccionar el rol deseado dentro de ese flujo
- por ahora debe permanecer fuera de la nueva capa auxiliar

### `GET /v1/contacts/search`

- sí se considera candidato real para la nueva capa auxiliar
- aunque pertenece al dominio `contacts`, hoy ya funciona como lookup transversal consumido por `recipient_groups`
- no se usa solo para administración local de `contacts`
- además, es razonable prever que pueda reutilizarse por otros módulos del backoffice más adelante
- por esa naturaleza transversal, encaja mejor como capability auxiliar reutilizable que como simple auxiliar local del módulo

### `GET /v1/communication-channels`

- sí se considera candidato para la nueva capa auxiliar
- aunque hoy publique un catálogo pequeño y esté ligado al dominio `recipient_groups`, su naturaleza es reusable
- puede servir como insumo transversal para otros módulos del backoffice relacionados con notificación, comunicación o configuración operativa
- por eso no conviene tratarlo solo como helper local del módulo que hoy lo consume

### Distinción de trabajo entre `catalog` y `options`

Dentro del backoffice actual ya aparece una diferencia útil que esta iniciativa puede aprovechar para clasificar auxiliares sin ambigüedad innecesaria.

#### `catalog`

- se usa dentro del propio módulo administrativo proveedor
- sirve para crear o editar instancias del recurso de ese mismo módulo
- normalmente expone:
  - enums
  - statuses
  - anchors
  - trigger modes
  - tipos fijos
  - shape base del formulario
- no debe asumirse por defecto como capability auxiliar reutilizable

#### `options`

- expone instancias reales resumidas para selección
- funciona como lectura no administrable de recursos ya existentes
- su propósito natural es ser consumido por otros módulos del backoffice
- encaja mejor como capability auxiliar reutilizable

### Aplicación inicial de esa distinción a policies

#### `GET /v1/expiration-status-policies/catalog`

- queda fuera de la nueva capa auxiliar
- se considera catálogo local del propio módulo `expiration_status_policies`
- hoy su función es soportar la creación o edición administrativa de policies

#### `GET /v1/expiration-notification-policies/catalog`

- queda fuera de la nueva capa auxiliar
- se considera catálogo local del propio módulo `expiration_notification_policies`
- hoy su función es soportar la creación o edición administrativa de policies

#### `GET /v1/expiration-status-policies/options`

- sí entra a la nueva capa auxiliar
- se considera lectura resumida y reutilizable de instancias reales seleccionables
- hoy ya encaja con el patrón de consumo desde otros módulos como `internal_asset_maintenance_records`

#### `GET /v1/expiration-notification-policies/options`

- sí entra a la nueva capa auxiliar
- se considera lectura resumida y reutilizable de instancias reales seleccionables
- hoy ya encaja con el patrón de consumo desde otros módulos como `internal_asset_maintenance_records`

## Why The Existing Model Is Not Enough By Itself

- absorber esos accesos dentro de `READ` administrativo del módulo proveedor sobre-otorga acceso
- abrir indiscriminadamente todos los auxiliares a cualquier autenticado elimina demasiado gobierno
- combinar en cada endpoint permisos de varios módulos consumidores escala mal y acopla proveedores con consumidores
- hardcodear dependencias en frontend rompe la frontera de fuente de verdad

## Product Constraint

Los usuarios que construyen roles no son técnicos.

Eso implica:

- no conviene exigirles que entiendan dependencias entre módulos
- no conviene hacer el editor de roles más complejo de lo necesario
- backend debe ayudar a evitar roles funcionalmente incompletos

## Working Assumption

Hasta que se apruebe otra decisión, esta spec asume:

- el catálogo funcional principal de `module + operation` debe permanecer estable
- las capacidades auxiliares se evaluarán como una capa nueva y separada
- las derivaciones deben resolverse en backend y persistirse explícitamente
- la implementación final de esta iniciativa deberá dejar uniforme el tratamiento de auxiliares reutilizables en todo el backoffice, no solo en `internal_asset_maintenance_records`

## Additional Boundary Clarified After Decision 02.a

Dentro del backoffice protegido de negocio no se quiere consolidar un tercer carril informal de autorización basado solo en autenticación.

La frontera aprobada queda así:

- endpoints funcionales y auxiliares locales del módulo:
  - permanecen gobernados por `module + operation`
- endpoints auxiliares reutilizables entre módulos:
  - quedan gobernados por la nueva capa de `auxiliary capabilities`

Consecuencia importante:

- `module + operation` no debe leerse como mapeo estricto `1 permiso = 1 endpoint exacto`
- debe leerse como frontera funcional del módulo
- esa frontera puede cubrir tanto la capacidad principal como helpers locales del mismo dominio

El modo `authenticated-only` dentro del backoffice:

- no se adopta como patrón normal
- solo podría existir como excepción estructural explícita, documentada y justificada
