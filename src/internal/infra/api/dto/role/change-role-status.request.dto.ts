import { IsEnum } from 'class-validator';

import { ChangeRoleStatusDto } from '@application/dto';
import { RoleStatus } from '@domain/entities';

const ALLOWED_STATUSES: Array<RoleStatus.ACTIVE | RoleStatus.INACTIVE> = [
  RoleStatus.ACTIVE,
  RoleStatus.INACTIVE,
];

export class ChangeRoleStatusRequestDto {
  @IsEnum(ALLOWED_STATUSES)
  status_id!: RoleStatus.ACTIVE | RoleStatus.INACTIVE;

  toDomain(roleId: string, actorUserId: string): ChangeRoleStatusDto {
    return {
      roleId,
      status: this.status_id,
      actorUserId,
    };
  }
}
