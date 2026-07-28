import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { SystemRole } from '@domain/entities';
import { CreateMasterUserRegistrationInvitationDto } from '@application/dto';
import {
  UserRegistrationInvitationScope,
  UserRegistrationInvitationUserData,
} from '@domain/ports/repositories';
import { PhoneRequestDto } from '@infra/api/dto/shared';

export class CreateMasterUserRegistrationInvitationRequestDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @Type(() => PhoneRequestDto)
  @ValidateNested()
  cell_phone?: PhoneRequestDto;

  @IsNotEmpty()
  @IsIn(Object.values(SystemRole))
  system_role!: SystemRole;

  @ValidateIf(
    (o: CreateMasterUserRegistrationInvitationRequestDto) =>
      o.system_role === SystemRole.USER,
  )
  @IsNotEmpty()
  @IsString()
  role_id!: string;

  toDomain(invitedByUserId: string): CreateMasterUserRegistrationInvitationDto {
    return {
      scope: UserRegistrationInvitationScope.MASTER,
      email: this.email,
      systemRole: this.system_role,
      roleId: this.system_role === SystemRole.USER ? this.role_id : null,
      invitedByUserId,
      userData: this.buildUserData(),
    };
  }

  private buildUserData(): UserRegistrationInvitationUserData | null {
    const hasAnyField =
      Boolean(this.name) || Boolean(this.lastname) || Boolean(this.cell_phone);

    if (!hasAnyField) {
      return null;
    }

    return {
      name: this.name ?? null,
      lastname: this.lastname ?? null,
      cellPhone: this.cell_phone
        ? {
            countryCode: this.cell_phone.country_code ?? null,
            number: this.cell_phone.number ?? null,
          }
        : null,
    };
  }
}
