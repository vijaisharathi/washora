import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SubmitDeliveryDocumentDto {
  @ApiProperty({
    description: 'Type of verification document (e.g. DRIVING_LICENSE, AADHAAR, VEHICLE_RC, PAN_CARD)',
    example: 'DRIVING_LICENSE',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(60)
  documentType!: string;

  @ApiPropertyOptional({
    description: 'Identification/reference number printed on document',
    example: 'TN0120200001234',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  documentNumber?: string;

  @ApiProperty({
    description: 'Uploaded document storage or secure URL',
    example: 'https://storage.washora.com/compliance/dlp-dl-tn01.pdf',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl({}, { message: 'Document URL must be a valid URL' })
  documentUrl!: string;
}
