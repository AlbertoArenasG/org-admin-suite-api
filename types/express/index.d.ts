import { AuthenticatedUserContextDto } from '@application/dto';

declare global {
  namespace Express {
    interface Request {
      authContext?: AuthenticatedUserContextDto;
    }
  }
}

export {};
