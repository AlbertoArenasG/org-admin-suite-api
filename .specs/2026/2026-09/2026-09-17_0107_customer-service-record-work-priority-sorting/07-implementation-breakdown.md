# Implementation Breakdown

## Slice 1. Close Contract And Prepare Shared Profile

Phase: 1.

Scope: añadir el perfil a los request DTOs, DTOs de aplicación y puertos de
las dos superficies, preservando la precedencia aprobada de `sort[]`. Los query
adapters y handlers existentes transportan los DTOs ampliados sin modificarse.

Limits: no cambia todavía la forma de consulta, respuestas, autorización,
registro CQRS ni frontend.

Validation: compilación y validación manual acordada para enum, ausencia del
parámetro y precedencia de `sort[]` sobre el perfil.

Closure: ambos listados pueden transportar el perfil sin cambiar el
comportamiento sin `sort_strategy`.

## Slice 2. Administrative Work-Priority Query

Phase: 2.

Scope: incorporar el método protegido de ordenamiento en
`MongooseCustomerServiceRecordBaseRepository` y aplicarlo desde
`MongooseCustomerServiceRecordReadRepositoryImpl` mediante `aggregate()` antes
de paginar. El repositorio conserva `countDocuments(filter)` en paralelo y
excluye la clave temporal antes de usar el mapper existente.

Limits: no modifica el camino existente cuando no se solicita el perfil.

Validation: escenarios manuales con los siete grupos, fechas,
materializaciones `POLICY` y paginación.

Closure: el listado administrativo devuelve la prioridad exacta y total
correcto.

## Slice 3. Client-Access Work-Priority Query

Phase: 3.

Scope: consumir el método protegido compartido desde el repositorio de acceso
de cliente sin alterar su filtro de visibilidad, usando el mismo patrón de
agregación, conteo paralelo y mapper existente.

Limits: no expone proveedor ni modifica el presenter dedicado.

Validation: escenarios manuales con actor visible/no visible, prioridad y
paginación.

Closure: el perfil coincide con el administrativo para el conjunto visible del
actor.

## Slice 4. Contract Publication And Integration Evidence

Phase: 4.

Scope: finalizar handoff y Postman, ejecutar compilación y revisión estática
aplicables, y registrar la validación manual del contrato backend.

Limits: la adopción de frontend se trabaja después y fuera de esta spec backend.

Validation: compilación y confirmación manual de la persona usuaria para los
dos endpoints, sin depender de una aplicación cliente específica.

Closure: contrato permanente actualizado y evidencia de resultados backend
registrada.
