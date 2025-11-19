import { Inject, Injectable } from '@nestjs/common';

import {
  GetCustomerFiscalProfilesDto,
  GetCustomerFiscalProfilesResultDto,
  CustomerFiscalProfileViewDto,
} from '@application/dto';
import {
  ICustomerFiscalProfileReadRepository,
  ICustomerFiscalProfileReadRepositoryToken,
  IFileReadRepository,
  IFileReadRepositoryToken,
  ICustomerReadRepository,
  ICustomerReadRepositoryToken,
  FindCustomersParams,
} from '@domain/ports/repositories';
import { CustomerFiscalProfileMapper } from '@application/mappers';
import { buildFilesMetadataForProfiles } from '@application/utils';

@Injectable()
export class GetCustomerFiscalProfilesUseCase {
  constructor(
    @Inject(ICustomerFiscalProfileReadRepositoryToken)
    private readonly profileReadRepository: ICustomerFiscalProfileReadRepository,
    @Inject(ICustomerReadRepositoryToken)
    private readonly customerReadRepository: ICustomerReadRepository,
    @Inject(IFileReadRepositoryToken)
    private readonly fileReadRepository: IFileReadRepository,
  ) {}

  async execute(
    input: GetCustomerFiscalProfilesDto,
  ): Promise<GetCustomerFiscalProfilesResultDto> {
    const params: FindCustomersParams = {
      page: 1,
      perPage: Number.MAX_SAFE_INTEGER,
      search: input.search ?? null,
      status: input.customerStatus ?? null,
      sorts: [{ field: 'created_at', direction: 'desc' }],
    };

    const { data: customers } =
      await this.customerReadRepository.findAll(params);

    const customerIds = customers.map((customer) => customer.id);
    const { data: profiles } =
      await this.profileReadRepository.findByCustomerIds(customerIds);

    const profilesByCustomer = new Map(
      profiles.map((profile) => [profile.customerId, profile]),
    );

    const metadataMap = await buildFilesMetadataForProfiles({
      profiles,
      fileReadRepository: this.fileReadRepository,
    });

    let items = customers.map((customer) => {
      const profile = profilesByCustomer.get(customer.id) ?? null;

      return CustomerFiscalProfileMapper.toViewDto(
        customer,
        profile,
        profile ? metadataMap.get(profile.id) : undefined,
      );
    });

    if (input.profileStatus) {
      items = items.filter(
        (item) => item.fiscalProfile?.status === input.profileStatus,
      );
    }

    items = this.sortItems(items, input.sorts);

    const total = items.length;
    const start = (input.page - 1) * input.perPage;
    const paginated = items.slice(start, start + input.perPage);

    return {
      items: paginated,
      total,
      page: input.page,
      perPage: input.perPage,
    };
  }

  private sortItems(
    items: CustomerFiscalProfileViewDto[],
    sorts?: GetCustomerFiscalProfilesDto['sorts'],
  ): CustomerFiscalProfileViewDto[] {
    if (!sorts || sorts.length === 0) {
      return items;
    }

    const compare = (
      a: CustomerFiscalProfileViewDto,
      b: CustomerFiscalProfileViewDto,
    ) => {
      for (const sort of sorts) {
        const direction = sort.direction === 'desc' ? -1 : 1;
        const valueA = this.resolveSortValue(a, sort.field);
        const valueB = this.resolveSortValue(b, sort.field);

        if (valueA === valueB) {
          continue;
        }

        if (valueA > valueB) {
          return 1 * direction;
        }

        if (valueA < valueB) {
          return -1 * direction;
        }
      }

      return 0;
    };

    return [...items].sort(compare);
  }

  private resolveSortValue(
    item: CustomerFiscalProfileViewDto,
    field: GetCustomerFiscalProfilesDto['sorts'][number]['field'],
  ): number | string {
    switch (field) {
      case 'company_name':
        return item.companyName.toLowerCase();
      case 'client_code':
        return item.clientCode.toLowerCase();
      case 'customer_status':
        return item.status;
      case 'status':
      case 'profile_status':
        return item.fiscalProfile?.status ?? '';
      case 'created_at':
        return item.createdAt?.getTime?.() ?? 0;
      case 'submitted_at':
        return item.fiscalProfile?.submittedAt?.getTime?.() ?? 0;
      default:
        return '';
    }
  }
}
