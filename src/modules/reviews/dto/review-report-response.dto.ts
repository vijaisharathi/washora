import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ReviewReportReason,
  ReviewReportStatus,
} from '../types/reviews.types';

export class ReviewReportResponseDto {
  @ApiProperty({ example: 'rpt-uuid-001' })
  id!: string;

  @ApiProperty({ example: 'RPT-2026-000001' })
  publicId!: string;

  @ApiProperty({ example: 'org-uuid-001' })
  organizationId!: string;

  @ApiProperty({ example: 'rev-uuid-001' })
  reviewId!: string;

  @ApiPropertyOptional({ example: 'REV-2026-000001' })
  reviewPublicId?: string;

  @ApiProperty({ example: 'usr-uuid-reporter' })
  reportedByUserId!: string;

  @ApiProperty({ enum: ReviewReportReason, example: ReviewReportReason.INAPPROPRIATE_CONTENT })
  reason!: ReviewReportReason;

  @ApiPropertyOptional({ example: 'Abusive language detected' })
  description?: string | null;

  @ApiProperty({ enum: ReviewReportStatus, example: ReviewReportStatus.OPEN })
  status!: ReviewReportStatus;

  @ApiProperty({ example: '2026-09-12T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-12T10:00:00.000Z' })
  updatedAt!: Date;

  @ApiPropertyOptional({ example: '2026-09-12T11:00:00.000Z' })
  resolvedAt?: Date | null;

  @ApiPropertyOptional({ example: 'usr-uuid-admin' })
  resolvedByUserId?: string | null;

  @ApiPropertyOptional({ example: 'Content hidden after investigation' })
  resolutionNote?: string | null;
}
