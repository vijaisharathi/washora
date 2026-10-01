import { ApiProperty } from '@nestjs/swagger';
import { CatalogStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateCategoryStatusDto {
  @ApiProperty({
    description: 'Target lifecycle status for the category',
    enum: CatalogStatus,
    example: CatalogStatus.ACTIVE,
  })
  @IsNotEmpty()
  @IsEnum(CatalogStatus)
  status!: CatalogStatus;
}
