import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RejectEvidenceDto {
  @ApiProperty({
    example: 'Image is too blurry to evaluate damage claim.',
    description: 'Reason for rejecting submitted evidence (3-500 characters)',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(500)
  rejectionReason!: string;
}
