import { IsOptional, IsString } from 'class-validator';
export class RefreshBillingCustomerServiceRecordOverdueRequestDto {
  @IsOptional() @IsString() cursor?: string | null;
  toDomain() {
    return { cursor: this.cursor ?? null };
  }
}
