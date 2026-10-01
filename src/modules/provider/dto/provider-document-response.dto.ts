import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentVerificationStatus } from '@prisma/client';

export class ProviderDocumentResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Document UUID' })
  id!: string;

  @ApiProperty({ example: 'PRO-0001', description: 'Provider public ID' })
  providerId!: string;

  @ApiProperty({ example: 'BUSINESS_PAN', description: 'Document type / category' })
  documentType!: string;

  @ApiPropertyOptional({ example: 'ABCDE1234F', description: 'Document registration number', nullable: true })
  documentNumber!: string | null;

  @ApiProperty({ example: 'https://documents.washora.com/providers/doc-pan-01.pdf', description: 'Document storage URL' })
  documentUrl!: string;

  @ApiProperty({ enum: DocumentVerificationStatus, example: DocumentVerificationStatus.PENDING, description: 'Verification status' })
  verificationStatus!: DocumentVerificationStatus;

  @ApiPropertyOptional({ example: '2026-09-10T10:00:00.000Z', description: 'Verification timestamp', nullable: true })
  verifiedAt!: Date | null;

  @ApiPropertyOptional({ example: 'Signature blurred', description: 'Rejection reason if applicable', nullable: true })
  rejectionReason!: string | null;

  @ApiProperty({ example: '2026-09-10T10:00:00.000Z', description: 'Submission timestamp' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z', description: 'Last update timestamp' })
  updatedAt!: Date;
}
