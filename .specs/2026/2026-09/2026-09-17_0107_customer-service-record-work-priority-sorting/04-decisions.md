# Decisions

## Decision 01. Perfil semántico de ordenamiento

Se agrega `sorting=work_priority` en vez de delegar múltiples `sort[]` al
frontend. La prioridad representa una bandeja de trabajo y pertenece al
backend, que conoce las materializaciones y puede ordenarla globalmente antes
de paginar.

Status: approved

## Decision 02. Fuente de la prioridad

Solo se usan los datos de `customer_delivery`. El compromiso de proveedor no
participa aunque tenga campos de entrega o materializaciones equivalentes.

Status: approved

## Decision 03. Jerarquía operativa

La jerarquía aprobada es `OVERDUE` abierto, abierto sin fecha estimada,
`POLICY` abierto, abierto con materialización ausente o no reconocible,
`ON_TIME` abierto, `COMPLETED`, `CANCELLED`; después se usa entrega estimada
ascendente y finalmente creación ascendente.

Una materialización `POLICY` se reconoce únicamente por su origen. Sus códigos
y labels no constituyen una escala global de severidad.

Status: approved

## Decision 04. Convivencia con ordenamiento manual

Cuando una request incluye `sorting=work_priority` y `sort[]`, se aplica solo
`sort[]`. Es una instrucción explícita por campo y por ello prevalece sobre el
perfil de bandeja. No se rechaza la request ni se agrega un nuevo código de
error.

Frontend puede quitar `sorting` al solicitar un orden manual para mantener una
URL limpia, pero backend no depende de que lo haga.

Status: approved

## Decision 05. Materialización ausente no deriva estatus en lectura

Para un registro abierto con fecha estimada y materialización ausente o no
reconocible, la prioridad fija es posterior a `POLICY` y anterior a `ON_TIME`.
La consulta no recalcula `OVERDUE` u `ON_TIME` a partir de la fecha ni persiste
una materialización. La normalización del dato, si se requiere, corresponde al
refresh técnico existente y queda fuera de este perfil de ordenamiento.

Una materialización es no reconocible si es nula o incompleta, si su `source`
no es `POLICY` ni `SYSTEM`, o si `source=SYSTEM` no tiene `OVERDUE` u
`ON_TIME` como código. Cualquier `source=POLICY` es reconocido sin evaluar su
código o label. La prioridad por fecha estimada nula se evalúa antes de esta
regla.

Status: approved

## Decision 06. Ordenamiento compartido en el base repository existente

No se crea un helper nuevo ni una carpeta nueva bajo los repositorios Mongoose.
`MongooseCustomerServiceRecordReadRepositoryImpl` y
`MongooseCustomerServiceRecordClientAccessReadRepositoryImpl` ya extienden
`MongooseCustomerServiceRecordBaseRepository`; este último recibe un método
protegido que construye la secuencia compartida de ordenamiento.

Status: approved

## Decision 07. Agregación local y mapper existente

Cada repositorio de lectura conserva su filtro actual y ejecuta, solo para
`sorting=work_priority` sin `sort[]`, una agregación con `$match`, las etapas
compartidas de prioridad, paginación y exclusión de la clave temporal. El
conteo mantiene `countDocuments(filter)` en paralelo.

El método protegido `buildWorkPriorityPipeline()` vive en
`MongooseCustomerServiceRecordBaseRepository` y devuelve únicamente las
etapas compartidas de `$addFields` y `$sort`. No se crea un helper ni archivo
nuevo. Los resultados crudos de `aggregate()` pasan al mapper existente con el
cast local que ya utiliza
`MongooseServiceEntrySurveyReadRepositoryImpl`; el mapper no se modifica y la
clave temporal se elimina antes de mapear.

Status: approved
