import { ApiProperty } from '@nestjs/swagger';

export class EarningSummaryDto {
  @ApiProperty({ description: 'Total gross earnings generated', example: '15000.00' })
  grossEarnings!: string;

  @ApiProperty({ description: 'Total platform commission deducted', example: '2250.00' })
  commission!: string;

  @ApiProperty({ description: 'Net approved adjustments / bonuses', example: '150.00' })
  adjustments!: string;

  @ApiProperty({ description: 'Total net earnings payable', example: '12900.00' })
  netEarnings!: string;

  @ApiProperty({ description: 'Earnings currently available for payout', example: '8500.00' })
  available!: string;

  @ApiProperty({ description: 'Total earnings already paid out', example: '4400.00' })
  paid!: string;

  @ApiProperty({ description: 'Earnings on hold or pending completion', example: '0.00' })
  onHold!: string;
}
