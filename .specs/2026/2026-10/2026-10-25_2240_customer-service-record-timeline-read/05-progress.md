# Progreso

## 2026-10-25 — definición

- Se revisaron el listado, el modelo de fechas, el repositorio de lectura y las primitivas de Kibo descargadas en `component-staging/component-lab`.
- El usuario confirmó el periodo del Gantt, el tratamiento de fechas ausentes, los dos hitos de calendario, las cinco vistas de consulta, la ruta frontend independiente, Kanban por estado operativo, el uso del listado vigente en Lista/Kanban/Tabla y la agrupación por cliente.
- Se añadió a la propuesta semana/mes para Calendario y Gantt. La primitiva semanal de calendario requiere adaptación aislada en frontend; no cambia el endpoint.
- El usuario aprobó el límite de 42 días inclusivos. Se cotejaron `PaginationRequestDto` (`page`, `limit`, `items_per_page`), el envelope de paginación y la materialización del presenter con el diseño.
- El usuario añadió un tramo subordinado del proveedor al Gantt: desde entrega al proveedor hasta retorno real si existe, o estimado si aún no hay retorno real. Se actualizaron definición, análisis, consulta, artefactos, slices y criterios de aceptación antes de implementar.
- En revisión delegada por el usuario se confirmó el envelope real `{page,per_page,total,total_pages}`, el máximo de 100 y los barriles de exports. La primera propuesta `include_provider` era insuficiente: un periodo del cliente podía cruzar el rango sin mostrar hitos. Se sustituyó por `match=customer_milestones|periods` para seleccionar solo eventos visibles en Calendario y periodos completos en Gantt. Se corrigió el registro de artefactos para señalar el único barril que cambia.
- La definición se marcó `completed` tras auditar los ocho documentos y el índice. `Implementation ready` permanece en `no` porque el workflow exige aprobación explícita del usuario; esto no se infiere de la delegación de revisión.
- En la revisión final se detectó que el catálogo vivo de autorización enumera las rutas del módulo: se añadió su actualización a artefactos, plan, tareas y slice del endpoint. No implica crear un permiso nuevo.
- En la auditoría completa se corrigió un criterio que equiparaba incorrectamente los resultados semanales y mensuales, se explicitó el error por `match` inválido y se documentó el límite real de 10 000 páginas del DTO compartido. Se aclaró la representación cuando un registro solo tiene fechas del proveedor.
- Al contrastar la proyección ligera con `CustomerServiceRecordMapper.toViewDto()` se confirmó que el mapper vigente exige la entidad completa y campos ajenos a esta ruta. Se registró un mapper de aplicación específico, su export y la conversión directa del documento proyectado al read model en el adaptador.

## 2026-10-27 — auditoría de definición

- Se contrastó la matriz de validación con el workflow y se separaron escenario, nivel, evidencia esperada y responsable; los casos ya acordados permanecen iguales.
- En la nueva pasada se explicitaron las dependencias de los artefactos, se corrigió el flujo del mapper estático según el patrón real de aplicación y se distinguió la declaración de índices de su creación efectiva en MongoDB. Se reforzó la revisión de ambos valores de `match` y del valor predeterminado en la slice HTTP.
- Una segunda comprobación del mapper de dominio identificó el formateador vigente de `service_number_display`; el diseño temporal ahora indica su reutilización y lo incluye en el registro de artefactos.
- En esa revisión seguía pendiente la aprobación explícita para `Implementation ready: yes`, requerida por el workflow. No se implementó código ni se realizaron validaciones HTTP.
- El usuario autorizó expresamente marcar la definición como lista para implementar el 2026-10-27. Se cerró la Fase 1 y se actualizó el índice. La siguiente fase es la implementación de la consulta de lectura, pendiente de autorización para iniciar la Slice 1; no se ha escrito código ni validado HTTP.
