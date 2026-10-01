import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateNotificationTemplateDto {
  @ApiPropertyOptional({
    example: 'Updated Subject: {{bookingNumber}}',
    description: 'Email/message subject template',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @ApiPropertyOptional({
    example: 'Updated Title: {{bookingNumber}}',
    description: 'Title template string',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  titleTemplate?: string;

  @ApiPropertyOptional({
    example: 'Updated body template content for {{customerName}}.',
    description: 'Body template text',
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(5000)
  bodyTemplate?: string;

  @ApiPropertyOptional({
    example: 'ACTIVE',
    description: 'Status (ACTIVE, ARCHIVED)',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
