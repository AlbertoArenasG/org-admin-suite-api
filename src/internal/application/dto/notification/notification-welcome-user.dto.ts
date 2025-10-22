import { User } from '@src/internal/domain/entities';

export interface UserWelcomeEmailDto {
  user: User;
  url: string;
}

export interface UserWelcomeSmsDto {
  user: User;
  url: string;
}
