# Validación Manual

## Preparación

- Usar un token de un rol con `CUSTOMERS/READ` y `CUSTOMERS/UPDATE`.
- Contar con un Cliente `ACTIVE`, un Cliente `INACTIVE`, un usuario `USER` activo sin relaciones y, opcionalmente, un usuario `USER` ya relacionado con otro Cliente.
- Usar la carpeta `Customer User Relationships` de `docs/icsacv-api.postman_collection.json`.

## Rutas Contextuales

1. Ejecutar `GET /v1/customers/:customerId/users` para un Cliente `ACTIVE` y confirmar paginación, `system_role_name` y `status_name` localizados.
2. Repetir el listado para un Cliente `INACTIVE`; debe responder correctamente.
3. Ejecutar `GET /v1/customers/:customerId/available-users`; debe devolver solo usuarios `USER` activos, no eliminados y sin relaciones con ningún Cliente.
4. Ejecutar `POST /v1/customers/:customerId/users` con un usuario elegible; debe responder `201 Created` y actualizar `company_names` del contacto asociado.
5. Repetir el mismo `POST`; debe responder `409 Conflict` con el código de relación duplicada.
6. Asociar desde un Cliente activo a un `USER` relacionado con otro Cliente; debe permitirse si no existe relación con el Cliente objetivo.
7. Ejecutar `DELETE /v1/customers/:customerId/users/:userId`; debe responder `204 No Content`, eliminar solo el pivote solicitado y resincronizar `company_names`.
8. Repetir el mismo `DELETE`; debe responder `409 Conflict` con el código de relación inexistente.
9. Intentar lookup, asociación o desasociación sobre un Cliente `INACTIVE`; debe rechazar la mutación. Un Cliente eliminado debe responder `404`.

## Listado Global De Usuarios

1. Ejecutar `GET /v1/users?customer_id=:customerId`; debe listar solo usuarios `USER` relacionados con ese Cliente.
2. Ejecutar `GET /v1/users?customer_relationship=UNASSIGNED`; debe incluir usuarios `USER` y `ADMIN` de negocio sin relaciones y excluir `MASTER_ADMIN`.
3. Enviar ambos parámetros; debe responder `400 Bad Request`.
4. Confirmar que el parámetro retirado `has_customer_relationship` no forma parte de las llamadas del cliente.

## Eliminación Lógica De Cliente

1. Asociar un Usuario a un Cliente y confirmar que el nombre aparece en su contacto.
2. Eliminar lógicamente ese Cliente mediante su endpoint administrativo.
3. Confirmar que el pivote permanece en MongoDB como historial y que el nombre del Cliente eliminado deja de estar en `company_names`.

## Verificaciones Estáticas Ejecutadas

- `npm run lint -- --quiet`
- `npm run build`
- Validación sintáctica de `docs/icsacv-api.postman_collection.json`
- `git diff --check`
