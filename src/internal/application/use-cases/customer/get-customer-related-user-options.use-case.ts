import { Inject, Injectable } from '@nestjs/common';

import { UserLookupDto } from '@application/dto';
import { UserResultMapper } from '@application/mappers';
import { CustomerContextValidationService } from '@application/services';
import {
  IUserReadRepository,
  IUserReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetCustomerRelatedUserOptionsUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
    private readonly customerContextValidationService: CustomerContextValidationService,
  ) {}

  async execute(
    customerId: string,
    search: string | null,
  ): Promise<UserLookupDto[]> {
    await this.customerContextValidationService.ensureReadable(customerId);
    const { data } =
      await this.userReadRepository.findActiveRelatedToCustomerOptions(
        customerId,
        search,
      );
    return data.map(UserResultMapper.toUserLookupDto);
  }
}
