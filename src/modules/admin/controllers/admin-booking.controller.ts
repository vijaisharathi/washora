import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import {
  createPaginatedResponse,
  createSuccessResponse,
} from '../../../common/utils/response.util';
import { CurrentOrganization } from '../../authorization/decorators/current-organization.decorator';
import { Roles } from '../../authorization/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../authorization/guards/organization.guard';
import { RolesGuard } from '../../authorization/guards/roles.guard';
import type { OrganizationContext } from '../../authorization/types/authorization.types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/types/auth.types';
import {
  AdminCancelBookingDto,
  AdminCreateBookingNoteDto,
  AdminRescheduleBookingDto,
  BookingAdminQueryDto,
} from '../dto/booking-admin.dto';
import { AdminBookingService } from '../services/admin-booking.service';

@ApiTags('Admin — Bookings Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Controller('admin/bookings')
export class AdminBookingController {
  constructor(private readonly bookingService: AdminBookingService) {}

  @Get()
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'List bookings with full filtering, pagination and sorting' })
  async listBookings(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: BookingAdminQueryDto,
  ) {
    const result = await this.bookingService.listBookings(org.organizationId, query);
    return createPaginatedResponse(
      result.items,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  }

  @Get(':id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get booking details with items, schedule, payment and notes' })
  async getBooking(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') bookingId: string,
  ) {
    const data = await this.bookingService.getBooking(org.organizationId, bookingId);
    return createSuccessResponse(data);
  }

  @Post(':id/cancel')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Cancel booking with reason and audit history' })
  async cancelBooking(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') bookingId: string,
    @Body() dto: AdminCancelBookingDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.bookingService.cancelBooking(
      org.organizationId,
      bookingId,
      dto,
      user.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  @Post(':id/reschedule')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Reschedule booking date and time slot' })
  async rescheduleBooking(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') bookingId: string,
    @Body() dto: AdminRescheduleBookingDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.bookingService.rescheduleBooking(
      org.organizationId,
      bookingId,
      dto,
      user.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  @Post(':id/notes')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Add internal operational note to booking' })
  async createBookingNote(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') bookingId: string,
    @Body() dto: AdminCreateBookingNoteDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.bookingService.createBookingNote(
      org.organizationId,
      bookingId,
      dto,
      user.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  @Get(':id/assignments')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get booking valet and provider assignments' })
  async getBookingAssignments(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') bookingId: string,
  ) {
    const data = await this.bookingService.getBookingAssignments(org.organizationId, bookingId);
    return createSuccessResponse(data);
  }

  @Get(':id/payments')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get booking payment records and refunds' })
  async getBookingPayments(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') bookingId: string,
  ) {
    const data = await this.bookingService.getBookingPayments(org.organizationId, bookingId);
    return createSuccessResponse(data);
  }

  @Get(':id/status-history')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get complete status change audit trail for booking' })
  async getBookingStatusHistory(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') bookingId: string,
  ) {
    const data = await this.bookingService.getBookingStatusHistory(org.organizationId, bookingId);
    return createSuccessResponse(data);
  }
}
