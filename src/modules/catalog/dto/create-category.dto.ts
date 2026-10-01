import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CatalogStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category display name',
    example: 'Dry Cleaning',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    description: 'URL-friendly unique slug. If omitted, will be generated from name.',
    example: 'dry-cleaning',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lower-case alphanumeric with hyphens (e.g. dry-cleaning)',
  })
  @MaxLength(120)
  slug?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the service category',
    example: 'Professional eco-friendly dry cleaning for delicate garments and suits.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Category icon URL or SVG reference',
    example: 'https://images.washora.com/icons/dry-cleaning.svg',
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'iconUrl must be a valid URL' })
  iconUrl?: string;

  @ApiPropertyOptional({
    description: 'Category promotional banner image URL',
    example: 'https://images.washora.com/banners/dry-cleaning-banner.jpg',
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'bannerUrl must be a valid URL' })
  bannerUrl?: string;

  @ApiPropertyOptional({
    description: 'Display order priority (ascending)',
    example: 1,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

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
