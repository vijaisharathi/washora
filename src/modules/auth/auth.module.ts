import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    PasswordService,
    TokenService,
    JwtAuthGuard,
  ],
  exports: [
    AuthService,
    AuthRepository,
    PasswordService,
    TokenService,
    JwtAuthGuard,
  ],
})
export class AuthModule {}
