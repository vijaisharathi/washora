import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RefundStatus } from '../types/financial.types';

export class ProcessRefundDto {
  @ApiProperty({
    description: 'Target refund status',
    enum: [RefundStatus.PROCESSED, RefundStatus.FAILED, RefundStatus.REJECTED],
    example: RefundStatus.PROCESSED,
  })
  @IsEnum(RefundStatus)
  status!: RefundStatus;

  @ApiPropertyOptional({
    description: 'Gateway refund reference or acknowledgement identifier',
    example: 'mock_gw_ref_998877',
  })
  @IsOptional()
  @IsString()
  gatewayRefundRef?: string;
}
