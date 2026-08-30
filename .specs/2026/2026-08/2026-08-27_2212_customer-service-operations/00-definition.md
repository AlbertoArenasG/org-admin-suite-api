# Customer Service Operations

## Status

- Definition status: completed
- Implementation ready: no

## Objective

Definir un nuevo modulo de backoffice para registrar y gestionar los servicios prestados a Clientes, ya sean ejecutados internamente o canalizados a un Proveedor/Laboratorio.

## Initial Scope

- Registrar servicios para un Cliente y uno o varios Usuarios relacionados con
  ese Cliente.
- Soportar uno o varios equipos por servicio en el modelo de backend.
- Registrar hitos operativos, compromisos de fecha, semaforos y seguimiento al
  Proveedor.
- Reutilizar la entidad existente de Proveedores para los Laboratorios.
- Establecer un consecutivo visible global para los servicios.

## Confirmed Decisions

- El modelo de backend soportara varios equipos por servicio; el MVP de frontend capturara uno.
- Proveedor/Laboratorio reutilizara el catalogo existente de Proveedores y sera opcional.
- No se agregara por ahora una clasificacion explicita de ejecucion interna o externa.
- Las fechas de los hitos no derivaran automaticamente el estatus operativo.
- El recurso separara `status` tecnico (`ACTIVE` o `DELETED`) de
  `operationalStatus` de negocio (`PENDING`, `IN_PROGRESS`, `COMPLETED` o
  `CANCELLED`).
- El folio visible sera un consecutivo global, autogenerado, numerico y con ceros a la izquierda.
- El consecutivo se asignara transaccionalmente mediante un contador atomico e
  indice unico; la duplicacion de registros queda fuera del MVP.
- El modulo tendra permisos directos de lectura, creacion, edicion, baja logica
  y administracion de tipos; las selecciones externas usaran lookups protegidos
  por capabilities auxiliares derivadas.
- El modulo tendra dos semaforos independientes: compromiso con el Cliente y compromiso de retorno del Proveedor.
- Las politicas de estatus materializaran los semaforos. Las politicas de notificaciones materializaran los eventos de recordatorio; un dispatcher futuro sera responsable de enviar los correos. Los seguimientos al Proveedor seran reglas embebidas por servicio.

## Open Decisions

No hay decisiones abiertas que bloqueen el MVP de backend.

## Business Questions

Las preguntas que requieren confirmacion directa del Cliente se administran en [08-business-questions.md](./08-business-questions.md). No bloquean decisiones tecnicas que puedan cerrarse independientemente.

## Out Of Scope For Now

- Implementacion de frontend.
- Automatizacion de notificaciones o seguimientos.
- Implementacion de un dispatcher para enviar eventos de notificacion materializados.
- Reemplazo literal de la interfaz legacy.
- Duplicacion individual o en lote de registros de servicio.
- Datos de envio, guias, pedimentos y otros detalles logisticos.
- Documentos, evidencias, imagenes e informes por equipo.
