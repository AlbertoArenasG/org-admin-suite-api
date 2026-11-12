# Conversión de recolección a registros de servicio a cliente

## Estado

- Initiative: `service-package-record-conversion`
- Definition status: completed
- Implementation ready: yes
- Implementation status: completed
- Validation status: completed
- Spec status: completed

## Resultado y alcance

El usuario con `SERVICE_PACKAGES.CONVERT` convierte un `ServicePackageRecord` activo en un `CustomerServiceRecord` por cada equipo de origen. El request contiene una lista completa, con cliente, usuarios, tipo de servicio, fecha de solicitud, datos del equipo y selección de fotos por equipo. La fecha de recepción usa la fecha de visita de origen, con posibilidad de indicarla cuando el origen no la tenga.

Cada destino conserva `sourceServicePackageRecordId` y `sourceServiceOrder` nullable; los destinos manuales usan `null`. El origen conserva `convertedToCustomerServiceRecords` booleano; cuando ya fue convertido, el backend rechaza otra conversión. Un ZIP puede contener varios registros de origen; `packageId` no determina duplicidad. Una recolección con varios equipos genera varios destinos con el mismo ID de origen.

Las fotos elegidas se copian a `uploads/`, se registran como entidades `File` y se adjuntan como fotos de condición de recepción de su equipo. El ZIP original y la ingesta PWA no se alteran.

Se amplían capabilities auxiliares para clientes, usuarios relacionados y tipos de servicio en los módulos consumidores acordados. El acceso del portal de cliente a catálogos permanece acotado y no recibe derivaciones globales.

## Migración y límites

Script `dry-run`/`apply`/`verify`: booleano `false` para orígenes históricos; referencias `null` para destinos históricos. No cambia `createdAt`, `updatedAt`, `createdBy` ni `updatedBy`. La migración y el seed se ejecutaron por autorización excepcional del usuario; las pruebas y validaciones manuales quedan a su cargo. No se implementa reconversión aunque después se eliminen destinos; tampoco frontend, archivado, migración de fotos históricas ni cambio del upload ZIP.

## Criterios de aceptación

- El cuerpo incluye exactamente una entrada por índice de equipo del origen; faltantes, duplicados y fotos ajenas producen error sin destinos.
- Origen inexistente: 404; eliminado o ya convertido: 409; datos o catálogos inválidos: 400/404 según patrón vigente; fallo de almacenamiento/persistencia: error sin conversión parcial confirmada.
- El marcado de origen, los destinos y las entidades `File` se confirman en una transacción Mongo. Ante fallo se intenta eliminar cada copia S3 de esta solicitud; si S3 falla al limpiar, se registra para seguimiento sin alterar originales.
- La lista y detalle del origen exponen el booleano; la lista y detalle de destino exponen las referencias. Los anteriores a la migración se completan con el script.
- La ruta requiere JWT y `SERVICE_PACKAGES.CONVERT`; los catálogos se rigen por capabilities auxiliares, sin exponer clientes globales en portal.

## Autorización

El usuario autorizó expresamente iniciar el ciclo autónomo el 2026-11-11 y, después, delegó por esta ocasión la ejecución de migración y seed. La validación manual queda a su cargo.
