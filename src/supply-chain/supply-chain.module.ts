import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupplyChainService } from './supply-chain.service';

@Module({
  imports: [ConfigModule],
  providers: [SupplyChainService],
  exports: [SupplyChainService]
})
export class SupplyChainModule {}
