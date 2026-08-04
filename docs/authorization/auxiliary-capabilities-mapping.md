# Mapeo De Capacidades Auxiliares

## Propósito

Este documento funciona como memoria institucional para registrar endpoints auxiliares, catálogos o lookups que no merecen por sí mismos una operación explícita en el catálogo general de permisos, pero cuyo acceso sí debe quedar trazable.

No es un catálogo runtime ni una fuente de verdad operativa del sistema. Es una referencia documental para evitar que estas decisiones queden implícitas o se pierdan entre sesiones.

Complementos:

- las reglas permanentes viven en [authorization-rules.md](/Users/alberto/projects/icsacv/org-admin-suite-api/docs/authorization/authorization-rules.md:1)
- el catálogo funcional general vive en [feature-permission-catalog.md](/Users/alberto/projects/icsacv/org-admin-suite-api/docs/authorization/feature-permission-catalog.md:1)

## Cuándo Registrar Algo Aquí

Registrar aquí un endpoint cuando:

- sea un catálogo o lookup auxiliar para UI o flujos de negocio
- no tenga autonomía funcional suficiente para convertirse en operación explícita del catálogo general
- convenga dejar constancia de qué capacidad principal lo absorbe

No registrar aquí:

- endpoints que ya son capacidades principales del catálogo general
- capacidades de plataforma o soporte que deban vivir bajo la frontera `MASTER_ADMIN`

## Criterio De Modelado

- por defecto, un endpoint auxiliar queda absorbido por una capacidad principal de negocio
- solo debe promoverse a operación explícita si expone información con sensibilidad propia o si negocio necesita gobernarlo por separado
- este documento no reemplaza decisiones de refactor; solo conserva trazabilidad documental

## Registro Actual

### `GET /v1/users/roles`

- tipo: catálogo auxiliar
- módulo principal relacionado: `USERS`
- capacidad principal que lo absorbe: `USERS/READ`
- razón:
  - sirve para poblar selects y flujos de edit e invite de usuarios
  - hoy no tiene autonomía funcional propia dentro del backoffice
  - no conviene introducirlo como permiso explícito independiente en el CRUD de roles

### `GET /v1/customers/:customerId/public-access`

- tipo: capacidad auxiliar sensible
- módulo principal relacionado: `CUSTOMERS`
- decisión de modelado: no queda absorbido por `CUSTOMERS/READ`
- operación explícita: `CUSTOMERS/READ_PUBLIC_ACCESS`
- razón:
  - expone `public_access_url` y `public_access_token`
  - esos campos permiten reutilizar el acceso tokenizado externo del customer fiscal profile
  - por sensibilidad, no conviene mantenerlos embebidos en el read ordinario del listado o detalle
  - la UI podrá pedirlos de forma explícita cuando realmente necesite revelar ese dato

### `GET /v1/providers/:providerId/public-access`

- tipo: capacidad auxiliar sensible
- módulo principal relacionado: `PROVIDERS`
- decisión de modelado: no queda absorbido por `PROVIDERS/READ`
- operación explícita objetivo: `PROVIDERS/READ_PUBLIC_ACCESS`
- razón:
  - expone `public_access_url` y `public_access_token`
  - esos campos permiten reutilizar el acceso tokenizado externo del provider profile
  - por sensibilidad, no conviene mantenerlos embebidos en el read ordinario del listado o detalle
  - la UI podrá pedirlos de forma explícita cuando realmente necesite revelar ese dato

## Mantenimiento

- si un endpoint auxiliar deja de ser auxiliar y adquiere autonomía funcional, debe reevaluarse para promoverlo al catálogo general
- si una capacidad auxiliar se mueve a frontera de plataforma, debe eliminarse de este documento y documentarse en la zona correspondiente
