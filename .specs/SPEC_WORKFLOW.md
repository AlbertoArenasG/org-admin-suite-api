# Guia de Trabajo de Specs

**Registrado:** 4 de septiembre de 2026  
**Estado:** Referencia operativa vigente para cualquier sesion que trabaje una
spec en este repositorio.

## Proposito

Esta guia define como colaborar en una iniciativa documentada en `.specs`.
Busca conservar decisiones, evitar implementaciones parciales o improvisadas y
permitir que una nueva sesion retome una spec sin depender del contexto de una
conversacion anterior.

La persona usuaria es la autoridad de producto y arquitectura. El agente
investiga, propone, implementa y verifica, pero no cambia por cuenta propia una
estrategia, alcance o decision previamente aprobada.

## Fuentes de Verdad

- La carpeta de una spec conserva su historial, analisis, decisiones, plan y
  progreso.
- `docs/` contiene la referencia operativa vigente que debe sobrevivir a la
  spec: contratos, guidelines, catalogos y reglas permanentes.
- El codigo y las pruebas describen el comportamiento implementado actual.
- Si estas fuentes entran en conflicto, detenerse, exponer la discrepancia y
  solicitar una decision antes de continuar.

Antes de trabajar una iniciativa, leer en este orden:

1. `.specs/README.md` y este documento.
2. `.specs/index.md` para ubicar el estado de la iniciativa.
3. Todos los archivos de la carpeta de la spec relevante.
4. Las guidelines y contratos relacionados en `docs/`.
5. El codigo, pruebas y configuracion afectados.

## Estructura de una Spec

Cada iniciativa relevante usa una carpeta:

```text
.specs/YYYY/YYYY-MM/YYYY-MM-DD_HHMM_slug-del-tema/
```

Los documentos recomendados y su responsabilidad son:

- `00-definition.md`: alcance, preguntas abiertas y gate para implementar.
- `01-analysis.md`: estado actual, hallazgos, dependencias y riesgos.
- `02-plan.md`: solucion aprobada, fases y orden de ejecucion.
- `03-task-list.md`: vista macro de tareas en orden fijo.
- `04-decisions.md`: decisiones tomadas, razon, alternativas descartadas e
  impacto.
- `05-progress.md`: bitacora breve por sesion e hitos verificables.
- `06-technical-design.md`: contratos, flujos, modelos y diseño concreto.
- `07-implementation-breakdown.md`: slices pequenos y verificables.

No todos los archivos son obligatorios. Se crean cuando aportan claridad; no se
crea documentacion vacia por cumplir una plantilla.

## Ciclo de Vida

### 1. Definicion

Crear o actualizar `00-definition.md` antes de implementar un cambio
estructural. Debe indicar explicitamente:

- Problema y resultado esperado.
- Alcance incluido y excluido.
- Dependencias, restricciones y compatibilidad requerida.
- Decisiones abiertas y quien debe resolverlas.
- `Definition status: in_progress | completed`.
- `Implementation ready: no | yes`.

No iniciar implementacion estructural mientras exista una decision critica
abierta. Si el usuario autoriza una exploracion visual o tecnica, aislarla de
la implementacion real y registrarla como experimento.

### Criterios de Aceptacion y Matriz de Comportamiento

Antes de marcar `Implementation ready: yes`, la definicion o el diseno tecnico
debe establecer criterios verificables de aceptacion. No basta con describir la
solucion interna: debe quedar claro que comportamiento observara cada consumidor
y como se demostrara.

Para cada flujo relevante, documentar segun aplique:

- Caso exitoso y resultado observable.
- Entradas invalidas, estados de error, codigo HTTP y envelope esperado.
- Autenticacion, permiso o capability requerida y comportamiento sin acceso.
- Ausencia de datos, filtros, paginacion, ordenamiento y limites del contrato.
- Efectos secundarios, eventos, idempotencia, concurrencia e invariantes.
- Compatibilidad con consumidores, datos y rutas existentes.
- Prueba automatica o validacion manual que evidencia cada criterio.

Las variantes que no apliquen se indican expresamente con su razon. El
breakdown y las pruebas deben poder rastrearse a estos criterios; no cerrar una
slice solo porque compila si deja un comportamiento relevante sin comprobar.

### 2. Analisis y Diseno

Investigar el repositorio antes de proponer cambios. Identificar rutas,
modulos, contratos, persistencia, autorizacion, integraciones, pruebas y deuda
de compatibilidad.

Registrar en `04-decisions.md` toda decision que cambie la direccion del
proyecto, especialmente sobre:

- Arquitectura, limites de modulos o estrategia de coexistencia/migracion.
- Contratos HTTP, DTOs, modelos de dominio y persistencia.
- Autorizacion, seguridad, datos sensibles y efectos secundarios.
- Estrategias de limpieza posteriores a una migracion.
- Cambios de alcance, alternativas descartadas o excepciones deliberadas.

El agente debe presentar alternativas cuando haya tradeoffs reales, pero debe
pedir confirmacion antes de elegir una que modifique una decision aprobada o
una frontera relevante.

### Registro Obligatorio de Artefactos

**Antes de crear o modificar codigo**, `06-technical-design.md` debe contener
un apartado llamado `Registro de Artefactos`. Es obligatorio para cualquier
feature, refactor estructural, integracion o cambio de contrato.

El registro define, de forma textual y verificable, que clases, interfaces,
modulos, archivos o configuraciones intervienen. Para cada artefacto nuevo o
modificado debe especificar:

| Campo           | Contenido obligatorio                                                                                                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Artefacto       | Nombre exacto propuesto de la clase, interfaz, archivo o configuracion.                                                                                                                        |
| Tipo            | Entidad, value object, puerto, repositorio, query, command, handler, caso de uso, servicio, DTO, mapper, presenter, controlador, modulo, permiso, seed, migracion, prueba u otro rol concreto. |
| Ubicacion       | Ruta o directorio exacto donde vivira.                                                                                                                                                         |
| Responsabilidad | Una sola responsabilidad y resultado esperado.                                                                                                                                                 |
| Dependencias    | Puertos, modelos, servicios, eventos o modulos que consume o registra.                                                                                                                         |
| Estado          | `new`, `modify`, `reuse` o `not_applicable`.                                                                                                                                                   |

No se aceptan entradas ambiguas como “agregar repositorio” o “crear DTO”. Debe
indicarse el nombre y la ruta esperados, por ejemplo:

```text
IExampleReadRepository
Tipo: puerto de lectura
Ubicacion: src/internal/domain/ports/example-read.repository.ts
Responsabilidad: define consultas visibles del aggregate Example sin exponer
persistencia.
Estado: new
```

El registro debe cubrir expresamente los siguientes grupos. Si alguno no
aplica, se registra con `not_applicable` y una razon; no se omite.

- **Dominio:** modulos, entidades, value objects, politicas, excepciones,
  eventos y puertos en `src/internal/domain/`.
- **Aplicacion:** comandos, queries, handlers CQRS, casos de uso, servicios,
  DTOs, mappers y utilidades en `src/internal/application/`.
- **Infraestructura:** repositorios/adaptadores, modelos Mongoose, schemas,
  indices, migraciones, integraciones, configuracion, notificaciones y
  registros de DI en `src/internal/infra/`.
- **HTTP/API:** controladores, presenters, rutas, endpoints locales o
  dedicados, request/response DTOs, guards, decorators y envelopes de
  respuesta. Cada endpoint debe registrar metodo HTTP, path, controlador,
  handler o caso de uso invocado, autorizacion y posicion frente a rutas
  dinamicas cuando aplique.
- **Autorizacion:** modulo de autorizacion, permisos nuevos, operaciones,
  enums, traducciones, decoradores de permiso, capabilities auxiliares, roles
  y seeds que correspondan. Cada permiso o capability debe indicar su modulo
  propietario, operacion, consumidores y mecanismo de registro.
- **Persistencia y datos:** cambios de coleccion, compatibilidad de datos,
  migraciones, `dry-run`, indices, backfill y estrategia de rollback cuando
  aplique.
- **Composicion:** modulos Nest, imports/exports, providers, registros CQRS y
  orden de rutas que pueda afectar el enrutamiento.
- **Verificacion:** pruebas unitarias, integracion, e2e, fixtures, validacion
  manual y comandos de build/lint.

El registro tambien debe separar explicitamente:

- Artefactos que se reutilizan sin modificar.
- Artefactos legacy que se mantienen por compatibilidad temporal.
- Limpieza diferida y la spec futura necesaria para ejecutarla.

La definicion no puede marcar `Implementation ready: yes` mientras el registro
tenga nombres, ubicaciones, responsabilidades o registros de DI/CQRS/API sin
resolver. Durante la implementacion, toda desviacion debe actualizar primero el
registro y quedar explicada en `04-decisions.md`; no se crean clases “sobre la
marcha” sin documentar su lugar y proposito.

### Limites de Controladores y Casos de Uso

No crear controladores gigantes que concentren todas las capacidades de un
dominio. Un mismo dominio puede exponer varios controladores cohesionados, por
ejemplo, uno administrativo, uno de acceso de cliente, uno de operaciones o
uno de lookups. Todos deben permanecer bajo el modulo propietario y registrarse
en el diseno con sus rutas, responsabilidades y autorizacion; segmentar un
controlador no crea un dominio nuevo por si mismo.

Los casos de uso y handlers CQRS deben conservar la responsabilidad de
orquestar el flujo: validar el contexto, coordinar puertos o servicios, aplicar
la politica adecuada y producir el resultado. No deben crecer hasta convertirse
en archivos que mezclen orquestacion, reglas complejas, transformaciones,
consultas de persistencia y efectos secundarios no relacionados.

Cuando una parte del flujo tenga complejidad propia o sea comun a distintos
casos de uso, crear un servicio auxiliar con proposito concreto y registrarlo
antes de implementarlo:

- Reglas puras de negocio pertenecen a una politica o servicio de dominio en
  `src/internal/domain/`.
- Coordinacion reutilizable entre casos de uso pertenece a un servicio de
  aplicacion en `src/internal/application/services/`.
- Acceso a sistemas externos, persistencia o detalles tecnicos pertenece a un
  adaptador o servicio de infraestructura en `src/internal/infra/`.

No se crean servicios auxiliares de forma preventiva ni como contenedores
genericos. La razon debe ser una responsabilidad delimitada, complejidad que
merece aislamiento o reutilizacion real entre flujos. El registro de artefactos
debe indicar que casos de uso consumen cada servicio y que parte del flujo deja
de vivir en el handler. No usar un limite arbitrario de lineas como unico
criterio: separar por responsabilidad, dependencias y posibilidad de prueba.

### 3. Plan y Slices

El plan se ordena por resultados verificables, no por carpetas. Para trabajo
grande, usar slices pequenos con:

- Objetivo funcional o tecnico concreto.
- Archivos, modulos o contratos que tocara.
- Limites explicitos: rutas, artefactos, datos o comportamiento que la slice no
  cambia.
- Compatibilidad que debe preservar.
- Pruebas y validacion manual requeridas.
- Criterio claro de cierre.

Para evitar gaps durante la implementacion, las iniciativas por fases deben
mantener detallados y consistentes estos tres documentos:

- **`03-task-list.md`:** lista macro estable de fases y resultados. Cada tarea
  contiene objetivo, estado, dependencia previa si existe y criterio de cierre.
  No se reordena al avanzar: se cambia su estado, no su posicion. Los comandos
  que debe ejecutar el usuario, como migraciones, seeds o CI operativo, se
  registran como tareas explicitas con su condicion de inicio y resultado
  esperado.
- **`07-implementation-breakdown.md`:** desglose ejecutable de cada fase en
  slices pequenos. Cada slice debe referenciar su fase de task list e indicar
  alcance concreto, artefactos del registro que crea o modifica, pasos en
  orden, compatibilidad, validaciones y condicion de cierre. Si requiere un
  comando ejecutado por el usuario, debe incluir el comando exacto, el momento
  de ejecucion, precondiciones, riesgo y evidencia esperada. Antes de escribir
  codigo, el breakdown debe contener todos los slices previstos de la
  iniciativa, en su orden de ejecucion.
- **`05-progress.md`:** bitacora cronologica de lo que realmente ocurrio. Al
  cerrar una slice, registrar fecha, fase/slice, resultado, decisiones o
  desviaciones, archivos o contratos relevantes, validaciones ejecutadas,
  validacion manual pendiente o confirmada y siguiente paso exacto.

La relacion debe poder seguirse sin inferencias:

```text
Fase en 03-task-list.md
  -> slices de 07-implementation-breakdown.md
  -> ejecucion y evidencia en 05-progress.md
```

No iniciar una fase con slices vagas como “crear backend” o “hacer frontend”.
Si el trabajo no puede expresarse en un slice verificable, falta diseno o falta
refinar el breakdown antes de editar codigo.

El breakdown inicial es el plan de referencia, no una restriccion inmutable. Si
durante la implementacion aparece nueva informacion, se pueden refinar, dividir,
combinar, reordenar o agregar slices. Antes de ejecutar la parte afectada, se
actualizan `03-task-list.md`, `07-implementation-breakdown.md` y
`05-progress.md` con la razon, impacto, dependencias y validaciones del ajuste.

Si el ajuste cambia alcance, arquitectura, contratos, estrategia o una decision
critica, tambien se actualizan `00-definition.md`, `02-plan.md` y
`04-decisions.md`, y se consulta al usuario antes de continuar. Las slices ya
cerradas no se reescriben para ocultar el cambio de rumbo; el progreso conserva
la historia de lo que realmente ocurrio.

### 4. Implementacion

Implementar una slice completa antes de abrir otra. La secuencia esperada es:

1. Confirmar que la definicion esta lista o que el usuario autorizo el slice.
2. Inspeccionar los archivos afectados y usar `git status` o `git diff` cuando
   sea necesario para revisar cambios en curso.
3. Explicar brevemente que se modificara antes de editar.
4. Implementar sin revertir trabajo ajeno ni introducir parches temporales
   innecesarios.
5. Ejecutar las validaciones pertinentes.
6. Actualizar task list, decisiones, progreso y `docs/` cuando corresponda.
7. Pedir o reportar la validacion manual que solo el usuario pueda realizar.

Mantener compatibilidad temporal de forma explicita. No reemplazar rutas,
contratos, estrategias ni componentes compartidos solo porque parezca una
mejora; consultar primero si cambia el rumbo aprobado.

### 5. Cierre

Una spec se cierra cuando su objetivo se implemento, se verifico y sus
documentos reflejan el estado final. Antes de marcarla como completada:

- Actualizar `00-definition.md`, task list, progreso y decisiones pendientes.
- Mover reglas permanentes a `docs/`; no usar la spec como guideline viva.
- Documentar de forma explicita cualquier limpieza diferida, su condicion de
  inicio y la necesidad de una spec posterior.
- Registrar pruebas ejecutadas, validacion manual y riesgos residuales reales.
- Actualizar `.specs/index.md` con un estado util.

## Documentacion Permanente

Actualizar `docs/` cuando el cambio establezca una regla que futuras iniciativas
deban seguir: contrato de API, modelo de datos, politica de autorizacion,
patron reutilizable, estrategia de migracion, guideline o procedimiento
operativo.

No usar guidelines como bitacora de migracion. La spec conserva historia y
progreso; la documentacion permanente solo conserva la norma vigente.

### Contratos e Impacto Entre Repositorios

Todo cambio que afecte a frontend, otra API, una integracion o un consumidor
externo debe declarar en `06-technical-design.md` un apartado de `Contrato e
Impacto Entre Repositorios`: consumidor afectado, contrato anterior y nuevo,
compatibilidad, accion requerida, responsable de validar y ruta documental que
se actualizara. El mismo impacto debe aparecer en la fase y slice que lo
implementa.

Usar estas rutas permanentes, segun el tipo de cambio:

- `docs/frontend/<feature>-handoff.md`: contrato funcional que consume
  frontend. Crear o actualizar el handoff del feature con endpoints, requests,
  responses, permisos, estados de error, reglas de UI y compatibilidad. El
  frontend debe usar este documento como referencia de integracion.
- `docs/icsacv-api.postman_collection.json`: coleccion que debe actualizarse
  **siempre** al crear un endpoint. Tambien se actualiza si cambia el contrato
  de un endpoint existente. Incluir metodo, URL, autenticacion, headers, query,
  body, ejemplos y escenarios de respuesta representativos cuando la coleccion
  los soporte.
- `docs/api-pipeline.md`: solo si cambia una regla transversal del pipeline
  HTTP, por ejemplo controller, DTO, CQRS, presenter, envelope, auth context o
  autorizacion estructural. No se actualiza por cada endpoint ordinario.
- `docs/authorization/feature-permission-catalog.md`: permisos u operaciones
  nuevos, retirados o modificados.
- `docs/authorization/auxiliary-capabilities-mapping.md`: capabilities
  auxiliares, sus consumidores o su mapeo a permisos.
- `docs/authorization/authorization-rules.md`: reglas generales de
  autorizacion, jerarquias o politicas transversales que cambien.
- `docs/runbooks/<tema>.md`: procedimientos operativos, jobs, reparaciones,
  migraciones o pasos manuales recurrentes. Actualizar
  `docs/runbooks/internal-jobs.md` cuando el cambio pertenezca a jobs internos.

Si el consumidor es otro repositorio, la spec debe referenciar tambien su ruta
de spec o documento de integracion cuando exista. No asumir que un cambio de
backend es invisible al frontend porque la respuesta siga siendo exitosa.

La actualizacion de Postman es una tarea obligatoria en `03-task-list.md` y en
la slice correspondiente de `07-implementation-breakdown.md` para cada
endpoint nuevo. La slice no puede cerrarse sin registrar su actualizacion, o
una excepcion aprobada y justificada en `04-decisions.md`.

La secuencia obligatoria para handoff y Postman es:

1. **Antes de codigo:** `06-technical-design.md` define el contrato e impacto;
   `03-task-list.md` y `07-implementation-breakdown.md` registran la tarea. Si
   el contrato ya esta completamente decidido, el handoff puede iniciarse como
   borrador.
2. **Durante la slice del endpoint:** implementar y verificar el endpoint
   contra el contrato previsto.
3. **Antes de cerrar esa slice:** actualizar o confirmar como finales
   `docs/frontend/<feature>-handoff.md` y
   `docs/icsacv-api.postman_collection.json`, de acuerdo con el comportamiento
   real, incluidos permisos, errores y ejemplos.

No diferir estas actualizaciones al cierre global de la spec: frontend debe
recibir un contrato vigente conforme se completa cada endpoint.

## Validacion

Seleccionar la validacion segun el alcance. No afirmar que algo esta verificado
si una dependencia, entorno o accion manual lo impide.

- Ejecutar pruebas unitarias o e2e relacionadas cuando existan.
- Ejecutar compilacion o chequeo de tipos cuando el cambio lo requiera.
- Ejecutar lint con cuidado: este repositorio configura `npm run lint` con
  `--fix`, por lo que puede modificar archivos. Revisar el diff despues.
- Para cambios de persistencia, registrar en task list y breakdown el comando
  de `dry-run` y, cuando aplique, el comando de aplicacion que ejecutara el
  usuario. La sesion de IA no ejecuta ninguno.
- Distinguir warnings preexistentes de fallas introducidas por la slice.
- No iniciar ni detener servidores de desarrollo sin que el usuario lo pida.

### Estrategia Basada en Riesgo

En `06-technical-design.md` o `07-implementation-breakdown.md`, documentar la
estrategia de validacion para cada riesgo relevante con: riesgo, escenario,
nivel de prueba, evidencia esperada y responsable de ejecutarla. Elegir el
nivel mas cercano a la falla posible, no una prueba generica por costumbre.

- Reglas de negocio, politicas e invariantes: pruebas unitarias.
- Repositorios, persistencia, indices, queries y transacciones: pruebas de
  integracion y validacion de datos cuando aplique.
- Endpoints, DTOs, guards, permisos, envelopes y contratos: pruebas de
  integracion o e2e, mas actualizacion de Postman.
- Integraciones externas, notificaciones y adaptadores: pruebas del adaptador,
  dobles controlados y validacion manual u operativa cuando sea necesaria.
- Migraciones, seeds, backfills y reparaciones: tarea de comando para el
  usuario, precondiciones, riesgo, evidencia y rollback o mitigacion.

Si se omite una capa de prueba razonable, registrar la limitacion y su motivo.
No usar "no aplica" sin explicar el riesgo que se evaluo y la evidencia
alternativa.

### Comandos Ejecutados por el Usuario

Durante una spec, los siguientes comandos los ejecuta exclusivamente el
usuario, salvo que solicite de forma explicita que la sesion de IA los ejecute:

- Seeds, migraciones, backfills, reparaciones o cualquier operacion contra
  datos persistidos, incluso sus variantes `dry-run`.
- Comandos de ejecucion de CI u operacion que el usuario decida ejecutar desde
  su entorno.
- Inicio, detencion o reinicio de servidores, workers, contenedores y procesos
  de desarrollo.

La sesion puede ejecutar `git status` y `git diff` para inspeccionar el estado
de trabajo. No ejecuta operaciones Git que modifiquen staging, historial,
ramas o remotos, como `add`, `commit`, `merge`, `rebase`, `reset`, `restore`,
`stash`, `fetch`, `pull` o `push`, salvo solicitud explicita del usuario.

Cuando uno de esos comandos sea necesario para avanzar o validar una slice, la
sesion debe indicar de forma concreta:

1. En que fase o slice se requiere.
2. El comando exacto que el usuario debe ejecutar.
3. Su proposito, precondiciones y cualquier riesgo.
4. El resultado esperado y que salida debe compartir si se necesita continuar.
5. La tarea y slice donde quedo registrado.

La sesion debe esperar la confirmacion o salida del usuario antes de asumir que
el comando se completo. Nunca debe sustituir esta regla con un comando similar
ni ejecutar una variante aparentemente inocua.

## Git y Commits

- Usar `git status` y `git diff` para inspeccionar el estado y preservar cambios
  ajenos en un worktree sucio.
- No ejecutar operaciones Git que cambien staging, historial, ramas o remotos
  sin solicitud explicita del usuario.
- No sugerir comandos destructivos, resets ni reverts salvo que el usuario los
  pida o apruebe expresamente.
- Usar Conventional Commits con mensaje en espanol, porque `commitlint` lo
  exige. Ejemplo: `feat: agrega la gestion de invitaciones de usuario`.
- Al cerrar un bloque validable, proponer automaticamente el comando exacto
  `git commit -m "..."`. No incluir `git add` salvo que el usuario lo pida.
- No crear commits ni modificar staging por cuenta propia salvo solicitud
  explicita.

## Comunicacion Entre Sesiones

Al retomar una spec:

1. Informar que documentos y codigo se revisaran.
2. Resumir el estado actual, la siguiente tarea y cualquier decision abierta.
3. No suponer que una decision no documentada fue aprobada.
4. Si falta contexto que cambia la arquitectura o el comportamiento, preguntar
   de forma concreta antes de editar.
5. Mantener actualizados `05-progress.md` y `04-decisions.md` para que la
   siguiente sesion pueda continuar sin reconstruir el razonamiento.

## Checklist de Cierre de Slice

Este checklist es un criterio operativo de cierre, no un archivo o bloque que
deba copiarse literalmente en cada spec. La evidencia se registra en
`03-task-list.md`, `07-implementation-breakdown.md`, `05-progress.md` y,
cuando corresponda, en la matriz de validacion manual de la iniciativa. Solo
crear una copia local del checklist si aporta claridad real para una iniciativa
excepcional; no duplicar documentacion que ya demuestra los mismos puntos.

```text
[ ] Alcance implementado sin cambios no autorizados.
[ ] Compatibilidad y efectos secundarios revisados.
[ ] Criterios de aceptacion y limites explicitos de la slice cubiertos.
[ ] Validaciones automaticas ejecutadas o limitacion registrada.
[ ] Validacion manual solicitada o confirmada cuando aplica.
[ ] Contrato, handoff y coleccion Postman actualizados cuando aplica.
[ ] Task list, breakdown y progreso actualizados.
[ ] Decision y documentacion permanente actualizadas si aplica.
[ ] Comando de commit convencional en espanol propuesto.
```
