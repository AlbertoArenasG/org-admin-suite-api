import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'local', 'production'])
    .default('development'),
  PORT: z.string().default('3000'),
  USER_WELCOME_BASE_URL: z.string(),
  USER_REGISTRATION_BASE_INVITATION_URL: z.string(),
  USER_PASSWORD_RESET_URL: z.string(),
  SERVICE_ENTRY_PUBLIC_BASE_URL: z.string(),
  MONGO_URI: z.string().url(),
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_SES_FROM_EMAIL: z.string(),
  AWS_SNS_SENDER_ID: z.string(),
  AWS_S3_BUCKET: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRATION: z.string(),
  MAILER_HOST: z.string(),
  MAILER_PORT: z.string(),
  MAILER_USER: z.string(),
  MAILER_PASSWORD: z.string(),
  MAILER_FROM: z.string(),
});

export type Env = z.infer<typeof envSchema>;
