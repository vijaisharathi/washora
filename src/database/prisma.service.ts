import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to PostgreSQL database via Prisma');
    } catch (error) {
      this.logger.error('Failed to connect to PostgreSQL database on module init', error);
      // In development or test environments where local Postgres might not be running immediately,
      // allow application initialization while logging the warning.
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from PostgreSQL database');
  }

  /**
   * Helper to execute queries inside an organization-scoped interactive transaction.
   */
  async executeTenantTransaction<T>(
    organizationId: string,
    callback: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>,
  ): Promise<T> {
    if (!organizationId) {
      throw new Error('Organization ID is required for tenant transactions');
    }
    return this.$transaction(async (tx) => {
      return callback(tx as any);
    });
  }
}
