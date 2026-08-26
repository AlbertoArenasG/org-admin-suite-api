# Analysis

## Current State

- `UserCustomerRelationship` es la fuente de verdad de la relacion.
- `UpdateUserUseCase` reemplaza relaciones y sincroniza contactos dentro de transaccion.
- El listado de Usuarios conserva una frontera `USERS/READ` para consultar por Cliente o usuarios sin relaciones.
- El frontend requiere una lectura y administracion contextual desde el detalle de Cliente.

## Findings

- La nueva superficie pertenece funcionalmente a `CUSTOMERS`.
- El listado paginado y el lookup contextual son auxiliares locales de `CUSTOMERS`; no son capabilities auxiliares reutilizables.
- Los servicios de validacion, reemplazo y sincronizacion existentes deben reutilizarse, no replicarse.
- El lookup favorece el caso habitual: usuarios sin relaciones con Clientes; la mutacion conserva flexibilidad para casos multi-Cliente.

## Risks

- Crear mutaciones paralelas que diverjan de `UpdateUserUseCase`.
- Exponer datos de Usuarios mas amplios que los necesarios.
- Sobrescribir relaciones concurrentes mediante contratos de reemplazo no acotados.
- Aplicar reglas distintas de Clientes inactivos entre la frontera de Usuarios y la de Clientes.

## Constraints

- Mantener arquitectura limpia, transacciones de infraestructura y presenters localizados.
- No incluir cambios de frontend ni ejecucion automatica de migraciones o seeds en esta spec.

## Definition Outcome

- Las 19 decisiones funcionales estan aprobadas y registradas en `00-definition.md` y `04-decisions.md`.
- La siguiente fase debe traducirlas a contratos y componentes tecnicos sin reabrir decisiones de producto.
