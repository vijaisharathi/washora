import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SupportPriority } from '../types/support.types';

export class UpdateSupportPriorityDto {
  @ApiProperty({
    enum: SupportPriority,
    example: SupportPriority.URGENT,
    description: 'Updated priority level for ticket or dispute',
  })
  @IsEnum(SupportPriority)
  priority!: SupportPriority;
}
