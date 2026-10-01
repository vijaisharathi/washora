import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CatalogStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateServiceVariantDto {
  @ApiProperty({
    description: 'Name of the service variant option',
    example: 'Express 6-Hour Rush',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    description: 'Price multiplier applied to base price (e.g. 1.50 for 50% surge)',
    example: 1.5,
    default: 1.0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  priceMultiplier?: number;

  @ApiPropertyOptional({
    description: 'Flat additional price added to base price',
    example: 50.0,
    default: 0.0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  additionalPrice?: number;

  @ApiPropertyOptional({
    description: 'Description of what this variant entails',
    example: 'Guaranteed dispatch and delivery within 6 hours of pickup.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Turnaround hours override for this variant',
    example: 6,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  turnaroundHours?: number;

  @ApiPropertyOptional({
    description: 'Status of the variant',
    enum: CatalogStatus,
    example: CatalogStatus.ACTIVE,
    default: CatalogStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CatalogStatus)
  status?: CatalogStatus;
}

export class UpdateServiceVariantDto {
  @ApiPropertyOptional({
    description: 'Name of the service variant option',
    example: 'Express 4-Hour Rush',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({
    description: 'Price multiplier applied to base price',
    example: 1.75,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  priceMultiplier?: number;

  @ApiPropertyOptional({
    description: 'Flat additional price added to base price',
    example: 75.0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  additionalPrice?: number;

  @ApiPropertyOptional({
    description: 'Description of what this variant entails',
    example: 'Updated turnaround description.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Turnaround hours override',
    example: 4,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  turnaroundHours?: number;

  @ApiPropertyOptional({
    description: 'Status of the variant',
    enum: CatalogStatus,
    example: CatalogStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CatalogStatus)
  status?: CatalogStatus;
}
