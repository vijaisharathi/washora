import { ApiProperty } from '@nestjs/swagger';

export class RatingDistributionDto {
  @ApiProperty({ example: 45, description: 'Count of 5-star ratings' })
  '5'!: number;

  @ApiProperty({ example: 20, description: 'Count of 4-star ratings' })
  '4'!: number;

  @ApiProperty({ example: 5, description: 'Count of 3-star ratings' })
  '3'!: number;

  @ApiProperty({ example: 2, description: 'Count of 2-star ratings' })
  '2'!: number;

  @ApiProperty({ example: 1, description: 'Count of 1-star ratings' })
  '1'!: number;
}
