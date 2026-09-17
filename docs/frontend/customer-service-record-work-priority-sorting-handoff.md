# Handoff Frontend: Customer Service Record Work Priority Sorting

**Fecha:** 2026-09-17  
**Spec:** [Customer Service Record Work Priority Sorting](../../.specs/2026/2026-09/2026-09-17_0107_customer-service-record-work-priority-sorting/00-definition.md).

## Contrato

Los listados siguientes aceptan opcionalmente:

```text
GET /v1/customer-service-records?sort_strategy=work_priority
GET /v1/customer-service-records-client-access?sort_strategy=work_priority
```

`sort_strategy` tiene un único valor válido: `work_priority`.

Sin ese parámetro, no cambia el contrato ni el orden histórico. Si llega junto
con uno o más `sort[]`, el backend ignora el perfil y aplica exclusivamente el
orden explícito de `sort[]`.

## Orden Del Perfil

El perfil ordena antes de la paginación con los siguientes grupos:

1. registros abiertos con materialización `SYSTEM/OVERDUE`;
2. registros abiertos sin `estimated_customer_delivery_at`;
3. registros abiertos con materialización de origen `POLICY`;
4. registros abiertos con fecha presente y materialización ausente o no
   reconocible;
5. registros abiertos con materialización `SYSTEM/ON_TIME`;
6. `COMPLETED`;
7. `CANCELLED`.

Los registros abiertos son `PENDING` e `IN_PROGRESS`. Dentro de cada grupo el
orden es entrega estimada ascendente, luego `created_at` ascendente y un
desempate técnico estable. El perfil solo usa datos persistidos; no recalcula
estatus durante la consulta ni clasifica códigos o labels de `POLICY`.

## Adopción Frontend

Las dos vistas pueden enviar `sort_strategy=work_priority` como orden inicial. Al
activar un orden manual por columna, pueden retirar el parámetro para mantener
la URL clara; aun si no lo retiran, `sort[]` prevalece en backend.

La adopción visual y su validación pertenecen a una iniciativa frontend
separada. Este documento no autoriza cambios en ese repositorio.
