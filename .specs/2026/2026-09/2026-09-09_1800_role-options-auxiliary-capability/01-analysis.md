# Análisis

## Estado actual

`GetUserRolesUseCase` resuelve las opciones según `actorSystemRole` y no recibe
paginación. Las rutas `GET /v1/users/roles` y
`GET /v1/users/creation-roles` ejecutan exactamente el mismo
`GetUserRolesQuery` y serializan con `UserRolePresenter`.

La duplicación es de frontera HTTP y autorización, no de regla de jerarquía.
La regla debe conservarse como fuente de verdad de las opciones asignables.

## Frontera correcta

`ROLES` es el dueño porque el recurso consultado son roles. `USERS` y
`USER_REGISTRATION_INVITATIONS` solo son consumidores que requieren ese lookup
para sus flujos. Por ello:

- el catálogo registra `ROLES / READ_OPTIONS`;
- el mapa de derivación lo asigna a cada rol que tenga cualquier permiso
  directo de `USERS` o `USER_REGISTRATION_INVITATIONS`;
- `AuxiliaryCapabilitiesGuard` protege la ruta de `ROLES`;
- el caso de uso conserva el filtro estructural por `systemRole`.

## Reconciliación de persistencia

La derivación se ejecuta al crear o actualizar un rol. Agregar la regla al
catálogo deja desactualizados los roles ya persistidos hasta ejecutar el seed
existente `npm run db:seed:roles`. `system-roles.seed.ts` ya reconcilia los
roles del sistema y todos los custom desde sus permisos directos, sin modificar
sus campos de auditoría durante esa escritura técnica. No se requiere una
migración ni un reconciliador adicional.

## Compatibilidad

Los consumidores actuales siguen usando las rutas legacy. La API puede agregar
la nueva ruta sin ruptura, pero no debe retirar las anteriores hasta una futura
migración de consumidores en frontend. Esa migración no se documenta ni se
implementa en esta spec backend.

## Fuentes revisadas

- `src/internal/application/use-cases/user/get-user-roles.use-case.ts`
- `src/internal/infra/cqrs/queries/user/get-user-roles.query.ts`
- `src/internal/infra/api/controllers/user/user.controller.ts`
- `src/internal/infra/api/controllers/role/role.controller.ts`
- `src/internal/application/services/authz/auxiliary-capabilities/`
- `docs/authorization/authorization-rules.md`
- `docs/authorization/auxiliary-capabilities-mapping.md`
- `docs/technical-debt/user-role-assignment-options/role-options-capability-inconsistency.md`

## Riesgos

- Derivar la capability para el módulo dueño `ROLES` sería incorrecto: abriría
  el lookup por administración de roles en vez de por necesidad del consumidor.
- Proteger la nueva ruta solo con `ROLES/READ` impediría a actores que pueden
  crear o editar usuarios pero no administrar roles.
- Conservar `GetUserRolesUseCase` dentro de `user` es una deuda de ubicación
  menor, pero moverlo no es necesario para establecer la frontera HTTP y de
  autorización correcta. Se evaluará en el diseño técnico, sin refactor
  preventivo.
