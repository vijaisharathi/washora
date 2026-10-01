import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSupportNoteDto {
  @ApiProperty({
    example: 'Spoke with partner team; provider re-confirmed schedule for 4 PM.',
    description: 'Internal operations note (1-5000 characters)',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  note!: string;
}
