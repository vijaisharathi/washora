import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SupportMessageResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: 'MSG-2026-000001' })
  publicId!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  ticketId!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  senderUserId!: string;

  @ApiPropertyOptional({ example: 'Support Agent Priya' })
  senderName?: string;

  @ApiPropertyOptional({ example: 'CUSTOMER' })
  senderRole?: string;

  @ApiProperty({ example: 'Thank you for updating. We are reviewing your issue.' })
  message!: string;

  @ApiProperty({ example: false })
  isInternal!: boolean;

  @ApiProperty()
  createdAt!: Date;
}
