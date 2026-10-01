import { ApiProperty } from '@nestjs/swagger';
import { RatingDistributionDto } from './rating-distribution.dto';

export class ReviewSummaryDto {
  @ApiProperty({
    example: '4.72',
    description: 'Decimal-safe average rating with 2 decimal places',
  })
  averageRating!: string;

  @ApiProperty({
    example: 73,
    description: 'Total number of published reviews',
  })
  totalReviews!: number;

  @ApiProperty({
    type: RatingDistributionDto,
    description: 'Breakdown of review counts by star rating',
  })
  ratingDistribution!: RatingDistributionDto;
}
