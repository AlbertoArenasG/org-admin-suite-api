# Implementation Breakdown

## Slice 1. Domain And Persistence Foundation

- Aggregate, enums e interfaces de valor.
- Entidad de tipos de servicio y contador generico.
- Esquemas Mongoose, mappers, repositorios, indices y configuracion DI.
- Sin endpoints ni seeds ejecutados.

## Slice 2. Authorization, I18n And Independent Seeds

- Registro de modulo, operacion y capabilities derivadas.
- Guards para nuevas capabilities de opciones.
- Copies `es/en` de modulos, operaciones y valores fijos visibles.
- Comandos independientes para roles, contactos y tipos de servicio.

## Slice 3. Service Types And External Lookups

- CRUD administrativo y opciones locales de tipos de servicio.
- Seed create-only e idempotente del catalogo legacy.
- Opciones de Proveedores, Grupos destinatarios y Usuarios activos relacionados
  con un Cliente, en sus modulos propietarios.

## Slice 4. Isolated Materializations

- Cinco refreshers: estatus y notificaciones de Cliente, estatus y
  notificaciones de Proveedor, y seguimiento al Proveedor.
- Escritura tecnica sin auditoria de negocio.
- Contratos operacionales por cursor para refresh futuro.

## Slice 5. Customer Service Records CRUD

- Preparadores por bloque, validaciones y snapshots.
- Crear, listar, consultar detalle, editar y baja logica.
- Calculo de fechas, refresh selectivo, CQRS, DTOs, controller y presenters
  con copies localizados.

## Slice 6. Operational Integration

- Endpoint interno de refresh protegido por lock.
- Refresco dirigido ante alta, cambio o baja de politicas.
- Ajustes de modulos existentes necesarios para registrar handlers y guards.

## Manual Validation

- Ejecutar manualmente `db:seed:roles` y
  `db:seed:customer-service-record-service-types` despues de desplegar los
  slices correspondientes.
- Validar idempotencia de seeds, capabilities derivadas y preservacion de
  timestamps de roles custom.
- Validar escenarios internos, con Proveedor, semaforos, notificaciones
  materializadas, seguimiento, PATCH selectivo, baja, reapertura, filtros,
  rangos date-only, ordenamientos y refresh cursor-based.

No se requieren migraciones para este modulo: todas sus colecciones son nuevas.
