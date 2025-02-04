import { Module } from '@nestjs/common';
import { ETFMintProcessService } from './etf-mint-process.service';
import { ETFMintProcessController } from './etf-mint-process.controller';
import { CollateralModule } from '../collateral/collateral.module';
import { QuoteModule } from '../quote/quote.module';
import { AssetPurchaseModule } from '../asset-purchase/asset-purchase.module';

@Module({
  imports: [CollateralModule, QuoteModule, AssetPurchaseModule],
  providers: [ETFMintProcessService],
  controllers: [ETFMintProcessController],
  exports: [ETFMintProcessService],
})
export class ETFMintProcessModule {}