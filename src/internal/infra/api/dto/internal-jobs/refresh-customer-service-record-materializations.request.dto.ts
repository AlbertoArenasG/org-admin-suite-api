import { IsOptional, IsString } from 'class-validator';
import { RefreshCustomerServiceRecordMaterializationsDto } from '@application/dto';
export class RefreshCustomerServiceRecordMaterializationsRequestDto {
  @IsOptional() @IsString() cursor?: string;
  toDomain(): RefreshCustomerServiceRecordMaterializationsDto {
    return { cursor: this.cursor ?? null };
  }
}
