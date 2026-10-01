import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssignmentType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProviderAssignmentDto {
  @ApiProperty({
    description: 'Provider identifier (UUID or public ID e.g. PRO-0001)',
    example: 'PRO-0001',
  })
  @IsNotEmpty()
  @IsString()
  providerId!: string;

  @ApiPropertyOptional({
    description: 'Optional operational notes for the provider assignment',
    example: 'Express wash requested, assign priority processing',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class CreateDeliveryAssignmentDto {
  @ApiProperty({
    description: 'Delivery Partner identifier (UUID or public ID e.g. DLP-0001)',
    example: 'DLP-0001',
  })
  @IsNotEmpty()
  @IsString()
  deliveryPartnerId!: string;

  @ApiPropertyOptional({
    description: 'Specific assignment type',
    enum: AssignmentType,
    default: AssignmentType.DELIVERY_PARTNER,
  })
  @IsOptional()
  @IsEnum(AssignmentType)
  type?: AssignmentType = AssignmentType.DELIVERY_PARTNER;

  @ApiPropertyOptional({
    description: 'Optional operational notes for the delivery partner assignment',
    example: 'Call recipient upon arrival at apartment gate',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
