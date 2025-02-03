import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue, Worker, QueueScheduler, Job } from 'bullmq';
import IORedis from 'ioredis';

@Injectable()
export class OrderQueueService implements OnModuleInit {
  private readonly logger = new Logger(OrderQueueService.name);
  private readonly redisConnection: IORedis.Redis;
  private readonly queue: Queue;
  private readonly worker: Worker;
  private readonly scheduler: QueueScheduler;

  constructor() {
    // Initialize Redis connection (using env var REDIS_URL or default)
    this.redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

    // Initialize the BullMQ Queue for order jobs
    this.queue = new Queue('order-queue', {
      connection: this.redisConnection,
    });

    // QueueScheduler ensures proper handling of delayed jobs and retries
    this.scheduler = new QueueScheduler('order-queue', {
      connection: this.redisConnection,
    });

    // Create a worker to process jobs sequentially (concurrency set to 1)
    this.worker = new Worker(
      'order-queue',
      async (job: Job) => this.processJob(job),
      {
        connection: this.redisConnection,
        concurrency: 1, // Enforce sequential processing
      },
    );

    // Log job completions and failures
    this.worker.on('completed', (job) => {
      this.logger.debug(`Job ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed: ${err.message}`, err.stack);
    });
  }

  async onModuleInit() {
    this.logger.log('OrderQueueService initialized');
  }

  /**
   * Adds an order processing job to the queue.
   * @param data - The data for the order job.
   * @param opts - Optional BullMQ job options (e.g., delay, attempts).
   */
  async addOrderJob(data: any, opts?: any) {
    const job = await this.queue.add('order-job', data, opts);
    this.logger.debug(`Enqueued job ${job.id} with data: ${JSON.stringify(data)}`);
    return job;
  }

  /**
   * Processes an order job.
   * This is where you add your business logic to interact with Binance, update order states, etc.
   * @param job - The BullMQ Job containing order data.
   */
  async processJob(job: Job) {
    this.logger.debug(`Processing job ${job.id} with data: ${JSON.stringify(job.data)}`);
    // Simulate order processing work (replace with actual order logic)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return a result object (can be expanded as needed)
    return { processed: true, jobId: job.id };
  }
}