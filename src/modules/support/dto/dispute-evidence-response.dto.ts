import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DisputeEvidenceResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiPropertyOptional({ example: 'EVD-2026-000001' })
  publicId?: string | null;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  disputeId!: string;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  submittedByUserId?: string | null;

  @ApiPropertyOptional({ example: 'Customer John' })
  submittedByName?: string | null;

  @ApiProperty({ example: 'Damaged cuff photo' })
  title!: string;

  @ApiPropertyOptional({ example: 'Close up photo of the torn stitch...' })
  description?: string | null;

  @ApiProperty({ example: 'PHOTO' })
  fileType!: string;

  @ApiProperty({ example: 'damaged_cuff.jpg' })
  fileName?: string | null;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType?: string | null;

  @ApiProperty({ example: 1024000 })
  fileSize?: number | null;

  @ApiProperty({ example: 'mock-storage://disputes/ORG-0001/DSP-0001/damaged_cuff.jpg' })
  fileUrl!: string;

  @ApiProperty({ example: 'SUBMITTED' })
  status!: string;

  @ApiPropertyOptional({ example: 'Image is too blurry to evaluate damage.' })
  rejectionReason?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
