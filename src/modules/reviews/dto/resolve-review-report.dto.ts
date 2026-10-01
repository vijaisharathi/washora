import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { REVIEW_VALIDATION } from '../types/reviews.types';

export class ResolveReviewReportDto {
  @ApiProperty({
    example: 'Investigated and confirmed content violation; review has been hidden.',
    description: 'Resolution note recorded by operations (3 to 1000 characters)',
    minLength: REVIEW_VALIDATION.REPORT_RESOLUTION_NOTE_MIN_LENGTH,
    maxLength: REVIEW_VALIDATION.REPORT_RESOLUTION_NOTE_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(REVIEW_VALIDATION.REPORT_RESOLUTION_NOTE_MIN_LENGTH)
  @MaxLength(REVIEW_VALIDATION.REPORT_RESOLUTION_NOTE_MAX_LENGTH)
  resolutionNote!: string;
}
