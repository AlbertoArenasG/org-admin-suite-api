import { Inject, Injectable } from '@nestjs/common';

import {
  GetProvidersDto,
  GetProvidersResultDto,
  ProviderViewDto,
} from '@application/dto';
import {
  IProviderReadRepository,
  IProviderReadRepositoryToken,
  IProviderFiscalProfileReadRepository,
  IProviderFiscalProfileReadRepositoryToken,
  IProviderBankingInfoReadRepository,
  IProviderBankingInfoReadRepositoryToken,
  IFileReadRepository,
  IFileReadRepositoryToken,
  FindProvidersParams,
} from '@domain/ports/repositories';
import { ProviderMapper } from '@application/mappers';
import {
  buildFilesMetadataForProviderFiscalProfiles,
  buildFilesMetadataForProviderBankingInfos,
} from '@application/utils';

@Injectable()
export class GetProvidersUseCase {
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

  async execute(input: GetProvidersDto): Promise<GetProvidersResultDto> {
    const validSortFields = new Set([
      'company_name',
      'provider_code',
      'provider_status',
      'created_at',
    ]);

    const repositorySorts = input.sorts
      .filter((sort) => validSortFields.has(sort.field))
      .map((sort) => ({
        field: sort.field as
          | 'company_name'
          | 'provider_code'
          | 'provider_status'
          | 'created_at',
        direction: sort.direction,
      }));

    const params: FindProvidersParams = {
      page: input.page,
      perPage: input.perPage,
      search: input.search ?? null,
      status: input.status ?? null,
      sorts:
        repositorySorts.length > 0
          ? repositorySorts
          : [{ field: 'created_at', direction: 'desc' }],
    };

    const { data: providers, total } =
      await this.providerReadRepository.findAll(params);

    if (providers.length === 0) {
      return {
        items: [],
        total: 0,
        page: input.page,
        perPage: input.perPage,
      };
    }

    const providerIds = providers.map((provider) => provider.id);

    const fiscalProfiles = await this.fetchFiscalProfiles(providerIds);
    const bankingInfos = await this.fetchBankingInfos(providerIds);

    const fiscalProfilesByProvider = new Map(
      fiscalProfiles.map((profile) => [profile.providerId, profile]),
    );

    const bankingInfosByProvider = new Map(
      bankingInfos.map((info) => [info.providerId, info]),
    );

    const fiscalProfilesMetadataMap =
      await buildFilesMetadataForProviderFiscalProfiles({
        profiles: fiscalProfiles,
        fileReadRepository: this.fileReadRepository,
      });

    const bankingInfosMetadataMap =
      await buildFilesMetadataForProviderBankingInfos({
        bankingInfos,
        fileReadRepository: this.fileReadRepository,
      });

    let items = providers.map((provider) => {
      const fiscalProfile = fiscalProfilesByProvider.get(provider.id) ?? null;
      const bankingInfo = bankingInfosByProvider.get(provider.id) ?? null;

      return ProviderMapper.toViewDto(
        provider,
        fiscalProfile,
        bankingInfo,
        fiscalProfile
          ? fiscalProfilesMetadataMap.get(fiscalProfile.id)
          : undefined,
        bankingInfo ? bankingInfosMetadataMap.get(bankingInfo.id) : undefined,
      );
    });

    items = this.applyFilters(items, input);

    return {
      items,
      total,
      page: input.page,
      perPage: input.perPage,
    };
  }

  private async fetchFiscalProfiles(providerIds: string[]) {
    const profiles = await Promise.all(
      providerIds.map((id) =>
        this.fiscalProfileReadRepository.findByProviderId(id),
      ),
    );

    return profiles
      .map((result) => result.data)
      .filter((profile) => profile !== null);
  }

  private async fetchBankingInfos(providerIds: string[]) {
    const infos = await Promise.all(
      providerIds.map((id) =>
        this.bankingInfoReadRepository.findByProviderId(id),
      ),
    );

    return infos.map((result) => result.data).filter((info) => info !== null);
  }

  private applyFilters(
    items: ProviderViewDto[],
    input: GetProvidersDto,
  ): ProviderViewDto[] {
    let filtered = items;

    if (input.fiscalProfileStatus) {
      filtered = filtered.filter(
        (item) => item.fiscalProfile?.status === input.fiscalProfileStatus,
      );
    }

    if (input.bankingInfoStatus) {
      filtered = filtered.filter(
        (item) => item.bankingInfo?.status === input.bankingInfoStatus,
      );
    }

    return filtered;
  }
}
