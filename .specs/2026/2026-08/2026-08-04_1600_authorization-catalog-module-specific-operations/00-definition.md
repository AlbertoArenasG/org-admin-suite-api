# Definition

## Purpose

Esta iniciativa existe para evolucionar el catálogo de autorización backend desde un modelo implícitamente CRUD hacia un modelo donde cada módulo declare explícitamente sus operaciones reales de dominio.

Regla de trabajo:

- no arrancar implementación estructural mientras existan decisiones críticas en estado `pending`
- tu tomas la decisión final
- aquí solo se registran contexto, opciones, recomendación e impacto

## Overall Status

- Initiative: `authorization-catalog-module-specific-operations`
- Definition status: `in_progress`
- Implementation ready: `no`

---

## Decision 01. Modelo objetivo del catálogo de operaciones

### Context

Hoy el sistema ya tiene un catálogo backend por módulo, pero la conversación de integración y parte del diseño siguen arrastrando una suposición fuerte de CRUD uniforme.

Eso empieza a romperse en módulos como:

- `USER_REGISTRATION_INVITATIONS`
- `FILES`
- `SERVICE_ENTRY_SURVEYS`
- `SERVICE_PACKAGES`

Porque su dominio real no necesariamente corresponde a `CREATE/READ/UPDATE/DELETE` completos ni permanentes.

### Options

1. Mantener un catálogo global implícitamente CRUD y modelar excepciones caso por caso
2. Mantener operaciones globales reutilizables, pero declarar por módulo cuáles aplican realmente
3. Definir operaciones completamente contextuales por módulo, sin un vocabulario compartido global

### Recommendation

Opción 2.

Permite seguir teniendo consistencia transversal donde sí existe, pero sin obligar a que todos los módulos encajen artificialmente en una tabla CRUD cuadrada.

### Implications

- backend debe declarar de forma explícita las operaciones válidas por módulo
- algunos módulos seguirán siendo casi CRUD puros
- otros podrán evolucionar hacia operaciones semánticas de dominio como `RESEND`, `CANCEL`, `UPLOAD`, `ANSWER` o similares
- frontend dejará de depender conceptualmente de una matriz CRUD uniforme

### Decision Final

Pendiente.

### Status

pending

---

## Decision 02. Futuro del vocabulario global de operaciones

### Context

Si el catálogo evoluciona a operaciones específicas por módulo, todavía falta decidir si backend debe conservar un vocabulario global compartido de operaciones o si todo debe ser 100% contextual.

### Options

1. Mantener un conjunto global base de operaciones y permitir extensiones por módulo
2. Eliminar cualquier noción global y dejar solo operaciones por módulo
3. Mantener solo CRUD como vocabulario global obligatorio

### Recommendation

Opción 1.

Un núcleo compartido puede seguir aportando consistencia, pero debe ser extensible y no normativo para todos los módulos.

### Implications

- el catálogo puede conservar operaciones comunes como `READ`, `CREATE`, `UPDATE`, `DELETE`
- módulos especiales podrán declarar operaciones no CRUD sin distorsión conceptual
- seeds, validaciones y documentación deberán distinguir entre operaciones base y operaciones específicas

### Decision Final

Pendiente.

### Status

pending

---

## Decision 03. Alcance de esta iniciativa

### Context

Antes de tocar código hay que decidir si esta iniciativa solo redefine el modelo y el contrato, o si también incluye implementación completa sobre catálogo, validaciones, endpoints, seeds y consumidores inmediatos.

### Options

1. Hacer solo análisis y diseño; mover implementación a una spec posterior
2. Cerrar análisis, decisiones e implementación backend en esta misma spec
3. Mezclar backend y frontend desde esta misma spec

### Recommendation

Opción 2.

Backend es la fuente de verdad del dominio de autorización. Esta spec debe quedar autosuficiente para cerrar el rediseño del catálogo backend antes de abrir el espejo de frontend.

### Implications

- aquí debe quedar el análisis módulo por módulo
- aquí deben quedar las decisiones de catálogo, validación y contrato
- después podrá abrirse una spec espejo en frontend ya derivada del backend

### Decision Final

Pendiente.

### Status

pending
