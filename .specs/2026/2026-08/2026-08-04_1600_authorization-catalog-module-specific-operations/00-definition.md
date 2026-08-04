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

Hoy el sistema ya tiene un catálogo backend por módulo, pero parte del diseño histórico sigue arrastrando una suposición fuerte de CRUD uniforme.

El problema real no es decidir si un módulo es CRUD o no CRUD, sino permitir que cada módulo sea libre de declarar las operaciones que realmente describen su dominio.

Esa libertad se vuelve importante cuando:

- un módulo no encaja naturalmente en `CREATE/READ/UPDATE/DELETE`
- un mismo `READ` empieza a concentrar demasiadas capacidades distintas
- el dominio pide operaciones propias como `RESEND`, `CANCEL`, `UPLOAD` o similares

### Options

1. Mantener un catálogo global implícitamente CRUD y modelar excepciones caso por caso
2. Permitir que cada módulo declare libremente sus operaciones y reutilizar un vocabulario base solo cuando sirva
3. Definir operaciones completamente contextuales por módulo, sin un vocabulario compartido global

### Recommendation

Opción 2.

Permite que el módulo sea dueño de sus operaciones reales, pero sin prohibir reutilizar operaciones comunes cuando eso siga teniendo valor semántico.

### Implications

- backend debe declarar de forma explícita las operaciones válidas por módulo
- algunos módulos seguirán viéndose casi CRUD por coincidencia natural del dominio, no por obligación de diseño
- otros podrán evolucionar hacia operaciones semánticas de dominio como `RESEND`, `CANCEL`, `UPLOAD`, `ANSWER` o similares
- frontend dejará de depender conceptualmente de una matriz CRUD uniforme

### Decision Final

Se aprueba que el catálogo no imponga una semántica CRUD uniforme.

Cada módulo podrá declarar libremente sus operaciones reales de dominio.

El uso de operaciones comunes como `CREATE`, `READ`, `UPDATE` o `DELETE` seguirá permitido solo cuando describa bien la capacidad real del módulo.

### Status

approved

---

## Decision 02. Frontera entre catálogo de negocio y capacidades de plataforma

### Context

No toda capacidad expuesta técnicamente por la API pertenece al catálogo funcional del producto.

Existen casos como endpoints operativos, utilidades de soporte o flujos pensados solo para uso técnico que no están abiertos al backoffice de negocio ni al frontend ordinario.

Si esas capacidades se quedan dentro del catálogo general, lo contaminan y fuerzan decisiones innecesarias en permisos, seeds, frontend y documentación.

### Options

1. Mantener cualquier endpoint interno dentro del catálogo general si ya existe en la API
2. Separar explícitamente capacidades de negocio autorizables y capacidades de plataforma o soporte
3. Mover todo lo no expuesto en frontend fuera del catálogo general sin más criterio

### Recommendation

Opción 2.

La distinción relevante no es si hoy existe pantalla en frontend, sino si la capacidad pertenece al dominio de negocio autorizable o a una frontera técnica/operativa de plataforma.

### Implications

- el catálogo general debe quedarse enfocado en capacidades funcionales de negocio o backoffice
- operaciones técnicas, operativas o de soporte deben evaluarse para vivir fuera del catálogo general
- esas capacidades pueden moverse a frontera `MASTER_ADMIN` o a controllers de plataforma cuando aplique
- seeds, validaciones y documentación deberán reflejar esa separación

### Decision Final

Se aprueba separar explícitamente:

- capacidades de negocio autorizables dentro del catálogo general
- capacidades de plataforma, soporte o mantenimiento fuera del catálogo general

La existencia técnica de un endpoint no basta para convertirlo en permiso funcional de negocio.

No se agregará metadata tipo `business/platform` dentro del catálogo de módulos y permisos.

La separación será semántica y estructural:

- catálogo general solo para negocio o backoffice autorizable
- frontera `MASTER_ADMIN` para capacidades de plataforma

Las capacidades de plataforma no deben concentrarse necesariamente en un solo controller gigantesco.

Pueden distribuirse en múltiples controllers bajo la frontera `master-admin` según su capacidad técnica u operativa.

### Status

approved

---

## Decision 03. Futuro del vocabulario global de operaciones

### Context

Si cada módulo puede declarar libremente sus operaciones, todavía falta decidir qué papel debe jugar un vocabulario global compartido.

### Options

1. Mantener un conjunto global base de operaciones y permitir extensiones por módulo
2. Eliminar cualquier noción global y dejar solo operaciones por módulo
3. Mantener solo CRUD como vocabulario global obligatorio

### Recommendation

Opción 1.

Un vocabulario base sigue aportando consistencia, pero ya no debe actuar como restricción universal ni como contrato obligatorio para todos los módulos.

### Implications

- operaciones comunes como `CREATE`, `READ`, `UPDATE`, `DELETE` pueden seguir existiendo
- módulos especiales podrán extender ese vocabulario con operaciones propias
- backend deberá distinguir entre reutilización semántica útil y arrastre artificial de nombres heredados

### Decision Final

Pendiente.

### Status

pending

---

## Decision 04. Alcance de esta iniciativa

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

---

## Decision 05. Tratamiento de endpoints de catálogo auxiliares

### Context

Existen endpoints que devuelven catálogos o lookups necesarios para poblar formularios, selects o ayudas de UI.

Si cada uno de esos endpoints se modela como permiso explícito editable en el CRUD de roles, el catálogo se vuelve ruidoso y la UX de administración de permisos se degrada rápidamente.

### Options

1. Modelar cada endpoint de catálogo como permiso explícito independiente
2. Permitir que los catálogos auxiliares queden absorbidos por una capacidad principal, salvo que tengan sensibilidad o autonomía funcional propia
3. Dejar todos los catálogos auxiliares fuera del modelo de autorización

### Recommendation

Opción 2.

No conviene sobre-modelar catálogos de soporte de UI, pero tampoco asumir que ninguno merece gobierno propio. La regla debe depender de si el catálogo tiene valor funcional autónomo o sensibilidad propia.

### Implications

- el CRUD de roles no se llena de permisos de bajo valor operativo
- endpoints como `GET /v1/users/roles` pueden seguir absorbidos por la capacidad principal de administración de usuarios
- si un catálogo expone información sensible o capacidad funcional independiente, sí podrá promoverse a operación explícita

### Decision Final

Se aprueba que los endpoints de catálogo auxiliares no se conviertan por defecto en permisos explícitos editables.

Podrán quedar implícitamente autorizados por una capacidad principal de negocio cuando solo sirvan de soporte para ejecutar esa acción.

Solo deberán modelarse como operación explícita si tienen sensibilidad propia o si negocio necesita gobernarlos de manera separada.

### Status

approved
