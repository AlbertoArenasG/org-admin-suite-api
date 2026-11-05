import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RefreshBillingCustomerServiceRecordOverdueRequestDto } from '@infra/api/dto/internal-jobs';
import { InternalJobsAuthGuard } from '@infra/api/guards';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import { RefreshBillingCustomerServiceRecordOverdueCommandAdapter } from '@infra/cqrs/commands/internal-jobs';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/internal-jobs/customer-service-records/invoices/overdue')
@UseGuards(InternalJobsAuthGuard)
export class BillingCustomerServiceRecordOverdueController {
  constructor(
    private readonly commands: CommandBus,
    private readonly success: SuccessMessageService,
  ) {}
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() body: RefreshBillingCustomerServiceRecordOverdueRequestDto,
  ) {
    const result = await this.commands.execute(
      RefreshBillingCustomerServiceRecordOverdueCommandAdapter.create(
        body.toDomain(),
      ),
    );
    return ApiResponseBuilder.create()
      .withSuccessMessage(this.success.getMsg('DEFAULT'))
      .withData({
        processed_records: result.processedRecords,
        updated_records: result.updatedRecords,
        next_cursor: result.nextCursor,
        duration_ms: result.durationMs,
      })
      .withStatus(HttpStatus.OK)
      .build();
  }
}
