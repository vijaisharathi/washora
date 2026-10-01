import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CatalogStatus } from '@prisma/client';

export class CatalogServiceSummaryDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Service UUID' })
  id!: string;

  @ApiProperty({ example: 'SVC-0001', description: 'Service public identifier' })
  publicId!: string;

  @ApiProperty({ example: 'Premium Wash & Fold', description: 'Canonical service name' })
  name!: string;

  @ApiProperty({ example: 'premium-wash-fold', description: 'Service slug' })
  slug!: string;

  @ApiPropertyOptional({ example: 'Fresh everyday laundry care', description: 'Tagline', nullable: true })
  tagline!: string | null;

  @ApiProperty({ example: 299, description: 'Canonical base price in INR' })
  basePrice!: number;

  @ApiProperty({ example: 'kg', description: 'Measurement unit' })
  unit!: string;

  @ApiProperty({ example: 24, description: 'Turnaround SLA commitment in hours' })
  turnaroundHours!: number;
}

export class ProviderServiceResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Provider service relation UUID' })
  id!: string;

  @ApiProperty({ example: 'PRO-0001', description: 'Provider public ID' })
  providerId!: string;

  @ApiProperty({ example: 'SVC-0001', description: 'Catalog service public ID or UUID' })
  serviceId!: string;

  @ApiProperty({ type: CatalogServiceSummaryDto, description: 'Underlying catalog service details' })
  service!: CatalogServiceSummaryDto;

  @ApiPropertyOptional({ example: 349.0, description: 'Provider-specific price override', nullable: true })
  customPrice!: number | null;

  @ApiProperty({ example: 349.0, description: 'Effective price for this provider (customPrice or basePrice)' })
  effectivePrice!: number;

  @ApiProperty({ enum: CatalogStatus, example: CatalogStatus.ACTIVE, description: 'Offering status for this provider' })
  status!: CatalogStatus;

  @ApiProperty({ example: '2026-09-10T10:00:00.000Z', description: 'Attached timestamp' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z', description: 'Last update timestamp' })
  updatedAt!: Date;
}
