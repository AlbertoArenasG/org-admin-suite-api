import { CustomerOptionDto } from '@application/dto';
import { Customer } from '@domain/entities';

export class CustomerMapper {
  static toOptionDto(customer: Customer): CustomerOptionDto {
    return {
      id: customer.id,
      companyName: customer.companyName,
    };
  }
}
