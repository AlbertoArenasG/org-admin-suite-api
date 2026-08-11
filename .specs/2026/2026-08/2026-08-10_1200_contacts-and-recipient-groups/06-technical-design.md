# Technical Design

## Objetivo

Traducir las decisiones funcionales ya aprobadas de `contacts-and-recipient-groups` a un diseño técnico concreto para este repo.

Este documento no abre nuevas decisiones de negocio. Su objetivo es aterrizar:

- entidades y agregados principales
- catálogos base en código
- contratos HTTP iniciales
- sincronización entre `user` y `contact`
- estrategia de persistencia y migración
- orden técnico recomendado de implementación

## Principios de implementación

- seguir el pipeline ya usado en el repo:
  - `controller -> dto -> command/query -> use-case -> repository -> presenter`
- mantener separación clara entre:
  - `domain`
  - `application`
  - `infra`
- no meter lógica de dominio en controllers
- mantener backend como fuente de verdad de:
  - contratos HTTP
  - catálogo de canales
  - reglas mínimas del modelo
- dejar a frontend libre de hardcodear canales o inferir semántica estructural por su cuenta

## Scope técnico de la iniciativa

- nuevo catálogo base de `contacts`
- nuevo catálogo agrupador de `recipient-groups`
- nuevo catálogo transversal en código de `communication-channels`
- sincronización automática `user -> contact`
- migración o seed para materializar `contacts` de usuarios ya existentes

No entra en esta iniciativa:

- implementación real de canales distintos a `EMAIL`
- módulo de notificaciones completo
- plantillas de mensajes
- reglas de envío por evento, asunto o tópico
- UI frontend

## Diseño objetivo por capas

### 1. Domain

#### 1.1 Contact

`Contact` será el catálogo base reusable del sistema.

Debe soportar:

- contactos vinculados a usuarios internos
- contactos externos sin `userId`

Shape conceptual objetivo:

```ts
interface ContactProps {
  id?: string;
  userId: string | null;
  name: string;
  lastname: string;
  companyName: string | null;
  emails: ContactEmailValue[];
  phones: ContactPhoneValue[];
  cellPhones: ContactCellPhoneValue[];
  status: ContactStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
```

```ts
interface ContactValueObject {
  value: string;
}
```

Enum inicial:

```ts
enum ContactStatus {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}
```

Reglas aprobadas:

- `fullName` no es input persistido; es derivado
- la distinción entre contacto interno y externo se infiere por `userId`
- no existe bandera extra tipo `isUser`
- `emails[]`, `phones[]` y `cellPhones[]` nacen desde `v1` como colecciones
- `companyName` forma parte del shape mínimo

Notas:

- en `v1` el modelo permite multiplicidad aunque la primera UI o ciertos flujos internos solo alimenten una parte mínima
- el email y celular provenientes de `user` sincronizarán solo el primer elemento correspondiente en `emails[]` y `cellPhones[]`
- cada elemento de `emails[]`, `phones[]` y `cellPhones[]` tendrá en `v1` un shape mínimo `{ value }`
- labels, flags de primario, tipo o metadata adicional no forman parte de `v1`

#### 1.2 RecipientGroup

`RecipientGroup` será el agrupador reusable de contactos para usos operativos futuros.

Shape conceptual objetivo:

```ts
interface RecipientGroupProps {
  id?: string;
  name: string;
  code: string;
  description: string | null;
  enabledChannels: CommunicationChannelCode[];
  contactIds: string[];
  status: RecipientGroupStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
```

Enum inicial:

```ts
enum RecipientGroupStatus {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}
```

Reglas aprobadas:

- `code` existe desde `v1`
- `code` se autogenera desde `name`
- `code` no es editable manualmente
- `enabledChannels[]` exige al menos un elemento
- `contactIds[]` exige al menos un elemento
- `contactIds[]` se persiste en el mismo orden en que llega
- `contactIds[]` se devuelve en ese mismo orden
- no existirá metadata adicional de orden como:
  - `index`
  - `position`
  - `sortOrder`

#### 1.3 CommunicationChannels catalog

El catálogo de canales vive en código y es transversal al módulo.

Shape sugerido:

```ts
const COMMUNICATION_CHANNELS = {
  EMAIL: {
    code: 'EMAIL',
    nameKey: 'COMMUNICATION.CHANNEL.EMAIL',
  },
} as const;
```

Notas:

- el modelo ya nace multicanal
- en `v1` solo se publica `EMAIL`
- agregar nuevos canales en el futuro debe poder ocurrir dentro del mismo prefijo `/v1`
- el catálogo debe exponer el shape necesario para respuestas multi idioma desde backend
- el patrón debe seguir lo ya existente en `authorization.catalog.ts` y `authorization-operations.catalog.ts`
- esta metadata de catálogo no forma parte de las entidades persistidas
- `recipient-groups` solo persiste `enabledChannels[]` como códigos
- `name` no vive en el catálogo base; se resuelve en presenters mediante i18n

Shape mínimo esperado del catálogo:

```ts
interface CommunicationChannelCatalogItem {
  code: string;
  nameKey: string;
}
```

Ubicación sugerida:

```text
src/internal/application/services/communication-channels/
  communication-channels.catalog.ts
  communication-channels.utils.ts
```

Shape esperado de salida HTTP:

```ts
interface CommunicationChannelResponseItem {
  code: string;
  name: string;
  name_key: string;
}
```

### 2. Application

#### 2.1 Use cases esperados de Contacts

Mínimo esperado:

- `GetContactsUseCase`
- `GetContactByIdUseCase`
- `CreateContactUseCase`
- `UpdateContactUseCase`
- `DeleteContactUseCase`
- `SearchContactsUseCase`

Reglas relevantes:

- `CreateContactUseCase` crea contactos externos manuales
- `UpdateContactUseCase` solo actualiza contactos no vinculados a `user`
- `DeleteContactUseCase` hace borrado lógico
- `SearchContactsUseCase` no es paginado; es lookup liviano con límite interno

#### 2.2 Use cases esperados de RecipientGroups

Mínimo esperado:

- `GetRecipientGroupsUseCase`
- `GetRecipientGroupByIdUseCase`
- `CreateRecipientGroupUseCase`
- `UpdateRecipientGroupUseCase`
- `DeleteRecipientGroupUseCase`

Reglas relevantes:

- validar `enabledChannels[]` contra el catálogo vivo
- validar `contactIds[]` existentes y activos
- preservar el orden recibido en `contactIds[]`

#### 2.3 Use case o servicio de sincronización `user -> contact`

Se necesita una pieza explícita para no regar esta lógica entre distintos use cases de `users`.

Sugerencia:

- `SyncUserContactService`

Responsabilidades:

- materializar `contact` al crear un usuario interno
- actualizar campos compartidos cuando cambia el `user`
- no tocar metadata ampliada del `contact`

Shape conceptual:

```ts
syncUserContact({
  userId,
  name,
  lastname,
  email,
  cellPhone,
})
```

Mapeo aprobado:

- `email` del usuario -> primer elemento de `emails[]`
- `cellPhone` del usuario -> primer elemento de `cellPhones[]`
- `companyName` inicial de contactos internos auto-generados -> `ICSACV`

### 3. Infra / Persistence

#### 3.1 Contacts collection

Se recomienda colección dedicada:

```text
contacts
```

Campos conceptuales:

```ts
{
  contact_id: string;
  user_id: string | null;
  name: string;
  lastname: string;
  company_name: string | null;
  emails: Array<{ value: string }>;
  phones: Array<{ value: string }>;
  cell_phones: Array<{ value: string }>;
  status: 'ACTIVE' | 'DELETED';
  createdAt: Date;
  updatedAt: Date;
}
```

Índices a evaluar:

- `user_id` único parcial cuando no sea null
- `status`
- búsqueda por `name`, `lastname`, `company_name`
- búsqueda por `emails`

#### 3.2 RecipientGroups collection

Colección sugerida:

```text
recipient_groups
```

Campos conceptuales:

```ts
{
  recipient_group_id: string;
  name: string;
  code: string;
  description: string | null;
  enabled_channels: string[];
  contact_ids: string[];
  status: 'ACTIVE' | 'DELETED';
  createdAt: Date;
  updatedAt: Date;
}
```

Índices a evaluar:

- `recipient_group_id` único
- `code` único
- `name` único
- `status`

#### 3.3 Migration / seed

Hace falta una pieza operativa explícita para usuarios existentes.

Objetivo:

- crear `contacts` correspondientes para usuarios ya existentes
- mapear:
  - `name`
  - `lastname`
  - `email`
  - `cellPhone`
- `companyName = ICSACV`
- `status = ACTIVE`

Recomendación:

- implementarlo como seed o migración explícita en `infra/persistence/mongoose`
- dejarlo registrado en task list como entregable obligatorio, no como tarea opcional posterior

### 4. HTTP Contracts

#### 4.1 Contacts

Endpoints aprobados:

- `GET /v1/contacts`
- `GET /v1/contacts/:contactId`
- `POST /v1/contacts`
- `PATCH /v1/contacts/:contactId`
- `DELETE /v1/contacts/:contactId`
- `GET /v1/contacts/search`

Contrato funcional esperado:

- `GET /v1/contacts`:
  - listado administrativo, probablemente paginado
- `GET /v1/contacts/:contactId`:
  - detalle completo
- `POST /v1/contacts`:
  - crea contacto externo
- `PATCH /v1/contacts/:contactId`:
  - solo permite contactos externos
- `DELETE /v1/contacts/:contactId`:
  - borrado lógico
- `GET /v1/contacts/search`:
  - lookup no paginado para selects/autocomplete
  - con límite interno controlado por backend

#### 4.2 RecipientGroups

Endpoints aprobados:

- `GET /v1/recipient-groups`
- `GET /v1/recipient-groups/:groupId`
- `POST /v1/recipient-groups`
- `PATCH /v1/recipient-groups/:groupId`
- `DELETE /v1/recipient-groups/:groupId`

Contrato funcional esperado:

- `POST` y `PATCH` deben aceptar:
  - `name`
  - `description`
  - `enabledChannels[]`
  - `contactIds[]`
- `code` no se captura desde cliente
- el detalle puede devolver la composición del grupo sin exigir endpoint especial adicional en `v1`

#### 4.3 CommunicationChannels

Endpoint aprobado:

- `GET /v1/communication-channels`

Contrato esperado:

- devuelve catálogo vivo definido en código
- en `v1` solo publica `EMAIL`
- frontend no debe hardcodear canales

### 5. Authorization impact

Todavía falta definir en una siguiente capa si estos módulos:

- vivirán bajo permisos propios
- y cuáles serán sus operaciones exactas en el catálogo de autorización

Punto base recomendado:

- `CONTACTS`
- `RECIPIENT_GROUPS`

Con operaciones todavía por aterrizar cuando se analice la integración con el catálogo de autorización.

### 6. Orden técnico recomendado de implementación

1. catálogo en código de `communication-channels`
2. entidad, puertos y persistencia de `contacts`
3. use cases y endpoints de `contacts`
4. sincronización automática `user -> contact`
5. migración/seed de usuarios existentes a `contacts`
6. entidad, puertos y persistencia de `recipient-groups`
7. use cases y endpoints de `recipient-groups`
8. validación y documentación viva adicional si aplica

## Riesgos técnicos todavía abiertos

- ninguno crítico a nivel de diseño conceptual de `v1`

## Decisiones técnicas cerradas dentro del diseño

### 1. Shape de colecciones multivalor de contacto

Se aprueba que `emails[]`, `phones[]` y `cellPhones[]` no nazcan como arrays de strings puros.

Nacerán desde `v1` como arrays de objetos mínimos, para evitar refactors posteriores cuando se necesite agregar metadata como:

- principalidad
- label
- origen
- validación
- sincronización con `user`

Shape mínimo sugerido:

```ts
interface ContactEmailValue {
  value: string;
}

interface ContactPhoneValue {
  value: string;
}

interface ContactCellPhoneValue {
  value: string;
}
```

Consecuencia:

- el modelo queda preparado para crecer sin cambiar la estructura principal de las colecciones
- en `v1` estos objetos se mantendrán mínimos y solo tendrán `value`
- campos como `label`, `isPrimary`, `source` o equivalentes se difieren hasta que exista una necesidad funcional concreta

### 2. Deduplcación de contactos externos en v1

En `v1` no se endurecerá una regla fuerte de unicidad para contactos externos por:

- email
- teléfono
- nombre

Razonamiento:

- el comportamiento real todavía debe observarse cuando los módulos empiecen a usarse en práctica
- la primera defensa contra duplicados se apoyará principalmente en UX de búsqueda y sugerencia
- no conviene bloquear prematuramente casos legítimos con restricciones rígidas aún no validadas por negocio

Consecuencia:

- `GET /v1/contacts/search` será pieza importante del flujo de selección/alta
- la prevención de duplicados en `v1` será principalmente asistida por lookup/autocomplete, no por constraints duros del dominio

### 3. Alcance de `GET /v1/contacts/search`

Se aprueba que `GET /v1/contacts/search` opere solo sobre contactos con `status = ACTIVE`.

Razonamiento:

- el endpoint está pensado como lookup operativo para selects/autocomplete
- no conviene sugerir contactos borrados lógicamente dentro de un flujo de selección activa

Consecuencia:

- los contactos `DELETED` quedan fuera del lookup normal
- si algún día se necesita búsqueda administrativa más amplia, deberá resolverse en otro endpoint o en el listado administrativo ordinario

### 4. Integración inicial con catálogo de autorización

Se aprueba que ambos módulos entren al catálogo de autorización con operaciones CRUD ordinarias en `v1`.

Módulos previstos:

- `CONTACTS`
- `RECIPIENT_GROUPS`

Operaciones iniciales:

- `CREATE`
- `READ`
- `UPDATE`
- `DELETE`

Razonamiento:

- para `v1` ambos módulos sí encajan de forma legítima en CRUD
- no existe todavía una operación especial de dominio que justifique salir de ese vocabulario base

Consecuencia:

- backend podrá integrarlos al catálogo de autorización sin inventar operaciones semánticas prematuras
- si en el futuro aparece una operación específica de dominio, podrá agregarse sin contradecir este punto
