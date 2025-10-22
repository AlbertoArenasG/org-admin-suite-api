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
];
