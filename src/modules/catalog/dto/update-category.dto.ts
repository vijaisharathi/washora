import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Category display name',
    example: 'Executive Dry Cleaning',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({
    description: 'URL-friendly unique slug',
    example: 'executive-dry-cleaning',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lower-case alphanumeric with hyphens',
  })
  @MaxLength(120)
  slug?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the service category',
    example: 'Updated description for executive dry cleaning services.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Category icon URL',
    example: 'https://images.washora.com/icons/dry-cleaning-v2.svg',
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'iconUrl must be a valid URL' })
  iconUrl?: string;

  @ApiPropertyOptional({
    description: 'Category promotional banner image URL',
    example: 'https://images.washora.com/banners/dry-cleaning-banner-v2.jpg',
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'bannerUrl must be a valid URL' })
  bannerUrl?: string;

  @ApiPropertyOptional({
    description: 'Display order priority (ascending)',
    example: 2,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Catalog status',
    enum: CatalogStatus,
    example: CatalogStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CatalogStatus)
  status?: CatalogStatus;
}
