import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateServiceDto {
  @ApiProperty({
    description: 'Category identifier (UUID, public ID, or slug)',
    example: 'CAT-0001',
  })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiProperty({
    description: 'Service offering name',
    example: 'Premium Woolen Dry Clean',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(160)
  name!: string;

  @ApiPropertyOptional({
    description: 'Unique URL slug for service. Generated from name if omitted.',
    example: 'premium-woolen-dry-clean',
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
    example: 'Gentle organic care for your expensive winterwear',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  tagline?: string;

  @ApiProperty({
    description: 'Detailed service description',
    example: 'Complete dry cleaning with specialized solvent for wool and cashmere items.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description!: string;

  @ApiProperty({
    description: 'Canonical base price in INR',
    example: 199.0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice!: number;

  @ApiPropertyOptional({
    description: 'Billing pricing unit',
    example: 'per piece',
    default: 'kg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  unit?: string;

  @ApiPropertyOptional({
    description: 'Standard turnaround delivery time in hours',
    example: 48,
    default: 24,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  turnaroundHours?: number;

  @ApiPropertyOptional({
    description: 'Whether service is featured on home discovery',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Initial catalog status',
    enum: CatalogStatus,
    example: CatalogStatus.ACTIVE,
    default: CatalogStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CatalogStatus)
  status?: CatalogStatus;
}
