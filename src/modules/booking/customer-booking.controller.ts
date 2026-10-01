import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
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
import { BookingService } from './booking.service';
import {
  BookingNoteResponseDto,
  BookingQueryDto,
  BookingStatusHistoryResponseDto,
  CancelBookingDto,
  CreateBookingDto,
  CreateBookingNoteDto,
  CustomerBookingDetailResponseDto,
  CustomerBookingListItemResponseDto,
  RescheduleBookingDto,
} from './dto';

@ApiTags('Customer Bookings')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-Organization-ID',
  description: 'Target Organization UUID or Public ID (e.g. ORG-0001)',
  required: true,
})
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Controller('customer/bookings')
export class CustomerBookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new customer laundry booking' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Optional unique client request key to prevent duplicate booking creation',
    required: false,
  })
  @ApiResponse({ status: 201, description: 'Booking successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid schedule, address, or item relationships' })
  @ApiResponse({ status: 404, description: 'Service, variant, or address not found' })
  async createBooking(
    @Body() dto: CreateBookingDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<CustomerBookingDetailResponseDto> {
    return this.bookingService.createBooking(user.id, org.organizationId, dto, idempotencyKey);
  }

  @Get()
  @ApiOperation({ summary: 'List customer bookings with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of bookings' })
  async getBookings(
    @Query() query: BookingQueryDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
  ) {
    return this.bookingService.getCustomerBookings(user.id, org.organizationId, query);
  }

  @Get(':bookingId')
  @ApiOperation({ summary: 'Get detailed booking representation with items, address snapshot, schedule, and notes' })
  @ApiParam({ name: 'bookingId', description: 'Booking UUID or Booking Number (e.g. WAS-2026-000001)' })
  @ApiResponse({ status: 200, description: 'Detailed booking representation' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getBookingById(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
  ): Promise<CustomerBookingDetailResponseDto> {
    return this.bookingService.getCustomerBookingById(user.id, org.organizationId, bookingId);
  }

  @Post(':bookingId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a customer booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking UUID or Booking Number' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Booking cannot be cancelled in its current status' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async cancelBooking(
    @Param('bookingId') bookingId: string,
    @Body() dto: CancelBookingDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
  ): Promise<CustomerBookingDetailResponseDto> {
    return this.bookingService.cancelCustomerBooking(user.id, org.organizationId, bookingId, dto);
  }

  @Post(':bookingId/reschedule')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reschedule a customer booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking UUID or Booking Number' })
  @ApiResponse({ status: 200, description: 'Booking rescheduled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid schedule or booking in terminal status' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async rescheduleBooking(
    @Param('bookingId') bookingId: string,
    @Body() dto: RescheduleBookingDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
  ): Promise<CustomerBookingDetailResponseDto> {
    return this.bookingService.rescheduleCustomerBooking(user.id, org.organizationId, bookingId, dto);
  }

  @Get(':bookingId/status-history')
  @ApiOperation({ summary: 'Get append-only status lifecycle history for a booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking UUID or Booking Number' })
  @ApiResponse({ status: 200, description: 'List of status history transitions' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getStatusHistory(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
  ): Promise<BookingStatusHistoryResponseDto[]> {
    return this.bookingService.getCustomerBookingStatusHistory(user.id, org.organizationId, bookingId);
  }

  @Get(':bookingId/notes')
  @ApiOperation({ summary: 'List notes for a customer booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking UUID or Booking Number' })
  @ApiResponse({ status: 200, description: 'List of booking notes' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getNotes(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
  ): Promise<BookingNoteResponseDto[]> {
    return this.bookingService.getCustomerBookingNotes(user.id, org.organizationId, bookingId);
  }

  @Post(':bookingId/notes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a new note to a customer booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking UUID or Booking Number' })
  @ApiResponse({ status: 201, description: 'Booking note successfully added' })
  @ApiResponse({ status: 400, description: 'Invalid note content' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async addNote(
    @Param('bookingId') bookingId: string,
    @Body() dto: CreateBookingNoteDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganization() org: OrganizationContext,
  ): Promise<BookingNoteResponseDto> {
    return this.bookingService.addCustomerBookingNote(user.id, org.organizationId, bookingId, dto);
  }
}
