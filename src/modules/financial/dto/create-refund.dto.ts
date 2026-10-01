import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateRefundDto {
  @ApiProperty({
    description: 'Refund amount as exact decimal string',
    example: '250.00',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'Amount must be a valid positive decimal string (e.g. 250.00)',
  })
  amount!: string;

  @ApiProperty({
    description: 'Reason for issuing refund',
    example: 'Customer cancelled booking prior to pickup window',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  reason!: string;

  @ApiPropertyOptional({
    description: 'Currency code',
    default: 'INR',
    example: 'INR',
  })
  @IsOptional()
  @IsString()
  currency?: string = 'INR';

  @ApiPropertyOptional({
    description: 'Optional gateway refund reference',
    example: 'mock_ref_ref_12345',
  })
  @IsOptional()
  @IsString()
  gatewayRefundRef?: string;
}
