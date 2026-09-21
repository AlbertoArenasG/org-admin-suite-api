# Decisions

## D01. Snapshot Embedded Instead Of Read-Time File Lookup

Cada relacion conserva `file_id`, nombre original, MIME, tamano y auditoria.
Evita lookups de `files` durante lecturas y deja abierta la adicion futura de
propiedades de relacion sin migrar arrays de strings.

## D02. Permanent Removal History

`files` son las relaciones activas; `removed_files` conserva cada remocion. El
cliente no envia historial. La restauracion futura agregara una nueva relacion
activa sin borrar evidencia de remociones previas.

## D03. Segmented PUT Instead Of Broad PATCH

El aggregate supera los campos que una mutacion amplia puede coordinar con
claridad. Cinco subrecursos limitan cada contrato y operacion atomica sin
acoplar la API a una interfaz particular.

## D04. Client Access Is A Read Projection

La visibilidad se resuelve al construir la respuesta de Client Access. No vive
en metadata generica de File ni exige endpoints dedicados por recurso.

## D05. Migration Instead Of Runtime Defaults

Los documentos existentes recibiran estructuras explicitas por migracion. No
se ocultara la ausencia historica con defaults de presenter, mapper o query.

## D06. Generic File Contract Remains General

La carga autenticada existe para registrar `uploaded_by`; la publica sirve
flujos tokenizados. Se limita tamano tecnico, no tipos MIME. La descarga usa
`disposition` para descargar o previsualizar sin revelar S3.

## D07. Active Arrays Are Authoritative And Preserve Multiplicity

Los requests solo expresan el listado activo deseado. Una ausencia archiva la
relacion persistida; una presencia conserva su auditoria original. IDs
duplicados no se rechazan ni se normalizan: se persisten y cuentan en el orden
recibido si existen en `files`.

## D08. Audit Is Additive

Cada alta y remocion de adjunto conserva su actor y fecha. Toda escritura de
Customer Service Record actualiza solo `updated_by` y `updatedAt`; nunca campos
de creacion. La migracion sigue la misma regla.

## D09. Documents Are Service-Record Subresources

Quotation, purchase order, invoice y other files viven en la raiz del Customer
Service Record. Aunque algunos involucren al cliente, no son propiedades de la
entidad Customer. La orden de compra en particular es emitida por el cliente
hacia Implementos Cientificos.

## D10. Asset Attachments Describe Condition And Service Output

Intake y delivery condition files corresponden al activo y documentan su
estado al ingreso y alrededor de la entrega, respectivamente. Aceptan archivos
genericos para no limitar una evolucion futura. Reports tambien pertenece al
activo y sustituye el nombre restrictivo de informe de calibracion.
