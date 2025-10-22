import { User } from '@domain/entities';
import { AuthenticateUserResultDto } from '@application/dto';
import { UserResultMapper } from '@application/mappers/user/user-result.mapper';

export class AuthenticateUserResultMapper {
  static toResult(user: User, accessToken: string): AuthenticateUserResultDto {
    return {
      user: UserResultMapper.toAuthenticatedUserDto(user),
      accessToken,
    };
  }
}
