import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { createSuccessResponse } from '../../../common/utils/response.util';
import { CurrentOrganization } from '../../authorization/decorators/current-organization.decorator';
import { Roles } from '../../authorization/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../authorization/guards/organization.guard';
import { RolesGuard } from '../../authorization/guards/roles.guard';
import type { OrganizationContext } from '../../authorization/types/authorization.types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/types/auth.types';
import {
  AdminCreateCategoryDto,
  AdminCreateServiceDto,
  AdminUpdateCategoryDto,
  AdminUpdateServiceDto,
} from '../dto/catalog-admin.dto';
import { AdminCatalogService } from '../services/admin-catalog.service';

@ApiTags('Admin — Catalog Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Controller('admin/catalog')
export class AdminCatalogController {
  constructor(private readonly catalogService: AdminCatalogService) {}

  // ============================================================================
  // CATEGORIES
  // ============================================================================

  @Get('categories')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'List service categories' })
  async listCategories(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: { page?: number; limit?: number; status?: string; search?: string },
  ) {
    const data = await this.catalogService.listCategories(org.organizationId, query);
    return createSuccessResponse(data);
  }

  @Get('categories/:id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get category details' })
  async getCategory(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') categoryId: string,
  ) {
    const data = await this.catalogService.getCategory(org.organizationId, categoryId);
    return createSuccessResponse(data);
  }

  @Post('categories')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Create service category (Admin only)' })
  async createCategory(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AdminCreateCategoryDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.catalogService.createCategory(org.organizationId, dto, user.id, ip);
    return createSuccessResponse(data);
  }

  @Patch('categories/:id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Update service category (Admin only)' })
  async updateCategory(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') categoryId: string,
    @Body() dto: AdminUpdateCategoryDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.catalogService.updateCategory(org.organizationId, categoryId, dto, user.id, ip);
    return createSuccessResponse(data);
  }

  @Delete('categories/:id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Delete service category (Admin only)' })
  async deleteCategory(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') categoryId: string,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.catalogService.deleteCategory(org.organizationId, categoryId, user.id, ip);
    return createSuccessResponse(data);
  }

  // ============================================================================
  // SERVICES
  // ============================================================================

  @Get('services')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'List services with variants and pricing' })
  async listServices(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: { page?: number; limit?: number; categoryId?: string; status?: string; search?: string },
  ) {
    const data = await this.catalogService.listServices(org.organizationId, query);
    return createSuccessResponse(data);
  }

  @Get('services/:id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get service details' })
  async getService(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') serviceId: string,
  ) {
    const data = await this.catalogService.getService(org.organizationId, serviceId);
    return createSuccessResponse(data);
  }

  @Post('services')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Create service in catalog (Admin only)' })
  async createService(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AdminCreateServiceDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.catalogService.createService(org.organizationId, dto, user.id, ip);
    return createSuccessResponse(data);
  }

  @Patch('services/:id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Update service in catalog (Admin only)' })
  async updateService(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') serviceId: string,
    @Body() dto: AdminUpdateServiceDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.catalogService.updateService(org.organizationId, serviceId, dto, user.id, ip);
    return createSuccessResponse(data);
  }

  @Post('services/:id/publish')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Publish service to active marketplace (Admin only)' })
  async publishService(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') serviceId: string,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.catalogService.publishService(org.organizationId, serviceId, user.id, ip);
    return createSuccessResponse(data);
  }

  @Post('services/:id/unpublish')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Unpublish service from marketplace (Admin only)' })
  async unpublishService(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') serviceId: string,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.catalogService.unpublishService(org.organizationId, serviceId, user.id, ip);
    return createSuccessResponse(data);
  }
}
