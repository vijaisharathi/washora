import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CatalogStatus } from '@prisma/client';

export class CategorySummaryDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Category UUID' })
  id!: string;

  @ApiProperty({ example: 'CAT-0001', description: 'Category public ID' })
  publicId!: string;

  @ApiProperty({ example: 'Wash & Fold', description: 'Category name' })
  name!: string;

  @ApiProperty({ example: 'wash-and-fold', description: 'URL-safe unique slug' })
  slug!: string;

  @ApiPropertyOptional({ example: 'Everyday personal and family laundry washed, dried, and folded.', nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ example: 'https://cdn.washora.com/icons/wash-fold.svg', nullable: true })
  iconUrl!: string | null;

  @ApiPropertyOptional({ example: 'https://cdn.washora.com/banners/wash-fold.jpg', nullable: true })
  bannerUrl!: string | null;

  @ApiProperty({ example: 1, description: 'Display order priority' })
  displayOrder!: number;

  @ApiProperty({ enum: CatalogStatus, example: CatalogStatus.ACTIVE })
  status!: CatalogStatus;

  @ApiPropertyOptional({ example: 5, description: 'Number of active services in this category' })
  servicesCount?: number;

  @ApiProperty({ example: '2026-09-10T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z' })
  updatedAt!: Date;
}

export class CategoryResponseDto extends CategorySummaryDto {}
