import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CancelAssignmentDto {
  @ApiProperty({
    description: 'Mandatory operational reason for cancelling assignment',
    example: 'Customer rescheduled pickup to next week',
    minLength: 3,
    maxLength: 500,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}

export class RejectAssignmentDto {
  @ApiProperty({
    description: 'Reason for rejecting assignment offer',
    example: 'Schedule conflict with ongoing workshop order',
    minLength: 3,
    maxLength: 500,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}
