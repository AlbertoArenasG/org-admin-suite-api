import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthenticatedUserContextDto } from '@application/dto';
import { AuxiliaryCapabilitiesService } from '@application/services';
import {
  AUXILIARY_CAPABILITY_METADATA_KEY,
  RequiredAuxiliaryCapabilityMetadata,
} from '@src/common/decorators';
import { AuthorizationException } from '@domain/exceptions';

@Injectable()
export class AuxiliaryCapabilitiesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auxiliaryCapabilitiesService: AuxiliaryCapabilitiesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const auxiliaryCapability = this.reflector.getAllAndOverride<
      RequiredAuxiliaryCapabilityMetadata | undefined
    >(AUXILIARY_CAPABILITY_METADATA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!auxiliaryCapability) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authContext = request.authContext as
      | AuthenticatedUserContextDto
      | undefined;

    if (!authContext) {
      throw AuthorizationException.authContextMissing();
    }

    await this.auxiliaryCapabilitiesService.ensureCapability(
      authContext,
      auxiliaryCapability.module,
      auxiliaryCapability.capability,
    );

    return true;
  }
}
