import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ValidateOfferResponseDto } from './validate-offer.dto';

export class RedeemOfferDto {
  @ApiProperty({ example: 'WAS-2026-000001', description: 'Booking ID or bookingNumber' })
  @IsString()
  @IsNotEmpty()
  bookingId!: string;
}

export class RedeemOfferResponseDto extends ValidateOfferResponseDto {
  @ApiProperty({ example: 'd1f81d11-5d9c-4f18-bc1e-8123e4567890' })
  redemptionId!: string;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z' })
  redeemedAt!: Date;
}
