import { Injectable } from '@nestjs/common';

import { ServiceEntryCategory } from '@domain/entities';
import { ServiceEntryCategoryViewDto } from '@application/dto';

@Injectable()
export class GetServiceCategoriesUseCase {
  execute(): ServiceEntryCategoryViewDto[] {
    return Object.values(ServiceEntryCategory).map((category) => ({
      category,
      categoryNameKey: `SERVICE_ENTRY.CATEGORY.${category}`,
    }));
  }
}
