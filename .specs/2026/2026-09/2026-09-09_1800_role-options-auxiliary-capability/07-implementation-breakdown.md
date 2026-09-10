# Desglose De Implementación

## Slice 1. Consolidar lógica asignable en Roles

**Fase:** 1 de `03-task-list.md`.

Crear los DTOs, caso de uso y query `GetAssignableRoles` bajo `ROLES`; mover
la regla exacta del caso de uso user-owned sin cambiar la matriz ni el orden de
opciones. Extender `RolePresenter` y retirar los artefactos legacy de usuario.

**Validación:** compilación y revisión del payload contra las rutas actuales.

## Slice 2. Registrar capability y derivación

**Fase:** 2 de `03-task-list.md`.

Agregar `ROLES/READ_OPTIONS` al catálogo y a las derivaciones de `USERS` y
`USER_REGISTRATION_INVITATIONS`. No se modifica el seed: reutiliza la función
de derivación desde los catálogos actualizados.

**Validación:** inicio de aplicación y revisión de que la configuración no
falla por una referencia de catálogo desconocida.

## Slice 3. Exponer el contrato y preservar legado

**Fase:** 3 de `03-task-list.md`.

Declarar `GET /v1/roles/options` antes de `:roleId`, con JWT y capability
auxiliar. Adaptar las dos rutas legacy para delegar a la query y presenter de
`ROLES` manteniendo sus permisos actuales.

**Validación:** payload no paginado, jerarquía por actor y respuestas `401` /
`403` esperadas.

## Slice 4. Sincronizar referencias y verificar

**Fase:** 4 de `03-task-list.md`.

Actualizar documentos backend y marcar la deuda como remediada en backend con
migración frontend pendiente. Ejecutar build, lint sin autofix y revisión de
diff. Tras desplegar, la persona usuaria ejecuta:

```bash
npm run db:seed:roles
```

**Precondición:** catálogo y derivación ya desplegados.

**Riesgo:** omitir el seed deja roles persistidos sin la nueva capability.

**Evidencia esperada:** reporte de `system-roles` y validación manual de los
tres niveles de `systemRole`.
