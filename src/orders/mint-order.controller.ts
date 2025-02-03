import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { OrderQueueService } from '../queue/order-queue.service';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Controller('orders/mint')
export class MintOrderController {
  constructor(private readonly orderQueueService: OrderQueueService) {}

  // Simulate a mint order by enqueuing a job
  @Post()
  createMintOrder(@Body() orderData: any): Observable<any> {
    if (!orderData || !orderData.collateral || !orderData.assets) {
      throw new HttpException('Invalid order data', HttpStatus.BAD_REQUEST);
    }

    // Enqueue the job using the reactive method (wrap Promise with 'from')
    return from(this.orderQueueService.addOrderJob(orderData)).pipe(
      map(job => ({
        message: 'Mint order enqueued',
        jobId: job.id,
        data: job.data,
      })),
      catchError(err => {
        throw new HttpException(`Error enqueuing order: ${err.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      })
    );
  }
}