# Implementation Plan

## Phase 1. Definition

- Cerrar decisiones de alcance, dominio, reglas, contratos, autorización, compatibilidad y validación.

## Phase 2. Technical Design

- Diseñar entidades, DTOs, puertos, casos de uso, persistencia, CQRS, HTTP y handoff frontend conforme a las decisiones aprobadas.

## Phase 3. Backend Implementation

- Implementar la frontera transaccional y el recurso interno `UserCustomerRelationship`.
- Extender invitaciones de aplicación, consumo atómico y sincronización aislada de contactos.
- Extender la administración de usuarios, sus detalles y filtros por relación.
- Reemplazar el contrato de contactos por `company_names`, incluidos búsqueda, índices, seed y migración.
- Incorporar la sincronización atómica por cambio de nombre de cliente y la protección de campos derivados.
- Exponer los contratos HTTP aprobados, actualizar CQRS, Postman, documentación de API y handoff frontend.
- Exponer el catálogo reutilizable de clientes activos, su capability auxiliar y derivaciones para usuarios e invitaciones.
- Ejecutar verificaciones estáticas y preparar los escenarios manuales de validación.

## Phase 4. Validation And Closure

- Ejecutar migración y validación manual de los flujos aprobados.
- Documentar resultados, cerrar la spec y actualizar el índice.
