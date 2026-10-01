import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CatalogStatus } from '@prisma/client';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class AdminCreateCategoryDto {
  @ApiProperty({ description: 'Category name', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ description: 'Category unique slug in organization', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  slug!: string;

  @ApiPropertyOptional({ description: 'Category description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Display order priority', default: 0 })
  @IsOptional()
  @IsNumber()
  displayOrder?: number = 0;
}

export class AdminUpdateCategoryDto {
  @ApiPropertyOptional({ description: 'Category name', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Category slug in organization', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({ description: 'Category description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Display order priority' })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

export class AdminCreateServiceDto {
  @ApiProperty({ description: 'Category ID' })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiProperty({ description: 'Service name', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @ApiProperty({ description: 'Service unique slug', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  slug!: string;

  @ApiPropertyOptional({ description: 'Short promotional tagline', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  tagline?: string;

  @ApiPropertyOptional({ description: 'Full service description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Base price in INR' })
  @IsNumber()
  @IsPositive()
  basePrice!: number;

  @ApiPropertyOptional({ description: 'Measurement unit: piece, kg, pair', default: 'piece' })
  @IsOptional()
  @IsString()
  unit?: string = 'piece';

  @ApiPropertyOptional({ description: 'Estimated turnaround time in hours', default: 24 })
  @IsOptional()
  @IsNumber()
  turnaroundHours?: number = 24;

  @ApiPropertyOptional({ description: 'Featured banner flag', default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false;
}

export class AdminUpdateServiceDto {
  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Service name', maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ description: 'Service slug', maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  slug?: string;

  @ApiPropertyOptional({ description: 'Short promotional tagline' })
  @IsOptional()
  @IsString()
  tagline?: string;

  @ApiPropertyOptional({ description: 'Full service description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Base price in INR' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  basePrice?: number;

  @ApiPropertyOptional({ description: 'Measurement unit' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: 'Estimated turnaround time in hours' })
  @IsOptional()
  @IsNumber()
  turnaroundHours?: number;

  @ApiPropertyOptional({ description: 'Featured banner flag' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
