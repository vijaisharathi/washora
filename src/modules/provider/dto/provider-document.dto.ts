import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class SubmitProviderDocumentDto {
  @ApiProperty({
    description: 'Document category/type (e.g. BUSINESS_PAN, GST, SHOP_ESTABLISHMENT, TRADE_LICENSE)',
    example: 'BUSINESS_PAN',
    minLength: 2,
    maxLength: 60,
  })
  @IsString()
  @Length(2, 60, { message: 'Document type must be between 2 and 60 characters' })
  documentType!: string;

  @ApiPropertyOptional({
    description: 'Official registration or document identification number',
    example: 'ABCDE1234F',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Document number must not exceed 100 characters' })
  documentNumber?: string;

  @ApiProperty({
    description: 'Secure file URL / storage reference of the uploaded document',
    example: 'https://documents.washora.com/providers/doc-pan-01.pdf',
  })
  @IsString()
  @IsUrl({}, { message: 'Document URL must be a valid URL' })
  documentUrl!: string;
}
