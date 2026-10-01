import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentOrganization } from '../../authorization/decorators/current-organization.decorator';
import { Roles } from '../../authorization/decorators/roles.decorator';
import { OrganizationGuard } from '../../authorization/guards/organization.guard';
import { RolesGuard } from '../../authorization/guards/roles.guard';
import { AssignmentService } from './assignment.service';
import {
  CancelAssignmentDto,
  CreateDeliveryAssignmentDto,
  CreateProviderAssignmentDto,
  OperationsAssignmentQueryDto,
  ReassignAssignmentDto,
  UpdateAssignmentDto,
} from './dto';
import {
  AssignmentHistoryResponseDto,
  AssignmentListItemResponseDto,
  AssignmentResponseDto,
  CandidateDeliveryPartnerResponseDto,
  CandidateProviderResponseDto,
} from './dto/assignment-response.dto';

@ApiTags('Operations Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Roles(RoleType.ADMIN, RoleType.OPERATIONS)
@Controller('operations')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Get('assignments')
  @ApiOperation({
    summary: 'List all operational assignments with multi-dimensional filters',
  })
  @ApiResponse({ status: 200, type: [AssignmentListItemResponseDto] })
  async listAssignments(
    @CurrentOrganization() org: { id: string },
    @Query() query: OperationsAssignmentQueryDto,
  ) {
    return this.assignmentService.listOperationsAssignments(org.id, query);
  }

  @Get('assignments/:assignmentId')
  @ApiOperation({
    summary: 'Get full operational assignment detail with relations and history',
  })
  @ApiResponse({ status: 200, type: AssignmentResponseDto })
  async getAssignmentDetail(
    @CurrentOrganization() org: { id: string },
    @Param('assignmentId') assignmentId: string,
  ): Promise<AssignmentResponseDto> {
    return this.assignmentService.getAssignmentDetail(assignmentId, org.id);
  }

  @Get('assignments/:assignmentId/history')
  @ApiOperation({
    summary: 'Get immutable audit timeline for an assignment',
  })
  @ApiResponse({ status: 200, type: [AssignmentHistoryResponseDto] })
  async getAssignmentHistory(
    @CurrentOrganization() org: { id: string },
    @Param('assignmentId') assignmentId: string,
  ): Promise<AssignmentHistoryResponseDto[]> {
    return this.assignmentService.getAssignmentHistory(assignmentId, org.id);
  }

  @Post('bookings/:bookingId/provider-assignment')
  @ApiOperation({
    summary: 'Create and assign an eligible Provider to a booking',
  })
  @ApiResponse({ status: 201, type: AssignmentResponseDto })
  async createProviderAssignment(
    @CurrentOrganization() org: { id: string },
    @CurrentUser() user: { id: string },
    @Param('bookingId') bookingId: string,
    @Body() dto: CreateProviderAssignmentDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<AssignmentResponseDto> {
    return this.assignmentService.createProviderAssignment(
      bookingId,
      dto,
      org.id,
      user.id,
      idempotencyKey,
    );
  }

  @Post('bookings/:bookingId/delivery-assignment')
  @ApiOperation({
    summary: 'Create and assign an eligible Delivery Partner to a booking',
  })
  @ApiResponse({ status: 201, type: AssignmentResponseDto })
  async createDeliveryAssignment(
    @CurrentOrganization() org: { id: string },
    @CurrentUser() user: { id: string },
    @Param('bookingId') bookingId: string,
    @Body() dto: CreateDeliveryAssignmentDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<AssignmentResponseDto> {
    return this.assignmentService.createDeliveryAssignment(
      bookingId,
      dto,
      org.id,
      user.id,
      idempotencyKey,
    );
  }

  @Patch('assignments/:assignmentId')
  @ApiOperation({
    summary: 'Update assignment notes/operational instructions',
  })
  @ApiResponse({ status: 200, type: AssignmentResponseDto })
  async updateAssignment(
    @CurrentOrganization() org: { id: string },
    @Param('assignmentId') assignmentId: string,
    @Body() dto: UpdateAssignmentDto,
  ): Promise<AssignmentResponseDto> {
    return this.assignmentService.updateAssignmentNotes(
      assignmentId,
      dto.notes,
      org.id,
    );
  }

  @Post('assignments/:assignmentId/cancel')
  @ApiOperation({
    summary: 'Force-cancel an operational assignment with mandatory reason',
  })
  @ApiResponse({ status: 200, type: AssignmentResponseDto })
  async cancelAssignment(
    @CurrentOrganization() org: { id: string },
    @CurrentUser() user: { id: string },
    @Param('assignmentId') assignmentId: string,
    @Body() dto: CancelAssignmentDto,
  ): Promise<AssignmentResponseDto> {
    return this.assignmentService.cancelAssignment(
      assignmentId,
      dto.reason,
      org.id,
      user.id,
    );
  }

  @Post('assignments/:assignmentId/reassign')
  @ApiOperation({
    summary:
      'Atomically reassign assignment to a new eligible candidate with history preserved',
  })
  @ApiResponse({ status: 200, type: AssignmentResponseDto })
  async reassignAssignment(
    @CurrentOrganization() org: { id: string },
    @CurrentUser() user: { id: string },
    @Param('assignmentId') assignmentId: string,
    @Body() dto: ReassignAssignmentDto,
  ): Promise<AssignmentResponseDto> {
    return this.assignmentService.reassignAssignment(
      assignmentId,
      dto,
      org.id,
      user.id,
    );
  }

  @Get('bookings/:bookingId/eligible-providers')
  @ApiOperation({
    summary:
      'Evaluate and discover all eligible candidate providers for a booking',
  })
  @ApiResponse({ status: 200, type: [CandidateProviderResponseDto] })
  async getEligibleProviders(
    @CurrentOrganization() org: { id: string },
    @Param('bookingId') bookingId: string,
  ): Promise<CandidateProviderResponseDto[]> {
    return this.assignmentService.getEligibleProviders(bookingId, org.id);
  }

  @Get('bookings/:bookingId/eligible-delivery-partners')
  @ApiOperation({
    summary:
      'Evaluate and discover all eligible candidate delivery partners for a booking',
  })
  @ApiResponse({ status: 200, type: [CandidateDeliveryPartnerResponseDto] })
  async getEligibleDeliveryPartners(
    @CurrentOrganization() org: { id: string },
    @Param('bookingId') bookingId: string,
  ): Promise<CandidateDeliveryPartnerResponseDto[]> {
    return this.assignmentService.getEligibleDeliveryPartners(
      bookingId,
      org.id,
    );
  }
}
