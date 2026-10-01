export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  apiVersion: string;
  appName: string;
  swaggerEnabled: boolean;
  swaggerProtected: boolean;
}

export interface DatabaseConfig {
  url: string;
  directUrl?: string;
}

export interface CorsConfig {
  origins: string[];
}

export interface SecurityConfig {
  rateLimitTtl: number;
  rateLimitMax: number;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  encryptionKey: string;
}

export interface LoggingConfig {
  level: string;
}

export interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
}

export interface IntegrationsConfig {
  paymentProvider: string;
  paymentWebhookSecret: string;
  emailProvider: string;
  smsProvider: string;
  pushProvider: string;
  storageProvider: string;
  storageBucket: string;
  mapsProvider: string;
  webhookBaseUrl: string;
  allowMockProviders: boolean;
}

export interface GlobalConfiguration {
  app: AppConfig;
  database: DatabaseConfig;
  cors: CorsConfig;
  security: SecurityConfig;
  logging: LoggingConfig;
  jwt: JwtConfig;
  integrations: IntegrationsConfig;
}

export const configuration = (): GlobalConfiguration => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = parseInt(process.env.PORT || '4000', 10);
  const apiPrefix = process.env.API_PREFIX || 'api';
  const apiVersion = process.env.API_VERSION || 'v1';

  // Parse CORS origins from comma-separated string or array
  const rawCors =
    process.env.CORS_ORIGINS ||
    'http://localhost:3000,http://localhost:3001,http://localhost:4000';
  const origins = rawCors
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const rateLimitWindowMs = parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || '60000',
    10,
  );
  const rateLimitMaxRequests = parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || '100',
    10,
  );

  return {
    app: {
      nodeEnv,
      port,
      apiPrefix,
      apiVersion,
      appName: 'WASHORA API Engine',
      swaggerEnabled:
        process.env.SWAGGER_ENABLED !== undefined
          ? process.env.SWAGGER_ENABLED === 'true'
          : nodeEnv !== 'production',
      swaggerProtected:
        process.env.SWAGGER_PROTECTED !== undefined
          ? process.env.SWAGGER_PROTECTED === 'true'
          : nodeEnv === 'production',
    },
    database: {
      url:
        process.env.DATABASE_URL ||
        'postgresql://postgres:postgres@localhost:5432/washora?schema=public',
      directUrl: process.env.DIRECT_DATABASE_URL,
    },
    cors: {
      origins,
    },
    security: {
      rateLimitTtl: parseInt(process.env.THROTTLE_TTL || '60', 10),
      rateLimitMax: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
      rateLimitWindowMs,
      rateLimitMaxRequests,
      encryptionKey:
        process.env.ENCRYPTION_KEY ||
        'washora_default_encryption_key_32_bytes_len!',
    },
    logging: {
      level:
        process.env.LOG_LEVEL || (nodeEnv === 'production' ? 'info' : 'debug'),
    },
    jwt: {
      accessSecret:
        process.env.JWT_ACCESS_SECRET ||
        'washora_super_secret_jwt_access_key_2026_production_grade',
      refreshSecret:
        process.env.JWT_REFRESH_SECRET ||
        'washora_super_secret_jwt_refresh_key_2026_production_grade',
      accessTokenExpiresIn:
        process.env.JWT_ACCESS_EXPIRES_IN ||
        process.env.ACCESS_TOKEN_EXPIRES_IN ||
        '15m',
      refreshTokenExpiresIn:
        process.env.JWT_REFRESH_EXPIRES_IN ||
        process.env.REFRESH_TOKEN_EXPIRES_IN ||
        '30d',
    },
    integrations: {
      paymentProvider: process.env.PAYMENT_PROVIDER || 'mock',
      paymentWebhookSecret:
        process.env.PAYMENT_WEBHOOK_SECRET || 'whsec_mock_payment_key_2026',
      emailProvider: process.env.EMAIL_PROVIDER || 'mock',
      smsProvider: process.env.SMS_PROVIDER || 'mock',
      pushProvider: process.env.PUSH_PROVIDER || 'mock',
      storageProvider: process.env.STORAGE_PROVIDER || 'mock',
      storageBucket: process.env.STORAGE_BUCKET || 'washora-uploads-dev',
      mapsProvider: process.env.MAPS_PROVIDER || 'mock',
      webhookBaseUrl:
        process.env.WEBHOOK_BASE_URL || 'http://localhost:4000/api/v1/webhooks',
      allowMockProviders:
        process.env.ALLOW_MOCK_PROVIDERS !== undefined
          ? process.env.ALLOW_MOCK_PROVIDERS === 'true'
          : nodeEnv !== 'production',
    },
  };
};

export default configuration;
