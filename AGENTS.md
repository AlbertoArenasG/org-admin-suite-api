# Instrucciones del repositorio API

## Acuerdos de trabajo

- Los mensajes de commit y las propuestas de `git commit` van en español. Si el usuario pide el comando, dar `git commit -m "..."` para ejecutarlo desde este repositorio, sin `git -C`.
- No agregar archivos al stage, crear commits ni hacer push salvo petición explícita. Una petición de mensaje de commit no autoriza esas operaciones.
- El usuario ejecuta las migraciones, seeds y cualquier comando que escriba en la base de datos, salvo que pida expresamente que lo hagamos.
- Respetar las decisiones y el alcance aprobados. Para trabajo de una spec activa, seguir `.specs/SPEC_WORKFLOW.md`; un cambio solicitado fuera de la spec no se incorpora a ella por defecto.
- Antes de ampliar el contrato de un componente o servicio compartido, revisar sus consumidores y discutir el cambio cuando implique una decisión arquitectónica o afecte otros módulos.

## Arquitectura de la API

- Seguir `docs/api-pipeline.md` como referencia normativa. El flujo habitual es controller → request DTO → command/query → handler → caso de uso → dominio, puertos y adaptadores → DTO de aplicación → presenter → `ApiResponseBuilder`.
- Controllers delgados: validación de entrada en DTO, autenticación y permisos en guards/decorators, orquestación de negocio en casos de uso, persistencia e integraciones detrás de puertos. Los handlers delegan; no contienen lógica de negocio.
- Mantener dominio y aplicación libres de dependencias de HTTP, Mongoose y detalles de infraestructura. Los adaptadores implementan los puertos en infraestructura.
- Separar responsabilidades por caso de uso y módulo, aun cuando compartan una entidad. Reutilizar políticas o servicios que representen lógica realmente común; evitar clases grandes y abstraer solo cuando la reutilización sea clara.
- Construir la respuesta HTTP en presenters. Cuando un enum se exponga al cliente, seguir el contrato existente de `code`, `name` localizado y `name_key` cuando corresponda. Usar `ApiResponseBuilder` para el envelope.
- Consultar el catálogo y las reglas vivas de `docs/authorization/` antes de añadir permisos, endpoints locales o capabilities auxiliares.

## Verificación

- Ejecutar build y lint enfocado tras cambios de código; añadir pruebas cuando comprueben comportamiento o riesgos reales. No dar por validado un flujo HTTP o una migración real solo por compilar.
- Antes de cerrar una spec, revisar tareas, estados, evidencia de validación y documentación viva aplicable. No marcar como completada una validación que no ocurrió.

## Para afirmar que una spec está completada

- Auditar la carpeta completa de la spec y `.specs/index.md` antes de decir al usuario que está cerrada o que no queda ningún check o estado abierto. Seguir `.specs/SPEC_WORKFLOW.md`; una revisión parcial o el éxito del build no bastan.
- **Definición:** comprobar en `00-definition.md` que `Definition status`, `Implementation status`, `Validation status` y `Spec status` estén en `completed`, y que el alcance y las decisiones abiertas estén resueltos. `Implementation ready: yes` solo autoriza iniciar; no equivale a completada.
- **Implementación:** cotejar código y artefactos previstos en `06-technical-design.md` y las slices de `07-implementation-breakdown.md`. Confirmar que cada slice tiene el resultado y la evidencia de cierre acordados; corregir referencias a archivos inexistentes o trabajo realmente pendiente.
- **Tareas:** revisar todo `03-task-list.md`. No debe quedar ningún `- [ ]` ni una tarea actual con `Status: pending` o `in_progress`; cada tarea completada debe usar `[x]` y `Status: done` o `completed`, según el formato de esa spec. No cerrar una tarea por suposición ni dejar contradicciones entre checkbox y estatus.
- **Validación:** comprobar en `05-progress.md` y en los documentos de validación, si existen, qué se ejecutó realmente, qué confirmó el usuario y qué límites tiene esa evidencia. Registrar build, lint, verificaciones manuales y migraciones o seeds realizados según corresponda. No convertir una confirmación general en resultados específicos que el usuario no compartió.
- **Documentación y catálogo:** verificar que decisiones, contratos y documentación viva aplicable en `docs/` reflejen la implementación; actualizar `.specs/index.md` para que la entrada diga completada y enlace a la spec correcta. La carpeta cerrada queda como historia, mientras `docs/` conserva las reglas vigentes.
- Buscar marcas actuales sin cerrar (`[ ]`, `pending`, `in_progress`, `TODO` y equivalentes) en los documentos de la spec y resolver cada hallazgo. Distinguir tareas o estados vigentes de anotaciones históricas en `05-progress.md`; no reescribir el historial solo para eliminar coincidencias de texto. Si falta evidencia o queda una tarea, decir exactamente cuál y mantener el estado abierto.
- El despliegue, la supervisión y otras tareas DevOps no son requisitos de cierre de una spec de desarrollo, salvo que el usuario los haya incluido expresamente en su alcance aprobado. Nunca añadirlos como condición por iniciativa propia.
