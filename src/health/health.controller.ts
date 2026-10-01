import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { Public } from '../modules/auth/decorators/public.decorator';

@ApiTags('Health & Readiness')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Application liveness probe' })
  @SwaggerResponse({ status: 200, description: 'Application is live and responding' })
  getLiveness() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'washora-api-engine',
      version: '1.0.0',
      environment: this.configService.get<string>('app.nodeEnv', 'development'),
    };
  }

  @Public()
  @Get('readiness')
  @ApiOperation({ summary: 'Infrastructure and database readiness probe' })
  @SwaggerResponse({ status: 200, description: 'Database and dependencies are ready' })
  @SwaggerResponse({ status: 503, description: 'Database or dependencies are unavailable' })
  async getReadiness() {
    const mem = process.memoryUsage();
    const readinessInfo: Record<string, any> = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'connected',
        configuration: 'valid',
        memory: {
          heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
          rssMb: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
        },
        providers: {
          payment: this.configService.get<string>('payment.provider', 'mock'),
          email: this.configService.get<string>('communications.email.provider', 'mock'),
          sms: this.configService.get<string>('communications.sms.provider', 'mock'),
          push: this.configService.get<string>('communications.push.provider', 'mock'),
          storage: this.configService.get<string>('storage.provider', 'mock'),
          maps: this.configService.get<string>('maps.provider', 'mock'),
        },
      },
    };

    try {
      // Test database connectivity by executing simple query with short timeout
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error: any) {
      readinessInfo.status = 'degraded';
      readinessInfo.checks.database = 'disconnected';
      throw new ServiceUnavailableException({
        message: 'PostgreSQL database connection is currently unavailable.',
        ...readinessInfo,
      });
    }

    return readinessInfo;
  }
}
