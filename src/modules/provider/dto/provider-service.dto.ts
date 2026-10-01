import { ApiPropertyOptional } from '@nestjs/swagger';
import { CatalogStatus } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class ConfigureProviderServiceDto {
  @ApiPropertyOptional({
    description: 'Custom pricing in INR (₹) override for this service',
    example: 349.0,
    minimum: 0.01,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Custom price must be a valid number' })
  @Min(0.01, { message: 'Custom price must be greater than 0' })
  customPrice?: number;

  @ApiPropertyOptional({
    description: 'Provider service active status',
    enum: CatalogStatus,
    default: CatalogStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CatalogStatus, { message: 'Status must be ACTIVE, INACTIVE, or ARCHIVED' })
  status?: CatalogStatus = CatalogStatus.ACTIVE;
}

export class UpdateProviderServiceDto {
  @ApiPropertyOptional({
    description: 'Custom pricing in INR (₹) override for this service',
    example: 349.0,
    minimum: 0.01,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Custom price must be a valid number' })
  @Min(0.01, { message: 'Custom price must be greater than 0' })
  customPrice?: number;

  @ApiPropertyOptional({
    description: 'Provider service active status',
    enum: CatalogStatus,
  })
  @IsOptional()
  @IsEnum(CatalogStatus, { message: 'Status must be ACTIVE, INACTIVE, or ARCHIVED' })
  status?: CatalogStatus;
}
