import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { REVIEW_VALIDATION } from '../types/reviews.types';

export class ModerateReviewDto {
  @ApiPropertyOptional({
    example: 'Violates platform community guidelines regarding personal contact information.',
    description: 'Reason for moderation action (mandatory for HIDE and REJECT, 3 to 500 characters)',
    minLength: REVIEW_VALIDATION.MODERATION_REASON_MIN_LENGTH,
    maxLength: REVIEW_VALIDATION.MODERATION_REASON_MAX_LENGTH,
  })
  @IsOptional()
  @IsString()
  @MinLength(REVIEW_VALIDATION.MODERATION_REASON_MIN_LENGTH)
  @MaxLength(REVIEW_VALIDATION.MODERATION_REASON_MAX_LENGTH)
  reason?: string;
}
