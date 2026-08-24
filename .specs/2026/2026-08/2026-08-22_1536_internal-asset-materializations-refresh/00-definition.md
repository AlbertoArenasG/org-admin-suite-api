# Internal Asset Materializations Refresh

## Status

- Definition: completed
- Technical design: completed
- Implementation: completed

## Objective

Definir e implementar un mecanismo manual y protegido para actualizar las materializaciones temporales de los registros de control de activos internos.

El problema a resolver es el paso del tiempo: aunque hoy las materializaciones se recalculan al crear, editar, eliminar registros o modificar sus políticas relacionadas, no existe un proceso que las refresque cuando cambia la fecha sin que ocurra una mutación explícita.

## Existing Behavior

Actualmente backend ya materializa y persiste:

- `expirationStatusMaterialization`
- `expirationNotificationMaterialization`

También ya recalcula esas materializaciones cuando cambian los inputs del record o las políticas de vencimiento asociadas.

El mecanismo pendiente debe reutilizar esa lógica existente y no duplicar las reglas de materialización.

## Approved Design

Las decisiones de diseño aprobadas para esta spec viven en [04-decisions.md](./04-decisions.md).

## Decision 01. Execution Strategy

### Decision

La primera versión expondrá un endpoint técnico invocable manualmente.

El endpoint delegará a un caso de uso reutilizable de actualización de materializaciones. No se implementará un cron interno ni se requerirá infraestructura externa en esta primera versión.

### Rationale

- permite observar el comportamiento, duración, volumen y resultados en producción antes de automatizarlo
- evita introducir scheduler, concurrencia y configuración de infraestructura antes de necesitarlos
- preserva un caso de uso reutilizable para una futura ejecución por cron interno o scheduler externo

## Decision 02. Technical Authentication Boundary

### Decision

Los jobs técnicos se separarán de las fronteras existentes:

- `public`: acceso externo público o por token de negocio
- `master-admin`: operaciones de plataforma ejecutadas por un usuario humano `MASTER_ADMIN`
- `internal-jobs`: automatizaciones técnicas invocadas manualmente o por infraestructura

El endpoint inicial pertenecerá a `internal-jobs` y no usará autenticación JWT ni permisos de roles.

### Authentication

La frontera `internal-jobs` se protegerá con un token técnico fijo configurado por variable de entorno, inicialmente `INTERNAL_JOBS_TOKEN`.

El invocador deberá enviarlo como Bearer token. No representa a un usuario, no depende de `MASTER_ADMIN` y puede reemplazarse mediante configuración sin cambiar código.

### Rationale

- evita usar o hardcodear credenciales de usuarios humanos
- permite que un scheduler externo reutilice el mismo endpoint sin refactorizar autorización
- mantiene las automatizaciones técnicas fuera del modelo de permisos de backoffice

## Decision 03. Eligibility For Materialization Refresh

### Decision

Solo los registros operativos participarán en recálculos de materializaciones dependientes de fecha o policies:

- `PENDING`
- `IN_PROGRESS`

El criterio aplicará de forma uniforme a:

- el job manual de actualización temporal
- la actualización de una policy de estatus de vencimiento
- la actualización de una policy de notificaciones de vencimiento

Los registros `COMPLETED`, `CANCELLED` y `DELETED` no serán seleccionados por esos flujos de recálculo masivo.

La eliminación lógica de una policy es una excepción de integridad referencial: deberá procesar todos los records asociados para desasignar la referencia a la policy eliminada, incluidos los terminales. Solo los records operativos requerirán un refresco materializado relevante después de esa desasignación.

### Rationale

- en estados terminales, el estatus materializado depende del estado del record y no de reglas configurables
- las notificaciones de estados terminales permanecen invalidadas y no deben regenerarse por un cambio de policy
- evita trabajo y escrituras sin efecto cuando cambia una policy o corre el job temporal
- establece un único criterio de elegibilidad para recálculos masivos

### Reentry Guarantee

Si un registro `COMPLETED` o `CANCELLED` vuelve a `PENDING` o `IN_PROGRESS`, su flujo ordinario de edición recargará las policies vigentes y reconstruirá ambas materializaciones. No dependerá de una ejecución posterior del job.

## Decision 04. Operational Record Queries

### Decision

Los recálculos masivos consultarán registros operativos desde persistencia. No obtendrán todos los registros asociados para filtrarlos en memoria.

El repositorio expondrá una consulta operacional compartida, conceptualmente `findOperational(...)`, con soporte para:

- filtro opcional por `expirationStatusPolicyId`
- filtro opcional por `expirationNotificationPolicyId`
- paginación o cursor para procesar el job temporal por lotes

Las actualizaciones de policies usarán esa misma consulta con su filtro correspondiente. El job temporal la usará sin filtros de policy.

La eliminación lógica de una policy conservará una consulta de records asociados sin filtro operativo para desasignar su referencia de todos los records. Esa operación podrá delegar el refresco de records operativos a la orquestación compartida.

### Rationale

- centraliza el criterio `PENDING` o `IN_PROGRESS` en la frontera de persistencia
- evita lecturas y materializaciones innecesarias de records terminales
- mantiene consistencia entre actualización de policies, eliminación lógica de policies y job temporal

## Decision 05. Shared Batch Refresh Orchestration

### Decision

Se extraerá una pieza de aplicación compartida para refrescar un lote de records operativos.

Esta pieza reutilizará las funciones existentes de materialización y concentrará:

- resolución de policies asociadas
- aplicación de ambas materializaciones por record
- persistencia de los cambios resultantes

Los use cases de actualización de policies y el caso de uso invocado por `internal-jobs` usarán esta misma orquestación. Los use cases de eliminación la usarán para los records operativos después de desasignar la policy, mientras preservan la limpieza de referencias para records terminales.

### Rationale

- evita duplicar loops, resolución de policies y persistencia en cada trigger
- mantiene un solo comportamiento de refresco para cambios de policy y paso del tiempo
- permite que un cron interno o scheduler externo futuro reutilice el mismo caso de uso

## Decision 06. Batch Processing

### Decision

El job manual procesará records operativos por lotes mediante cursor.

El límite será una configuración interna del proceso y no formará parte del contrato público del endpoint en esta primera versión. El tamaño exacto del lote y el shape del cursor se definirán antes de implementación.

### Rationale

- evita cargar todos los records operativos en memoria
- permite observar y reanudar el proceso de forma controlada
- conserva una base adecuada para automatización futura

## Decision 07. Independent Materialization Refreshers

### Decision

La lógica profunda de actualización se dividirá en dos refreshers de aplicación independientes:

- `InternalAssetStatusMaterializationRefresher`
- `InternalAssetNotificationMaterializationRefresher`

Cada refresher procesará, calculará y persistirá únicamente su respectiva materialización. Un caso de uso técnico compuesto podrá invocarlos juntos en la primera versión del endpoint manual.

Los use cases CRUD de records y policies reutilizarán los refreshers que correspondan, pero no conocerán batches, cursors ni detalles de ejecución de `internal-jobs`.

### Rationale

- separa el proceso técnico de las operaciones normales de negocio
- permite ejecutar ambos tipos de materialización de forma independiente en el futuro
- evita mezclar responsabilidades de scheduling, paginación y observabilidad con los use cases CRUD
- permite retornar métricas separadas por estatus y notificaciones

## Decision 08. Cursor And Invocation Boundary

### Decision

Cada invocación del endpoint procesará un solo lote y devolverá un cursor opaco `nextCursor`. El invocador repetirá la llamada hasta que `nextCursor` sea `null`.

El cursor se basará únicamente en campos propios del recurso:

```ts
{
  createdAt: string;
  recordId: string;
}
```

`recordId` corresponde a `internal_asset_maintenance_record_id`. La consulta ordenará por `createdAt ASC` y después por `recordId ASC`; `recordId` será el desempate estable.

No se usará `_id` de Mongo ni `updatedAt`:

- `_id` es un detalle de implementación de infraestructura
- `updatedAt` cambia durante el propio refresco

La persistencia incorporará un índice compuesto que cubra el filtro y orden del proceso: `status`, `createdAt`, `internal_asset_maintenance_record_id`.

### Rationale

- preserva la arquitectura limpia al no filtrar ni transportar `ObjectId`
- evita los problemas de `page + skip` sobre un conjunto que cambia durante el proceso
- permite reanudar manualmente el proceso y reutilizar el protocolo desde un scheduler futuro
- mantiene una orden estable aunque varios records compartan fecha de creación

## Decision 09. Batch Size And Execution Lock

### Decision

Cada invocación procesará un lote interno fijo de `100` records. El límite no será configurable mediante el endpoint en esta primera versión.

Antes de procesar, el job adquirirá un lock persistente y atómico en Mongo. El lock incluirá conceptualmente:

- nombre estable del job
- `executionId`
- `lockedUntil`

Si existe una ejecución vigente del mismo job, no se iniciará otra. El lock se liberará al finalizar y tendrá un lease para recuperarse si la API termina de forma inesperada.

### Rationale

- evita que dos invocaciones procesen el mismo lote simultáneamente
- funciona aunque existan varias instancias de la API
- evita depender de credenciales humanas o coordinación manual
- deja una base segura para cron interno o scheduler externo

### Non-Goals

Los `last_materialized_at` de cada record no sustituyen este lock. Son timestamps de auditoría por record y por tipo de materialización; no representan una ejecución global ni coordinan concurrencia.

## Decision 10. Lock Lease And Active Execution Response

### Decision

El lease inicial del lock será de cinco minutos.

Si el job ya tiene un lock vigente, el endpoint responderá `409 Conflict` e incluirá el momento de expiración disponible. El lock se liberará en un bloque `finally` al finalizar el lote, incluso si el procesamiento falla.

La primera versión no renovará el lease durante una ejecución. Si un lote de 100 records se acerca al límite, se ajustará el tamaño del lote o se agregará renovación de lease en una evolución posterior.

### Rationale

- mantiene el mecanismo inicial simple y observable
- evita bloqueos permanentes ante caídas de proceso
- comunica al invocador cuándo puede reintentar
- evita introducir renovación de locks sin evidencia de que sea necesaria

## Decision 11. Stateless Batch Progress

### Decision

El job será stateless respecto al progreso entre lotes.

El endpoint recibirá opcionalmente un cursor y devolverá `nextCursor`. El invocador será responsable de conservar el cursor devuelto y enviarlo en la siguiente llamada hasta recibir `nextCursor = null`.

El lock persistente solo coordina ejecuciones simultáneas; no almacenará checkpoints, historial ni estado de progreso de una corrida.

### Rationale

- evita crear modelos y colecciones adicionales para una primera versión manual
- hace explícita la reanudación para el operador y para un scheduler externo futuro
- si una llamada falla, el invocador puede reintentar desde el último cursor confirmado
- preserva la posibilidad de crear ejecuciones persistidas más adelante si negocio u operación lo requieren

## Decision 12. Technical Refresh Audit Semantics

### Decision

Un refresh técnico de materializaciones no modificará `updatedBy` ni `updatedAt` del record.

La trazabilidad técnica se conservará exclusivamente en los `lastMaterializedAt` de:

- `expirationStatusMaterialization`
- `expirationNotificationMaterialization`

Se separarán dos rutas de persistencia:

- actualización de backoffice: modifica datos de negocio y conserva la auditoría actual de `updatedBy` y `updatedAt`
- refresh técnico: actualiza únicamente los campos `expiration_*_materialization`, sin auditoría de usuario ni timestamps automáticos de Mongoose

La ruta técnica usará una actualización parcial específica con `timestamps: false` para garantizar que infraestructura tampoco modifique `updatedAt`.

### Rationale

- una materialización no representa una edición manual del record
- evita atribuir un cambio técnico a un usuario de backoffice inexistente
- `lastMaterializedAt` ya provee la trazabilidad temporal requerida
- separa claramente las mutaciones de negocio de los procesos técnicos reutilizables

## Decision 13. Batch Response And Failure Semantics

### Decision

La respuesta exitosa del endpoint devolverá, dentro del wrapper HTTP estándar de la API:

```ts
{
  processedRecords: number;
  materializations: {
    expirationStatus: { refreshedRecords: number };
    expirationNotification: { refreshedRecords: number };
  };
  durationMs: number;
  nextCursor: string | null;
}
```

Cada record calculará ambas materializaciones y se persistirá mediante una única actualización técnica atómica del documento.

Los errores serán fail-fast:

- se detendrá el lote ante el primer error
- no se devolverá un `nextCursor` nuevo
- los records terminados antes del error conservarán sus cambios
- el invocador reintentará desde el último cursor confirmado
- los logs internos incluirán `executionId`, `recordId` y etapa fallida

`409 Conflict` se reservará exclusivamente para lock vigente.

### Rationale

- mantiene las respuestas acotadas y útiles para ejecución manual
- separa métricas por materialización para permitir evolución independiente
- evita saltar records o avanzar el cursor sin un mecanismo persistente de incidencias
- permite reintentos seguros sobre records previamente refrescados

## Decision 14. Internal Job HTTP Contract

### Decision

El endpoint inicial será:

```http
POST /v1/internal-jobs/internal-asset-maintenance-records/refresh-materializations
Authorization: Bearer <INTERNAL_JOBS_TOKEN>
Content-Type: application/json
```

El body aceptará únicamente un cursor opcional:

```ts
{
  cursor?: string;
}
```

Respuestas esperadas:

- `200 OK`: lote procesado con el contrato de la decisión 13
- `400 Bad Request`: cursor inválido
- `401 Unauthorized`: token técnico faltante o inválido
- `409 Conflict`: lock vigente de otra ejecución

El controller vivirá bajo `src/internal/infra/api/controllers/internal-jobs/`, separado de `public` y `master-admin`.

La automatización que consume `nextCursor` queda fuera de este repositorio y de esta spec. Puede construirse después como script Node o dentro de un scheduler externo.

### Rationale

- expresa una acción técnica y no una operación de backoffice
- evita asociar el job con JWT, usuarios humanos o permisos funcionales
- mantiene un contrato mínimo que un cliente manual o scheduler puede encadenar

## Decision 15. Observability And Validation

### Decision

La observabilidad de esta primera versión usará el `Logger` estándar de Nest, siguiendo el patrón existente en la API. No se agregará una librería de logging, métricas externas, dashboard ni persistencia de historial de ejecuciones.

Se registrarán eventos `start`, `completed`, `failed` y `locked` con:

- `jobName`
- `executionId`
- duración
- records procesados
- métricas por tipo de materialización
- presencia de `nextCursor`
- `lockedUntil` cuando aplique

Nunca se registrará `INTERNAL_JOBS_TOKEN` ni el cursor completo.

No se agregarán pruebas automatizadas en esta versión. La validación será manual mediante invocaciones controladas al endpoint y verificación de la persistencia resultante.

### Manual Validation Scope

- ejecución exitosa de un lote inicial y continuación con `nextCursor`
- actualización de ambas materializaciones sin modificar `updatedBy` ni `updatedAt`
- respuesta `401` con token faltante o inválido
- respuesta `409` ante lock vigente
- reintento desde el último cursor confirmado tras un fallo controlado
- actualización de policies y eliminación de policies con los criterios aprobados

## Decision 16. Operational Runbook

### Decision

El runbook de `internal-jobs` vivirá en:

```text
docs/runbooks/internal-jobs.md
```

Este job será la primera entrada del documento. El runbook definirá:

- variables requeridas de URL y token técnico, sin incluir secretos reales
- primera invocación y continuación mediante `nextCursor`
- criterio de finalización con `nextCursor = null`
- recuperación ante `401`, `409` y fallos de lote
- reintento desde el último cursor confirmado
- rotación de `INTERNAL_JOBS_TOKEN`
- verificación en logs y persistencia

El documento se estructurará para admitir futuros `internal-jobs` sin duplicar la guía de autenticación o recuperación común.

### Rationale

- separa la operación manual de la documentación de diseño y autorización
- deja una guía reutilizable para operadores e infraestructura
- permite incorporar un scheduler futuro sin rediseñar el protocolo operativo

## Pending Decisions

No hay decisiones pendientes para la primera versión manual. La frecuencia y el mecanismo de automatización futura quedan explícitamente fuera de alcance.
