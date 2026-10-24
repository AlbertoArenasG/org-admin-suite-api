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
