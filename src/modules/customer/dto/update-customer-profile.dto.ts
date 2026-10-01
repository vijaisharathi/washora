import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';

export class UpdateCustomerProfileDto {
  @ApiPropertyOptional({
    description: 'Full name of the customer',
    example: 'John Doe',
    minLength: 2,
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @Length(2, 120, { message: 'Full name must be between 2 and 120 characters' })
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Indian mobile phone number with or without +91 country code',
    example: '+919876543210',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(?:(?:\+91)|(?:91)|(?:0))?[6789]\d{9}$/, {
    message: 'Phone must be a valid 10-digit Indian mobile number',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Public URL to customer profile image',
    example: 'https://images.washora.com/profiles/cus-01.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Profile image must be a valid URL' })
  profileImageUrl?: string;
}
