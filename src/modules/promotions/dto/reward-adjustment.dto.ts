import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength, NotEquals } from 'class-validator';

export class RewardAdjustmentDto {
  @ApiProperty({
    example: 50,
    description: 'Points to adjust (positive to credit, negative to debit; non-zero)',
  })
  @IsInt()
  @NotEquals(0)
  points!: number;

  @ApiProperty({
    example: 'Customer courtesy credit for delayed delivery',
    description: 'Explicit operational reason for the balance adjustment',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  reason!: string;
}
