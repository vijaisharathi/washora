import { ApiProperty } from '@nestjs/swagger';

export class CustomerPaymentSummaryDto {
  @ApiProperty({ description: 'Total amount paid by customer', example: '5400.00' })
  totalPaid!: string;

  @ApiProperty({ description: 'Total amount refunded to customer', example: '250.00' })
  totalRefunded!: string;

  @ApiProperty({ description: 'Pending payable amount on open bookings', example: '1250.00' })
  pendingAmount!: string;
}

export class OperationsFinancialSummaryDto {
  @ApiProperty({ description: 'Total gross payments collected', example: '250000.00' })
  grossPayments!: string;

  @ApiProperty({ description: 'Total refunds issued', example: '12500.00' })
  refunds!: string;

  @ApiProperty({ description: 'Total net earnings assigned to providers', example: '175000.00' })
  providerEarnings!: string;

  @ApiProperty({ description: 'Total net earnings assigned to delivery partners', example: '35000.00' })
  deliveryEarnings!: string;

  @ApiProperty({ description: 'Total platform retained commission', example: '27500.00' })
  platformCommission!: string;
}
