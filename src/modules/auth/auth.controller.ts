import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { CurrentSessionId } from './decorators/current-session.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import {
  AuthUserResponseDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  LoginResponseDto,
  MessageResponseDto,
  RefreshResponseDto,
  RefreshTokenDto,
  RegisterDto,
  ResendVerificationDto,
  ResetPasswordDto,
  SessionResponseDto,
  VerifyEmailDto,
  SelectOrganizationDto,
  OrganizationMembershipResponseDto,
  OrganizationContextResponseDto,
} from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentOrganization, CurrentMembership } from '../authorization/decorators';
import { OrganizationGuard } from '../authorization/guards/organization.guard';
import type { AuthenticatedUser } from './types/auth.types';
import type { OrganizationContext, MemberSummary } from '../authorization/types/authorization.types';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user identity account' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed',
  })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip;
    const userAgent = req.headers['user-agent'];
    return this.authService.register(dto, { ip, userAgent });
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate credentials and issue session token pair' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully authenticated',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid email or password',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Account suspended, inactive or pending',
  })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<LoginResponseDto> {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip;
    const userAgent = req.headers['user-agent'];
    return this.authService.login(dto, { ip, userAgent });
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and issue new token pair' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refreshed successfully',
    type: RefreshResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid, expired, or reused refresh token',
  })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
  ): Promise<RefreshResponseDto> {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip;
    return this.authService.refresh(dto, { ip });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke the current active session' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session logged out successfully',
    type: MessageResponseDto,
  })
  async logout(
    @CurrentUser('id') userId: string,
    @CurrentSessionId() sessionId: string,
  ): Promise<MessageResponseDto> {
    return this.authService.logout(userId, sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke all active sessions belonging to the user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All sessions logged out successfully',
    type: MessageResponseDto,
  })
  async logoutAll(
    @CurrentUser('id') userId: string,
  ): Promise<MessageResponseDto> {
    return this.authService.logoutAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated identity information' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Safe user identity details',
    type: AuthUserResponseDto,
  })
  async getMe(@CurrentUser('id') userId: string): Promise<AuthUserResponseDto> {
    return this.authService.getMe(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('organizations')
  @ApiOperation({ summary: 'List all organizations the authenticated user belongs to' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of accessible organizations with role and membership status',
    type: [OrganizationMembershipResponseDto],
  })
  async getOrganizations(
    @CurrentUser('id') userId: string,
  ): Promise<OrganizationMembershipResponseDto[]> {
    return this.authService.getUserOrganizations(userId);
  }

  @UseGuards(JwtAuthGuard, OrganizationGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('organizations/current')
  @ApiOperation({ summary: 'Get current resolved organization context, membership, and permissions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current organization context, membership details, and effective permissions',
    type: OrganizationContextResponseDto,
  })
  async getCurrentOrganization(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentMembership() mem: MemberSummary,
  ): Promise<OrganizationContextResponseDto> {
    return {
      organization: {
        organizationId: org.organizationId,
        publicId: org.publicId,
        name: org.name,
        type: org.type,
      },
      membership: {
        membershipId: mem.id,
        fullName: mem.fullName,
        role: mem.role,
        status: mem.status,
      },
      role: org.role,
      permissions: org.permissions,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post('organizations/select')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Select active organization context' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active organization selected successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not belong to organization or membership is inactive',
  })
  async selectOrganization(
    @CurrentUser('id') userId: string,
    @Body() dto: SelectOrganizationDto,
  ) {
    return this.authService.selectOrganization(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('sessions')
  @ApiOperation({ summary: 'List active sessions for current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of active sessions',
    type: [SessionResponseDto],
  })
  async listSessions(
    @CurrentUser('id') userId: string,
    @CurrentSessionId() currentSessionId: string,
  ): Promise<SessionResponseDto[]> {
    return this.authService.listSessions(userId, currentSessionId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Delete('sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke a specific session belonging to current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session revoked successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found or belongs to another user',
  })
  async revokeSession(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<MessageResponseDto> {
    return this.authService.revokeSession(userId, sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password and revoke other sessions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password changed successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Current password is incorrect',
  })
  async changePassword(
    @CurrentUser('id') userId: string,
    @CurrentSessionId() currentSessionId: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<MessageResponseDto> {
    return this.authService.changePassword(userId, currentSessionId, dto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address with verification token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email verified successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired verification token',
  })
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<MessageResponseDto> {
    return this.authService.verifyEmail(dto);
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend email verification instructions (non-enumerating)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Verification instructions resent',
    type: MessageResponseDto,
  })
  async resendVerification(
    @Body() dto: ResendVerificationDto,
  ): Promise<MessageResponseDto> {
    return this.authService.resendVerification(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset instructions (non-enumerating)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset instructions generated',
    type: MessageResponseDto,
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<MessageResponseDto> {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with reset token and revoke existing sessions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired reset token',
  })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<MessageResponseDto> {
    return this.authService.resetPassword(dto);
  }
}
