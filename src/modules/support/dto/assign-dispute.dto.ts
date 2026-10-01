import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AssignDisputeDto {
  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: 'Target user ID (UUID) of active operations/admin member',
  })
  @IsString()
  @IsNotEmpty()
  assignedToUserId!: string;

  @ApiPropertyOptional({
    example: 'Assigning to quality inspection lead',
    description: 'Optional assignment note/reason',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
