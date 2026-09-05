# Progress

## 2026-09-03

- Se creo la spec para el acceso de Clientes a registros de servicio.
- Se definio el modulo tecnico `CUSTOMER_SERVICE_RECORDS_CLIENT_ACCESS` y los
  copies separados para autorizacion e interfaz.
- Se cerro la frontera de visibilidad: permiso, relacion vigente
  usuario-cliente, asociacion usuario-registro y estatus tecnico activo.
- Se delimito la respuesta visible: datos generales, equipos, usuarios, tipo y
  compromiso con Cliente; sin informacion de Proveedor, politicas ni eventos.
- Se registraron listado, detalle, filtros permitidos y lookup de Clientes
  basado en registros autorizados existentes.
- Se aprobaron las rutas independientes de listado y detalle bajo
  `/v1/customer-service-records-client-access`.
- Se confirmo que el lookup de Clientes responde a la busqueda y filtros activos
  para no mostrar opciones sin coincidencias en la consulta actual.
- Se identifico que la definition funcional necesita complementarse con el
  diseno tecnico detallado antes de cualquier implementacion.
- Se registro la gobernanza de decisiones: cualquier gap se presenta al usuario
  responsable con opciones y no se resuelve sin su aprobacion explicita.
- Se aprobo un puerto de lectura dedicado para aislar el acceso por cliente del
  repositorio administrativo de registros de servicio.
- Se aprobo resolver primero las relaciones vigentes usuario-cliente; los
  snapshots de usuarios en registros se preservan como historia y no conceden
  acceso por si solos.
- Se aprobo reutilizar los indices existentes en el MVP; cualquier indice nuevo
  requiere medir previamente su beneficio con datos representativos.
- Se aprobo omitir `observations` del contrato inicial de consulta.
- Se aprobo exponer `created_at` en el detalle para trazabilidad del registro.
- Se aprobo omitir `updated_at` del contrato inicial por ser auditoria interna.
- Se aprobo que el lookup de Clientes ignore solo su propio `customer_id` y
  conserve la busqueda y los demas filtros activos.
- Se aprobo el ordenamiento multiple limitado a campos visibles, con
  `created_at desc` y desempate tecnico estable por defecto.
- Se retiro `created_at` de los ordenamientos publicos; conserva solo el orden
  interno predeterminado y desempate estable.
- Se aprobaron contratos separados: listado resumido con equipos y detalle
  completo con usuarios asociados y compromiso visible.
- Se aprobo el shape visible de equipos, sin observaciones internas.
- Se aprobo el semaforo de compromiso con datos presentables, sin origen ni
  metadatos internos de politicas.
- Por aclaracion del Cliente, se sustituyo esa decision: el semaforo no se
  expone y se conserva la fecha tentativa de entrega. Las observaciones vuelven
  al alcance en listado y detalle.
- Se aprobo localizar en backend los valores de sistema y conservar nombres de
  negocio persistidos listos para interfaz.
- Se aprobo exponer en detalle los snapshots basicos de usuarios asociados, sin
  metadatos de cuenta ni relacion.
- Se aprobaron las fechas de recepcion, entrega tentativa y entrega real para
  listado y detalle; `requested_at` queda fuera de los contratos de respuesta.
- Se alinearon filtros y ordenamientos con el contrato visible: `requested_at`
  queda fuera de rutas publicas, igual que datos de Proveedor.
- Se aprobaron lookups completos no paginados para Clientes y tipos de servicio.
- Se aprobo conservar el envelope no paginado existente para lookups, sin
  metadata adicional.
- Por aclaracion del Cliente, se retiro `operational_status` de respuestas,
  filtros, ordenamientos, lookups y catalogos del modulo.
- Se aprobo exponer solo la fecha tentativa efectiva, sin el intervalo tecnico
  que la origina.
- Se aprobo un lookup contextual de tipos de servicio basado en registros
  autorizados, no en el catalogo global.
- Se aprobaron rutas propias de opciones para Clientes y tipos de servicio bajo
  el modulo de acceso por Cliente.
- Se aprobaron los filtros contextuales de lookups, sin paginacion ni
  ordenamiento de tabla.
- Se aprobo el orden alfabetico estable de Clientes y tipos de servicio.
- Se aprobo excluir el nombre de Cliente de `search`; Cliente se filtra solo
  mediante su lookup contextual.
- Se aprobaron los campos operativos de equipo que participan en `search`.
- Se aprobo que valores numericos busquen tanto folio exacto normalizado como
  coincidencias textuales de tipo y equipos.
- Se aprobo responder colecciones vacias como resultado normal cuando no hay
  registros visibles para el actor.
- Se aprobo rechazar rangos de fechas invertidos con `400` en listado y
  lookups.
- El seed de roles se ejecutara manualmente por el responsable del entorno con
  `npm run db:seed:roles` despues de integrar el catalogo de autorizacion.
- Se completo la definicion y el diseno tecnico; la iniciativa esta lista para
  iniciar implementacion sin gaps funcionales abiertos.

## 2026-09-04

- Se corrigio el estado de la iniciativa: la definicion permanece en progreso y
  no esta lista para implementar hasta completar el registro obligatorio de
  artefactos y el breakdown de todas las slices.
- Se agregaron criterios de aceptacion, matriz de comportamiento, registro de
  artefactos, impacto entre repositorios y los slices completos de la
  iniciativa.
- Postman y handoff frontend quedan planeados en la slice HTTP; se
  materializaran y corroboraran contra los endpoints implementados antes de
  cerrar esa slice.
- La revision final del gate confirmo criterios de aceptacion, artefactos,
  composicion, impacto entre repositorios y slices completos; la definicion se
  marco como completada y lista para implementacion.
- Se cerro la Slice 1, `Authorization And Read Foundation`: se implementaron
  el catalogo `READ`, i18n, servicio de visibilidad, puerto y repositorio de
  lectura dedicados, DTOs, mapper, cuatro casos de uso y registros DI/barrels.
- La frontera compuesta se aplica en el repositorio antes de conteo,
  paginacion, detalle y opciones. No se modificaron schema, indices, CRUD
  administrativo, rutas HTTP, Postman ni handoff frontend.
- Validacion ejecutada: `npx tsc --noEmit --pretty false` exitosa. No se
  ejecutaron pruebas automatizadas por alcance aprobado; la validacion manual
  queda en la Slice 3.
- Se corrigio el DTO de opciones para cumplir la regla ESLint de tipos vacios;
  `npx eslint --fix` sobre los artefactos de Client Access y
  `npx tsc --noEmit --pretty false` finalizaron correctamente.
- Siguiente paso: Slice 2, contrato HTTP y documentacion de consumidores.

## 2026-09-04 - Implementacion de Slice 2

- Se completaron DTOs HTTP, cuatro queries/handlers tipados, presenter, controller
  y registros globales/barrels propios de Client Access.
- Se implemento la validacion compartida de rangos invertidos con HTTP 400.
- Se corrigio la sustitucion accidental del filtro de clientes autorizados por
  customer_id y se explicito la inyeccion de VisibilityService en la base heredada.
- Se actualizaron el handoff frontend, los cuatro requests y ejemplos Postman
  y el catalogo permanente de permisos.
- ESLint y npm run build correctos. Inspecciones locales de ValidationPipe,
  metadata de rutas/DI, presenter y filtro compuesto registradas en 07.
- Una inspeccion inicial importando modulos globales se interrumpio por la
  instrumentacion Console Ninja del entorno; la inspeccion directa posterior
  de controller y casos de uso termino correctamente.
- No se agregaron pruebas automatizadas ni se ejecutaron seeds. Los ejemplos
  Postman son ilustrativos; validacion HTTP con datos y seed pendiente en Slice 3.
