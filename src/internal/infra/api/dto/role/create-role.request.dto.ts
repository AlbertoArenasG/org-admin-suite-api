import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { CreateRoleDto } from '@application/dto';
import { RolePermissionRequestDto } from './role-permission.request.dto';

export class CreateRoleRequestDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RolePermissionRequestDto)
  permissions?: RolePermissionRequestDto[];

  toDomain(actorUserId: string): CreateRoleDto {
    return {
      name: this.name,
      permissions:
        this.permissions?.map((permission) => permission.toDomain()) ?? [],
      actorUserId,
    };
  }
}
