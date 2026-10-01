import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';

export class UpdateProviderProfileDto {
  @ApiPropertyOptional({
    description: 'Full primary contact / owner name',
    example: 'Rajesh Kumar',
    minLength: 2,
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @Length(2, 120, { message: 'Full name must be between 2 and 120 characters' })
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Registered business/studio name',
    example: 'Sparkle Care Laundry Studios',
    minLength: 2,
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @Length(2, 150, { message: 'Business name must be between 2 and 150 characters' })
  businessName?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of provider studio and specialties',
    example: 'Specialized organic dry cleaning and express shoe spa service',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Operational business phone number (Indian mobile)',
    example: '+919876543210',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(?:(?:\+91)|(?:91)|(?:0))?[6789]\d{9}$/, {
    message: 'Phone must be a valid 10-digit Indian mobile number',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'City of operations',
    example: 'Chennai',
    maxLength: 80,
  })
  @IsOptional()
  @IsString()
  @Length(1, 80, { message: 'City must be between 1 and 80 characters' })
  city?: string;

  @ApiPropertyOptional({
    description: 'Physical workshop / studio address',
    example: '142, GST Road, Guindy Industrial Estate',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Public URL to provider avatar / logo image',
    example: 'https://images.washora.com/providers/logo-01.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Profile image must be a valid URL' })
  profileImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Public URL to provider cover / storefront photo',
    example: 'https://images.washora.com/providers/cover-01.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Cover image must be a valid URL' })
  coverImageUrl?: string;
}
