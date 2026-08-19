import { Injectable, OnModuleInit } from '@nestjs/common';

import {
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

@Injectable()
export class AuxiliaryCapabilitiesService implements OnModuleInit {
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
    const permissionModules = new Set(
      permissions.map((permission) =>
        normalizeAuthorizationModuleCode(permission.module),
      ),
    );

    const derived = AUXILIARY_CAPABILITIES_DERIVATION_CATALOG.flatMap(
      (rule) => {
        const consumerModule = normalizeAuthorizationModuleCode(
          rule.consumerModule,
        );

        if (!permissionModules.has(consumerModule)) {
          return [];
        }

        return rule.auxiliaryCapabilities.map((auxiliaryCapability) =>
          this.normalizeCapability(auxiliaryCapability),
        );
      },
    );

    return this.ensureUniqueCapabilities(derived);
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

  private ensureUniqueCatalogEntries(
    entries: AuxiliaryCapabilityCatalogEntry[],
  ): void {
    const seen = new Set<string>();

    for (const entry of entries) {
      const normalized = this.normalizeCapability(entry);
      const key = this.toCapabilityKey(normalized);

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
        this.toCapabilityKey(this.normalizeCapability(entry)),
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
        const key = this.toCapabilityKey(
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
    const seen = new Set<string>();
    const normalizedCapabilities: AuxiliaryCapability[] = [];

    for (const capability of capabilities) {
      const normalized = this.normalizeCapability(capability);
      const key = this.toCapabilityKey(normalized);

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      normalizedCapabilities.push(normalized);
    }

    return normalizedCapabilities;
  }

  private normalizeCapability(
    capability: AuxiliaryCapability,
  ): AuxiliaryCapability {
    return {
      module: normalizeAuthorizationModuleCode(capability.module),
      capability: this.normalizeCapabilityCode(capability.capability),
    };
  }

  private normalizeCapabilityCode(code: string): string {
    return code.trim().replace(/\s+/g, '_').toUpperCase();
  }

  private toCapabilityKey(capability: AuxiliaryCapability): string {
    return `${capability.module}:${capability.capability}`;
  }
}
