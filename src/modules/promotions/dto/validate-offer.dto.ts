import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { DiscountType, OfferType } from '../types/promotions.types';

export class ValidateOfferDto {
  @ApiProperty({ example: 'WAS-2026-000001', description: 'Booking ID or bookingNumber' })
  @IsString()
  @IsNotEmpty()
  bookingId!: string;
}

export class ValidateOfferResponseDto {
  @ApiProperty({ example: true })
  valid!: boolean;

  @ApiProperty({
    example: {
      id: 'f0f81d11-5d9c-4f18-bc1e-8123e4567890',
      publicId: 'OFF-2026-000001',
      name: 'Welcome 20% Off',
      offerType: OfferType.WELCOME,
      discountType: DiscountType.PERCENTAGE,
      discountValue: '20.00',
    },
  })
  offer!: {
    id: string;
    publicId: string;
    name: string;
    offerType: OfferType;
    discountType: DiscountType;
    discountValue: string;
  };

  @ApiProperty({ example: '150.00' })
  discountAmount!: string;

  @ApiProperty({ example: '1350.00' })
  finalAmount!: string;
}
