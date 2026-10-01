import { ApiPropertyOptional } from '@nestjs/swagger';
import { CatalogStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class ProviderServiceQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by provider service status',
    enum: CatalogStatus,
  })
  @IsOptional()
  @IsEnum(CatalogStatus)
  status?: CatalogStatus;

  @ApiPropertyOptional({
    description: 'Search catalog service name',
    example: 'Dry Clean',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ProviderAreaQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by locality or postal PIN code',
    example: '600032',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ProviderDocumentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by document type',
    example: 'BUSINESS_PAN',
  })
  @IsOptional()
  @IsString()
  documentType?: string;
}
