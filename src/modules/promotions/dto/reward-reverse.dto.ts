import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RewardReverseDto {
  @ApiProperty({
    example: 'Reversal due to booking order cancellation and refund',
    description: 'Explicit operational reason for the transaction reversal',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  reason!: string;
}
