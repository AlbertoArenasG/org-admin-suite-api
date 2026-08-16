export interface GenericEmailDto {
  to: string[];
  cc?: string[];
  subject: string;
  html: string;
}
