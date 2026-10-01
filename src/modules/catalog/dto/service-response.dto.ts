import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CatalogStatus } from '@prisma/client';
import { CategorySummaryDto } from './category-response.dto';
import { ServiceImageResponseDto } from './service-image-response.dto';
import { ServiceVariantResponseDto } from './variant-response.dto';

export class ServiceSummaryDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Service UUID' })
  id!: string;

  @ApiProperty({ example: 'SVC-0001', description: 'Service public ID' })
  publicId!: string;

  @ApiProperty({ example: 'CAT-0001', description: 'Parent category public ID or UUID' })
  categoryId!: string;

  @ApiProperty({ example: 'Standard Wash & Fold', description: 'Service name' })
  name!: string;

  @ApiProperty({ example: 'standard-wash-fold', description: 'Service slug' })
  slug!: string;

  @ApiPropertyOptional({ example: 'Crisp everyday laundry with hygienic drying', nullable: true })
  tagline!: string | null;

  @ApiProperty({ example: 'Comprehensive laundry treatment including sorting, temperature-controlled wash, gentle tumble drying, and precision folding.' })
  description!: string;

  @ApiProperty({ example: 199.0, description: 'Base price in INR' })
  basePrice!: number;

  @ApiProperty({ example: 'kg', description: 'Measurement unit' })
  unit!: string;

  @ApiProperty({ example: 24, description: 'Standard turnaround hours' })
  turnaroundHours!: number;

  @ApiProperty({ example: true, description: 'Featured service flag' })
  isFeatured!: boolean;

  @ApiProperty({ example: 4.85, description: 'Average rating' })
  rating!: number;

  @ApiProperty({ example: 42, description: 'Total reviews count' })
  totalReviews!: number;

  @ApiProperty({ enum: CatalogStatus, example: CatalogStatus.ACTIVE })
  status!: CatalogStatus;

  @ApiPropertyOptional({ type: CategorySummaryDto, description: 'Associated category summary' })
  category?: CategorySummaryDto;

  @ApiPropertyOptional({ type: ServiceImageResponseDto, description: 'Primary banner / thumbnail image', nullable: true })
  primaryImage?: ServiceImageResponseDto | null;

  @ApiProperty({ example: '2026-09-10T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z' })
  updatedAt!: Date;
}

export class ServiceDetailResponseDto extends ServiceSummaryDto {
  @ApiProperty({ type: [ServiceVariantResponseDto], description: 'List of active service variants' })
  variants!: ServiceVariantResponseDto[];

  @ApiProperty({ type: [ServiceImageResponseDto], description: 'List of all media images' })
  images!: ServiceImageResponseDto[];
}

export class ServiceResponseDto extends ServiceDetailResponseDto {}
