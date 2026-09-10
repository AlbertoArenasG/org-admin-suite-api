# Lista De Tareas

## Fase 1. Lookup dueño `ROLES`

- [ ] Consolidar DTO, caso de uso, query y presenter de opciones asignables en `ROLES`.
  Status: done
  Cierre: una sola implementación conserva exactamente la matriz de jerarquía y el payload actual.

## Fase 2. Capability y reconciliación

- [ ] Registrar `ROLES/READ_OPTIONS` y derivarla desde `USERS` y `USER_REGISTRATION_INVITATIONS`.
  Status: done
  Cierre: el catálogo valida al iniciar y el seed existente puede reconciliar roles default y custom.

## Fase 3. HTTP y compatibilidad

- [ ] Exponer `GET /v1/roles/options` y delegar rutas legacy en la query de `ROLES`.
  Status: done
  Cierre: la nueva ruta no tiene paginación, exige capability auxiliar y las rutas legacy preservan su contrato.

## Fase 4. Documentación y validación

- [ ] Actualizar documentación backend y registrar la transición pendiente de consumidores frontend.
  Status: done
  Cierre: catálogo, reglas de autorización y deuda técnica reflejan el estado implementado.

- [ ] Ejecutar verificaciones estáticas y validación manual; ejecutar el seed de roles por la persona usuaria.
  Status: done
  Cierre: compilación y lint sin autofix pasan; el responsable confirma el seed y los escenarios manuales.

- [ ] Cerrar formalmente la spec.
  Status: done
  Cierre: no hay tareas backend pendientes y las rutas legacy quedan identificadas para la futura migración frontend.
