# Decisions

## 2026-08-10

### Decision

La iniciativa se separa en dos submódulos base:

- `contacts`
- `recipient-groups`

### Reason

El catálogo base no debe quedar amarrado únicamente al caso de uso actual de destinatarios.

`contacts` permite una semántica más amplia y reusable para agenda, directorio o referencias futuras, mientras que `recipient-groups` describe correctamente la agrupación operativa de esos contactos para flujos de notificación o envío.

### Impact

- el diseño del catálogo base se mantiene general
- los grupos quedan como capability consumidora y no como dueño de la identidad del contacto
- la iniciativa queda mejor preparada para reutilización futura

## 2026-08-10

### Decision

`v1` nace ya como modelo multicanal, aunque inicialmente solo `EMAIL` esté habilitado.

La distribución de responsabilidades queda así:

- `recipient-groups` define canales habilitados
- `contacts` guarda identidad reusable
- cada `contact` guarda sus address values por canal

### Reason

Se quiere evitar refactors estructurales cuando aparezcan nuevos canales.

Además, esta distribución permite equilibrar:

- configuración general del grupo
- reutilización del contacto
- almacenamiento correcto de los datos concretos de contacto por canal

### Impact

- existirá catálogo de canales desde `v1`
- el modelo queda listo para crecer a `WHATSAPP`, `SMS`, `PUSH` u otros canales
- el uso efectivo de canales se resuelve por intersección entre grupo y contacto

## 2026-08-10

### Decision

`recipient-groups` referenciará `contacts` reutilizables en lugar de capturar destinatarios embebidos como modelo principal.

### Reason

Se quiere evitar duplicación de captura y mantenimiento cuando un mismo contacto deba pertenecer a varios grupos.

Además, esto deja mejor preparada la UX para búsqueda, autocomplete, reutilización de usuarios internos y alta rápida de contactos externos.

### Impact

- el catálogo `contacts` se vuelve una capability base real y no un accesorio opcional
- `recipient-groups` se diseña como agrupador de referencias reutilizables
- el modelo queda preparado para relación reusable entre contactos y grupos

## 2026-08-10

### Decision

Los usuarios internos generarán automáticamente su registro correspondiente en `contacts`.

### Reason

`contacts` debe nacer como catálogo base real y consistente, no como una pieza opcional o incompleta.

Esto evita huecos donde existan usuarios internos reutilizables en negocio pero no puedan consumirse como contactos dentro del sistema.

### Impact

- `contacts` deberá soportar contactos vinculados a usuarios internos y contactos externos
- habrá que definir sincronización mínima entre `user` y `contact`
- los usuarios internos podrán reutilizarse directamente en futuros grupos y flujos
- la implementación deberá contemplar migración o seed inicial para convertir en `contacts` a los usuarios ya existentes
- los contactos auto-generados a partir de usuarios internos usarán `ICSACV` como `companyName` inicial

## 2026-08-10

### Decision

El modelo de `contacts` nacerá desde `v1` preparado para multiplicidad en datos de contacto.

### Reason

Ya existe expectativa clara de que negocio pedirá múltiples emails y múltiples teléfonos por contacto.

No se quiere aceptar un modelo rígido de valores únicos que obligue a refactors grandes después.

### Impact

- el modelo de datos y la entidad nacerán con:
  - `emails[]`
  - `phones[]`
  - `cellPhones[]`
- `companyName` formará parte del shape mínimo de `contact`
- `fullName` se tratará como derivado
- la primera UI podrá seguir siendo mínima, pero el dominio ya quedará correctamente preparado
