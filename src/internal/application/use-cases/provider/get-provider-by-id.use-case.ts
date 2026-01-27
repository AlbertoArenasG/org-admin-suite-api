import { Inject, Injectable } from '@nestjs/common';

import { ProviderViewDto } from '@application/dto';
import {
  IProviderReadRepository,
  IProviderReadRepositoryToken,
  IProviderFiscalProfileReadRepository,
  IProviderFiscalProfileReadRepositoryToken,
  IProviderBankingInfoReadRepository,
  IProviderBankingInfoReadRepositoryToken,
  IFileReadRepository,
  IFileReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import { ProviderMapper } from '@application/mappers';
import {
  buildFilesMetadataForProviderFiscalProfiles,
  buildFilesMetadataForProviderBankingInfos,
} from '@application/utils';
import { ProviderStatus } from '@domain/entities';

@Injectable()
export class GetProviderByIdUseCase {
  constructor(
    @Inject(IProviderReadRepositoryToken)
    private readonly providerReadRepository: IProviderReadRepository,
    @Inject(IProviderFiscalProfileReadRepositoryToken)
    private readonly fiscalProfileReadRepository: IProviderFiscalProfileReadRepository,
    @Inject(IProviderBankingInfoReadRepositoryToken)
    private readonly bankingInfoReadRepository: IProviderBankingInfoReadRepository,
    @Inject(IFileReadRepositoryToken)
    private readonly fileReadRepository: IFileReadRepository,
  ) {}

  async execute(providerId: string): Promise<ProviderViewDto> {
    const { data: provider } =
      await this.providerReadRepository.findById(providerId);

    if (!provider || provider.status === ProviderStatus.DELETED) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.PROVIDER,
        { id: providerId },
      );
    }

    const { data: fiscalProfile } =
      await this.fiscalProfileReadRepository.findByProviderId(provider.id);

    const { data: bankingInfo } =
      await this.bankingInfoReadRepository.findByProviderId(provider.id);

    let fiscalProfileMetadata = undefined;
    if (fiscalProfile) {
      const metadataMap = await buildFilesMetadataForProviderFiscalProfiles({
        profiles: [fiscalProfile],
        fileReadRepository: this.fileReadRepository,
      });
      fiscalProfileMetadata = metadataMap.get(fiscalProfile.id);
    }

    let bankingInfoMetadata = undefined;
    if (bankingInfo) {
      const metadataMap = await buildFilesMetadataForProviderBankingInfos({
        bankingInfos: [bankingInfo],
        fileReadRepository: this.fileReadRepository,
      });
      bankingInfoMetadata = metadataMap.get(bankingInfo.id);
    }

    return ProviderMapper.toViewDto(
      provider,
      fiscalProfile,
      bankingInfo,
      fiscalProfileMetadata,
      bankingInfoMetadata,
    );
  }
}
