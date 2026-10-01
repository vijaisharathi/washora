import {
  Body,
  Controller,
  Get,
  Param,
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
import { DeliveryPartnerService } from '../../delivery-partner/delivery-partner.service';
import { AssignmentService } from './assignment.service';
import { DeliveryPartnerAssignmentQueryDto, RejectAssignmentDto } from './dto';
import {
  AssignmentHistoryResponseDto,
  DeliveryPartnerAssignmentDetailDto,
  DeliveryPartnerAssignmentListItemDto,
} from './dto/assignment-response.dto';

@ApiTags('Delivery Partner Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Roles(RoleType.DELIVERY_PARTNER)
@Controller('delivery-partner/assignments')
export class DeliveryPartnerAssignmentController {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly deliveryPartnerService: DeliveryPartnerService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'List delivery assignments offered to or accepted by the authenticated partner',
  })
  @ApiResponse({ status: 200, type: [DeliveryPartnerAssignmentListItemDto] })
  async listAssignments(
    @CurrentOrganization() org: { id: string },
    @CurrentUser() user: { id: string },
    @Query() query: DeliveryPartnerAssignmentQueryDto,
  ) {
    const partner = await this.deliveryPartnerService.resolveDeliveryPartner(
      user.id,
      org.id,
    );
    return this.assignmentService.listDeliveryPartnerAssignments(
      partner.id,
      org.id,
      query,
    );
  }

  @Get(':assignmentId')
  @ApiOperation({
    summary:
      'Get task details for authenticated delivery partner with pickup/delivery addresses',
  })
  @ApiResponse({ status: 200, type: DeliveryPartnerAssignmentDetailDto })
  async getAssignmentDetail(
    @CurrentOrganization() org: { id: string },
    @CurrentUser() user: { id: string },
    @Param('assignmentId') assignmentId: string,
  ): Promise<DeliveryPartnerAssignmentDetailDto> {
    const partner = await this.deliveryPartnerService.resolveDeliveryPartner(
      user.id,
      org.id,
    );
    return this.assignmentService.getDeliveryPartnerAssignmentDetail(
      assignmentId,
      partner.id,
      org.id,
    );
  }

  @Post(':assignmentId/accept')
  @ApiOperation({
    summary: 'Accept an assignment offered to the authenticated delivery partner',
  })
  @ApiResponse({ status: 200, type: DeliveryPartnerAssignmentDetailDto })
  async acceptAssignment(
    @CurrentOrganization() org: { id: string },
    @CurrentUser() user: { id: string },
    @Param('assignmentId') assignmentId: string,
  ): Promise<DeliveryPartnerAssignmentDetailDto> {
    const partner = await this.deliveryPartnerService.resolveDeliveryPartner(
      user.id,
      org.id,
    );
    return this.assignmentService.acceptDeliveryPartnerAssignment(
      assignmentId,
      partner.id,
      org.id,
      user.id,
    );
  }

  @Post(':assignmentId/reject')
  @ApiOperation({
    summary:
      'Reject an assignment offered to the authenticated delivery partner with mandatory reason',
  })
  @ApiResponse({ status: 200, type: DeliveryPartnerAssignmentDetailDto })
  async rejectAssignment(
    @CurrentOrganization() org: { id: string },
    @CurrentUser() user: { id: string },
    @Param('assignmentId') assignmentId: string,
    @Body() dto: RejectAssignmentDto,
  ): Promise<DeliveryPartnerAssignmentDetailDto> {
    const partner = await this.deliveryPartnerService.resolveDeliveryPartner(
      user.id,
      org.id,
    );
    return this.assignmentService.rejectDeliveryPartnerAssignment(
      assignmentId,
      partner.id,
      org.id,
      user.id,
      dto.reason,
    );
  }

  @Get(':assignmentId/history')
  @ApiOperation({
    summary: 'View history timeline for delivery partner assignment',
  })
  @ApiResponse({ status: 200, type: [AssignmentHistoryResponseDto] })
  async getAssignmentHistory(
    @CurrentOrganization() org: { id: string },
    @CurrentUser() user: { id: string },
    @Param('assignmentId') assignmentId: string,
  ): Promise<AssignmentHistoryResponseDto[]> {
    const partner = await this.deliveryPartnerService.resolveDeliveryPartner(
      user.id,
      org.id,
    );
    return this.assignmentService.getDeliveryPartnerAssignmentHistory(
      assignmentId,
      partner.id,
      org.id,
    );
  }
}
