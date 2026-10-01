import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateServiceImageDto {
  @ApiProperty({
    description: 'Image file URL',
    example: 'https://images.washora.com/services/dry-clean-suit.jpg',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl({}, { message: 'imageUrl must be a valid URL' })
  imageUrl!: string;

  @ApiPropertyOptional({
    description: 'Descriptive alt text for accessibility and SEO',
    example: 'Front view of cleaned and pressed executive suit',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  altText?: string;

  @ApiPropertyOptional({
    description: 'Display order priority (ascending)',
    example: 1,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether this image should be set as the primary cover image',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class UpdateServiceImageDto {
  @ApiPropertyOptional({
    description: 'Image file URL',
    example: 'https://images.washora.com/services/dry-clean-suit-v2.jpg',
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'imageUrl must be a valid URL' })
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Descriptive alt text',
    example: 'Updated alt text for garment suit image',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  altText?: string;

  @ApiPropertyOptional({
    description: 'Display order priority (ascending)',
    example: 2,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether this image should be the primary cover image',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
