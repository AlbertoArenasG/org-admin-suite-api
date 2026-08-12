# Plan

## Objective

Diseñar e implementar en backend una capability reusable de `contacts` y `recipient-groups` que permita agrupar destinatarios sin duplicación operativa, preparada para crecimiento multicanal, pero con alcance funcional inicial acotado a `EMAIL`.

## Target Design

- módulo `contacts` como catálogo base reusable de contactos internos y externos
- módulo `recipient-groups` como agrupador reusable de referencias a `contacts`
- catálogo transversal `communication-channels` expuesto por API y definido en código
- sincronización automática entre `user` y `contact` para campos compartidos base
- persistencia de grupos con `contactIds[]` preservando el orden recibido
- contratos HTTP iniciales completos para CRUD base y lookup liviano

## Phases

### Phase 1. Analysis And Domain Framing

- consolidar análisis técnico y contractual a partir de la definición ya aprobada
- identificar entidades, value objects, catálogos base y reglas de sincronización
- dejar claras las fronteras entre:
  - `users`
  - `contacts`
  - `recipient-groups`
  - `communication-channels`

### Phase 2. Backend Model And Contract Design

- aterrizar shape de entidades y DTOs mínimos
- definir contratos HTTP concretos de `contacts`
- definir contratos HTTP concretos de `recipient-groups`
- definir respuesta de `GET /v1/communication-channels`
- decidir e implementar estrategia de `seed` y sincronización inicial de usuarios existentes

### Phase 3. Backend Implementation

- crear catálogo de canales en código
- implementar dominio, puertos, persistencia y casos de uso de `contacts`
- implementar dominio, puertos, persistencia y casos de uso de `recipient-groups`
- implementar wiring y controllers
- implementar `seed` para materializar contactos de usuarios existentes
- conectar sincronización automática `user -> contact`

### Phase 4. Validation And Handoff

- validar contratos y reglas mínimas del módulo
- actualizar documentación viva si nace algún catálogo o regla operativa reusable
- dejar lista la base para abrir spec espejo en frontend cuando haga falta

## Sequencing Notes

- primero debe cerrarse backend como spec madre antes de bajar un espejo en frontend
- `contacts` debe construirse antes o junto con `recipient-groups`, nunca después
- el catálogo de canales se mantendrá en código desde el inicio
- la `seed` de usuarios existentes no debe quedar olvidada como tarea posterior informal

## Exit Criteria

- `contacts` queda definido e implementado como catálogo base reusable
- `recipient-groups` queda definido e implementado como agrupador de `contacts`
- `EMAIL` queda operativo como único canal publicado en `v1`
- los usuarios internos existentes y nuevos pueden materializarse como `contacts`
- el contrato HTTP base queda listo para consumo futuro desde frontend
