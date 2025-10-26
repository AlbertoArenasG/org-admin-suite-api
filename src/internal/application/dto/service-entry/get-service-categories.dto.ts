import { ServiceEntryCategory } from '@domain/entities';

export interface ServiceEntryCategoryViewDto {
  category: ServiceEntryCategory;
  categoryNameKey: string;
}
