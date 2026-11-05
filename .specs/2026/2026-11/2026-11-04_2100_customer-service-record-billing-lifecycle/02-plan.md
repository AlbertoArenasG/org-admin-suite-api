# Plan

1. Extender entidad, schema, mapper, migración y presenters con `billing`/`invoiceStatus`, sin modificar las rutas de lectura existentes ni el contrato del portal.
2. Extender el envío administrativo con instrucciones opcionales y un endpoint administrativo para editarlas posteriormente. El correo de transición a `SUBMITTED` incluye las instrucciones actuales.
3. Incorporar escrituras de facturación independientes para datos/fechas, estado de factura, orden de compra, complementos, archivado y comentarios. Conservar la escritura actual de referencia/archivos de factura.
4. Implementar lectura paginada de comentarios e historial y el job interno dedicado a vencimientos.
5. Actualizar handoff, Postman, documentación viva de autorización y runbook de internal jobs durante la slice correspondiente a cada ruta; después realizar revisión estática y pedir validación manual.

El orden detallado está en `07-implementation-breakdown.md`. Ninguna fase de código comienza hasta autorización expresa y `Implementation ready: yes` aprobado por el usuario.
