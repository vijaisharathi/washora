import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ReviewModerationAction,
  ReviewModerationReason,
  ReviewStatus,
} from '../types/reviews.types';

export class ModerationHistoryResponseDto {
  @ApiProperty({ example: 'hist-uuid-001' })
  id!: string;

  @ApiProperty({ example: 'rev-uuid-001' })
  reviewId!: string;

  @ApiProperty({ example: 'org-uuid-001' })
  organizationId!: string;

  @ApiProperty({ example: 'usr-uuid-001' })
  actorUserId!: string;

  @ApiProperty({ enum: ReviewStatus, example: ReviewStatus.PENDING })
  previousStatus!: ReviewStatus;

  @ApiProperty({ enum: ReviewStatus, example: ReviewStatus.PUBLISHED })
  newStatus!: ReviewStatus;

  @ApiProperty({ enum: ReviewModerationAction, example: ReviewModerationAction.PUBLISHED })
  action!: ReviewModerationAction;

  @ApiPropertyOptional({ enum: ReviewModerationReason, example: ReviewModerationReason.POLICY_VIOLATION })
  reason?: ReviewModerationReason | null;

  @ApiPropertyOptional({ example: 'Reviewed and verified to follow community standards.' })
  notes?: string | null;

  @ApiProperty({ example: '2026-09-12T10:00:00.000Z' })
  createdAt!: Date;
}
