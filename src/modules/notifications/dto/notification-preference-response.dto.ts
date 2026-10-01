import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationPreferenceResponseDto {
  @ApiProperty({ example: 'b6f9e612-5eb3-4638-b719-74d75f284e92' })
  userId!: string;

  @ApiProperty({ example: 'b6f9e612-5eb3-4638-b719-74d75f284e90' })
  organizationId!: string;

  @ApiProperty({ example: true })
  inAppEnabled!: boolean;

  @ApiProperty({ example: true })
  emailEnabled!: boolean;

  @ApiProperty({ example: false })
  smsEnabled!: boolean;

  @ApiProperty({ example: true })
  whatsappEnabled!: boolean;

  @ApiProperty({ example: true })
  pushEnabled!: boolean;

  @ApiProperty({ example: true })
  orderUpdates!: boolean;

  @ApiProperty({ example: true })
  marketingOffers!: boolean;

  @ApiProperty({ example: true })
  systemAlerts!: boolean;

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
  })
  categories?: any;

  @ApiProperty({ example: '2026-09-12T09:00:00.000Z' })
  updatedAt!: Date;
}
