# Progress

## 2026-08-04

- Se creó la spec `roles-permissions-catalog-contract`.
- Se documentó la desalineación actual entre catálogo interno y contrato HTTP consumido por frontend.
- Se implementó el enriquecimiento de `GET /v1/roles/modules` con `operations[]` derivado directamente de `authorization.catalog.ts`.
- Se eliminó `GET /v1/roles/operations` del controller, CQRS y presenter asociados.
- Se actualizó el handoff de frontend y la documentación operativa del catálogo.
- Se validó el cambio con `npm run lint` y `npm run build`.
