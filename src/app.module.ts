import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { KafkaModule } from './kafka/kafka.module';
import { QueueModule } from './queue/queue.module';
import { BinanceModule } from './binance/binance.module';
import { MintOrderModule } from './orders/mint-order.module';
import { CollateralModule } from './collateral/collateral.module';
import { QuoteModule } from './quote/quote.module';
import { AssetPurchaseModule } from './asset-purchase/asset-purchase.module';
import { ETFMintProcessModule } from './etf-mint-process/etf-mint-process.module';
import { TokenMintingModule } from './token-minting/token-minting.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
      },
    }),
    HttpModule,
    KafkaModule,
    QueueModule,
    BinanceModule,
    MintOrderModule,
    CollateralModule,
    QuoteModule,
    AssetPurchaseModule,
    ETFMintProcessModule,
    TokenMintingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}