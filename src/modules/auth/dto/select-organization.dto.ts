import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SelectOrganizationDto {
  @ApiProperty({
    example: 'ORG-0001',
    description: 'Organization UUID or Public ID to switch context to',
  })
  @IsString({ message: 'organizationId must be a string' })
  @IsNotEmpty({ message: 'organizationId is required' })
  organizationId!: string;
}
