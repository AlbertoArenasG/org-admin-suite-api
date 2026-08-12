import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { CreateRecipientGroupDto } from '@application/dto';

export class CreateRecipientGroupRequestDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  enabled_channels!: string[];

  @IsArray()
  @IsString({ each: true })
  contact_ids!: string[];

  toDomain(actorUserId: string): CreateRecipientGroupDto {
    return {
      actorUserId,
      name: this.name,
      description: this.description ?? null,
      enabledChannels: this.enabled_channels,
      contactIds: this.contact_ids,
    };
  }
}
