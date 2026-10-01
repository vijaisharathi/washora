import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBookingNoteDto {
  @ApiProperty({
    description: 'Booking note content',
    example: 'Customer requested eco-friendly low-allergenic detergent',
    minLength: 1,
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'Note text is required' })
  @IsString()
  @MinLength(1, { message: 'Note text must contain at least 1 character' })
  @MaxLength(500, { message: 'Note text cannot exceed 500 characters' })
  note!: string;
}
