import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import {
  CommunicationChannel,
  CommunicationStatus,
} from '../types/notifications.types';

export class CommunicationListQueryDto {
  @ApiPropertyOptional({ enum: CommunicationChannel, description: 'Filter by channel' })
  @IsOptional()
  @IsEnum(CommunicationChannel)
  channel?: CommunicationChannel;

  @ApiPropertyOptional({ enum: CommunicationStatus, description: 'Filter by delivery status' })
  @IsOptional()
  @IsEnum(CommunicationStatus)
  status?: CommunicationStatus;

  @ApiPropertyOptional({ example: 'TRANSACTIONAL', description: 'Filter by communication type' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100, description: 'Page limit' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
