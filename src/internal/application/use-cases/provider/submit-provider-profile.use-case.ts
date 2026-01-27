import { Inject, Injectable } from '@nestjs/common';

import { SubmitProviderProfileDto, ProviderViewDto } from '@application/dto';
import {
  IProviderReadRepository,
  IProviderReadRepositoryToken,
  IProviderWriteRepository,
  IProviderWriteRepositoryToken,
  IProviderFiscalProfileReadRepository,
  IProviderFiscalProfileReadRepositoryToken,
  IProviderFiscalProfileWriteRepository,
  IProviderFiscalProfileWriteRepositoryToken,
  IProviderBankingInfoReadRepository,
  IProviderBankingInfoReadRepositoryToken,
  IProviderBankingInfoWriteRepository,
  IProviderBankingInfoWriteRepositoryToken,
  IFileReadRepository,
  IFileReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import {
  Provider,
  ProviderStatus,
  ProviderFiscalProfile,
  ProviderBankingInfo,
} from '@domain/entities';
import { ProviderMapper } from '@application/mappers';
import {
  buildFilesMetadataForProviderFiscalProfiles,
  buildFilesMetadataForProviderBankingInfos,
} from '@application/utils';

@Injectable()
export class SubmitProviderProfileUseCase {
  constructor(
    @Inject(IProviderReadRepositoryToken)
    private readonly providerReadRepository: IProviderReadRepository,
    @Inject(IProviderWriteRepositoryToken)
    private readonly providerWriteRepository: IProviderWriteRepository,
    @Inject(IProviderFiscalProfileReadRepositoryToken)
    private readonly fiscalProfileReadRepository: IProviderFiscalProfileReadRepository,
    @Inject(IProviderFiscalProfileWriteRepositoryToken)
    private readonly fiscalProfileWriteRepository: IProviderFiscalProfileWriteRepository,
    @Inject(IProviderBankingInfoReadRepositoryToken)
    private readonly bankingInfoReadRepository: IProviderBankingInfoReadRepository,
    @Inject(IProviderBankingInfoWriteRepositoryToken)
    private readonly bankingInfoWriteRepository: IProviderBankingInfoWriteRepository,
    @Inject(IFileReadRepositoryToken)
    private readonly fileReadRepository: IFileReadRepository,
  ) {}

  async execute(input: SubmitProviderProfileDto): Promise<ProviderViewDto> {
    const { provider, fiscalProfile, bankingInfo } =
      await this.resolveProviderAndProfiles(input.token);

    // Validate fiscal profile files
    await this.ensureFileExists(input.fiscalProfile.taxStatusCertificateFileId);
    await this.ensureFileExists(input.fiscalProfile.taxComplianceOpinionFileId);
    await this.ensureFileExists(input.fiscalProfile.addressProofFileId);

    // Validate banking info file
    await this.ensureFileExists(input.bankingInfo.bankStatementFileId);

    // Update provider contact
    provider.updateDetails({
      contact: input.contact,
    });
    await this.providerWriteRepository.update(provider);

    // Update fiscal profile
    fiscalProfile.markFormSubmitted({
      formData: input.fiscalProfile.formData,
      taxStatusCertificateFileId:
        input.fiscalProfile.taxStatusCertificateFileId,
      taxComplianceOpinionFileId:
        input.fiscalProfile.taxComplianceOpinionFileId,
      addressProofFileId: input.fiscalProfile.addressProofFileId,
    });
    const { data: updatedFiscalProfile } =
      await this.fiscalProfileWriteRepository.update(fiscalProfile);
    const persistedFiscalProfile: ProviderFiscalProfile =
      updatedFiscalProfile ?? fiscalProfile;

    // Update banking info
    bankingInfo.markFormSubmitted({
      formData: input.bankingInfo.formData,
      bankStatementFileId: input.bankingInfo.bankStatementFileId,
    });
    const { data: updatedBankingInfo } =
      await this.bankingInfoWriteRepository.update(bankingInfo);
    const persistedBankingInfo: ProviderBankingInfo =
      updatedBankingInfo ?? bankingInfo;

    // Build files metadata
    const fiscalProfileMetadataMap =
      await buildFilesMetadataForProviderFiscalProfiles({
        profiles: [persistedFiscalProfile],
        fileReadRepository: this.fileReadRepository,
      });

    const bankingInfoMetadataMap =
      await buildFilesMetadataForProviderBankingInfos({
        bankingInfos: [persistedBankingInfo],
        fileReadRepository: this.fileReadRepository,
      });

    return ProviderMapper.toViewDto(
      provider,
      persistedFiscalProfile,
      persistedBankingInfo,
      fiscalProfileMetadataMap.get(persistedFiscalProfile.id),
      bankingInfoMetadataMap.get(persistedBankingInfo.id),
    );
  }

  private async ensureFileExists(fileId: string): Promise<void> {
    const { data } = await this.fileReadRepository.findById(fileId);
    if (!data) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.FILE, {
        fileId,
      });
    }
  }

  private async resolveProviderAndProfiles(token: string): Promise<{
    provider: Provider;
    fiscalProfile: ProviderFiscalProfile;
    bankingInfo: ProviderBankingInfo;
  }> {
    const { data: provider } =
      await this.providerReadRepository.findByAccessToken(token);

    if (!provider || provider.status === ProviderStatus.DELETED) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.PROVIDER,
        { token },
      );
    }

    const { data: fiscalProfile } =
      await this.fiscalProfileReadRepository.findByProviderId(provider.id);

    if (!fiscalProfile) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.PROVIDER_FISCAL_PROFILE,
        { providerId: provider.id },
      );
    }

    const { data: bankingInfo } =
      await this.bankingInfoReadRepository.findByProviderId(provider.id);

    if (!bankingInfo) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.PROVIDER_BANKING_INFO,
        { providerId: provider.id },
      );
    }

    return { provider, fiscalProfile, bankingInfo };
  }
}
