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
import { DeliveryPartnerService } from './delivery-partner.service';
import {
  CreateDeliveryAvailabilityDto,
  CreateDeliveryServiceAreaDto,
  DeliveryPartnerAreaQueryDto,
  DeliveryPartnerAvailabilityResponseDto,
  DeliveryPartnerDocumentQueryDto,
  DeliveryPartnerDocumentResponseDto,
  DeliveryPartnerProfileResponseDto,
  DeliveryPartnerServiceAreaResponseDto,
  SubmitDeliveryDocumentDto,
  UpdateDeliveryAvailabilityDto,
  UpdateDeliveryPartnerProfileDto,
  UpdateDeliveryServiceAreaDto,
} from './dto';

@ApiTags('Delivery Partner')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-Organization-ID',
  description: 'Target Organization UUID or Public ID (e.g. ORG-0001)',
  required: true,
})
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Controller('delivery-partner')
export class DeliveryPartnerController {
  constructor(
    private readonly deliveryPartnerService: DeliveryPartnerService,
  ) {}

  // ---------------------------------------------------------------------------
  // 1. Profile Endpoints
  // ---------------------------------------------------------------------------

  @Get('profile')
  @ApiOperation({ summary: 'Get current delivery partner profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Delivery partner profile retrieved successfully',
    type: DeliveryPartnerProfileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Delivery partner profile not found in current organization',
  })
  async getProfile(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
  ): Promise<DeliveryPartnerProfileResponseDto> {
    return this.deliveryPartnerService.getProfile(user.id, org.organizationId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current delivery partner profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Delivery partner profile updated successfully',
    type: DeliveryPartnerProfileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed on input fields',
  })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Body() dto: UpdateDeliveryPartnerProfileDto,
  ): Promise<DeliveryPartnerProfileResponseDto> {
    return this.deliveryPartnerService.updateProfile(
      user.id,
      org.organizationId,
      dto,
    );
  }

  // ---------------------------------------------------------------------------
  // 2. Service Area Endpoints
  // ---------------------------------------------------------------------------

  @Get('service-areas')
  @ApiOperation({ summary: 'List delivery partner coverage service areas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service areas retrieved successfully',
  })
  async getServiceAreas(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: DeliveryPartnerAreaQueryDto,
  ) {
    return this.deliveryPartnerService.getServiceAreas(
      user.id,
      org.organizationId,
      query,
    );
  }

  @Post('service-areas')
  @ApiOperation({ summary: 'Add new geographic service area' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Service area created successfully',
    type: DeliveryPartnerServiceAreaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Postal code area already exists for delivery partner',
  })
  async createServiceArea(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Body() dto: CreateDeliveryServiceAreaDto,
  ): Promise<DeliveryPartnerServiceAreaResponseDto> {
    return this.deliveryPartnerService.createServiceArea(
      user.id,
      org.organizationId,
      dto,
    );
  }

  @Get('service-areas/:areaId')
  @ApiOperation({ summary: 'Get single service area details' })
  @ApiParam({ name: 'areaId', description: 'Service Area UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service area retrieved successfully',
    type: DeliveryPartnerServiceAreaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service area not found',
  })
  async getServiceArea(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Param('areaId') areaId: string,
  ): Promise<DeliveryPartnerServiceAreaResponseDto> {
    return this.deliveryPartnerService.getServiceArea(
      user.id,
      org.organizationId,
      areaId,
    );
  }

  @Patch('service-areas/:areaId')
  @ApiOperation({ summary: 'Update service area properties' })
  @ApiParam({ name: 'areaId', description: 'Service Area UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service area updated successfully',
    type: DeliveryPartnerServiceAreaResponseDto,
  })
  async updateServiceArea(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Param('areaId') areaId: string,
    @Body() dto: UpdateDeliveryServiceAreaDto,
  ): Promise<DeliveryPartnerServiceAreaResponseDto> {
    return this.deliveryPartnerService.updateServiceArea(
      user.id,
      org.organizationId,
      areaId,
      dto,
    );
  }

  @Delete('service-areas/:areaId')
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
    return this.deliveryPartnerService.deleteServiceArea(
      user.id,
      org.organizationId,
      areaId,
    );
  }

  // ---------------------------------------------------------------------------
  // 3. Availability Schedule Endpoints
  // ---------------------------------------------------------------------------

  @Get('availability')
  @ApiOperation({ summary: 'Get weekly operating hours and capacity schedule' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Availability schedule retrieved successfully',
    type: [DeliveryPartnerAvailabilityResponseDto],
  })
  async getAvailabilities(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
  ): Promise<DeliveryPartnerAvailabilityResponseDto[]> {
    return this.deliveryPartnerService.getAvailabilities(
      user.id,
      org.organizationId,
    );
  }

  @Post('availability')
  @ApiOperation({ summary: 'Create availability schedule for day of week' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Availability saved successfully',
    type: DeliveryPartnerAvailabilityResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Availability already exists for this day',
  })
  async createAvailability(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Body() dto: CreateDeliveryAvailabilityDto,
  ): Promise<DeliveryPartnerAvailabilityResponseDto> {
    return this.deliveryPartnerService.createAvailability(
      user.id,
      org.organizationId,
      dto,
    );
  }

  @Patch('availability/:availabilityId')
  @ApiOperation({ summary: 'Update availability entry by ID' })
  @ApiParam({ name: 'availabilityId', description: 'Availability entry UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Availability updated successfully',
    type: DeliveryPartnerAvailabilityResponseDto,
  })
  async updateAvailability(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Param('availabilityId') availabilityId: string,
    @Body() dto: UpdateDeliveryAvailabilityDto,
  ): Promise<DeliveryPartnerAvailabilityResponseDto> {
    return this.deliveryPartnerService.updateAvailability(
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
    return this.deliveryPartnerService.deleteAvailability(
      user.id,
      org.organizationId,
      availabilityId,
    );
  }

  // ---------------------------------------------------------------------------
  // 4. Verification Document Endpoints
  // ---------------------------------------------------------------------------

  @Get('documents')
  @ApiOperation({ summary: 'List submitted delivery partner verification documents' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Verification documents retrieved successfully',
  })
  async getDocuments(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: DeliveryPartnerDocumentQueryDto,
  ) {
    return this.deliveryPartnerService.getDocuments(
      user.id,
      org.organizationId,
      query,
    );
  }

  @Post('documents')
  @ApiOperation({ summary: 'Submit new compliance or verification document' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Document submitted for verification',
    type: DeliveryPartnerDocumentResponseDto,
  })
  async submitDocument(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Body() dto: SubmitDeliveryDocumentDto,
  ): Promise<DeliveryPartnerDocumentResponseDto> {
    return this.deliveryPartnerService.submitDocument(
      user.id,
      org.organizationId,
      dto,
    );
  }

  @Get('documents/:documentId')
  @ApiOperation({ summary: 'Get single document details by ID' })
  @ApiParam({ name: 'documentId', description: 'Document UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document details retrieved successfully',
    type: DeliveryPartnerDocumentResponseDto,
  })
  async getDocument(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Param('documentId') documentId: string,
  ): Promise<DeliveryPartnerDocumentResponseDto> {
    return this.deliveryPartnerService.getDocument(
      user.id,
      org.organizationId,
      documentId,
    );
  }

  @Delete('documents/:documentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete unverified delivery partner document' })
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
    return this.deliveryPartnerService.deleteDocument(
      user.id,
      org.organizationId,
      documentId,
    );
  }
}
