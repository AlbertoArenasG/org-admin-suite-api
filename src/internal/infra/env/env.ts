import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'local', 'production'])
    .default('development'),
  // PORT: z.coerce.number().optional().default(3000),
  PORT: z.string().default('3000'),
  MONGO_URI: z.string().url(),
  // SERVICE_URL: z.coerce.string(),
  // API_KEY_SECRET: z.coerce.string(),
});

export type Env = z.infer<typeof envSchema>;
