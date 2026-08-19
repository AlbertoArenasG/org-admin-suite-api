import { AuxiliaryCapabilityCatalogEntry } from './auxiliary-capabilities.types';

export const AUXILIARY_CAPABILITIES_CATALOG: AuxiliaryCapabilityCatalogEntry[] =
  [
    {
      module: 'CONTACTS',
      capability: 'SEARCH',
      description:
        'Permite consultar contactos resumidos para selección en módulos consumidores.',
    },
    {
      module: 'COMMUNICATION_CHANNELS',
      capability: 'READ_OPTIONS',
      description:
        'Permite consultar canales de comunicación disponibles para selección.',
    },
    {
      module: 'EXPIRATION_STATUS_POLICIES',
      capability: 'READ_OPTIONS',
      description:
        'Permite consultar políticas de estatus resumidas para selección en módulos consumidores.',
    },
    {
      module: 'EXPIRATION_NOTIFICATION_POLICIES',
      capability: 'READ_OPTIONS',
      description:
        'Permite consultar políticas de notificación resumidas para selección en módulos consumidores.',
    },
  ];
