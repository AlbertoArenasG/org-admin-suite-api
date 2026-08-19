import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { AuthenticatedUserContextDto } from '@application/dto';
import {
  IRoleReadRepository,
  IRoleReadRepositoryToken,
} from '@domain/ports/repositories';
import { Role, RoleScope, SystemRole } from '@domain/entities';
import {
  AuthorizationException,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import {
  getAuthorizationModule,
  normalizeAuthorizationModuleCode,
} from '../authorization-catalog.utils';
import { AUXILIARY_CAPABILITIES_CATALOG } from './auxiliary-capabilities.catalog';
import { AUXILIARY_CAPABILITIES_DERIVATION_CATALOG } from './auxiliary-capabilities-derivation.catalog';
import {
  AuxiliaryCapability,
  AuxiliaryCapabilityCatalogEntry,
  AuxiliaryCapabilityDerivationRule,
} from './auxiliary-capabilities.types';

export function normalizeAuxiliaryCapability(
  capability: AuxiliaryCapability,
): AuxiliaryCapability {
  return {
    module: normalizeAuthorizationModuleCode(capability.module),
    capability: normalizeAuxiliaryCapabilityCode(capability.capability),
  };
}

export function normalizeAuxiliaryCapabilityCode(code: string): string {
  return code.trim().replace(/\s+/g, '_').toUpperCase();
}

export function dedupeAuxiliaryCapabilities(
  capabilities: AuxiliaryCapability[],
): AuxiliaryCapability[] {
  const seen = new Set<string>();
  const normalizedCapabilities: AuxiliaryCapability[] = [];

  for (const capability of capabilities) {
    const normalized = normalizeAuxiliaryCapability(capability);
    const key = toAuxiliaryCapabilityKey(normalized);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    normalizedCapabilities.push(normalized);
  }

  return normalizedCapabilities;
}

export function deriveAuxiliaryCapabilitiesFromPermissions(
  permissions: Array<{ module: string; operation: string }>,
): AuxiliaryCapability[] {
  const permissionModules = new Set(
    permissions.map((permission) =>
      normalizeAuthorizationModuleCode(permission.module),
    ),
  );

  const derived = AUXILIARY_CAPABILITIES_DERIVATION_CATALOG.flatMap((rule) => {
    const consumerModule = normalizeAuthorizationModuleCode(
      rule.consumerModule,
    );

    if (!permissionModules.has(consumerModule)) {
      return [];
    }

    return rule.auxiliaryCapabilities.map((auxiliaryCapability) =>
      normalizeAuxiliaryCapability(auxiliaryCapability),
    );
  });

  return dedupeAuxiliaryCapabilities(derived);
}

function toAuxiliaryCapabilityKey(capability: AuxiliaryCapability): string {
  return `${capability.module}:${capability.capability}`;
}

@Injectable()
export class AuxiliaryCapabilitiesService implements OnModuleInit {
  constructor(
    @Inject(IRoleReadRepositoryToken)
    private readonly roleReadRepository: IRoleReadRepository,
  ) {}

  onModuleInit(): void {
    this.validateConfiguration();
  }

  validateConfiguration(): void {
    this.ensureUniqueCatalogEntries(AUXILIARY_CAPABILITIES_CATALOG);
    this.ensureValidDerivationRules(AUXILIARY_CAPABILITIES_DERIVATION_CATALOG);
  }

  deriveFromPermissions(
    permissions: Array<{ module: string; operation: string }>,
  ): AuxiliaryCapability[] {
    return deriveAuxiliaryCapabilitiesFromPermissions(permissions);
  }

  hasCapability(
    capabilities: AuxiliaryCapability[],
    module: string,
    capability: string,
  ): boolean {
    const requested = this.normalizeCapability({ module, capability });

    return capabilities.some((item) => {
      const normalized = this.normalizeCapability(item);

      return (
        normalized.module === requested.module &&
        normalized.capability === requested.capability
      );
    });
  }

  async ensureCapability(
    actor: AuthenticatedUserContextDto,
    module: string,
    capability: string,
  ): Promise<void> {
    const allowed = await this.actorHasCapability(actor, module, capability);

    if (!allowed) {
      throw AuthorizationException.rolePrivilegesInsufficient(actor.systemRole);
    }
  }

  async actorHasCapability(
    actor: AuthenticatedUserContextDto,
    module: string,
    capability: string,
  ): Promise<boolean> {
    const role = await this.resolveRole(actor);

    if (!role) {
      return false;
    }

    return this.hasCapability(role.auxiliaryCapabilities, module, capability);
  }

  private ensureUniqueCatalogEntries(
    entries: AuxiliaryCapabilityCatalogEntry[],
  ): void {
    const seen = new Set<string>();

    for (const entry of entries) {
      const normalized = this.normalizeCapability(entry);
      const key = toAuxiliaryCapabilityKey(normalized);

      if (seen.has(key)) {
        throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
          field: 'auxiliaryCapabilitiesCatalog',
          module: normalized.module,
          capability: normalized.capability,
          reason: 'DUPLICATED_AUXILIARY_CAPABILITY_CATALOG_ENTRY',
        });
      }

      seen.add(key);
    }
  }

  private ensureValidDerivationRules(
    rules: AuxiliaryCapabilityDerivationRule[],
  ): void {
    const catalogKeys = new Set(
      AUXILIARY_CAPABILITIES_CATALOG.map((entry) =>
        toAuxiliaryCapabilityKey(this.normalizeCapability(entry)),
      ),
    );

    for (const rule of rules) {
      const consumerModule = normalizeAuthorizationModuleCode(
        rule.consumerModule,
      );

      if (!getAuthorizationModule(consumerModule)) {
        throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
          field: 'auxiliaryCapabilitiesDerivationCatalog',
          consumerModule,
          reason: 'INVALID_AUXILIARY_CAPABILITY_CONSUMER_MODULE',
        });
      }

      const deduped = this.ensureUniqueCapabilities(rule.auxiliaryCapabilities);

      for (const auxiliaryCapability of deduped) {
        const key = toAuxiliaryCapabilityKey(
          this.normalizeCapability(auxiliaryCapability),
        );

        if (!catalogKeys.has(key)) {
          throw InvalidValueException.create(
            InvalidValueExceptionCode.DEFAULT,
            {
              field: 'auxiliaryCapabilitiesDerivationCatalog',
              consumerModule,
              module: auxiliaryCapability.module,
              capability: auxiliaryCapability.capability,
              reason: 'UNKNOWN_AUXILIARY_CAPABILITY_REFERENCE',
            },
          );
        }
      }
    }
  }

  private ensureUniqueCapabilities(
    capabilities: AuxiliaryCapability[],
  ): AuxiliaryCapability[] {
    return dedupeAuxiliaryCapabilities(capabilities);
  }

  private normalizeCapability(
    capability: AuxiliaryCapability,
  ): AuxiliaryCapability {
    return normalizeAuxiliaryCapability(capability);
  }

  private async resolveRole(
    actor: Pick<AuthenticatedUserContextDto, 'roleId' | 'systemRole'>,
  ): Promise<Role | null> {
    if (actor.roleId) {
      const { data } = await this.roleReadRepository.findById(actor.roleId);

      if (data) {
        return data;
      }
    }

    if (actor.systemRole === SystemRole.MASTER_ADMIN) {
      const { data } = await this.roleReadRepository.findDefaultByScope(
        RoleScope.MASTER_ADMIN,
      );

      return data ?? null;
    }

    if (actor.systemRole === SystemRole.ADMIN) {
      const { data } = await this.roleReadRepository.findDefaultByScope(
        RoleScope.ADMIN,
      );

      return data ?? null;
    }

    const { data } = await this.roleReadRepository.findByCode('STAFF_LEGACY');

    return data ?? null;
  }
}
