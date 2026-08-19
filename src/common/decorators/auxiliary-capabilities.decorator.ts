import { SetMetadata } from '@nestjs/common';

export const AUXILIARY_CAPABILITY_METADATA_KEY =
  'required_auxiliary_capability';

export interface RequiredAuxiliaryCapabilityMetadata {
  module: string;
  capability: string;
}

export function RequireAuxiliaryCapability(
  module: string,
  capability: string,
): MethodDecorator {
  return SetMetadata(AUXILIARY_CAPABILITY_METADATA_KEY, {
    module,
    capability,
  } satisfies RequiredAuxiliaryCapabilityMetadata);
}
