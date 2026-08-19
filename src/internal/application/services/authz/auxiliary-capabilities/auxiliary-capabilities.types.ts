export interface AuxiliaryCapability {
  module: string;
  capability: string;
}

export interface AuxiliaryCapabilityCatalogEntry extends AuxiliaryCapability {
  description: string;
}

export interface AuxiliaryCapabilityDerivationRule {
  consumerModule: string;
  auxiliaryCapabilities: AuxiliaryCapability[];
}
