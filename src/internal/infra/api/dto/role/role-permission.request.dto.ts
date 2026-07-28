import { IsNotEmpty, IsString } from 'class-validator';

import { RolePermissionDto } from '@application/dto';

export class RolePermissionRequestDto {
  @IsNotEmpty()
  @IsString()
  module!: string;

  @IsNotEmpty()
  @IsString()
  operation!: string;

  toDomain(): RolePermissionDto {
    return {
      module: this.module,
      operation: this.operation,
    };
  }
}
