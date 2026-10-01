import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '../../modules/auth/decorators/public.decorator';
import { WebhookService } from './webhook.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Public()
  @Post('payments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle incoming external payment gateway webhook notifications' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webhook processed or acknowledged',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid signature',
  })
  async handlePaymentWebhook(
    @Req() req: Request,
    @Headers('x-signature') signatureHeader?: string,
    @Headers('x-webhook-timestamp') timestampHeader?: string,
  ) {
    const signature = signatureHeader || (req.headers['stripe-signature'] as string);
    if (!signature) {
      throw new BadRequestException('Missing webhook signature header');
    }

    // Use rawBody if available or body stringified
    const rawPayload = (req as any).rawBody || JSON.stringify(req.body);

    return this.webhookService.processPaymentWebhook(rawPayload, signature, timestampHeader);
  }
}
