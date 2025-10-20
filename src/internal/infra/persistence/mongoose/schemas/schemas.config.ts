import * as schemas from './index';

export const configSchemas = [
  {
    name: schemas.UserDocument.name,
    schema: schemas.UserSchema,
  },
  {
    name: schemas.TenantDocument.name,
    schema: schemas.TenantSchema,
  },
  {
    name: schemas.TenantConfigsDocument.name,
    schema: schemas.TenantConfigsSchema,
  },
  {
    name: schemas.TenantThemeConfigDocument.name,
    schema: schemas.TenantThemeConfigSchema,
  },
  {
    name: schemas.TenantAppearanceConfigDocument.name,
    schema: schemas.TenantAppearanceConfigSchema,
  },
  {
    name: schemas.TenantUserDocument.name,
    schema: schemas.TenantUserSchema,
  },
];
