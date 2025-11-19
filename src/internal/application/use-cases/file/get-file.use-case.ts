import { Inject, Injectable } from '@nestjs/common';

import { GetFileByIdDto, GetFileByIdResultDto } from '@application/dto';
import {
  IFileReadRepository,
  IFileReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import { FileResultMapper } from '@application/mappers';

@Injectable()
export class GetFileByIdUseCase {
  constructor(
    @Inject(IFileReadRepositoryToken)
    private readonly fileReadRepository: IFileReadRepository,
  ) {}

  async execute(input: GetFileByIdDto): Promise<GetFileByIdResultDto> {
    const { data } = await this.fileReadRepository.findById(input.fileId);

    if (!data) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.FILE, {
        fileId: input.fileId,
      });
    }

    return FileResultMapper.toViewDto(data);
  }
}
