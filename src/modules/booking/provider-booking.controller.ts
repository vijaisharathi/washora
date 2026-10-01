import {
  Controller,
  Get,
  Param,
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
import { BookingService } from './booking.service';
import {
  BookingNoteResponseDto,
  BookingQueryDto,
  BookingStatusHistoryResponseDto,
  ProviderBookingDetailResponseDto,
  ProviderBookingListItemResponseDto,
} from './dto';

@ApiTags('Provider Bookings')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-Organization-ID',
  description: 'Target Organization UUID or Public ID (e.g. ORG-0001)',
  required: true,
})
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Controller('provider/bookings')
export class ProviderBookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  @ApiOperation({ summary: 'List bookings legitimately assigned to authenticated provider' })
  @ApiResponse({ status: 200, description: 'Paginated list of provider bookings' })
  async getBookings(
    @Query() query: BookingQueryDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
  ) {
    return this.bookingService.getProviderBookings(user.id, org.organizationId, query);
  }

  @Get(':bookingId')
  @ApiOperation({ summary: 'Get provider booking detail with sanitized customer information' })
  @ApiParam({ name: 'bookingId', description: 'Booking UUID or Booking Number' })
  @ApiResponse({ status: 200, description: 'Provider booking detail' })
  @ApiResponse({ status: 404, description: 'Booking not found or not assigned to this provider' })
  async getBookingById(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
  ): Promise<ProviderBookingDetailResponseDto> {
    return this.bookingService.getProviderBookingById(user.id, org.organizationId, bookingId);
  }

  @Get(':bookingId/status-history')
  @ApiOperation({ summary: 'Get booking status history for provider' })
  @ApiParam({ name: 'bookingId', description: 'Booking UUID or Booking Number' })
  @ApiResponse({ status: 200, description: 'Status history transitions' })
  @ApiResponse({ status: 404, description: 'Booking not found or not assigned to this provider' })
  async getStatusHistory(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
  ): Promise<BookingStatusHistoryResponseDto[]> {
    return this.bookingService.getProviderBookingStatusHistory(user.id, org.organizationId, bookingId);
  }

  @Get(':bookingId/notes')
  @ApiOperation({ summary: 'List notes for provider booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking UUID or Booking Number' })
  @ApiResponse({ status: 200, description: 'List of booking notes' })
  @ApiResponse({ status: 404, description: 'Booking not found or not assigned to this provider' })
  async getNotes(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
  ): Promise<BookingNoteResponseDto[]> {
    return this.bookingService.getProviderBookingNotes(user.id, org.organizationId, bookingId);
  }
}
