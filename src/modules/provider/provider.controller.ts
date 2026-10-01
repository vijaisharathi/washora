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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/auth.types';
import { CurrentOrganization } from '../authorization/decorators/current-organization.decorator';
import { OrganizationGuard } from '../authorization/guards/organization.guard';
import type { OrganizationContext } from '../authorization/types/authorization.types';
import { ProviderService } from './provider.service';
import {
  ConfigureProviderServiceDto,
  CreateAvailabilityDto,
  CreateServiceAreaDto,
  ProviderAreaQueryDto,
  ProviderAvailabilityResponseDto,
  ProviderDocumentQueryDto,
  ProviderDocumentResponseDto,
  ProviderProfileResponseDto,
  ProviderServiceAreaResponseDto,
  ProviderServiceQueryDto,
  ProviderServiceResponseDto,
  SubmitProviderDocumentDto,
  UpdateAvailabilityDto,
  UpdateProviderProfileDto,
  UpdateProviderServiceDto,
  UpdateServiceAreaDto,
} from './dto';

@ApiTags('Provider')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-Organization-ID',
  description: 'Target Organization UUID or Public ID (e.g. ORG-0001)',
  required: true,
})
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Controller('provider')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  // ---------------------------------------------------------------------------
  // 1. Profile Endpoints
  // ---------------------------------------------------------------------------

  @Get('profile')
  @ApiOperation({ summary: 'Get current provider profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Provider profile retrieved successfully',
    type: ProviderProfileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Provider profile not found in current organization',
  })
  async getProfile(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
  ): Promise<ProviderProfileResponseDto> {
    return this.providerService.getProfile(user.id, org.organizationId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current provider profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Provider profile updated successfully',
    type: ProviderProfileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed on input fields',
  })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Body() dto: UpdateProviderProfileDto,
  ): Promise<ProviderProfileResponseDto> {
    return this.providerService.updateProfile(user.id, org.organizationId, dto);
  }

  // ---------------------------------------------------------------------------
  // 2. Service Offering Endpoints
  // ---------------------------------------------------------------------------

  @Get('services')
  @ApiOperation({ summary: 'List services offered by provider' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Provider services retrieved successfully',
  })
  async getServices(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: ProviderServiceQueryDto,
  ) {
    return this.providerService.getServices(user.id, org.organizationId, query);
  }

  @Get('services/:serviceIdentifier')
  @ApiOperation({ summary: 'Get single provider service offering' })
  @ApiParam({ name: 'serviceIdentifier', description: 'Catalog Service ID, Public ID, or Slug' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Provider service offering retrieved successfully',
    type: ProviderServiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service offering not configured',
  })
  async getService(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Param('serviceIdentifier') serviceIdentifier: string,
  ): Promise<ProviderServiceResponseDto> {
    return this.providerService.getService(user.id, org.organizationId, serviceIdentifier);
  }

  @Post('services/:serviceIdentifier')
  @ApiOperation({ summary: 'Add or configure service offering in provider catalog' })
  @ApiParam({ name: 'serviceIdentifier', description: 'Catalog Service ID, Public ID, or Slug' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service configured successfully',
    type: ProviderServiceResponseDto,
  })
  async addOrConfigureService(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Param('serviceIdentifier') serviceIdentifier: string,
    @Body() dto: ConfigureProviderServiceDto,
  ): Promise<ProviderServiceResponseDto> {
    return this.providerService.addOrConfigureService(
      user.id,
      org.organizationId,
      serviceIdentifier,
      dto,
    );
  }

  @Patch('services/:serviceIdentifier')
  @ApiOperation({ summary: 'Update custom pricing or status of offered service' })
  @ApiParam({ name: 'serviceIdentifier', description: 'Catalog Service ID, Public ID, or Slug' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Provider service updated successfully',
    type: ProviderServiceResponseDto,
  })
  async updateService(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Param('serviceIdentifier') serviceIdentifier: string,
    @Body() dto: UpdateProviderServiceDto,
  ): Promise<ProviderServiceResponseDto> {
    return this.providerService.updateService(
      user.id,
      org.organizationId,
      serviceIdentifier,
      dto,
    );
  }

  @Delete('services/:serviceIdentifier')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate service offering from provider catalog' })
  @ApiParam({ name: 'serviceIdentifier', description: 'Catalog Service ID, Public ID, or Slug' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Provider service offering deactivated',
  })
  async deleteService(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Param('serviceIdentifier') serviceIdentifier: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.providerService.deleteService(user.id, org.organizationId, serviceIdentifier);
  }

  // ---------------------------------------------------------------------------
  // 3. Service Area Endpoints
  // ---------------------------------------------------------------------------

  @Get('areas')
  @ApiOperation({ summary: 'List provider coverage service areas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service areas retrieved successfully',
  })
  async getServiceAreas(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: ProviderAreaQueryDto,
  ) {
    return this.providerService.getServiceAreas(user.id, org.organizationId, query);
  }

  @Post('areas')
  @ApiOperation({ summary: 'Add new geographic service area' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Service area created successfully',
    type: ProviderServiceAreaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Postal code area already exists for provider',
  })
  async createServiceArea(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Body() dto: CreateServiceAreaDto,
  ): Promise<ProviderServiceAreaResponseDto> {
    return this.providerService.createServiceArea(user.id, org.organizationId, dto);
  }

  @Get('areas/:areaId')
  @ApiOperation({ summary: 'Get single service area details' })
  @ApiParam({ name: 'areaId', description: 'Service Area UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service area retrieved successfully',
    type: ProviderServiceAreaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service area not found',
  })
  async getServiceArea(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Param('areaId') areaId: string,
  ): Promise<ProviderServiceAreaResponseDto> {
    return this.providerService.getServiceArea(user.id, org.organizationId, areaId);
  }

  @Patch('areas/:areaId')
  @ApiOperation({ summary: 'Update service area properties' })
  @ApiParam({ name: 'areaId', description: 'Service Area UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service area updated successfully',
    type: ProviderServiceAreaResponseDto,
  })
  async updateServiceArea(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Param('areaId') areaId: string,
    @Body() dto: UpdateServiceAreaDto,
  ): Promise<ProviderServiceAreaResponseDto> {
    return this.providerService.updateServiceArea(user.id, org.organizationId, areaId, dto);
  }

  @Delete('areas/:areaId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete service area' })
  @ApiParam({ name: 'areaId', description: 'Service Area UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service area removed',
  })
  async deleteServiceArea(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Param('areaId') areaId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.providerService.deleteServiceArea(user.id, org.organizationId, areaId);
  }

  // ---------------------------------------------------------------------------
  // 4. Availability Schedule Endpoints
  // ---------------------------------------------------------------------------

  @Get('availability')
  @ApiOperation({ summary: 'Get weekly operating hours and capacity schedule' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Availability schedule retrieved successfully',
    type: [ProviderAvailabilityResponseDto],
  })
  async getAvailabilities(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
  ): Promise<ProviderAvailabilityResponseDto[]> {
    return this.providerService.getAvailabilities(user.id, org.organizationId);
  }

  @Put('availability')
  @ApiOperation({ summary: 'Create or replace availability for day of week' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Availability saved successfully',
    type: ProviderAvailabilityResponseDto,
  })
  async upsertAvailability(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Body() dto: CreateAvailabilityDto,
  ): Promise<ProviderAvailabilityResponseDto> {
    return this.providerService.upsertAvailability(user.id, org.organizationId, dto);
  }

  @Patch('availability/:availabilityId')
  @ApiOperation({ summary: 'Update availability entry by ID' })
  @ApiParam({ name: 'availabilityId', description: 'Availability entry UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Availability updated successfully',
    type: ProviderAvailabilityResponseDto,
  })
  async updateAvailability(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Param('availabilityId') availabilityId: string,
    @Body() dto: UpdateAvailabilityDto,
  ): Promise<ProviderAvailabilityResponseDto> {
    return this.providerService.updateAvailability(
      user.id,
      org.organizationId,
      availabilityId,
      dto,
    );
  }

  @Delete('availability/:availabilityId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete availability entry by ID' })
  @ApiParam({ name: 'availabilityId', description: 'Availability entry UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Availability removed',
  })
  async deleteAvailability(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Param('availabilityId') availabilityId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.providerService.deleteAvailability(
      user.id,
      org.organizationId,
      availabilityId,
    );
  }

  // ---------------------------------------------------------------------------
  // 5. Verification Document Endpoints
  // ---------------------------------------------------------------------------

  @Get('documents')
  @ApiOperation({ summary: 'List submitted provider verification documents' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Verification documents retrieved successfully',
  })
  async getDocuments(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: ProviderDocumentQueryDto,
  ) {
    return this.providerService.getDocuments(user.id, org.organizationId, query);
  }

  @Post('documents')
  @ApiOperation({ summary: 'Submit new compliance or verification document' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Document submitted for verification',
    type: ProviderDocumentResponseDto,
  })
  async submitDocument(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Body() dto: SubmitProviderDocumentDto,
  ): Promise<ProviderDocumentResponseDto> {
    return this.providerService.submitDocument(user.id, org.organizationId, dto);
  }

  @Get('documents/:documentId')
  @ApiOperation({ summary: 'Get single document details by ID' })
  @ApiParam({ name: 'documentId', description: 'Document UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document details retrieved successfully',
    type: ProviderDocumentResponseDto,
  })
  async getDocument(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Param('documentId') documentId: string,
  ): Promise<ProviderDocumentResponseDto> {
    return this.providerService.getDocument(user.id, org.organizationId, documentId);
  }

  @Delete('documents/:documentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete unverified provider document' })
  @ApiParam({ name: 'documentId', description: 'Document UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document removed successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Cannot delete verified compliance document',
  })
  async deleteDocument(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Param('documentId') documentId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.providerService.deleteDocument(user.id, org.organizationId, documentId);
  }
}
