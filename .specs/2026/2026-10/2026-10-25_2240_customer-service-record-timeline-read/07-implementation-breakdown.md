# Slices previstas

## Slice 1 — Consulta de persistencia y contrato de aplicación

- Fase 2 de `03-task-list.md`.
- Extender puerto y tipos, implementar `findTimeline` en repositorio de lectura con selección de hitos de cliente u OR/cruce de periodos de cliente y proveedor, elección de retorno real/estimado, proyección, conteo y orden; mapear el documento proyectado al read model sin invocar `toDomain()` de la entidad completa. Declarar los tres índices faltantes en schema. Crear DTO, mapper ligero y su export, caso de uso y su export. Mantener `findAll` intacto.
- Validación: build/lint enfocado y revisión estática de fronteras, fechas ausentes, prioridad de retorno real, proyección, mapper e índices. Cierre: caso de uso y repositorio compilados; ningún cambio en rutas.

## Slice 2 — Ruta y contrato HTTP

- Fases 2 y 3. Añadir request DTO con `match`, query/handler y registro CQRS; añadir ruta protegida antes de `:recordId` y método del presenter. Los barriles de request DTO y queries reexportan sus archivos modificados; los exports nuevos del mapper y caso de uso se añaden en Slice 1.
- En la misma slice, finalizar `docs/frontend/customer-service-record-timeline-handoff.md`, `docs/authorization/feature-permission-catalog.md` y `docs/icsacv-api.postman_collection.json` con la respuesta, permiso y errores reales; no diferir documentación al cierre.
- Validación: build/lint enfocado y revisión de permiso, envelope, rango, orden, ambos valores de `match`, valor predeterminado y ejemplos con/sin proveedor. Cierre: ruta y documentación sincronizadas. Ningún cambio de frontend ni de escritura.

## Slice 3 — Validación y cierre documental

- Fase 4. Preparar la matriz manual y registrar qué parte confirma el usuario; comprobar con el usuario índices efectivos, plan de consulta y paginación sobre datos reales si autoriza esas lecturas. Si los índices no existen, registrar la limitación y no declarar validado el rendimiento; su creación corresponde a una decisión y ejecución del usuario. Actualizar progreso, tareas, documentación viva e índice conforme a evidencia.
- Cierre: sin criterios pendientes, validación real registrada y aprobación de cierre. No ejecutar seeds, migraciones ni comandos que escriban a BD.

## Gate

Fase 1 quedó aprobada y cerrada el 2026-10-27; `Implementation ready: yes`. La autorización para iniciar una slice de código es un paso separado. La siguiente es Slice 1, aún sin iniciar.
