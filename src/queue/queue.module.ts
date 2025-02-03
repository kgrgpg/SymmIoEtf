import { Module } from '@nestjs/common';
import { OrderQueueService } from './order-queue.service';

@Module({
  providers: [OrderQueueService],
  exports: [OrderQueueService],
})
export class QueueModule {}