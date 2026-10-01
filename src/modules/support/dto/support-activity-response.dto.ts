import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SupportActivityResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  ticketId!: string;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  actorUserId?: string | null;

  @ApiPropertyOptional({ example: 'Operations Lead Kumar' })
  actorName?: string | null;

  @ApiProperty({ example: 'STATUS_CHANGED' })
  action!: string;

  @ApiPropertyOptional({ example: 'OPEN' })
  previousValue?: string | null;

  @ApiPropertyOptional({ example: 'IN_PROGRESS' })
  newValue?: string | null;

  @ApiPropertyOptional({ example: { reason: 'Initial triage started' } })
  metadata?: Record<string, any> | null;

  @ApiProperty()
  createdAt!: Date;
}
