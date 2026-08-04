# Progress

## 2026-08-04

- Se creó la spec `authorization-catalog-module-specific-operations`.
- Se registró que backend será la spec madre de esta iniciativa.
- Se dejó preparado el espacio para el análisis módulo por módulo antes de implementar.
- Se aprobó que el catálogo general no llevará metadata `business/platform`; la separación será estructural entre negocio y frontera `MASTER_ADMIN`.
- Se registró como norma que las capacidades de plataforma pueden distribuirse en múltiples controllers `master-admin` y no deben concentrarse en un megacontroller.
- Se aprobó como regla que los endpoints de catálogo auxiliares no se modelan por defecto como permisos explícitos del CRUD de roles.
- Se creó `docs/authorization/auxiliary-capabilities-mapping.md` como memoria institucional para registrar capacidades auxiliares absorbidas por permisos principales.
- Se analizó `USERS` y se aprobó sacar `USERS/CREATE` del catálogo de negocio; la creación funcional de usuarios queda representada por invitaciones y el alta directa pasa a reevaluarse como capacidad de plataforma.
- Se analizó `ROLES` y se aprobó modelar el cambio de estado como operación explícita `ACTIVATE`, en lugar de seguir absorbiéndolo dentro de `UPDATE`.
- Se analizó `CUSTOMERS` y se confirmó que el módulo autenticado puede mantenerse como CRUD de backoffice; los endpoints públicos por token permanecen fuera del catálogo autenticado.
