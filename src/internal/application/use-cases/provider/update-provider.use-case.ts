import { Inject, Injectable } from '@nestjs/common';

import { UpdateProviderDto, ProviderViewDto } from '@application/dto';
import {
  IProviderReadRepository,
  IProviderReadRepositoryToken,
  IProviderWriteRepository,
  IProviderWriteRepositoryToken,
  IProviderFiscalProfileReadRepository,
  IProviderFiscalProfileReadRepositoryToken,
  IProviderBankingInfoReadRepository,
  IProviderBankingInfoReadRepositoryToken,
  IFileReadRepository,
  IFileReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import { ProviderMapper } from '@application/mappers';
import {
  buildFilesMetadataForProviderFiscalProfiles,
  buildFilesMetadataForProviderBankingInfos,
} from '@application/utils';
import { ProviderStatus } from '@domain/entities';
import { AuditUserFetcherService } from '@application/services';

@Injectable()
export class UpdateProviderUseCase {
  constructor(
    @Inject(IProviderReadRepositoryToken)
    private readonly providerReadRepository: IProviderReadRepository,
    @Inject(IProviderWriteRepositoryToken)
    private readonly providerWriteRepository: IProviderWriteRepository,
    @Inject(IProviderFiscalProfileReadRepositoryToken)
    private readonly fiscalProfileReadRepository: IProviderFiscalProfileReadRepository,
    @Inject(IProviderBankingInfoReadRepositoryToken)
    private readonly bankingInfoReadRepository: IProviderBankingInfoReadRepository,
    @Inject(IFileReadRepositoryToken)
    private readonly fileReadRepository: IFileReadRepository,
    private readonly auditUserFetcher: AuditUserFetcherService,
  ) {}

  async execute(input: UpdateProviderDto): Promise<ProviderViewDto> {
    const { data: provider } = await this.providerReadRepository.findById(
      input.providerId,
    );

    if (!provider || provider.status === ProviderStatus.DELETED) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.PROVIDER,
        { id: input.providerId },
      );
    }

    if (input.providerCode && input.providerCode !== provider.providerCode) {
      const { data: existing } =
        await this.providerReadRepository.findByProviderCode(
          input.providerCode,
        );

      if (existing && existing.id !== provider.id) {
        throw EntityAlreadyExistsException.create(
          EntityAlreadyExistsExceptionCode.PROVIDER_CODE,
          { providerCode: input.providerCode },
        );
      }
    }

    provider.updateDetails(
      {
        companyName: input.companyName,
        providerCode: input.providerCode,
      },
      input.userId,
    );

    await this.providerWriteRepository.update(provider);

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

    const { createdByUser, updatedByUser } =
      await this.auditUserFetcher.fetchAuditUsers({
        createdBy: provider.createdBy,
        updatedBy: provider.updatedBy,
      });

    return ProviderMapper.toViewDto(
      provider,
      fiscalProfile,
      bankingInfo,
      fiscalProfileMetadata,
      bankingInfoMetadata,
      createdByUser,
      updatedByUser,
    );
  }
}
