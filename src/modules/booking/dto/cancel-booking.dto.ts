import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CancelBookingDto {
  @ApiProperty({
    description: 'Reason for booking cancellation',
    example: 'Change of travel plans and schedule',
    minLength: 3,
    maxLength: 200,
  })
  @IsNotEmpty({ message: 'Cancellation reason is required' })
  @IsString()
  @MinLength(3, { message: 'Reason must be at least 3 characters long' })
  @MaxLength(200, { message: 'Reason cannot exceed 200 characters' })
  reason!: string;
}
