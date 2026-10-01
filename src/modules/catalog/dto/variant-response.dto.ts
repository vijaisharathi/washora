import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CatalogStatus } from '@prisma/client';

export class ServiceVariantResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Variant UUID' })
  id!: string;

  @ApiProperty({ example: 'VAR-0001', description: 'Variant public ID' })
  publicId!: string;

  @ApiProperty({ example: 'SVC-0001', description: 'Parent service UUID or public ID' })
  serviceId!: string;

  @ApiProperty({ example: 'Express Delivery (6h)', description: 'Variant name' })
  name!: string;

  @ApiProperty({ example: 1.5, description: 'Price multiplier on base price' })
  priceMultiplier!: number;

  @ApiProperty({ example: 50.0, description: 'Flat surcharge added to base price' })
  additionalPrice!: number;

  @ApiPropertyOptional({ example: 'Same-day turnaround completed within 6 hours', nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ example: 6, description: 'Turnaround commitment in hours', nullable: true })
  turnaroundHours!: number | null;

  @ApiProperty({ enum: CatalogStatus, example: CatalogStatus.ACTIVE })
  status!: CatalogStatus;

  @ApiProperty({ example: '2026-09-10T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z' })
  updatedAt!: Date;
}
