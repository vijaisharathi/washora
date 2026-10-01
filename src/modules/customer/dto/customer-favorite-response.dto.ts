import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FavoriteServiceSummaryDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Service UUID' })
  id!: string;

  @ApiProperty({ example: 'SVC-0001', description: 'Service public ID' })
  publicId!: string;

  @ApiProperty({ example: 'Premium Wash & Fold', description: 'Service name' })
  name!: string;

  @ApiProperty({ example: 'premium-wash-fold', description: 'Service slug' })
  slug!: string;

  @ApiPropertyOptional({ example: 'Professional laundry care', description: 'Tagline', nullable: true })
  tagline!: string | null;

  @ApiPropertyOptional({ example: 'Professional gentle wash with fabric softener', description: 'Description', nullable: true })
  description!: string | null;

  @ApiProperty({ example: 299, description: 'Base price' })
  basePrice!: number;

  @ApiPropertyOptional({ example: 'https://images.washora.com/services/wash-fold.jpg', description: 'Cover image URL', nullable: true })
  imageUrl!: string | null;
}

export class CustomerFavoriteResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Favorite record UUID' })
  id!: string;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Service UUID' })
  serviceId!: string;

  @ApiProperty({ type: FavoriteServiceSummaryDto, description: 'Service details' })
  service!: FavoriteServiceSummaryDto;

  @ApiProperty({ example: '2026-09-10T10:00:00.000Z', description: 'Favorited timestamp' })
  createdAt!: Date;
}
