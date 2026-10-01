import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleType, UserStatus } from '@prisma/client';
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
import { UserQueryDto } from '../dto/entity-admin.dto';
import { AdminUsersService } from '../services/admin-users.service';

@ApiTags('Admin — User Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: AdminUsersService) {}

  @Get()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'List platform users with status, search and pagination (Admin only)' })
  async listUsers(@Query() query: UserQueryDto) {
    const result = await this.usersService.listUsers(query);
    return createPaginatedResponse(
      result.items,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  }

  @Get(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Get user details with profiles and memberships (Admin only)' })
  async getUser(@Param('id') userId: string) {
    const data = await this.usersService.getUser(userId);
    return createSuccessResponse(data);
  }

  @Patch(':id/status')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Update user status and revoke sessions on suspension (Admin only)' })
  async updateUserStatus(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') userId: string,
    @Body('status') status: UserStatus,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.usersService.updateUserStatus(
      userId,
      status,
      user.id,
      org.organizationId,
      ip,
    );
    return createSuccessResponse(data);
  }
}
