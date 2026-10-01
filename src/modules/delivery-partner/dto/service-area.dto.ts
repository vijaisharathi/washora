import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDeliveryServiceAreaDto {
  @ApiProperty({
    description: 'Name of the geographic area or neighborhood',
    example: 'Adyar & Besant Nagar',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  areaName!: string;

  @ApiProperty({
    description: '6-digit Indian PIN code',
    example: '600020',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9][0-9]{5}$/, {
    message: 'Postal code must be a valid 6-digit Indian PIN code',
  })
  postalCode!: string;

  @ApiProperty({
    description: 'Operating city for the service area',
    example: 'Chennai',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  city!: string;

  @ApiPropertyOptional({
    description: 'Whether the service area is currently active for dispatch',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateDeliveryServiceAreaDto {
  @ApiPropertyOptional({
    description: 'Name of the geographic area or neighborhood',
    example: 'Adyar & Thiruvanmiyur',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  areaName?: string;

  @ApiPropertyOptional({
    description: 'Operating city for the service area',
    example: 'Chennai',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  city?: string;

  @ApiPropertyOptional({
    description: 'Whether the service area is currently active for dispatch',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
