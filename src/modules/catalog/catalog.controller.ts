import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/auth.types';
import { CurrentOrganization } from '../authorization/decorators/current-organization.decorator';
import { Roles } from '../authorization/decorators/roles.decorator';
import { OrganizationGuard } from '../authorization/guards/organization.guard';
import { RolesGuard } from '../authorization/guards/roles.guard';
import type { OrganizationContext } from '../authorization/types/authorization.types';
import { CatalogService } from './catalog.service';
import {
  CatalogCategoryQueryDto,
  CatalogServiceQueryDto,
  CategoryResponseDto,
  CreateCategoryDto,
  CreateServiceDto,
  CreateServiceImageDto,
  CreateServiceVariantDto,
  ServiceDetailResponseDto,
  ServiceImageResponseDto,
  ServiceResponseDto,
  ServiceSummaryDto,
  ServiceVariantResponseDto,
  UpdateCategoryDto,
  UpdateCategoryStatusDto,
  UpdateServiceDto,
  UpdateServiceImageDto,
  UpdateServiceStatusDto,
  UpdateServiceVariantDto,
} from './dto';

@ApiTags('Catalog')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-Organization-ID',
  description: 'Target Organization UUID or Public ID (e.g. ORG-0001)',
  required: true,
})
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  private isManagementRole(role: RoleType): boolean {
    return role === RoleType.ADMIN || role === RoleType.OPERATIONS;
  }

  // ==========================================================================
  // CATEGORIES
  // ==========================================================================

  @Get('categories')
  @ApiOperation({ summary: 'List service categories with filtering and active services count' })
  @ApiResponse({ status: 200, description: 'Paginated list of service categories' })
  async getCategories(
    @Query() query: CatalogCategoryQueryDto,
    @CurrentOrganization() org: OrganizationContext,
  ) {
    const isAdminOrOps = this.isManagementRole(org.role);
    return this.catalogService.getCategories(query, org.organizationId, isAdminOrOps);
  }

  @Get('categories/slug/:slug')
  @ApiOperation({ summary: 'Get service category by unique URL slug' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiResponse({ status: 200, description: 'Category detail' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getCategoryBySlug(
    @Param('slug') slug: string,
    @CurrentOrganization() org: OrganizationContext,
  ): Promise<CategoryResponseDto> {
    const isAdminOrOps = this.isManagementRole(org.role);
    return this.catalogService.getCategoryBySlug(slug, org.organizationId, isAdminOrOps);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get service category by UUID or public ID' })
  @ApiParam({ name: 'id', description: 'Category UUID or public ID (e.g. CAT-0001)' })
  @ApiResponse({ status: 200, description: 'Category detail' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getCategoryById(
    @Param('id') id: string,
    @CurrentOrganization() org: OrganizationContext,
  ): Promise<CategoryResponseDto> {
    const isAdminOrOps = this.isManagementRole(org.role);
    return this.catalogService.getCategoryById(id, org.organizationId, isAdminOrOps);
  }

  @Post('categories')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new service category (Admin/Ops only)' })
  @ApiResponse({ status: 201, description: 'Category successfully created' })
  @ApiResponse({ status: 409, description: 'Category slug already exists' })
  async createCategory(
    @Body() dto: CreateCategoryDto,
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CategoryResponseDto> {
    return this.catalogService.createCategory(dto, org.organizationId, user.id);
  }

  @Put('categories/:id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Update service category details (Admin/Ops only)' })
  @ApiParam({ name: 'id', description: 'Category UUID or public ID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CategoryResponseDto> {
    return this.catalogService.updateCategory(id, dto, org.organizationId, user.id);
  }

  @Patch('categories/:id/status')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Update category lifecycle status (Admin/Ops only)' })
  @ApiParam({ name: 'id', description: 'Category UUID or public ID' })
  @ApiResponse({ status: 200, description: 'Category status updated' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async updateCategoryStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryStatusDto,
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CategoryResponseDto> {
    return this.catalogService.updateCategoryStatus(id, dto, org.organizationId, user.id);
  }

  @Delete('categories/:id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Delete a category if no active services exist (Admin/Ops only)' })
  @ApiParam({ name: 'id', description: 'Category UUID or public ID' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 400, description: 'Category has active services' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async deleteCategory(
    @Param('id') id: string,
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.catalogService.deleteCategory(id, org.organizationId, user.id);
  }

  // ==========================================================================
  // SERVICES
  // ==========================================================================

  @Get('services')
  @ApiOperation({ summary: 'Browse services with filters, search, and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of catalog services' })
  async getServices(
    @Query() query: CatalogServiceQueryDto,
    @CurrentOrganization() org: OrganizationContext,
  ) {
    const isAdminOrOps = this.isManagementRole(org.role);
    return this.catalogService.getServices(query, org.organizationId, isAdminOrOps);
  }

  @Get('services/slug/:slug')
  @ApiOperation({ summary: 'Get service details by slug with variants and media' })
  @ApiParam({ name: 'slug', description: 'Service slug' })
  @ApiResponse({ status: 200, description: 'Detailed service representation' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async getServiceBySlug(
    @Param('slug') slug: string,
    @CurrentOrganization() org: OrganizationContext,
  ): Promise<ServiceResponseDto> {
    const isAdminOrOps = this.isManagementRole(org.role);
    return this.catalogService.getServiceBySlug(slug, org.organizationId, isAdminOrOps);
  }

  @Get('services/:id')
  @ApiOperation({ summary: 'Get service details by UUID or public ID' })
  @ApiParam({ name: 'id', description: 'Service UUID or public ID (e.g. SVC-0001)' })
  @ApiResponse({ status: 200, description: 'Detailed service representation' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async getServiceById(
    @Param('id') id: string,
    @CurrentOrganization() org: OrganizationContext,
  ): Promise<ServiceResponseDto> {
    const isAdminOrOps = this.isManagementRole(org.role);
    return this.catalogService.getServiceById(id, org.organizationId, isAdminOrOps);
  }

  @Post('services')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new catalog service (Admin/Ops only)' })
  @ApiResponse({ status: 201, description: 'Service created successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Service slug already exists' })
  async createService(
    @Body() dto: CreateServiceDto,
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ServiceResponseDto> {
    return this.catalogService.createService(dto, org.organizationId, user.id);
  }

  @Put('services/:id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Update catalog service details (Admin/Ops only)' })
  @ApiParam({ name: 'id', description: 'Service UUID or public ID' })
  @ApiResponse({ status: 200, description: 'Service updated successfully' })
  @ApiResponse({ status: 404, description: 'Service or Category not found' })
  async updateService(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ServiceResponseDto> {
    return this.catalogService.updateService(id, dto, org.organizationId, user.id);
  }

  @Patch('services/:id/status')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Update service lifecycle status (Admin/Ops only)' })
  @ApiParam({ name: 'id', description: 'Service UUID or public ID' })
  @ApiResponse({ status: 200, description: 'Service status updated' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async updateServiceStatus(
    @Param('id') id: string,
    @Body() dto: UpdateServiceStatusDto,
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ServiceResponseDto> {
    return this.catalogService.updateServiceStatus(id, dto, org.organizationId, user.id);
  }

  @Delete('services/:id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Delete a catalog service (Admin/Ops only)' })
  @ApiParam({ name: 'id', description: 'Service UUID or public ID' })
  @ApiResponse({ status: 200, description: 'Service deleted successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async deleteService(
    @Param('id') id: string,
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.catalogService.deleteService(id, org.organizationId, user.id);
  }

  // ==========================================================================
  // SERVICE VARIANTS
  // ==========================================================================

  @Get('services/:serviceId/variants')
  @ApiOperation({ summary: 'List variants for a service' })
  @ApiParam({ name: 'serviceId', description: 'Parent service UUID or public ID' })
  @ApiResponse({ status: 200, description: 'List of service variants' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async getVariantsByService(
    @Param('serviceId') serviceId: string,
    @CurrentOrganization() org: OrganizationContext,
  ): Promise<ServiceVariantResponseDto[]> {
    const isAdminOrOps = this.isManagementRole(org.role);
    return this.catalogService.getVariantsByService(serviceId, org.organizationId, isAdminOrOps);
  }

  @Post('services/:serviceId/variants')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a new variant to a service (Admin/Ops only)' })
  @ApiParam({ name: 'serviceId', description: 'Parent service UUID or public ID' })
  @ApiResponse({ status: 201, description: 'Variant created successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async createVariant(
    @Param('serviceId') serviceId: string,
    @Body() dto: CreateServiceVariantDto,
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ServiceVariantResponseDto> {
    return this.catalogService.createVariant(serviceId, dto, org.organizationId, user.id);
  }

  @Put('services/:serviceId/variants/:variantId')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Update a service variant (Admin/Ops only)' })
  @ApiParam({ name: 'serviceId', description: 'Parent service UUID or public ID' })
  @ApiParam({ name: 'variantId', description: 'Variant UUID or public ID' })
  @ApiResponse({ status: 200, description: 'Variant updated successfully' })
  @ApiResponse({ status: 404, description: 'Service or Variant not found' })
  async updateVariant(
    @Param('serviceId') serviceId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateServiceVariantDto,
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ServiceVariantResponseDto> {
    return this.catalogService.updateVariant(serviceId, variantId, dto, org.organizationId, user.id);
  }

  @Delete('services/:serviceId/variants/:variantId')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Delete a service variant (Admin/Ops only)' })
  @ApiParam({ name: 'serviceId', description: 'Parent service UUID or public ID' })
  @ApiParam({ name: 'variantId', description: 'Variant UUID or public ID' })
  @ApiResponse({ status: 200, description: 'Variant deleted successfully' })
  @ApiResponse({ status: 404, description: 'Service or Variant not found' })
  async deleteVariant(
    @Param('serviceId') serviceId: string,
    @Param('variantId') variantId: string,
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.catalogService.deleteVariant(serviceId, variantId, org.organizationId, user.id);
  }

  // ==========================================================================
  // SERVICE IMAGES
  // ==========================================================================

  @Get('services/:serviceId/images')
  @ApiOperation({ summary: 'List media images for a service' })
  @ApiParam({ name: 'serviceId', description: 'Parent service UUID or public ID' })
  @ApiResponse({ status: 200, description: 'List of service images' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async getServiceImages(
    @Param('serviceId') serviceId: string,
    @CurrentOrganization() org: OrganizationContext,
  ): Promise<ServiceImageResponseDto[]> {
    return this.catalogService.getServiceImages(serviceId, org.organizationId);
  }

  @Post('services/:serviceId/images')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a media image to a service (Admin/Ops only)' })
  @ApiParam({ name: 'serviceId', description: 'Parent service UUID or public ID' })
  @ApiResponse({ status: 201, description: 'Image added successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async addServiceImage(
    @Param('serviceId') serviceId: string,
    @Body() dto: CreateServiceImageDto,
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ServiceImageResponseDto> {
    return this.catalogService.addServiceImage(serviceId, dto, org.organizationId, user.id);
  }

  @Put('services/:serviceId/images/:imageId')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Update service image metadata or primary status (Admin/Ops only)' })
  @ApiParam({ name: 'serviceId', description: 'Parent service UUID or public ID' })
  @ApiParam({ name: 'imageId', description: 'Image UUID' })
  @ApiResponse({ status: 200, description: 'Image updated successfully' })
  @ApiResponse({ status: 404, description: 'Service or Image not found' })
  async updateServiceImage(
    @Param('serviceId') serviceId: string,
    @Param('imageId') imageId: string,
    @Body() dto: UpdateServiceImageDto,
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ServiceImageResponseDto> {
    return this.catalogService.updateServiceImage(serviceId, imageId, dto, org.organizationId, user.id);
  }

  @Delete('services/:serviceId/images/:imageId')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Delete a service image (Admin/Ops only)' })
  @ApiParam({ name: 'serviceId', description: 'Parent service UUID or public ID' })
  @ApiParam({ name: 'imageId', description: 'Image UUID' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  @ApiResponse({ status: 404, description: 'Service or Image not found' })
  async deleteServiceImage(
    @Param('serviceId') serviceId: string,
    @Param('imageId') imageId: string,
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.catalogService.deleteServiceImage(serviceId, imageId, org.organizationId, user.id);
  }
}
