# Progress

## 2026-09-21 - Definition Created

- Se documentaron modelo de adjuntos, historial permanente, conteos y
  proyecciones de lectura.
- Se cerraron contratos de POST minimo y cinco PUT por subrecurso.
- Se registro la migracion sin alteracion de auditoria y la politica manual de
  validacion.
- No se ha creado ni modificado codigo.

## 2026-09-21 - Implementation Gate Approved

- Se contrasto el diseno con `docs/api-pipeline.md` y se incorporaron los
  artefactos/garantias de pipeline faltantes.
- Se formalizo `remove` como estado del registro de artefactos para retiros
  planificados con reemplazo documentado.
- La persona usuaria aprobo `Implementation ready: yes`.
- No se ha iniciado implementacion de codigo.

## 2026-09-21 - Slice 1 Started

- Inicio autorizado de modelo, persistencia y reconciliacion compartida.
- Esta slice no incluye rutas HTTP, DTOs de request, casos de uso, migracion ni
  proyecciones de lectura.

## 2026-09-21 - Slice 1 Completed

- Se incorporaron snapshots activos, historial de removidos, referencias de
  documentos, `workOrderReference` y conteos materializados al aggregate,
  schema y mapper Mongoose.
- Se creo el reconciliador compartido: conserva auditoria de activos, resuelve
  IDs nuevos en lote, archiva ausencias y preserva orden y duplicados.
- Los repositorios estandar reutilizan el mapper comun, por lo que no requirieron
  cambios directos.
- Verificacion estatica ejecutada: `npm run build` y `npm run lint`.

## 2026-09-21 - Slice 2 Started

- Inicio autorizado de contratos de escritura segmentados, CQRS, casos de uso y
  retiro del PATCH amplio.

## 2026-09-21 - Slice 2 Completed

- El POST ahora recibe solo el contrato minimo e inicializa customer delivery,
  provider, colecciones y conteos aprobados.
- Se implementaron los PUT de details, customer, provider, asset y documents;
  los dos ultimos reconcilian adjuntos y recalculan conteos materializados.
- Se retiro el PATCH amplio, sus DTOs, adaptador, handler y caso de uso.
- Verificacion estatica ejecutada: `npm run build`, `npm run lint` y
  `git diff --check`.

## 2026-09-21 - Slice 3 Started

- Inicio autorizado de proyecciones de lectura y contrato generico de entrega
  de archivos.

## 2026-09-21 - Slice 3 Completed

- Los listados administrativo y Client Access exponen solo
  `attachments_count`; sus detalles exponen snapshots activos con URLs HTTP de
  descarga y previsualizacion.
- Client Access conserva su frontera de visibilidad: no entrega provider,
  historial, auditoria, bucket ni storage key.
- La descarga generica acepta `disposition=attachment|inline`; ambas cargas
  conservan el maximo de diez archivos y aplican 20 MiB por archivo.
- Verificacion estatica ejecutada: `npm run build`, `npm run lint` y
  `git diff --check`.
