import { ApiPropertyOptional } from '@nestjs/swagger';
import { CatalogStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CatalogCategoryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search categories by name, slug, or description',
    example: 'Dry Cleaning',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter categories by status (defaults to ACTIVE for public reads)',
    enum: CatalogStatus,
    example: CatalogStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CatalogStatus)
  status?: CatalogStatus;
}

export class CatalogServiceQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search services by name, slug, or description',
    example: 'Suit Dry Clean',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter services by category UUID, public ID, or slug',
    example: 'CAT-0001',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter services by status (defaults to ACTIVE for public reads)',
    enum: CatalogStatus,
    example: CatalogStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CatalogStatus)
  status?: CatalogStatus;

  @ApiPropertyOptional({
    description: 'Filter featured services only',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Minimum base price filter',
    example: 99,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum base price filter',
    example: 999,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Sort field (e.g. price, name, rating, turnaroundHours, createdAt)',
    example: 'price',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order (asc or desc)',
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
