import { Injectable } from '@nestjs/common';
import { CreateUserResultDto } from '@application/dto';

@Injectable()
export class UserPresenter {
  async toUserResponse(result: CreateUserResultDto) {
    return {
      id: result.id,
      name: result.name,
      lastname: result.lastname,
      email: result.email,
      role: result.role,
      status: result.status,
      created_at: result.createdAt,
    };
  }
}
