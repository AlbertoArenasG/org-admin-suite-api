export interface ServiceEntryCreatedNotificationDto {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  serviceOrderIdentifier: string;
  publicUrl: string;
}
