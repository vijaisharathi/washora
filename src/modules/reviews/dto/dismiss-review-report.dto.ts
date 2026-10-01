import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { REVIEW_VALIDATION } from '../types/reviews.types';

export class DismissReviewReportDto {
  @ApiPropertyOptional({
    example: 'Review content reviewed; complies with community standards.',
    description: 'Dismissal reason or note recorded by operations (up to 1000 characters)',
    maxLength: REVIEW_VALIDATION.REPORT_RESOLUTION_NOTE_MAX_LENGTH,
  })
  @IsOptional()
  @IsString()
  @MaxLength(REVIEW_VALIDATION.REPORT_RESOLUTION_NOTE_MAX_LENGTH)
  resolutionNote?: string;
}
