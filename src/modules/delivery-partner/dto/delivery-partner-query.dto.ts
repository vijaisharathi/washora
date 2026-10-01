import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class DeliveryPartnerAreaQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search filter by area name, city, or postal code',
    example: '600020',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class DeliveryPartnerDocumentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by specific document type',
    example: 'DRIVING_LICENSE',
  })
  @IsOptional()
  @IsString()
  documentType?: string;
}
