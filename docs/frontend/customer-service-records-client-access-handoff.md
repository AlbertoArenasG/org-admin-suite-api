# Handoff Frontend: Seguimiento de Servicios

**Fecha:** 2026-09-06
**Estado:** Contrato final; compromiso completo con Cliente validado por
confirmacion del usuario el 2026-09-06.
**Spec:** [Customer Service Records Client Access](../../.specs/2026/2026-09/2026-09-03_1307_customer-service-records-client-access/00-definition.md).

## Acceso y compatibilidad

Modulo independiente `CUSTOMER_SERVICE_RECORDS_CLIENT_ACCESS`, operacion `READ`.
Copy de navegacion: Seguimiento de servicios. Copy de permisos: Acceso de clientes
a registros de servicio. Los cuatro endpoints requieren Bearer JWT y ese permiso.
El permiso administrativo `CUSTOMER_SERVICE_RECORDS/READ` no lo sustituye.

Cada lectura exige READ y estatus tecnico ACTIVE. Backend lee is_internal_staff
del usuario persistido en cada consulta. Staff interno ve registros de todos los
Clientes sin requerir relacion usuario-cliente ni pertenencia a customer.users.
Usuarios externos requieren ambas condiciones simultaneamente.
El rol no determina este alcance y frontend no puede enviar el flag como filtro.
Revocar una relacion impide consultas posteriores del usuario externo aunque el
snapshot siga presente. Cambiar la clasificacion de staff afecta la siguiente
consulta sin renovar JWT.
No cambia el contrato administrativo existente. La implementacion frontend tendra
su propia spec; este documento es su referencia de integracion.

## Endpoints

Base: `/v1/customer-service-records-client-access`.

| Metodo | Ruta relativa | Respuesta |
| --- | --- | --- |
| GET | base | Listado paginado |
| GET | `/:recordId` | Detalle visible o 404 |
| GET | `/customers/options` | Opciones contextuales de Clientes |
| GET | `/service-types/options` | Opciones contextuales de tipos |

## Filtros y orden

Listado: `page`, `limit`, alias `items_per_page` (prioridad de `limit`).
Defaults: pagina 1, limite 10. Pagina 1..10000; limite 1..100.
Filtros compartidos con options:

- `search`: texto de tipo de servicio y equipo (name, identifier, brand, model,
  serial_number); si representa un entero tambien busca el folio exacto.
- `customer_id`, `service_type_code`.
- `received_at_from`, `received_at_to`.
- `estimated_customer_delivery_at_from`, `estimated_customer_delivery_at_to`.

Rangos inclusivos con formato `YYYY-MM-DD`, independientes de zona horaria.
Un rango invertido responde 400 incluso sin coincidencias.
Busqueda no incluye nombre de Cliente, observaciones ni datos de Proveedor.

Orden multiple solo en listado:
`sort[0][field]=service_number&sort[0][direction]=asc`.
Campos: `service_number`, `received_at`, `estimated_customer_delivery_at`;
direcciones `asc` y `desc`. Default interno `created_at desc`, desempate por ID.
Options no aplican paginacion ni sort; devuelven todas las coincidencias.

El ValidationPipe global descarta parametros no declarados; no se convierten en
filtros. Un valor de sort invalido en listado responde 400.

## Respuestas

Todos usan el envelope existente: `success`, `success_message`, `status_code`
y `data`. El listado agrega `pagination: { page, per_page, total, total_pages }`.
Detalle y options no agregan pagination ni meta.

Cada fila del listado:

```json
{
  "customer_service_record_id": "record-example",
  "service_number": "0001",
  "service_type": {
    "service_type_code": "CALIBRATION",
    "name": "Calibracion"
  },
  "observations": "Equipo recibido",
  "customer": {
    "customer_id": "customer-example",
    "name": "Cliente Ejemplo"
  },
  "assets": [
    {
      "asset_id": "asset-example",
      "name": "Manometro",
      "identifier": "EQ-001",
      "brand": "Marca",
      "model": "Modelo",
      "serial_number": "SN-001"
    }
  ],
  "customer_delivery": {
    "received_at": "2026-09-01",
    "estimated_delivery_interval": { "years": 0, "months": 0, "weeks": 1, "days": 0 },
    "estimated_delivery_at": "2026-09-10",
    "delivered_to_customer_at": null,
    "status_policy_id": "policy-example",
    "notification_policy_id": "notification-policy-example",
    "status_materialization": {
      "source": { "code": "POLICY", "name": "Politica", "name_key": "CUSTOMER_SERVICE_RECORD.MATERIALIZATION_SOURCE.POLICY" },
      "code": "ON_TIME",
      "name": "En tiempo",
      "name_key": "CUSTOMER_SERVICE_RECORD.STATUS.ON_TIME",
      "color_hex": "#16A34A",
      "effective_start_date": "2026-09-03",
      "matched_rule": null,
      "last_materialized_at": "2026-09-03T12:00:00.000Z"
    },
    "notification_materialization": null
  },
  "operational_status": {
    "code": "IN_PROGRESS",
    "name": "En proceso",
    "name_key": "CUSTOMER_SERVICE_RECORD.OPERATIONAL_STATUS.IN_PROGRESS"
  }
}
```

Detalle contiene la misma estructura y agrega `created_at` (timestamp ISO) y
`customer.users: [{ user_id, name, email }]`. El folio es string con padding
minimo de cuatro digitos. Las fechas del compromiso son date-only o null.
Observaciones son string o null. Los nombres de Cliente y tipo son snapshots
de negocio, no enums traducibles.

`customer_delivery` expone el compromiso completo: fechas, intervalo,
referencias de politicas, `status_materialization` y
`notification_materialization`. La materializacion de estatus incluye fuente
localizada, codigo, nombre, color, fecha efectiva, regla coincidente y fecha de
materializacion. La de notificaciones incluye sus fechas, reglas y eventos con
estatus localizado. `operational_status` tambien se expone como codigo, nombre
y `name_key` localizado.

No se exponen provider, requested_at, updated_at ni observaciones de assets.
No se exponen campos, politicas, materializaciones o eventos pertenecientes a
Proveedor.

Opciones de Clientes: `[{ customer_id, company_name }]`.
Opciones de tipos: `[{ code, name }]`. Ambas listas viven dentro de `data`.
Cada lookup se deriva de registros autorizados y conserva busqueda y filtros,
excepto su filtro propio: Clientes ignora customer_id y tipos ignora service_type_code.
Para staff las opciones abarcan todos los registros ACTIVE coincidentes; para
externos solo los autorizados. La UI debe reenviar el contexto de filtros al refrescar ambos selects.
Orden alfabetico por etiqueta y desempate por ID/codigo.

## Estados y errores

| Caso | HTTP | Resultado |
| --- | --- | --- |
| Sin coincidencias (o externo sin relaciones) | 200 | data vacia; listado con total y total_pages 0 |
| Registro inexistente, eliminado o fuera de frontera | 404 | ENTITY_NOT_FOUND.CUSTOMER_SERVICE_RECORD |
| JWT ausente o invalido | 401 | Codigo AUTHENTICATION correspondiente |
| Permiso insuficiente | 403 | AUTHORIZATION.ROLE_PRIVILEGES_INSUFFICIENT |
| DTO invalido o rango invertido | 400 | VALIDATION.DEFAULT |

Errores conservan `success: false`, `success_message: null`, `status_code` y
`error_details` con message, method, path, error_code, validation_errors.
Frontend no distingue el motivo del 404 ni trata el vacio como error.

## Validacion y operacion

La coleccion `docs/icsacv-api.postman_collection.json` incluye la carpeta
Customer Service Records Client Access con ejemplos ilustrativos, no capturas
de un entorno. Configurar HOST, CLIENT_ACCESS_AUTH_TOKEN y CLIENT_ACCESS_RECORD_ID.
No incluye scripts de pruebas automatizadas nuevos.

Despues de desplegar el catalogo, el responsable del entorno ejecuta
`npm run db:seed:roles` antes de validar roles de sistema. El seed no crea
relaciones ni agrega usuarios a registros. Comprobar manualmente los cuatro GET,
revocacion, filtros cruzados, paginacion, permisos y ausencia de datos internos.
La evidencia se registra en 05-progress de la spec; no se asume ejecutado el seed.
