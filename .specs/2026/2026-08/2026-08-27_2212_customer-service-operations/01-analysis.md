# Analysis

## Legacy Inventory

El sistema legacy concentra en un mismo formulario:

- Datos generales del servicio, Cliente, Contacto, Proveedor, estatus operativo
  y fechas de entrega. El nuevo aggregate separara ese estatus de negocio del
  `status` tecnico de ciclo de vida.
- Uno o mas equipos atendidos, su identificacion y evidencia de entrada/salida.
- Logistica de entrega, retorno, mensajeria, guias y documentos aduanales.
- Documentos comerciales y tecnicos, como cotizacion, orden de compra, factura e informe de calibracion.

El nuevo modulo no debe trasladar el formulario como una entidad plana. Debe separar las responsabilidades de servicio, equipo, logistica y documentos.

## Existing Reusable Domains

- Customers y Contacts.
- Providers, tambien utilizados como Laboratorios.
- Recipient groups, notification policies y expiration-status policies cuando sean pertinentes.
- Infraestructura actual de archivos y documentos, por validar durante el diseno.
- Patrones de control de activos internos para estados, auditoria y materializaciones, sin acoplar el nuevo dominio a sus nombres o reglas.
