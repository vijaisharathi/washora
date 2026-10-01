import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { PaymentMethod } from '../types/financial.types';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Payment amount as exact decimal string with up to 2 decimal places',
    example: '1250.00',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'Amount must be a valid non-negative decimal string (e.g. 1250.00)',
  })
  amount!: string;

  @ApiPropertyOptional({
    description: 'Currency code',
    default: 'INR',
    example: 'INR',
  })
  @IsOptional()
  @IsString()
  currency?: string = 'INR';

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.UPI,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Gateway identifier (neutral/mock)',
    default: 'MOCK',
    example: 'MOCK',
  })
  @IsOptional()
  @IsString()
  gateway?: string = 'MOCK';
}
