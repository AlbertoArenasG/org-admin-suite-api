import { Injectable } from '@nestjs/common';

import { AuthenticateUserResultDto } from '@application/dto';

@Injectable()
export class AuthPresenter {
  async toLoginResponse(result: AuthenticateUserResultDto) {
    return {
      access_token: result.accessToken,
      user: {
        id: result.user.id,
        name: result.user.name,
        lastname: result.user.lastname,
        email: result.user.email,
        role: result.user.role,
        status: result.user.status,
        cell_phone: {
          country_code: result.user.cellPhone?.countryCode ?? null,
          number: result.user.cellPhone?.number ?? null,
        },
      },
    };
  }
}
