import { Module } from '@nestjs/common';
import { MintOrderController } from './mint-order.controller';
import { OrderQueueService } from '../queue/order-queue.service';

@Module({
  controllers: [MintOrderController],
  providers: [OrderQueueService],
})
export class MintOrderModule {}