import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateServiceAreaDto {
  @ApiProperty({
    description: 'Locality or neighborhood name',
    example: 'Guindy Industrial Area',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100, { message: 'Area name must be between 2 and 100 characters' })
  areaName!: string;

  @ApiProperty({
    description: '6-digit Indian Postal Code / PIN code',
    example: '600032',
  })
  @IsString()
  @Matches(/^[1-9][0-9]{5}$/, {
    message: 'Postal code must be a valid 6-digit Indian PIN code',
  })
  postalCode!: string;

  @ApiProperty({
    description: 'City name',
    example: 'Chennai',
    minLength: 2,
    maxLength: 80,
  })
  @IsString()
  @Length(2, 80, { message: 'City must be between 2 and 80 characters' })
  city!: string;

  @ApiPropertyOptional({
    description: 'Service area active status',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateServiceAreaDto {
  @ApiPropertyOptional({
    description: 'Locality or neighborhood name',
    example: 'Guindy Industrial Area West',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100, { message: 'Area name must be between 2 and 100 characters' })
  areaName?: string;

  @ApiPropertyOptional({
    description: 'City name',
    example: 'Chennai',
    minLength: 2,
    maxLength: 80,
  })
  @IsOptional()
  @IsString()
  @Length(2, 80, { message: 'City must be between 2 and 80 characters' })
  city?: string;

  @ApiPropertyOptional({
    description: 'Service area active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
