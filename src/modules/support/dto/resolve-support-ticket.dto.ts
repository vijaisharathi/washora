import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ResolveSupportTicketDto {
  @ApiProperty({
    example: 'The booking was rescheduled successfully and confirmed with customer.',
    description: 'Detailed resolution note (3-2000 characters)',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(2000)
  resolution!: string;
}
