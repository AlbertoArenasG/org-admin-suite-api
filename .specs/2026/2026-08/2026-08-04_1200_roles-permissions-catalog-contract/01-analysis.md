# Analysis

## Initiative

- Name: `roles-permissions-catalog-contract`
- Date: `2026-08-04`

## Current State

- el catálogo fuente vive en `src/internal/application/services/authz/authorization.catalog.ts`
- `PATCH /v1/roles/:roleId` valida correctamente cada combinación `module + operation`
- `GET /v1/roles/modules` devuelve módulos sin sus operaciones válidas
- `GET /v1/roles/operations` devuelve operaciones globales separadas

## Findings

- el backend sí conoce las operaciones válidas por módulo
- el contrato HTTP actual no entrega esa relación de forma directa
- la separación actual favorece reconstrucciones ambiguas en clientes

## Risks

- cambiar el shape de catálogo puede requerir ajuste coordinado en frontend
- si se mantiene el contrato actual, el problema de desalineación puede repetirse

## Constraints

- backend ya tiene la fuente de verdad centralizada
- la solución no debe duplicar catálogos en presenters o controllers
