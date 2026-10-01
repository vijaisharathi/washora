import { ApiPropertyOptional } from '@nestjs/swagger';
import { AddressStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CustomerAddressQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by address status (defaults to ACTIVE)',
    enum: AddressStatus,
    default: AddressStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(AddressStatus)
  status?: AddressStatus = AddressStatus.ACTIVE;
}

export class CustomerRewardQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search description within reward transactions',
    example: 'Welcome bonus',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
