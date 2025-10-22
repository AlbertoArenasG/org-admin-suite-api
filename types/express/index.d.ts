import {
  AuthenticatedTenantContextDto,
  AuthenticatedUserContextDto,
} from '@application/dto';

declare global {
  namespace Express {
    interface Request {
      authContext?: AuthenticatedUserContextDto;
      activeTenant?: AuthenticatedTenantContextDto | null;
    }
  }
}

export {};
