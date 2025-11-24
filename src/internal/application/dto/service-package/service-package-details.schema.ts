import { z } from 'zod';

import {
  ParsedServicePackageDetailsDto,
  ServicePackageEquipmentDto,
} from './ingest-service-package.dto';

const equipmentSchema = z.object({
  number: z.preprocess(
    (value) => (value === null || value === undefined ? null : Number(value)),
    z.number().nullable(),
  ),
  equipment: z
    .string()
    .optional()
    .transform((val) => (val ?? '').trim() || null),
  brand: z
    .string()
    .optional()
    .transform((val) => (val ?? '').trim() || null),
  model: z
    .string()
    .optional()
    .transform((val) => (val ?? '').trim() || null),
  identification: z
    .string()
    .optional()
    .transform((val) => (val ?? '').trim() || null),
  serialNumber: z
    .string()
    .optional()
    .transform((val) => (val ?? '').trim() || null),
});

const booleanLike = z.union([z.boolean(), z.number(), z.string()]).optional();

const servicePackageDetailsSchema = z.object({
  serviceNumber: z
    .string()
    .min(1)
    .transform((val) => val.trim()),
  serviceTime: z
    .string()
    .optional()
    .transform((val) => (val ?? '').trim() || null),
  company: z
    .string()
    .optional()
    .transform((val) => (val ?? '').trim() || null),
  collectorName: z
    .string()
    .optional()
    .transform((val) => (val ?? '').trim() || null),
  contactPerson: z
    .string()
    .optional()
    .transform((val) => (val ?? '').trim() || null),
  visitDate: z
    .string()
    .optional()
    .transform((val) => (val ?? '').trim() || null),
  serviceType: z
    .string()
    .optional()
    .transform((val) => (val ?? '').trim() || null),
  purpose: z
    .string()
    .optional()
    .transform((val) => (val ?? '').trim() || null),
  email: z
    .string()
    .optional()
    .transform((val) => (val ?? '').trim() || null),
  address: z
    .string()
    .optional()
    .transform((val) => (val ?? '').trim() || null),
  phone: z
    .string()
    .optional()
    .transform((val) => (val ?? '').trim() || null),
  equipment: z.array(equipmentSchema).optional().default([]),
  observations: z
    .string()
    .optional()
    .transform((val) => (val ?? '').trim() || null),
  createdAt: z
    .string()
    .optional()
    .transform((val) => (val ?? '').trim() || null),
  synced: booleanLike,
  hasCollectorSignature: booleanLike,
  hasClientSignature: booleanLike,
  raw: z.record(z.string(), z.any()).optional(),
});

function parseBooleanLike(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return fallback;
    }
    return ['true', '1', 'yes', 'si', 'sí'].includes(normalized);
  }

  return fallback;
}

function coerceDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function parseServicePackageDetails(
  payload: string,
): ParsedServicePackageDetailsDto {
  const parsedJson = JSON.parse(payload) as Record<string, unknown>;
  const result = servicePackageDetailsSchema.parse({
    ...parsedJson,
    raw: parsedJson,
  });

  const normalizeEquipment = (
    equipmentItems: z.infer<typeof equipmentSchema>[],
  ): ServicePackageEquipmentDto[] =>
    equipmentItems.map((item) => ({
      number: item.number ?? null,
      equipment: item.equipment,
      brand: item.brand,
      model: item.model,
      identification: item.identification,
      serialNumber: item.serialNumber,
    }));

  return {
    serviceNumber: result.serviceNumber,
    serviceTime: result.serviceTime,
    company: result.company,
    collectorName: result.collectorName,
    contactPerson: result.contactPerson,
    visitDate: result.visitDate,
    serviceType: result.serviceType,
    purpose: result.purpose,
    email: result.email,
    address: result.address,
    phone: result.phone,
    equipment: normalizeEquipment(result.equipment ?? []),
    observations: result.observations,
    createdAt: coerceDate(result.createdAt ?? null),
    synced: parseBooleanLike(result.synced, false),
    hasCollectorSignature: parseBooleanLike(
      result.hasCollectorSignature,
      false,
    ),
    hasClientSignature: parseBooleanLike(result.hasClientSignature, false),
    raw: result.raw ?? parsedJson,
  };
}
