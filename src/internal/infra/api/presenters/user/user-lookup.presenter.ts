import { Injectable } from '@nestjs/common';

import { UserLookupDto } from '@application/dto';

@Injectable()
export class UserLookupPresenter {
  toResponse(result: UserLookupDto) {
    return {
      id: result.id,
      name: result.name,
      lastname: result.lastname,
      full_name: result.fullName,
      email: result.email,
    };
  }

  toCollectionResponse(results: UserLookupDto[]) {
    return results.map((result) => this.toResponse(result));
  }
}
