import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DisputeMessageResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: 'DMSG-2026-000001' })
  publicId!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  disputeId!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  senderUserId!: string;

  @ApiPropertyOptional({ example: 'Operations Lead Kumar' })
  senderName?: string;

  @ApiPropertyOptional({ example: 'CUSTOMER' })
  senderRole?: string;

  @ApiProperty({ example: 'Evidence review has commenced.' })
  message!: string;

  @ApiProperty({ example: false })
  isInternal!: boolean;

  @ApiProperty()
  createdAt!: Date;
}
