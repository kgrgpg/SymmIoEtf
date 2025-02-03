import { Module } from '@nestjs/common';
import { MintFlowService } from './mint-flow.service';
import { MintFlowController } from './mint-flow.controller';
import { CollateralModule } from '../collateral/collateral.module';
import { QuoteModule } from '../quote/quote.module';
import { AssetPurchaseModule } from '../asset-purchase/asset-purchase.module';

@Module({
  imports: [CollateralModule, QuoteModule, AssetPurchaseModule],
  providers: [MintFlowService],
  controllers: [MintFlowController],
  exports: [MintFlowService],
})
export class MintFlowModule {}