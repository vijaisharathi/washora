import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentVerificationStatus } from '@prisma/client';

export class DeliveryPartnerDocumentResponseDto {
  @ApiProperty({
    description: 'Unique internal identifier of the document',
    example: 'd9b02a28-98e3-4f91-8be7-3479528d22df',
  })
  id!: string;

  @ApiProperty({
    description: 'Public identifier of the delivery partner',
    example: 'DLP-0001',
  })
  deliveryPartnerId!: string;

  @ApiProperty({
    description: 'Type of compliance document (e.g. DRIVING_LICENSE, AADHAAR, VEHICLE_RC)',
    example: 'DRIVING_LICENSE',
  })
  documentType!: string;

  @ApiPropertyOptional({
    description: 'Document identification number if recorded',
    example: 'TN0120200001234',
  })
  documentNumber?: string | null;

  @ApiProperty({
    description: 'Secure uploaded document URL',
    example: 'https://storage.washora.com/compliance/dlp-dl-tn01.pdf',
  })
  documentUrl!: string;

  @ApiProperty({
    description: 'Verification review status',
    enum: DocumentVerificationStatus,
    example: DocumentVerificationStatus.PENDING,
  })
  verificationStatus!: DocumentVerificationStatus;

  @ApiPropertyOptional({
    description: 'Timestamp when document was verified by Operations/Admin',
    example: '2026-02-05T14:30:00.000Z',
  })
  verifiedAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Rejection reason if verification failed',
    example: null,
  })
  rejectionReason?: string | null;

  @ApiProperty({
    description: 'Submission timestamp',
    example: '2026-02-01T09:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-02-01T09:00:00.000Z',
  })
  updatedAt!: Date;
}
