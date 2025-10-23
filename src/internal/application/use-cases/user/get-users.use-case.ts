import { Inject, Injectable } from '@nestjs/common';

import {
  IUserReadRepository,
  IUserReadRepositoryToken,
} from '@domain/ports/repositories';
import { GetUsersDto, GetUsersResultDto } from '@application/dto';
import { UserResultMapper } from '@application/mappers';

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
  ) {}

  async execute(input: GetUsersDto): Promise<GetUsersResultDto> {
    const { data, total } = await this.userReadRepository.findAll(input);

    return {
      items: UserResultMapper.toUserViewCollection(data),
      total,
      page: input.page,
      perPage: input.perPage,
    };
  }
}
