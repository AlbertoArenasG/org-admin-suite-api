# Decisions

## Decision 01. Archivo como subrecurso de Service Package Record

La descarga se expone bajo el registro dueño, no bajo `v1/files`. Los archivos
de paquetes no son entidades del modulo generico y la ruta necesita validar su
pertenencia al registro antes de solicitar el stream.

Status: approved

## Decision 02. Descriptor compatible con colecciones documentales

El detalle publico usa el mismo nucleo de descriptor que Customer Service
Records: `file_id`, `original_name`, `mime_type`, `size`, `download_url` y
`preview_url`. Ambas URLs apuntan al subrecurso de descarga con disposiciones
`attachment` e `inline`, respectivamente. `s3_key` deja de ser parte del
contrato de presenter. `relative_path` puede coexistir como metadata propia del
paquete sin ser requerida por el componente generico.

Status: approved

## Decision 03. Autorizacion existente

La ruta reutiliza `JwtAuthGuard`, `PermissionsGuard` y
`service_packages:READ`. No se agregan capacidades ni excepciones de acceso.

Status: approved

## Decision 04. Normalizacion exclusivamente en presentacion

`ServicePackageRecordFileProps`, el schema Mongo y la ingesta ZIP conservan
sus campos actuales. El presenter traduce `contentType` a `mime_type` y
construye las URLs publicas protegidas; el caso de uso conserva `s3Key` solo
para solicitar el stream al storage.

La alternativa descartada es migrar los archivos embebidos al agregado generico
`files` o reescribir su persistencia. Requeriria migracion y reingesta de datos
sin aportar valor al contrato de lectura actual.

Status: approved
