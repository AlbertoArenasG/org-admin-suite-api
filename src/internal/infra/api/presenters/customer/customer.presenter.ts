import { Injectable } from '@nestjs/common';

import { CustomerOptionDto } from '@application/dto';

@Injectable()
export class CustomerPresenter {
  toOptionsResponse(customers: CustomerOptionDto[]) {
    return customers.map((customer) => ({
      customer_id: customer.id,
      company_name: customer.companyName,
    }));
  }
}
