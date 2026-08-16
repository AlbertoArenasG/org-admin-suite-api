export interface InternalAssetMaintenanceProviderFollowUpNotificationDto {
  to: string[];
  cc?: string[];
  providerName?: string | null;
  assetName: string;
  assetIdentifier: string;
  assetMaintenanceType: string;
  expirationDate: string;
}
