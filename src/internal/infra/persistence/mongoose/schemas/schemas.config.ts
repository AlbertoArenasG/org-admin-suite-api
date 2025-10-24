import * as schemas from './index';

export const configSchemas = [
  {
    name: schemas.UserDocument.name,
    schema: schemas.UserSchema,
  },
  {
    name: schemas.UserRegistrationInvitationDocument.name,
    schema: schemas.UserRegistrationInvitationSchema,
  },
  {
    name: schemas.FileDocument.name,
    schema: schemas.FileSchema,
  },
];
