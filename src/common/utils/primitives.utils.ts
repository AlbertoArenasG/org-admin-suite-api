import { Entity } from '@src/internal/core/entities/entity';
import { ValueObject } from '@src/internal/core/entities/value-object';

export function recursivelyConvertToPrimitives(value: unknown): unknown {
  if (value instanceof Date) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => recursivelyConvertToPrimitives(item));
  }

  if (value !== null && typeof value === 'object') {
    if (
      typeof (value as any).toPrimitives === 'function' &&
      (value as any).toPrimitives !== Entity.prototype.toPrimitives &&
      (value as any).toPrimitives !== ValueObject.prototype.toPrimitives
    ) {
      return (value as any).toPrimitives();
    }

    if (value instanceof Entity || value instanceof ValueObject) {
      return recursivelyConvertToPrimitives((value as any).props);
    }

    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = recursivelyConvertToPrimitives(val);
    }
    return result;
  }

  return value;
}
