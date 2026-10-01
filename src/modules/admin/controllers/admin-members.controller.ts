import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
  CreateMemberDto,
  MemberQueryDto,
  UpdateMemberDto,
  UpdateMemberRolesDto,
} from '../dto/member-management.dto';
import { AdminMembersService } from '../services/admin-members.service';

@ApiTags('Admin — Organization Members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Controller('admin/organization/members')
export class AdminMembersController {
  constructor(private readonly membersService: AdminMembersService) {}

  @Get()
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'List organization members with pagination and filters' })
  async listMembers(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: MemberQueryDto,
  ) {
    const result = await this.membersService.listMembers(org.organizationId, query);
    return createPaginatedResponse(
      result.items,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  }

  @Get(':id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get organization member details' })
  async getMember(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') memberId: string,
  ) {
    const data = await this.membersService.getMember(org.organizationId, memberId);
    return createSuccessResponse(data);
  }

  @Post()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Invite/create organization member (Admin only)' })
  async createMember(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateMemberDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.membersService.createMember(org.organizationId, dto, user.id, ip);
    return createSuccessResponse(data);
  }

  @Patch(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Update member status or details (Admin only)' })
  async updateMember(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') memberId: string,
    @Body() dto: UpdateMemberDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.membersService.updateMember(org.organizationId, memberId, dto, user.id, ip);
    return createSuccessResponse(data);
  }

  @Patch(':id/roles')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Update member role (Admin only)' })
  async updateMemberRoles(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') memberId: string,
    @Body() dto: UpdateMemberRolesDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.membersService.updateMemberRoles(org.organizationId, memberId, dto, user.id, ip);
    return createSuccessResponse(data);
  }

  @Delete(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Remove member from organization (Admin only)' })
  async removeMember(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') memberId: string,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.membersService.removeMember(org.organizationId, memberId, user.id, ip);
    return createSuccessResponse(data);
  }
}
