import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { REVIEW_VALIDATION } from '../types/reviews.types';

export class CreateReviewResponseDto {
  @ApiProperty({
    example: 'Thank you for your warm feedback! We are delighted to serve you.',
    description: 'Provider response text (3 to 1000 characters)',
    minLength: REVIEW_VALIDATION.RESPONSE_MIN_LENGTH,
    maxLength: REVIEW_VALIDATION.RESPONSE_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(REVIEW_VALIDATION.RESPONSE_MIN_LENGTH)
  @MaxLength(REVIEW_VALIDATION.RESPONSE_MAX_LENGTH)
  comment!: string;
}
