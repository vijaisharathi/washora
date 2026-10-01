import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DisputeActivityResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  disputeId!: string;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  actorUserId?: string | null;

  @ApiPropertyOptional({ example: 'Operations Lead Kumar' })
  actorName?: string | null;

  @ApiProperty({ example: 'INVESTIGATION_STARTED' })
  action!: string;

  @ApiPropertyOptional({ example: 'OPEN' })
  previousValue?: string | null;

  @ApiPropertyOptional({ example: 'UNDER_REVIEW' })
  newValue?: string | null;

  @ApiPropertyOptional({ example: 'Dispute investigation initiated by staff.' })
  details?: string | null;

  @ApiPropertyOptional({ example: { note: 'Reviewing pickup photos' } })
  metadata?: Record<string, any> | null;

  @ApiProperty()
  createdAt!: Date;
}
