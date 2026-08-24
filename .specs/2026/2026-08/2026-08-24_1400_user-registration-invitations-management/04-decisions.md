# Decisions

## Decision 01. Scope Boundary

La funcionalidad de backoffice operará exclusivamente sobre invitaciones con `scope: APPLICATION`. Las invitaciones `MASTER` quedan fuera, así como los endpoints públicos de consulta y consumo.

## Decision 02. Invitation Lifecycle

No se agregará expiración. El listado mostrará `PENDING`, `CONSUMED` y `REVOKED`; solo una invitación `PENDING` con `consumedAt: null` puede reenviarse.

## Decision 03. Direct Operations

El módulo `user_registration_invitations` tendrá:

- `READ` para el listado administrativo.
- `CREATE` para emitir una invitación nueva.
- `RESEND` para reenviar una invitación pendiente.
- `REVOKE` para invalidar una invitación pendiente.

`UPDATE` no se usará para reenviar y queda reservado para una futura edición de datos.

## Decision 04. HTTP Boundary

La frontera ordinaria de aplicación incorporará:

```text
GET  /v1/user-registration-invitations
POST /v1/user-registration-invitations/:invitationId/resend
POST /v1/user-registration-invitations/:invitationId/revoke
```

Los endpoints requerirán JWT y `PermissionsGuard`, con `READ`, `RESEND` y `REVOKE` respectivamente. No se modifica la frontera `master-admin`.

## Decision 05. Listing

El listado será paginado, buscará por email y permitirá filtrar por `status`. Sin orden explícito, usará `createdAt DESC`.

También admitirá orden compuesto; frontend podrá solicitar primero `status` y después `createdAt`, con direcciones validadas por backend.

## Decision 06. Re-send Token Rotation

Cada reenvío generará un token nuevo y persistirá su hash. El enlace anterior queda inválido. La invitación conserva su mismo `invitationId`, email, rol, datos de usuario e historial de consumo.

La creación ordinaria continuará rechazando un email con invitación activa; no se transformará implícitamente en reenvío.

## Decision 07. Delivery Metadata

Cada invitación incorporará:

```ts
emailDelivery: {
  lastAttemptAt: Date | null;
  lastAttemptStatus: 'ACCEPTED' | 'FAILED' | null;
};
resendCount: number;
```

`ACCEPTED` significa que el proveedor aceptó el correo para envío, no que el destinatario lo recibió o leyó. La metadata se registra tanto en creación como en reenvío; una invitación nueva inicia con `resendCount: 0`.

## Decision 08. Failure Semantics

La creación o rotación persiste el token y deja inicialmente el último intento como `FAILED`. Si el proveedor acepta el correo, se actualiza a `ACCEPTED`.

Ante fallo del proveedor, la invitación permanece `PENDING`, el endpoint responde error y un reenvío posterior puede recuperarla con otro token.

## Decision 09. Existing Invitations

Las invitaciones existentes sin esos campos se expondrán con `emailDelivery.lastAttemptAt: null`, `emailDelivery.lastAttemptStatus: null` y `resendCount: 0`. No habrá migración masiva. Solo las pendientes no consumidas podrán reenviarse.

La normalización se aplicará en `MongooseUserRegistrationInvitationMapper`, al convertir documentos de persistencia a records de dominio. No se aplicará en el presenter HTTP, para que todos los consumidores del dominio reciban el mismo contrato.

## Decision 10. Administrative Response

El listado devolverá:

```ts
invitationId
email
status
systemRole
roleId
userData
invitedByUserId
createdAt
consumedAt
revokedAt
revokedByUserId
emailDelivery
resendCount
```

Nunca expondrá token, hash, URL de invitación ni datos internos del proveedor.

## Decision 11. System Roles And Seeders

Se agregarán las operaciones `RESEND` y `REVOKE`, con sus traducciones español/inglés. Los seeders actualizarán solo `MASTER_ADMIN` y `ADMIN`; no modificarán ni eliminarán roles personalizados.

## Decision 12. Re-send Concurrency

La rotación de token usará una actualización condicional atómica con los valores previamente leídos:

```ts
invitationId
scope: APPLICATION
status: PENDING
consumedAt: null
tokenHash: expectedTokenHash
```

Si otra solicitud consume o reenvía la invitación antes de esa actualización, el documento deja de coincidir y no se envía un correo adicional. El caso de uso responderá un conflicto `409`.

No se agregarán campos, índices, migraciones ni locks. La garantía depende de una única actualización atómica de Mongo sobre los campos existentes.

## Decision 13. Re-send Errors

El endpoint de reenvío responderá:

- `404` si la invitación no existe o no pertenece a `APPLICATION`.
- `409` si existe, pero fue consumida o cambió durante otro reenvío concurrente.
- El error de infraestructura correspondiente si el proveedor de correo falla; la invitación seguirá `PENDING` y registrará `emailDelivery.lastAttemptStatus: FAILED`.

## Decision 14. Validation Strategy

No se agregarán pruebas automatizadas en esta versión. La validación será manual mediante la colección Postman actualizada e incluirá creación, listado, filtros, orden compuesto, reenvío, rotación de token, consumo, conflictos y fallo de correo.

## Decision 15. Existing Metadata Defaults

El contrato de metadata será:

```ts
emailDelivery: {
  lastAttemptAt: Date | null;
  lastAttemptStatus: 'ACCEPTED' | 'FAILED' | null;
};
resendCount: number;
```

Las invitaciones existentes sin esos campos se expondrán como `lastAttemptAt: null`, `lastAttemptStatus: null` y `resendCount: 0`, sin migración masiva.

Las invitaciones nuevas se crearán con `lastAttemptStatus: FAILED` y el instante del intento. Si el proveedor acepta el correo, se actualizarán a `ACCEPTED`.

## Decision 16. Invitation Revocation

La invalidación administrativa se modelará como revocación, no como `DELETE` físico ni como cancelación.

```text
POST /v1/user-registration-invitations/:invitationId/revoke
```

Solo puede revocar una invitación `PENDING` de scope `APPLICATION`. La actualización será atómica y condicionada a ese estado pendiente, para no competir con consumo o reenvío. La operación cambia el estado a `REVOKED` y persiste:

```ts
revokedAt: Date;
revokedByUserId: string;
```

Las invitaciones `CONSUMED` o ya `REVOKED` responden `409`. Una invitación revocada no bloquea crear otra para el mismo email, porque deja de ser activa. El listado conservará las revocadas como historial, sin acciones.

Los endpoints públicos de consulta y consumo deberán tratar una invitación `REVOKED` como inválida. Así el enlace anterior no revela información ni permite completar un registro.

`REVOKED` es terminal y no se reactivará. Si se requiere corregir email, rol u otros datos, se creará una nueva invitación `PENDING` con token y datos propios. Puede coexistir con una o más invitaciones históricas `REVOKED` para el mismo email y scope; solo una invitación activa bloqueará una nueva creación.

## Decision 17. Management Authorization

`CREATE` conservará la evaluación actual de jerarquía mediante `AuthorizationService.ensureCanCreateUser`.

`RESEND` y `REVOKE` serán permisos de gestión delegada: quien los tenga podrá administrar cualquier invitación de `scope: APPLICATION`, sin una evaluación adicional contra el `systemRole` o `roleId` destino.

Estas operaciones no cambian el rol asignado ni crean una nueva concesión. La frontera `MASTER` permanece fuera de la funcionalidad.

## Decision 18. Revocation Reason

No se persistirá ni solicitará un motivo textual de revocación en esta versión. La trazabilidad se limita a `revokedAt` y `revokedByUserId`.
