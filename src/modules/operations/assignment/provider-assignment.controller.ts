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
import { ProviderService } from '../../provider/provider.service';
import { AssignmentService } from './assignment.service';
import { ProviderAssignmentQueryDto, RejectAssignmentDto } from './dto';
import {
  AssignmentHistoryResponseDto,
  ProviderAssignmentDetailDto,
  ProviderAssignmentListItemDto,
} from './dto/assignment-response.dto';

@ApiTags('Provider Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Roles(RoleType.PROVIDER)
@Controller('provider/assignments')
export class ProviderAssignmentController {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly providerService: ProviderService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List assignments offered to or accepted by the authenticated provider',
  })
  @ApiResponse({ status: 200, type: [ProviderAssignmentListItemDto] })
  async listAssignments(
    @CurrentOrganization() org: { id: string },
    @CurrentUser() user: { id: string },
    @Query() query: ProviderAssignmentQueryDto,
  ) {
    const provider = await this.providerService.resolveProvider(
      user.id,
      org.id,
    );
    return this.assignmentService.listProviderAssignments(
      provider.id,
      org.id,
      query,
    );
  }

  @Get(':assignmentId')
  @ApiOperation({
    summary:
      'Get assignment detail for authenticated provider with customer privacy redactions',
  })
  @ApiResponse({ status: 200, type: ProviderAssignmentDetailDto })
  async getAssignmentDetail(
    @CurrentOrganization() org: { id: string },
    @CurrentUser() user: { id: string },
    @Param('assignmentId') assignmentId: string,
  ): Promise<ProviderAssignmentDetailDto> {
    const provider = await this.providerService.resolveProvider(
      user.id,
      org.id,
    );
    return this.assignmentService.getProviderAssignmentDetail(
      assignmentId,
      provider.id,
      org.id,
    );
  }

  @Post(':assignmentId/accept')
  @ApiOperation({
    summary: 'Accept an assignment offered to the authenticated provider',
  })
  @ApiResponse({ status: 200, type: ProviderAssignmentDetailDto })
  async acceptAssignment(
    @CurrentOrganization() org: { id: string },
    @CurrentUser() user: { id: string },
    @Param('assignmentId') assignmentId: string,
  ): Promise<ProviderAssignmentDetailDto> {
    const provider = await this.providerService.resolveProvider(
      user.id,
      org.id,
    );
    return this.assignmentService.acceptProviderAssignment(
      assignmentId,
      provider.id,
      org.id,
      user.id,
    );
  }

  @Post(':assignmentId/reject')
  @ApiOperation({
    summary: 'Reject an assignment offered to the authenticated provider with mandatory reason',
  })
  @ApiResponse({ status: 200, type: ProviderAssignmentDetailDto })
  async rejectAssignment(
    @CurrentOrganization() org: { id: string },
    @CurrentUser() user: { id: string },
    @Param('assignmentId') assignmentId: string,
    @Body() dto: RejectAssignmentDto,
  ): Promise<ProviderAssignmentDetailDto> {
    const provider = await this.providerService.resolveProvider(
      user.id,
      org.id,
    );
    return this.assignmentService.rejectProviderAssignment(
      assignmentId,
      provider.id,
      org.id,
      user.id,
      dto.reason,
    );
  }

  @Get(':assignmentId/history')
  @ApiOperation({
    summary: 'View history timeline for provider assignment',
  })
  @ApiResponse({ status: 200, type: [AssignmentHistoryResponseDto] })
  async getAssignmentHistory(
    @CurrentOrganization() org: { id: string },
    @CurrentUser() user: { id: string },
    @Param('assignmentId') assignmentId: string,
  ): Promise<AssignmentHistoryResponseDto[]> {
    const provider = await this.providerService.resolveProvider(
      user.id,
      org.id,
    );
    return this.assignmentService.getProviderAssignmentHistory(
      assignmentId,
      provider.id,
      org.id,
    );
  }
}
