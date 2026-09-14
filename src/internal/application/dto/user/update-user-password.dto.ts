import { SystemRole } from '@domain/entities';

export interface UpdateUserPasswordDto {
  userId: string;
  actorSystemRole: SystemRole;
  actorUserId: string;
  password: string;
}
