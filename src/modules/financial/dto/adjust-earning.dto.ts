import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { EarningTransactionType } from '../types/financial.types';

export class AdjustEarningDto {
  @ApiProperty({
    description: 'Adjustment amount as signed decimal string (e.g. 50.00 or -25.00)',
    example: '50.00',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^-?\d+(\.\d{1,2})?$/, {
    message: 'Amount must be a signed decimal string with up to 2 decimal places',
  })
  adjustmentAmount!: string;

  @ApiProperty({
    description: 'Adjustment classification type',
    enum: [EarningTransactionType.BONUS, EarningTransactionType.ADJUSTMENT, EarningTransactionType.COMMISSION_DEDUCTION],
    example: EarningTransactionType.BONUS,
  })
  @IsNotEmpty()
  @IsEnum(EarningTransactionType)
  type!: EarningTransactionType;

  @ApiProperty({
    description: 'Reason and notes for financial adjustment',
    example: 'Performance bonus for high ratings and punctuality',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  notes!: string;
}
