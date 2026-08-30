import { CustomerServiceRecordAssetInputDto } from '@application/dto';
import {
  CustomerServiceRecordAssetProps,
  CustomerServiceRecordOperationalStatus,
} from '@domain/entities';
import {
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';

export function normalizeAssets(
  input: CustomerServiceRecordAssetInputDto[],
): CustomerServiceRecordAssetProps[] {
  if (!input?.length)
    throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
      field: 'assets',
      reason: 'REQUIRED',
    });
  return input.map((asset) => {
    const value = {
      name: asset.name?.trim(),
      identifier: asset.identifier?.trim(),
      brand: asset.brand?.trim(),
      model: asset.model?.trim(),
      serialNumber: asset.serialNumber?.trim(),
      observations: asset.observations?.trim() || null,
    };
    if (
      !value.name ||
      !value.identifier ||
      !value.brand ||
      !value.model ||
      !value.serialNumber
    )
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'assets',
        reason: 'INVALID_ASSET',
      });
    return value;
  });
}

export function assertOperationalStatus(
  value: string,
): CustomerServiceRecordOperationalStatus {
  if (
    !Object.values(CustomerServiceRecordOperationalStatus).includes(
      value as CustomerServiceRecordOperationalStatus,
    )
  )
    throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
      field: 'operational_status',
      value,
    });
  return value as CustomerServiceRecordOperationalStatus;
}
