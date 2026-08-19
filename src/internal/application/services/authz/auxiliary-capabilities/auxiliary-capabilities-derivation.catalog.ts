import { AuxiliaryCapabilityDerivationRule } from './auxiliary-capabilities.types';

export const AUXILIARY_CAPABILITIES_DERIVATION_CATALOG: AuxiliaryCapabilityDerivationRule[] =
  [
    {
      consumerModule: 'RECIPIENT_GROUPS',
      auxiliaryCapabilities: [
        {
          module: 'CONTACTS',
          capability: 'SEARCH',
        },
        {
          module: 'COMMUNICATION_CHANNELS',
          capability: 'READ_OPTIONS',
        },
      ],
    },
    {
      consumerModule: 'INTERNAL_ASSET_MAINTENANCE_RECORDS',
      auxiliaryCapabilities: [
        {
          module: 'EXPIRATION_STATUS_POLICIES',
          capability: 'READ_OPTIONS',
        },
        {
          module: 'EXPIRATION_NOTIFICATION_POLICIES',
          capability: 'READ_OPTIONS',
        },
      ],
    },
  ];
