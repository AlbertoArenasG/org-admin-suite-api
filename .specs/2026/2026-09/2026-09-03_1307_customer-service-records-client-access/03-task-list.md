# Task List

## Phase 1. Definition

- [x] Registrar objetivo, alcance y frontera de visibilidad.
  Status: done

- [x] Confirmar ruta HTTP y comportamiento del lookup de Clientes.
  Status: done

- [x] Cerrar contrato visible de listado y detalle.
  Status: done

- [x] Completar criterios de aceptacion, registro de artefactos, contratos entre
  repositorios y estrategia de validacion.
  Status: done

## Phase 2. Technical Design

- [x] Diseñar artefactos, DTOs, queries, repositorio y presenters de consulta
  restringida.
  Status: done

- [x] Diseñar integracion de autorizacion, i18n, composicion CQRS/API, Postman
  y handoff frontend.
  Status: done

## Phase 3. Implementation

- [x] Agregar catalogo, traducciones y seed derivado de roles de sistema.
  Status: done

- [x] Implementar listado, detalle y lookups restringidos de Clientes y tipos
  de servicio.
  Status: done

- [x] Actualizar la coleccion Postman y el handoff frontend del modulo.
  Status: done

- [x] Actualizar el catalogo permanente de permisos del feature.
  Status: done

- [x] Documentar y ejecutar validacion manual de frontera, paginacion y contrato de respuesta.
  Status: done
  Evidence: 2026-09-04, todos los escenarios confirmados por el usuario;
  alcance y fuente de evidencia registrados en `05-progress.md`.

- [x] Ampliar acceso a todos los registros ACTIVE para staff interno y conservar
  ambas restricciones para externos; actualizar contratos y comprobar lint/build.
  Status: done

## Phase 4. Validation And Closure

- [x] Ejecutar validaciones tecnicas y registrar resultados.
  Status: done
  Evidence: lint/build e inspecciones locales previas; validacion HTTP confirmada
  por el usuario el 2026-09-04. Sin pruebas automatizadas, por alcance aprobado.

- [x] Solicitar ejecucion manual de `npm run db:seed:roles` al responsable del entorno.
  Status: done
  Evidence: captura del usuario; system-roles created=0 updated=2 unchanged=4.

- [x] Registrar resultado del seed y cerrar la spec.
  Status: done
  Evidence: seed registrado; todas las validaciones confirmadas por el usuario.
  Slice 3 y spec cerradas el 2026-09-04.
