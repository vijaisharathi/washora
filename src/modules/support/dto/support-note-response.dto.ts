import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SupportNoteResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiPropertyOptional({ example: 'NOT-2026-000001' })
  publicId?: string | null;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  ticketId!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  authorUserId!: string;

  @ApiPropertyOptional({ example: 'Operations Lead Kumar' })
  authorName?: string;

  @ApiProperty({ example: 'Spoke with partner team; provider re-confirmed schedule.' })
  note!: string;

  @ApiProperty({ example: true })
  isInternalOnly!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
