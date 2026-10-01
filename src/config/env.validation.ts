import { z } from 'zod';

export const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test', 'staging']).default('development'),
  PORT: z
    .string()
    .default('4000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 65535, {
      message: 'PORT must be a valid port number between 1 and 65535',
    }),
  API_PREFIX: z.string().optional().default('api'),
  API_VERSION: z.string().optional().default('v1'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_DATABASE_URL: z.string().optional(),

  CORS_ORIGINS: z
    .string()
    .optional()
    .default('http://localhost:3000,http://localhost:3001,http://localhost:4000'),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional().default('debug'),

  THROTTLE_TTL: z
    .string()
    .optional()
    .default('60')
    .transform((val) => parseInt(val, 10)),
  THROTTLE_LIMIT: z
    .string()
    .optional()
    .default('100')
    .transform((val) => parseInt(val, 10)),

  RATE_LIMIT_WINDOW_MS: z
    .string()
    .optional()
    .default('60000')
    .transform((val) => parseInt(val, 10)),
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .optional()
    .default('100')
    .transform((val) => parseInt(val, 10)),

  JWT_ACCESS_SECRET: z
    .string()
    .min(16, 'JWT_ACCESS_SECRET must be at least 16 characters')
    .default('washora_super_secret_jwt_access_key_2026_production_grade'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16, 'JWT_REFRESH_SECRET must be at least 16 characters')
    .default('washora_super_secret_jwt_refresh_key_2026_production_grade'),
  JWT_ACCESS_EXPIRES_IN: z.string().optional().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().optional().default('30d'),
  ACCESS_TOKEN_EXPIRES_IN: z.string().optional().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().optional().default('30d'),

  ENCRYPTION_KEY: z
    .string()
    .min(16, 'ENCRYPTION_KEY must be at least 16 characters')
    .default('washora_default_encryption_key_32_bytes_len!'),

  // External Provider Configurations
  PAYMENT_PROVIDER: z.string().optional().default('mock'),
  PAYMENT_WEBHOOK_SECRET: z.string().optional().default('whsec_mock_payment_key_2026'),

  EMAIL_PROVIDER: z.string().optional().default('mock'),
  SMS_PROVIDER: z.string().optional().default('mock'),
  PUSH_PROVIDER: z.string().optional().default('mock'),

  STORAGE_PROVIDER: z.string().optional().default('mock'),
  STORAGE_BUCKET: z.string().optional().default('washora-uploads-dev'),

  MAPS_PROVIDER: z.string().optional().default('mock'),

  WEBHOOK_BASE_URL: z.string().optional().default('http://localhost:4000/api/v1/webhooks'),

  ALLOW_MOCK_PROVIDERS: z
    .string()
    .optional()
    .transform((val) => val === 'true'),

  SWAGGER_ENABLED: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  SWAGGER_PROTECTED: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

export function validateEnvironment(config: Record<string, unknown>) {
  const result = environmentSchema.safeParse(config);

  if (!result.success) {
    const errorMessages = result.error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    throw new Error(`Environment validation failed: ${errorMessages}`);
  }

  const data = result.data;

  // Strict Production Validations
  if (data.NODE_ENV === 'production') {
    const isDefaultAccessSecret =
      data.JWT_ACCESS_SECRET ===
      'washora_super_secret_jwt_access_key_2026_production_grade';
    const isDefaultRefreshSecret =
      data.JWT_REFRESH_SECRET ===
      'washora_super_secret_jwt_refresh_key_2026_production_grade';

    if (isDefaultAccessSecret || isDefaultRefreshSecret) {
      throw new Error(
        'PRODUCTION_SECURITY_VIOLATION: Insecure default JWT secrets are strictly forbidden in production mode.',
      );
    }

    if (
      !data.ALLOW_MOCK_PROVIDERS &&
      (data.PAYMENT_PROVIDER === 'mock' ||
        data.STORAGE_PROVIDER === 'mock' ||
        data.EMAIL_PROVIDER === 'mock')
    ) {
      throw new Error(
        'PRODUCTION_CONFIGURATION_VIOLATION: Mock external providers (payment, storage, communication) cannot run in production without explicit ALLOW_MOCK_PROVIDERS=true override.',
      );
    }
  }

  return data;
}
