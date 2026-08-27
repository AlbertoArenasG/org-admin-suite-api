# Task List

## Definition

- [x] Registrar el problema y el objetivo.
- [x] Acordar `is_internal_staff` como fuente de verdad de clasificacion de contactos de usuarios.
- [x] Definir semantica de companias derivadas.
- [x] Definir fronteras y administracion aplicables.
- [x] Definir migracion y compatibilidad de datos existentes.
- [x] Definir semantica de actualizacion y contratos API afectados.
- [x] Definir como se materializa la clasificacion en `Contact`.
- [x] Definir eventos y alcance de la sincronizacion entre Usuario, Cliente y Contacto.
- [x] Definir contratos API y estrategia de migracion temporal.

## Technical Design

- [x] Documentar modelo, puertos, servicios y persistencia.
- [x] Documentar endpoints, DTOs y presenters afectados.
- [x] Documentar estrategia de migracion y seed.

## Implementation

- [ ] Implementar cambios por slices aprobados.
- [ ] Actualizar documentos de API relevantes.
- [ ] Eliminar la migracion temporal despues de ejecutarla y validarla manualmente.

## Validation

- [ ] Ejecutar y validar manualmente migracion o seed.
- [ ] Validar flujos y datos en Postman y MongoDB.
- [ ] Cerrar la spec.
