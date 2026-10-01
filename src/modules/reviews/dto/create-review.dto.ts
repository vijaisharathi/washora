import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { REVIEW_VALIDATION } from '../types/reviews.types';

export class CreateReviewDto {
  @ApiProperty({
    example: 'WAS-2026-000001',
    description: 'Booking ID or Booking Number for completed booking',
  })
  @IsString()
  @IsNotEmpty()
  bookingId!: string;

  @ApiProperty({
    example: 5,
    description: 'Integer star rating between 1 and 5',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({
    example: 'Excellent service',
    description: 'Review title (3 to 120 characters)',
    minLength: REVIEW_VALIDATION.TITLE_MIN_LENGTH,
    maxLength: REVIEW_VALIDATION.TITLE_MAX_LENGTH,
  })
  @IsString()
  @MinLength(REVIEW_VALIDATION.TITLE_MIN_LENGTH)
  @MaxLength(REVIEW_VALIDATION.TITLE_MAX_LENGTH)
  title!: string;

  @ApiProperty({
    example: 'Very professional, garments arrived impeccably clean and pressed.',
    description: 'Review comments (10 to 2000 characters)',
    minLength: REVIEW_VALIDATION.COMMENT_MIN_LENGTH,
    maxLength: REVIEW_VALIDATION.COMMENT_MAX_LENGTH,
  })
  @IsString()
  @MinLength(REVIEW_VALIDATION.COMMENT_MIN_LENGTH)
  @MaxLength(REVIEW_VALIDATION.COMMENT_MAX_LENGTH)
  comment!: string;
}
