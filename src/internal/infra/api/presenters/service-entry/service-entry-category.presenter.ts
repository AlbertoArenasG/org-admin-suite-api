import { Injectable } from '@nestjs/common';

import { ServiceEntryCategoryViewDto } from '@application/dto';
import { EnumNameService } from '@infra/i18n/services';

@Injectable()
export class ServiceEntryCategoryPresenter {
  constructor(private readonly enumNameService: EnumNameService) {}

  toResponse(categories: ServiceEntryCategoryViewDto[]) {
    return categories.map((category) => ({
      category_id: category.category,
      category_name: this.enumNameService.getEnumName(category.categoryNameKey),
    }));
  }
}
