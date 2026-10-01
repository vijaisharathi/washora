import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAssignmentDto {
  @ApiPropertyOptional({
    description: 'Updated operational notes for the assignment',
    example: 'Customer requested gate delivery instead of door handoff',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
