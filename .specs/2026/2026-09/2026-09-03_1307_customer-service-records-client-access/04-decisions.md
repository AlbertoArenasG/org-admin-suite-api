# Decisions

## 2026-09-03 - Identidad y frontera del modulo

### Decision

El modulo tecnico se llamara `CUSTOMER_SERVICE_RECORDS_CLIENT_ACCESS`.
Su copy de autorizacion sera `Acceso de clientes a registros de servicio` y
su copy de navegacion e interfaz sera `Seguimiento de servicios`.

### Reason

La identidad tecnica debe comunicar que el acceso esta acotado por Cliente y
usuario, mientras que la interfaz debe describir la tarea de consulta sin
exponer detalles de autorizacion.

### Impact

- El catalogo de autorizacion y los permisos no dependen del copy visible.
- Las claves i18n de autorizacion y navegacion se mantienen separadas.

## 2026-09-03 - Frontera de visibilidad compuesta

### Decision

El permiso `READ` del modulo se combina con relacion vigente usuario-cliente,
asociacion del usuario al registro y estatus tecnico `ACTIVE`.

### Reason

Una relacion con el Cliente no autoriza por si sola a ver todos sus registros;
el registro tambien debe incluir explicitamente al usuario como contacto.

### Impact

- La consulta debe recibir el usuario autenticado como parte de su entrada.
- La frontera se aplica antes de contar y paginar.
- Perder la relacion con el Cliente revoca acceso inmediatamente.

## 2026-09-03 - Separacion contractual del modulo administrativo

### Decision

El modulo usara presenters y contratos exclusivos, aunque lea el mismo
aggregate `CustomerServiceRecord`.

### Reason

La ocultacion de Proveedor, politicas y eventos debe ser una garantia de API,
no una responsabilidad del frontend.

### Impact

- No se reutiliza la respuesta administrativa sin una proyeccion dedicada.
- Search, filtros y ordenamientos no consideran campos de Proveedor.

## 2026-09-03 - Ruta y lookup contextual

### Decision

El modulo expone `GET /v1/customer-service-records-client-access` y
`GET /v1/customer-service-records-client-access/:recordId`.

El lookup de Clientes se calcula como `distinct` sobre los registros que pasan
la frontera de acceso y la consulta activa, incluida la busqueda y los filtros
aplicados.

### Reason

La ruta independiente evita confundir la superficie de acceso restringido con
el CRUD administrativo. Un lookup contextual evita mostrar opciones de Cliente
sin coincidencias en la busqueda actual.

### Impact

- El query del lookup recibe los mismos criterios visibles que el listado.
- La frontera de acceso se mantiene como condicion invariable del lookup.
