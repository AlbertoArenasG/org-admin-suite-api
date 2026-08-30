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
    {
      consumerModule: 'CUSTOMER_SERVICE_RECORDS',
      auxiliaryCapabilities: [
        {
          module: 'CUSTOMERS',
          capability: 'READ_OPTIONS',
        },
        {
          module: 'CUSTOMERS',
          capability: 'READ_RELATED_USERS_OPTIONS',
        },
        {
          module: 'PROVIDERS',
          capability: 'READ_OPTIONS',
        },
        {
          module: 'RECIPIENT_GROUPS',
          capability: 'READ_OPTIONS',
        },
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
    {
      consumerModule: 'USER_REGISTRATION_INVITATIONS',
      auxiliaryCapabilities: [
        {
          module: 'CUSTOMERS',
          capability: 'READ_OPTIONS',
        },
      ],
    },
    {
      consumerModule: 'USERS',
      auxiliaryCapabilities: [
        {
          module: 'CUSTOMERS',
          capability: 'READ_OPTIONS',
        },
      ],
    },
  ];
