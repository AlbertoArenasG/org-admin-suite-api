import * as schemas from './index';

export const configSchemas = [
  {
    name: schemas.UserDocument.name,
    schema: schemas.UserSchema,
  },
  {
    name: schemas.RoleDocument.name,
    schema: schemas.RoleSchema,
  },
  {
    name: schemas.PermissionModuleDocument.name,
    schema: schemas.PermissionModuleSchema,
  },
  {
    name: schemas.PermissionOperationDocument.name,
    schema: schemas.PermissionOperationSchema,
  },
  {
    name: schemas.UserPasswordResetTokenDocument.name,
    schema: schemas.UserPasswordResetTokenSchema,
  },
  {
    name: schemas.UserRegistrationInvitationDocument.name,
    schema: schemas.UserRegistrationInvitationSchema,
  },
  {
    name: schemas.FileDocument.name,
    schema: schemas.FileSchema,
  },
  {
    name: schemas.ServiceEntryDocument.name,
    schema: schemas.ServiceEntrySchema,
  },
  {
    name: schemas.ServiceEntryAccessDocument.name,
    schema: schemas.ServiceEntryAccessSchema,
  },
  {
    name: schemas.ServiceEntrySurveyDocument.name,
    schema: schemas.ServiceEntrySurveySchema,
  },
  {
    name: schemas.ServiceEntrySurveyTemplateDocument.name,
    schema: schemas.ServiceEntrySurveyTemplateSchema,
  },
  {
    name: schemas.CustomerFiscalProfileDocument.name,
    schema: schemas.CustomerFiscalProfileSchema,
  },
  {
    name: schemas.CustomerDocument.name,
    schema: schemas.CustomerSchema,
  },
  {
    name: schemas.ServicePackageRecordDocument.name,
    schema: schemas.ServicePackageRecordSchema,
  },
  {
    name: schemas.ProviderDocument.name,
    schema: schemas.ProviderSchema,
  },
  {
    name: schemas.ProviderFiscalProfileDocument.name,
    schema: schemas.ProviderFiscalProfileSchema,
  },
  {
    name: schemas.ProviderBankingInfoDocument.name,
    schema: schemas.ProviderBankingInfoSchema,
  },
];
