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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/auth.types';
import { CurrentOrganization } from '../authorization/decorators/current-organization.decorator';
import { OrganizationGuard } from '../authorization/guards/organization.guard';
import type { OrganizationContext } from '../authorization/types/authorization.types';
import { CustomerService } from './customer.service';
import {
  CreateAddressDto,
  CustomerAddressQueryDto,
  CustomerAddressResponseDto,
  CustomerFavoriteResponseDto,
  CustomerProfileResponseDto,
  CustomerRewardAccountResponseDto,
  CustomerRewardQueryDto,
  CustomerRewardTransactionResponseDto,
  UpdateAddressDto,
  UpdateCustomerProfileDto,
} from './dto';

@ApiTags('Customer')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-Organization-ID',
  description: 'Target Organization UUID or Public ID (e.g. ORG-0001)',
  required: true,
})
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // --------------------------------------------------------------------------
  // Profile Endpoints
  // --------------------------------------------------------------------------

  @Get('profile')
  @ApiOperation({ summary: 'Get current customer profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer profile details',
    type: CustomerProfileResponseDto,
  })
  async getProfile(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
  ): Promise<CustomerProfileResponseDto> {
    return this.customerService.getProfile(user.id, org.organizationId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update customer profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Updated customer profile',
    type: CustomerProfileResponseDto,
  })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Body() dto: UpdateCustomerProfileDto,
  ): Promise<CustomerProfileResponseDto> {
    return this.customerService.updateProfile(
      user.id,
      org.organizationId,
      dto,
    );
  }

  // --------------------------------------------------------------------------
  // Address Endpoints
  // --------------------------------------------------------------------------

  @Get('addresses')
  @ApiOperation({ summary: 'List customer saved addresses' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paginated list of customer addresses',
  })
  async getAddresses(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: CustomerAddressQueryDto,
  ) {
    return this.customerService.getAddresses(
      user.id,
      org.organizationId,
      query,
    );
  }

  @Post('addresses')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new customer address' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Address created successfully',
    type: CustomerAddressResponseDto,
  })
  async createAddress(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Body() dto: CreateAddressDto,
  ): Promise<CustomerAddressResponseDto> {
    return this.customerService.createAddress(
      user.id,
      org.organizationId,
      dto,
    );
  }

  @Get('addresses/:addressId')
  @ApiOperation({ summary: 'Get address details by address ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Address details',
    type: CustomerAddressResponseDto,
  })
  async getAddress(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Param('addressId') addressId: string,
  ): Promise<CustomerAddressResponseDto> {
    return this.customerService.getAddress(
      user.id,
      org.organizationId,
      addressId,
    );
  }

  @Patch('addresses/:addressId')
  @ApiOperation({ summary: 'Update customer address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Updated address details',
    type: CustomerAddressResponseDto,
  })
  async updateAddress(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Param('addressId') addressId: string,
    @Body() dto: UpdateAddressDto,
  ): Promise<CustomerAddressResponseDto> {
    return this.customerService.updateAddress(
      user.id,
      org.organizationId,
      addressId,
      dto,
    );
  }

  @Delete('addresses/:addressId')
  @ApiOperation({ summary: 'Soft-deactivate customer address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Address deactivated successfully',
  })
  async deleteAddress(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Param('addressId') addressId: string,
  ) {
    return this.customerService.deleteAddress(
      user.id,
      org.organizationId,
      addressId,
    );
  }

  @Post('addresses/:addressId/default')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set address as primary default address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Address set as default',
    type: CustomerAddressResponseDto,
  })
  async setDefaultAddress(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Param('addressId') addressId: string,
  ): Promise<CustomerAddressResponseDto> {
    return this.customerService.setDefaultAddress(
      user.id,
      org.organizationId,
      addressId,
    );
  }

  // --------------------------------------------------------------------------
  // Favorite Endpoints
  // --------------------------------------------------------------------------

  @Get('favorites')
  @ApiOperation({ summary: 'List customer favorite services' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of favorite services',
    type: [CustomerFavoriteResponseDto],
  })
  async getFavorites(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
  ): Promise<CustomerFavoriteResponseDto[]> {
    return this.customerService.getFavorites(user.id, org.organizationId);
  }

  @Post('favorites/:serviceId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add service to customer favorites (idempotent)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service favorited successfully',
    type: CustomerFavoriteResponseDto,
  })
  async addFavorite(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Param('serviceId') serviceId: string,
  ): Promise<CustomerFavoriteResponseDto> {
    return this.customerService.addFavorite(
      user.id,
      org.organizationId,
      serviceId,
    );
  }

  @Delete('favorites/:serviceId')
  @ApiOperation({ summary: 'Remove service from customer favorites' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service removed from favorites',
  })
  async removeFavorite(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Param('serviceId') serviceId: string,
  ) {
    return this.customerService.removeFavorite(
      user.id,
      org.organizationId,
      serviceId,
    );
  }

  // --------------------------------------------------------------------------
  // Reward Endpoints
  // --------------------------------------------------------------------------

  @Get('rewards')
  @ApiOperation({ summary: 'Get customer reward account summary and balance' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reward account balance details',
    type: CustomerRewardAccountResponseDto,
  })
  async getRewards(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
  ): Promise<CustomerRewardAccountResponseDto> {
    return this.customerService.getRewards(user.id, org.organizationId);
  }

  @Get('rewards/transactions')
  @ApiOperation({ summary: 'List customer reward transaction history' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paginated list of reward transactions',
  })
  async getRewardTransactions(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: CustomerRewardQueryDto,
  ) {
    return this.customerService.getRewardTransactions(
      user.id,
      org.organizationId,
      query,
    );
  }
}
