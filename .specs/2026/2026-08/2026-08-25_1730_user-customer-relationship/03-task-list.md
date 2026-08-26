# Task List

## Phase 1. Definition

- [x] Definir alcance de usuarios y fronteras de la relación.
      Status: completed

- [x] Definir el modelo pivote de la relación.
      Status: completed

- [x] Definir integridad referencial, ciclo de vida y reglas de clientes elegibles.
      Status: completed

- [x] Definir el contrato de creación y la visibilidad administrativa de clientes invitados.
      Status: completed

- [x] Definir consumo de invitación y administración posterior de relaciones efectivas.
      Status: completed

- [x] Definir lecturas y filtros de relaciones efectivas.
      Status: completed

- [x] Definir reenvío, revocación y compatibilidad de invitaciones.
      Status: completed

- [x] Definir contratos, autorización, compatibilidad histórica y documentación.
      Status: completed

- [x] Definir migración y sincronización de nombres de empresa en contactos vinculados a usuarios.
      Status: completed

## Phase 2. Technical Design

- [x] Diseñar los cambios backend conforme a las decisiones aprobadas.
      Status: completed

- [x] Definir la ubicación y las fronteras internas de `UserCustomerRelationship`.
      Status: completed

- [x] Diseñar la frontera transaccional agnóstica y su responsabilidad de infraestructura.
      Status: completed

- [x] Diseñar entidad, puertos e índices de `UserCustomerRelationship`.
      Status: completed

- [x] Diseñar filtros de usuarios por relación con cliente sin alterar los listados.
      Status: completed

- [x] Diseñar la lectura de resúmenes de clientes en detalles administrativos.
      Status: completed

- [x] Diseñar la orquestación de invitaciones, usuarios, relaciones y contactos.
      Status: completed

- [x] Diseñar el reemplazo de contrato de nombres de empresa en contactos.
      Status: completed

- [x] Diseñar la evolución de búsqueda e índices de contactos.
      Status: completed

- [x] Diseñar la migración y secuencia de despliegue del contrato de contactos.
      Status: completed

- [x] Diseñar el detalle administrativo de invitaciones y su contrato HTTP.
      Status: completed

- [x] Diseñar los contratos request de asociaciones en invitaciones y usuarios.
      Status: completed

- [x] Diseñar el contrato de filtros de usuarios por cliente.
      Status: completed

- [x] Diseñar la extensión de detalle y presenter de usuarios.
      Status: completed

- [x] Definir registros, migración, documentación y handoff de frontend.
      Status: completed

- [x] Proteger los nombres de empresa derivados en contactos vinculados a usuarios.
      Status: completed

- [x] Definir propagación aislada al cambiar el nombre de un cliente.
      Status: completed

- [x] Definir atomicidad entre la actualización de un cliente y la propagación de sus nombres derivados.
      Status: completed

- [x] Diseñar servicios compartidos para resolver y sincronizar nombres derivados por lote.
      Status: completed

- [x] Definir puertos por lote para relaciones, clientes y nombres derivados de contactos.
      Status: completed

- [x] Definir el alcance de validación manual y revisar los contratos técnicos.
      Status: completed

## Phase 3. Implementation

- [x] Implementar la frontera transaccional y el recurso interno `UserCustomerRelationship`.
      Status: completed

- [x] Extender invitaciones de aplicación y materializar relaciones al consumirlas.
      Status: completed

- [x] Implementar servicios aislados de resolución y sincronización de nombres de empresa.
      Status: completed

- [x] Extender la edición, detalle y filtrado administrativo de usuarios.
      Status: completed

- [x] Reemplazar el contrato de contactos por `company_names`, incluidos búsqueda e índices.
      Status: completed

- [x] Implementar migración y actualizar el seed de contactos derivados de usuarios.
      Status: completed

- [x] Implementar sincronización atómica por cambios de nombre de cliente y proteger campos derivados de contactos.
      Status: completed

- [x] Exponer el detalle administrativo de invitaciones y actualizar DTOs, presenters, CQRS y rutas.
      Status: completed

- [ ] Actualizar Postman, documentación de API y handoff para frontend.
      Status: pending

- [ ] Ejecutar verificaciones estáticas y documentar escenarios manuales.
      Status: pending

## Phase 4. Validation And Closure

- [ ] Ejecutar migración y la validación manual acordada, luego cerrar la spec.
      Status: pending
