import { ApiPropertyOptional } from '@nestjs/swagger';
import { AddressLabel } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class UpdateAddressDto {
  @ApiPropertyOptional({
    description: 'Address label category',
    enum: AddressLabel,
    example: AddressLabel.WORK,
  })
  @IsOptional()
  @IsEnum(AddressLabel, {
    message: 'Label must be one of HOME, WORK, or OTHER',
  })
  label?: AddressLabel;

  @ApiPropertyOptional({
    description: 'Name of the recipient at this address',
    example: 'John Doe',
    minLength: 2,
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @Length(2, 120, { message: 'Recipient name must be between 2 and 120 characters' })
  recipientName?: string;

  @ApiPropertyOptional({
    description: 'Contact phone number of the recipient',
    example: '+919876543210',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(?:(?:\+91)|(?:91)|(?:0))?[6789]\d{9}$/, {
    message: 'Recipient phone must be a valid 10-digit Indian mobile number',
  })
  recipientPhone?: string;

  @ApiPropertyOptional({
    description: 'Primary street address and door / house number',
    example: '12 Example Street',
    minLength: 3,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(3, 200, { message: 'Address line 1 must be between 3 and 200 characters' })
  addressLine1?: string;

  @ApiPropertyOptional({
    description: 'Secondary address details, apartment, suite or floor',
    example: 'Apartment 4B',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(0, 200, { message: 'Address line 2 must not exceed 200 characters' })
  addressLine2?: string;

  @ApiPropertyOptional({
    description: 'Locality or area name',
    example: 'Anna Nagar',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Area must be between 1 and 100 characters' })
  area?: string;

  @ApiPropertyOptional({
    description: 'City name',
    example: 'Chennai',
    maxLength: 80,
  })
  @IsOptional()
  @IsString()
  @Length(1, 80, { message: 'City must be between 1 and 80 characters' })
  city?: string;

  @ApiPropertyOptional({
    description: 'State name',
    example: 'Tamil Nadu',
    maxLength: 80,
  })
  @IsOptional()
  @IsString()
  @Length(1, 80, { message: 'State must be between 1 and 80 characters' })
  state?: string;

  @ApiPropertyOptional({
    description: '6-digit Indian Postal Code / PIN code',
    example: '600040',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[1-9][0-9]{5}$/, {
    message: 'Postal code must be a valid 6-digit Indian PIN code',
  })
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Prominent nearby landmark',
    example: 'Near Metro Station',
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @Length(0, 150, { message: 'Landmark must not exceed 150 characters' })
  landmark?: string;

  @ApiPropertyOptional({
    description: 'Latitude coordinates (-90 to 90)',
    example: 13.085,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude coordinates (-180 to 180)',
    example: 80.21,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Set as default address for future orders',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
