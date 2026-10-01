import { ApiProperty } from '@nestjs/swagger';

export class UnreadCountResponseDto {
  @ApiProperty({ example: 5, description: 'Total unread notifications' })
  unreadCount!: number;

  @ApiProperty({ example: 1, description: 'Unread critical priority notifications' })
  criticalCount!: number;

  @ApiProperty({ example: 2, description: 'Unread high priority notifications' })
  highCount!: number;
}
