import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CancelCommunicationDto {
  @ApiProperty({ example: 'Customer cancelled booking prior to dispatch', description: 'Cancellation reason' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  reason!: string;
}
