# Task List

## Phase 1. Definition And Design

- [x] Cerrar la regla de convivencia entre `sort_strategy` y `sort[]`.
  Status: done
  Closure: contrato no ambiguo documentado en definition, decisions y diseño.
- [x] Definir la ubicación de abiertos con materialización ausente y completar
  el diseño técnico.
  Status: done
  Closure: nivel fijo aprobado después de `POLICY`, sin derivar estatus en la
  consulta, y registro técnico revisado por la persona usuaria, incluido el
  método compartido en el base repository existente y el patrón de agregación
  ya usado por el proyecto. La persona usuaria autorizó explícitamente la
  implementación.

## Phase 2. Administrative Contract And Query

- [x] Incorporar `sort_strategy=work_priority` al listado administrativo.
  Status: done
  Closure: DTO, aplicación, puerto y consulta aplican el perfil antes de
  paginar sin cambiar requests existentes sin `sort_strategy`.

## Phase 3. Client-Access Contract And Query

- [x] Incorporar `sort_strategy=work_priority` al listado de acceso de cliente.
  Status: done
  Closure: misma prioridad con la frontera de visibilidad intacta.

## Phase 4. Verification And Handoff

- [x] Ejecutar la validación manual y compilación acordadas.
  Status: done
  Closure: la persona usuaria confirmó manualmente prioridad, paginación,
  precedencia de `sort[]`, visibilidad Client Access y compatibilidad sin
  `sort_strategy`; compilación y revisión estática también finalizaron correctamente.
- [x] Actualizar el handoff de frontend y Postman.
  Status: done
  Closure: ambos endpoints documentan el parámetro, incompatibilidades y
  ejemplos finales.
