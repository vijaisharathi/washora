import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  ALLOWED_EVIDENCE_MIME_TYPES,
  EVIDENCE_TYPES,
  MAX_EVIDENCE_FILE_SIZE,
} from '../types/support.types';

export class CreateDisputeEvidenceDto {
  @ApiProperty({
    example: 'Damaged cuff photo',
    description: 'Title of the evidence item (1-150 characters)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(150)
  title!: string;

  @ApiPropertyOptional({
    example: 'Close up photo of the torn stitch on the right cuff after wash.',
    description: 'Detailed description of the evidence',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    enum: EVIDENCE_TYPES,
    example: 'PHOTO',
    description: 'Categorization of evidence (PHOTO, VIDEO, DOCUMENT, RECEIPT, SCREENSHOT, OTHER)',
  })
  @IsString()
  @IsIn(EVIDENCE_TYPES as unknown as string[])
  fileType!: string;

  @ApiProperty({
    example: 'damaged_cuff.jpg',
    description: 'Original file name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName!: string;

  @ApiProperty({
    example: 'image/jpeg',
    description: 'MIME type (image/jpeg, image/png, image/webp, application/pdf, video/mp4)',
  })
  @IsString()
  @IsIn(ALLOWED_EVIDENCE_MIME_TYPES as unknown as string[])
  mimeType!: string;

  @ApiProperty({
    example: 1024000,
    description: 'File size in bytes (maximum 52,428,800 bytes / 50MB)',
  })
  @IsInt()
  @Min(1)
  @Max(MAX_EVIDENCE_FILE_SIZE)
  fileSize!: number;

  @ApiPropertyOptional({
    example: 'data:image/jpeg;base64,...',
    description: 'Base64 encoded string or client payload',
  })
  @IsOptional()
  @IsString()
  fileContentBase64?: string;
}
