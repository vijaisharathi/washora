import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional } from 'class-validator';

export class UpdateNotificationPreferenceDto {
  @ApiPropertyOptional({ example: true, description: 'Enable in-app notifications' })
  @IsOptional()
  @IsBoolean()
  inAppEnabled?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Enable email notifications' })
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Enable SMS notifications' })
  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Enable WhatsApp notifications' })
  @IsOptional()
  @IsBoolean()
  whatsappEnabled?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Enable push notifications' })
  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Enable order updates' })
  @IsOptional()
  @IsBoolean()
  orderUpdates?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Enable marketing offers' })
  @IsOptional()
  @IsBoolean()
  marketingOffers?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Enable system alerts (security bypass applies)' })
  @IsOptional()
  @IsBoolean()
  systemAlerts?: boolean;

  @ApiPropertyOptional({
    example: {
      BOOKING: true,
      ASSIGNMENT: true,
      PAYMENT: true,
      EARNINGS: true,
      PROMOTIONS: false,
      REVIEWS: true,
      SECURITY: true,
      SYSTEM: true,
    },
    description: 'Category-specific toggles (SECURITY cannot be disabled)',
  })
  @IsOptional()
  @IsObject()
  categories?: Record<string, boolean>;
}
