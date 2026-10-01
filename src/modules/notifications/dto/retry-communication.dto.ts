import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RetryCommunicationDto {
  @ApiPropertyOptional({ example: 'Network timeout during previous attempt', description: 'Retry reason note' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
