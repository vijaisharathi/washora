import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { AuthorizationRepository } from './authorization.repository';
import { OrganizationGuard } from './guards/organization.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthorizationService } from './services/authorization.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    AuthorizationRepository,
    AuthorizationService,
    OrganizationGuard,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [
    AuthorizationRepository,
    AuthorizationService,
    OrganizationGuard,
    RolesGuard,
    PermissionsGuard,
  ],
})
export class AuthorizationModule {}
