import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { REVIEW_VALIDATION } from '../types/reviews.types';

export class UpdateReviewResponseDto {
  @ApiProperty({
    example: 'Updated response: Thank you again for choosing our premium service.',
    description: 'Updated provider response text (3 to 1000 characters)',
    minLength: REVIEW_VALIDATION.RESPONSE_MIN_LENGTH,
    maxLength: REVIEW_VALIDATION.RESPONSE_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(REVIEW_VALIDATION.RESPONSE_MIN_LENGTH)
  @MaxLength(REVIEW_VALIDATION.RESPONSE_MAX_LENGTH)
  comment!: string;
}
