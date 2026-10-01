import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { REVIEW_VALIDATION } from '../types/reviews.types';

export class UpdateReviewDto {
  @ApiPropertyOptional({
    example: 4,
    description: 'Updated integer star rating between 1 and 5',
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    example: 'Great service after second inspection',
    description: 'Updated review title (3 to 120 characters)',
    minLength: REVIEW_VALIDATION.TITLE_MIN_LENGTH,
    maxLength: REVIEW_VALIDATION.TITLE_MAX_LENGTH,
  })
  @IsOptional()
  @IsString()
  @MinLength(REVIEW_VALIDATION.TITLE_MIN_LENGTH)
  @MaxLength(REVIEW_VALIDATION.TITLE_MAX_LENGTH)
  title?: string;

  @ApiPropertyOptional({
    example: 'Revised review: The care on the wool items was particularly good.',
    description: 'Updated review comment (10 to 2000 characters)',
    minLength: REVIEW_VALIDATION.COMMENT_MIN_LENGTH,
    maxLength: REVIEW_VALIDATION.COMMENT_MAX_LENGTH,
  })
  @IsOptional()
  @IsString()
  @MinLength(REVIEW_VALIDATION.COMMENT_MIN_LENGTH)
  @MaxLength(REVIEW_VALIDATION.COMMENT_MAX_LENGTH)
  comment?: string;
}
