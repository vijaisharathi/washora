import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ServiceImageResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Image UUID' })
  id!: string;

  @ApiProperty({ example: 'SVC-0001', description: 'Associated service ID or public ID' })
  serviceId!: string;

  @ApiProperty({ example: 'https://cdn.washora.com/services/wash-fold-main.jpg', description: 'Image CDN URL' })
  imageUrl!: string;

  @ApiPropertyOptional({ example: 'Neatly folded shirts and garments', description: 'Alternative descriptive text', nullable: true })
  altText!: string | null;

  @ApiProperty({ example: 0, description: 'Display order priority' })
  displayOrder!: number;

  @ApiProperty({ example: true, description: 'Primary banner / thumbnail flag' })
  isPrimary!: boolean;

  @ApiProperty({ example: '2026-09-10T10:00:00.000Z' })
  createdAt!: Date;
}
