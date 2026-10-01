import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { REVIEW_VALIDATION, ReviewReportReason } from '../types/reviews.types';

export class CreateReviewReportDto {
  @ApiProperty({
    enum: ReviewReportReason,
    example: ReviewReportReason.INAPPROPRIATE_CONTENT,
    description: 'Categorical reason for reporting review',
  })
  @IsEnum(ReviewReportReason)
  @IsNotEmpty()
  reason!: ReviewReportReason;

  @ApiPropertyOptional({
    example: 'This review contains offensive language and false accusations.',
    description: 'Detailed description of the abuse or policy violation (up to 1000 characters)',
    maxLength: REVIEW_VALIDATION.REPORT_DESCRIPTION_MAX_LENGTH,
  })
  @IsOptional()
  @IsString()
  @MaxLength(REVIEW_VALIDATION.REPORT_DESCRIPTION_MAX_LENGTH)
  description?: string;
}
