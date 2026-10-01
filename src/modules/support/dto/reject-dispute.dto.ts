import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RejectDisputeDto {
  @ApiProperty({
    example: 'Pre-service intake photographs demonstrate the tear existed prior to pickup.',
    description: 'Reason for rejecting the dispute (3-1000 characters)',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(1000)
  decisionReason!: string;
}
