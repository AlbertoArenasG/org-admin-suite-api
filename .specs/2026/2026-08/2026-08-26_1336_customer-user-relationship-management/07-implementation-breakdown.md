# Implementation Breakdown

## Phase 3. Fundaciones

1. Crear `StateConflictException`, codigos y mapeo HTTP global.
2. Extender puertos de relaciones y Usuarios con operaciones de lectura/escritura explicitas.
3. Implementar consultas Mongoose dedicadas, manteniendo agregaciones e indices como detalle de infraestructura.
4. Implementar `CustomerContextValidationService` y `UserCustomerRelationshipManagerService`.

## Phase 4. Casos De Uso

1. Refactorizar `GetUsersUseCase` y sus DTOs para `customer_id` y `customer_relationship=UNASSIGNED`.
2. Implementar Queries para usuarios relacionados y candidatos disponibles.
3. Implementar Commands para asociar y desasociar usuarios.
4. Delegar el reemplazo de `UpdateUserUseCase` al servicio compartido.

## Phase 5. Infraestructura HTTP Y CQRS

1. Agregar Query/Command handlers y adapters CQRS.
2. Crear DTOs de request para listado relacionado y asociacion.
3. Implementar `UserLookupPresenter` y ampliar `UserPresenter` con `system_role_name`.
4. Crear `CustomerUserRelationshipController`, registrar dependencias y agregar mensajes i18n.

## Phase 6. Integridad, Documentacion Y Validacion

1. Ajustar resolucion y sincronizacion de Contactos ante eliminacion logica de Clientes.
2. Volver transaccional `DeleteCustomerUseCase` para resincronizar Contactos afectados.
3. Actualizar coleccion Postman y documentos relevantes en `docs`.
4. Ejecutar verificaciones estaticas disponibles.
5. Documentar los escenarios de validacion manual para ejecucion del usuario.

## Implementation Rules

- No incorporar pruebas automatizadas en esta spec.
- No ejecutar migrations, seeds ni comandos de datos; el usuario los ejecuta manualmente si fueran necesarios.
- Mantener controllers y casos de uso como orquestadores delgados.
- Mantener detalles MongoDB dentro de infraestructura.
