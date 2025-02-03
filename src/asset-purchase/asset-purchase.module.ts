import { Module } from '@nestjs/common';
import { AssetPurchaseService } from './asset-purchase.service';
import { AssetPurchaseController } from './asset-purchase.controller';
import { BinanceModule } from '../binance/binance.module';

@Module({
  imports: [BinanceModule],
  providers: [AssetPurchaseService],
  controllers: [AssetPurchaseController],
  exports: [AssetPurchaseService],
})
export class AssetPurchaseModule {}