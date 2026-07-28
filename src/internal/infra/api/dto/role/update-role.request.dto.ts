import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';

import { UpdateRoleDto } from '@application/dto';
import { RolePermissionRequestDto } from './role-permission.request.dto';

export class UpdateRoleRequestDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RolePermissionRequestDto)
  permissions?: RolePermissionRequestDto[];

  toDomain(roleId: string, actorUserId: string): UpdateRoleDto {
    return {
      roleId,
      permissions: this.permissions?.map((permission) => permission.toDomain()),
      actorUserId,
    };
  }
}
