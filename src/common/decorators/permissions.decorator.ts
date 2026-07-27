import { SetMetadata } from '@nestjs/common';

export const PERMISSION_METADATA_KEY = 'required_permission';

export interface RequiredPermissionMetadata {
  module: string;
  operation: string;
}

export function RequirePermission(
  module: string,
  operation: string,
): MethodDecorator {
  return SetMetadata(PERMISSION_METADATA_KEY, {
    module,
    operation,
  } satisfies RequiredPermissionMetadata);
}
