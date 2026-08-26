import { Inject, Injectable } from '@nestjs/common';

import { GetCustomerAvailableUsersResultDto } from '@application/dto';
import { UserResultMapper } from '@application/mappers';
import { CustomerContextValidationService } from '@application/services';
import {
  IUserReadRepository,
  IUserReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetCustomerAvailableUsersUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
    private readonly customerContextValidationService: CustomerContextValidationService,
  ) {}

  async execute(
    customerId: string,
  ): Promise<GetCustomerAvailableUsersResultDto> {
    await this.customerContextValidationService.ensureMutable(customerId);

    const { data } = await this.userReadRepository.findUnassignedActiveUsers();

    return data.map((user) => UserResultMapper.toUserLookupDto(user));
  }
}
