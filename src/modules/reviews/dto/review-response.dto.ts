import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewStatus } from '../types/reviews.types';

export class ProviderResponseDto {
  @ApiProperty({ example: 'Thank you for your feedback!' })
  comment!: string;

  @ApiProperty({ example: '2026-09-12T10:30:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-12T10:30:00.000Z' })
  updatedAt!: Date;
}

export class ReviewResponseDto {
  @ApiProperty({ example: 'b5f1e8f2-8921-4f51-b0db-b8830113c121' })
  id!: string;

  @ApiProperty({ example: 'REV-2026-000001' })
  publicId!: string;

  @ApiProperty({ example: 'org-uuid-001' })
  organizationId!: string;

  @ApiProperty({ example: 'cust-uuid-001' })
  customerId!: string;

  @ApiProperty({ example: 'bkg-uuid-001' })
  bookingId!: string;

  @ApiProperty({ example: 'pro-uuid-001' })
  providerId!: string;

  @ApiProperty({ example: 'srv-uuid-001' })
  serviceId!: string;

  @ApiProperty({ example: 5 })
  rating!: number;

  @ApiPropertyOptional({ example: 'Excellent dry cleaning' })
  title?: string | null;

  @ApiPropertyOptional({ example: 'Everything was neatly packaged and on time.' })
  comment?: string | null;

  @ApiProperty({ enum: ReviewStatus, example: ReviewStatus.PUBLISHED })
  status!: ReviewStatus;

  @ApiPropertyOptional({ type: ProviderResponseDto })
  providerResponse?: ProviderResponseDto | null;

  @ApiProperty({ example: '2026-09-12T09:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-12T09:00:00.000Z' })
  updatedAt!: Date;

  @ApiPropertyOptional({ example: '2026-09-12T09:30:00.000Z' })
  publishedAt?: Date | null;

  @ApiPropertyOptional({ example: 'Rahul S.' })
  customerName?: string | null;

  @ApiPropertyOptional({ example: 'Super Laundry Hub' })
  providerName?: string | null;

  @ApiPropertyOptional({ example: 'Premium Dry Clean' })
  serviceName?: string | null;
}
