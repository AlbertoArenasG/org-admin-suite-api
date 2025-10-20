import { AuthenticatedActorDto } from '@application/dto';

declare global {
  namespace Express {
    interface Request {
      authActor?: AuthenticatedActorDto;
    }
  }
}

export {};
