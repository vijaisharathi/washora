import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ProcessPaymentDto {
  @ApiPropertyOptional({
    description: 'Gateway payment reference or transaction ID',
    example: 'mock_pay_ref_98765',
  })
  @IsOptional()
  @IsString()
  gatewayRef?: string;

  @ApiPropertyOptional({
    description: 'Gateway name if applicable',
    example: 'MOCK',
  })
  @IsOptional()
  @IsString()
  gatewayName?: string;

  @ApiPropertyOptional({
    description: 'Failure reason if payment failed',
    example: 'Bank server timeout',
  })
  @IsOptional()
  @IsString()
  failureReason?: string;
}
