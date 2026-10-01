import { ApiPropertyOptional } from '@nestjs/swagger';
import { CatalogStatus } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateServiceDto {
  @ApiPropertyOptional({
    description: 'Target category identifier (UUID, public ID, or slug)',
    example: 'CAT-0001',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Service offering name',
    example: 'Executive Woolen Dry Clean',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(160)
  name?: string;

  @ApiPropertyOptional({
    description: 'Unique URL slug for service',
    example: 'executive-woolen-dry-clean',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lower-case alphanumeric with hyphens',
  })
  @MaxLength(160)
  slug?: string;

  @ApiPropertyOptional({
    description: 'Short promotional tagline or subtitle',
    example: 'Premium steam pressing and delicate care',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  tagline?: string;

  @ApiPropertyOptional({
    description: 'Detailed service description',
    example: 'Updated description for executive woolen garment cleaning.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Canonical base price in INR',
    example: 220.0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({
    description: 'Billing pricing unit',
    example: 'per kg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  unit?: string;

  @ApiPropertyOptional({
    description: 'Turnaround time in hours',
    example: 36,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  turnaroundHours?: number;

  @ApiPropertyOptional({
    description: 'Whether service is featured',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Catalog status',
    enum: CatalogStatus,
    example: CatalogStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CatalogStatus)
  status?: CatalogStatus;
}
