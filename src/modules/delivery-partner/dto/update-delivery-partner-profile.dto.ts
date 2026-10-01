import { ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateDeliveryPartnerProfileDto {
  @ApiPropertyOptional({
    description: 'Full name of the delivery partner',
    example: 'Rajesh Kumar',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Contact phone number in E.164 or Indian 10-digit format',
    example: '+919876543210',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(?:\+91|91)?[6-9]\d{9}$/, {
    message: 'Phone must be a valid Indian mobile number',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Profile avatar photo URL',
    example: 'https://images.washora.com/avatars/dlp-rajesh.jpg',
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Profile image URL must be a valid URL' })
  profileImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Type of delivery vehicle',
    enum: VehicleType,
    example: VehicleType.BIKE,
  })
  @IsOptional()
  @IsEnum(VehicleType, {
    message: 'Vehicle type must be one of: BIKE, SCOOTER, EV_2W, VAN, OTHER',
  })
  vehicleType?: VehicleType;

  @ApiPropertyOptional({
    description: 'Vehicle registration license plate number',
    example: 'TN01AB1234',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$|^[A-Z0-9- ]{4,30}$/i, {
    message: 'Vehicle registration number format is invalid',
  })
  @MaxLength(30)
  vehicleNumber?: string;

  @ApiPropertyOptional({
    description: 'Primary operating city',
    example: 'Chennai',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;
}
