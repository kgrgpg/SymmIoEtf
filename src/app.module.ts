// src/app.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { KafkaModule } from './kafka/kafka.module';
import { QueueModule } from './queue/queue.module';
import { BinanceModule } from './binance/binance.module';
import { MintOrderModule } from './orders/mint-order.module';
import { CollateralModule } from './collateral/collateral.module';
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}