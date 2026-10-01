import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

import { SensitiveSanitizerInterceptor } from './common/interceptors/sensitive-sanitizer.interceptor';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('app.nodeEnv', 'development');
  const port = configService.get<number>('app.port', 4000);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');
  const allowedOrigins = configService.get<string[]>('cors.origins', []);
  const swaggerEnabled = configService.get<boolean>('swagger.enabled', nodeEnv !== 'production');
  const swaggerProtected = configService.get<boolean>('swagger.protected', false);

  // 1. Security Headers via Helmet & Custom Policies
  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production' ? {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", 'https:', 'data:'],
          objectSrc: ["'none'"],
          frameSrc: ["'none'"],
        },
      } : false,
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      hsts: nodeEnv === 'production' ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
      xFrameOptions: { action: 'deny' },
      xContentTypeOptions: true,
    }),
  );

  // Permissions-Policy header
  app.use((_req: any, res: any, next: () => void) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  // 2. Body Parser Limits (2MB default limit)
  app.use(json({ limit: '2mb' }));
  app.use(urlencoded({ extended: true, limit: '2mb' }));

  // 3. Response Compression
  app.use(compression());

  // 4. CORS Configuration
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // In production, prohibit wildcard origin when credentials are true
      if (nodeEnv === 'production' && allowedOrigins.includes('*')) {
        return callback(new Error('CORS policy: Wildcard origin is forbidden in production with credentials'));
      }

      if (
        nodeEnv === 'development' ||
        allowedOrigins.includes(origin) ||
        (nodeEnv !== 'production' && allowedOrigins.includes('*'))
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy: Origin ${origin} is not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',
      'X-Organization-ID',
      'X-Org-ID',
      'Idempotency-Key',
      'Accept',
    ],
    exposedHeaders: ['X-Request-ID', 'Idempotency-Key'],
    credentials: true,
  });

  // 5. API Global Prefix & URI Versioning
  app.setGlobalPrefix(apiPrefix);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // 6. Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 7. Global Exception Filter & Interceptors
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new TransformResponseInterceptor(),
    new SensitiveSanitizerInterceptor(),
    new LoggingInterceptor(),
  );

  // 8. Graceful Shutdown Hooks
  app.enableShutdownHooks();

  // 9. Swagger / OpenAPI Documentation
  if (swaggerEnabled) {
    if (swaggerProtected && nodeEnv === 'production') {
      logger.warn('Swagger is enabled in protected mode in production.');
    }
    const swaggerConfig = new DocumentBuilder()
      .setTitle('WASHORA API Engine')
      .setDescription('Production-grade marketplace REST API engine for WASHORA')
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT Bearer access token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Authentication', 'Identity authentication, sessions, credentials, tokens, and password reset')
      .addTag('Health & Readiness', 'Probes for system liveness and database readiness')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      customSiteTitle: 'WASHORA API Documentation',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list',
      },
    });

    logger.log(`Swagger documentation initialized at http://localhost:${port}/${apiPrefix}/docs`);
  }

  // 9. Start Application
  await app.listen(port);
  logger.log(`🚀 WASHORA NestJS Backend Engine running on http://localhost:${port}/${apiPrefix}/v1`);
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap().catch((err) => {
    console.error('Fatal error during application bootstrap:', err);
    process.exit(1);
  });
}

export { bootstrap };
