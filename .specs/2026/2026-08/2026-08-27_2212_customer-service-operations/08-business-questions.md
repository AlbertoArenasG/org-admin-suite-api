# Business Questions

## Usage

Este documento concentra exclusivamente dudas que requieren confirmacion del negocio. No sustituye las decisiones tecnicas de la spec.

Cada pregunta conserva su identificador, estado y respuesta para poder retomarla sin bloquear decisiones tecnicas independientes.

Estados permitidos:

- `open`: pendiente de confirmar con negocio.
- `answered`: confirmada; la respuesta debe quedar registrada.
- `cancelled`: ya no aplica; explicar el motivo.

## BQ-01. Meaning Of Warranty

### Question

En el legacy, `Garantia` aparecia visualmente cerca del estatus general. ¿Representa un estado operativo o un tipo de servicio?

### Why It Matters

Define si `Garantia` pertenece al ciclo de vida operativo o al catalogo de tipos de servicio.

### Status

answered

### Business Answer

`Garantia` es un tipo de servicio. No forma parte del estatus operativo.

## BQ-02. Customer Delivery Estimate Anchor

### Question

Cuando un servicio se captura como pendiente antes de su recoleccion o
recepcion, ¿el plazo estimado de entrega al Cliente se cuenta desde la fecha de
solicitud/registro o desde la fecha real de recoleccion/recepcion?

### Why It Matters

Define la fecha base para calcular `estimated_customer_delivery_at` y evita que
la fecha comprometida cambie de manera inesperada al registrar la recepcion.

### Status

answered

### Business Answer

El plazo estimado de entrega al Cliente se cuenta desde `received_at`.
