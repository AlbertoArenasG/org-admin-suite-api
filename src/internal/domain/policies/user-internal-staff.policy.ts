import { SystemRole } from '@domain/entities';
import {
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';

export class UserInternalStaffPolicy {
  static resolve(
    systemRole: SystemRole,
    isInternalStaff: boolean | undefined,
  ): boolean {
    if (systemRole === SystemRole.USER) {
      if (isInternalStaff === undefined) {
        throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
          field: 'is_internal_staff',
        });
      }

      return isInternalStaff;
    }

    if (isInternalStaff === false) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'is_internal_staff',
        reason: 'INTERNAL_STAFF_REQUIRED_FOR_SYSTEM_ROLE',
      });
    }

    return true;
  }
}
