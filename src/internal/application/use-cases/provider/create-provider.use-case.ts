import { Inject, Injectable } from '@nestjs/common';

import { CreateProviderDto, CreateProviderResultDto } from '@application/dto';
import {
  IProviderReadRepository,
  IProviderReadRepositoryToken,
  IProviderWriteRepository,
  IProviderWriteRepositoryToken,
  IProviderFiscalProfileWriteRepository,
  IProviderFiscalProfileWriteRepositoryToken,
  IProviderBankingInfoWriteRepository,
  IProviderBankingInfoWriteRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
} from '@domain/exceptions';
import {
  Provider,
  ProviderFiscalProfile,
  ProviderBankingInfo,
} from '@domain/entities';
import { ProviderMapper } from '@application/mappers';
import { genId } from '@src/common/utils';

@Injectable()
export class CreateProviderUseCase {
  constructor(
    @Inject(IProviderReadRepositoryToken)
    private readonly providerReadRepository: IProviderReadRepository,
    @Inject(IProviderWriteRepositoryToken)
    private readonly providerWriteRepository: IProviderWriteRepository,
    @Inject(IProviderFiscalProfileWriteRepositoryToken)
    private readonly fiscalProfileWriteRepository: IProviderFiscalProfileWriteRepository,
    @Inject(IProviderBankingInfoWriteRepositoryToken)
    private readonly bankingInfoWriteRepository: IProviderBankingInfoWriteRepository,
  ) {}

  async execute(input: CreateProviderDto): Promise<CreateProviderResultDto> {
    await this.ensureProviderCodeUnique(input.providerCode);

    const token = this.generateToken();

    const provider = new Provider({
      companyName: input.companyName,
      providerCode: input.providerCode,
      accessToken: token,
      contact: {
        name: null,
        phone: null,
        email: null,
      },
      createdAt: new Date(),
    });

    const { data: createdProvider } =
      await this.providerWriteRepository.create(provider);

    const fiscalProfile = new ProviderFiscalProfile({
      providerId: createdProvider.id,
      createdAt: new Date(),
    });

    const { data: createdFiscalProfile } =
      await this.fiscalProfileWriteRepository.create(fiscalProfile);

    const bankingInfo = new ProviderBankingInfo({
      providerId: createdProvider.id,
      createdAt: new Date(),
    });

    const { data: createdBankingInfo } =
      await this.bankingInfoWriteRepository.create(bankingInfo);

    return ProviderMapper.toCreateResultDto(
      createdProvider,
      createdFiscalProfile,
      createdBankingInfo,
    );
  }

  private async ensureProviderCodeUnique(providerCode: string): Promise<void> {
    const { data } =
      await this.providerReadRepository.findByProviderCode(providerCode);

    if (data) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.PROVIDER_CODE,
        { providerCode },
      );
    }
  }

  private generateToken(): string {
    return genId(36);
  }
}
