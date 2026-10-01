import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ReassignAssignmentDto {
  @ApiPropertyOptional({
    description: 'New candidate provider identifier (UUID or PRO-xxxx) for provider assignments',
    example: 'PRO-0002',
  })
  @IsOptional()
  @IsString()
  providerId?: string;

  @ApiPropertyOptional({
    description: 'New candidate delivery partner identifier (UUID or DLP-xxxx) for delivery assignments',
    example: 'DLP-0002',
  })
  @IsOptional()
  @IsString()
  deliveryPartnerId?: string;

  @ApiProperty({
    description: 'Mandatory operational reason for reassignment',
    example: 'Previous provider reported equipment maintenance outage',
    minLength: 3,
    maxLength: 500,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;

  @ApiPropertyOptional({
    description: 'Optional operational notes for the reassignment',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
