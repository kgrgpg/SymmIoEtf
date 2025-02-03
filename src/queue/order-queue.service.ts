import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker, QueueScheduler, Job } from 'bullmq';
import Redis from 'ioredis';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class OrderQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OrderQueueService.name);
  private readonly redisConnection: Redis;
  private readonly queue: Queue;
  private readonly worker: Worker;
  private readonly scheduler: QueueScheduler;

  // RxJS subjects to emit job events
  private jobCompletedSubject: Subject<Job<any, any, string>> = new Subject();
  private jobFailedSubject: Subject<{ job: Job<any, any, string>; err: Error }> = new Subject();

  // Exposed observables for other parts of the app
  public readonly jobCompleted$: Observable<Job<any, any, string>> = this.jobCompletedSubject.asObservable();
  public readonly jobFailed$: Observable<{ job: Job<any, any, string>; err: Error }> = this.jobFailedSubject.asObservable();

  constructor() {
    // Create a Redis connection with the recommended option for BullMQ
    this.redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        maxRetriesPerRequest: null,
      });

    // Initialize the queue and scheduler
    this.queue = new Queue('order-queue', { connection: this.redisConnection });
    this.scheduler = new QueueScheduler('order-queue', { connection: this.redisConnection });

    // Create a worker with concurrency of 1 (sequential processing)
    this.worker = new Worker(
      'order-queue',
      async (job: Job) => this.processJob(job),
      { connection: this.redisConnection, concurrency: 1 }
    );

    // Listen for job completion events and push them into our RxJS subject
    this.worker.on('completed', (job: Job) => {
      this.logger.debug(`Job ${job.id} completed`);
      this.jobCompletedSubject.next(job);
    });

    // Listen for job failure events and push them into our RxJS subject
    this.worker.on('failed', (job: Job, err: Error) => {
      this.logger.error(`Job ${job.id} failed: ${err.message}`);
      this.jobFailedSubject.next({ job, err });
    });
  }

  async onModuleInit() {
    this.logger.log('OrderQueueService initialized');
  }

  async onModuleDestroy() {
    await this.worker.close();
    await this.queue.close();
    await this.scheduler.close();
    await this.redisConnection.quit();
  }

  /**
   * Adds an order processing job to the queue.
   * Returns the created Job (as a Promise), and you can also subscribe to the job events reactively.
   */
  async addOrderJob(data: any, opts?: any): Promise<Job<any, any, string>> {
    const job = await this.queue.add('order-job', data, opts);
    this.logger.debug(`Enqueued job ${job.id} with data: ${JSON.stringify(data)}`);
    return job;
  }

  /**
   * Processes an order job.
   * This function simulates processing by waiting for 1 second.
   * In a real implementation, you would add your business logic here.
   */
  async processJob(job: Job): Promise<any> {
    this.logger.debug(`Processing job ${job.id} with data: ${JSON.stringify(job.data)}`);
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Return some dummy result indicating successful processing
    return { processed: true, jobId: job.id };
  }
}