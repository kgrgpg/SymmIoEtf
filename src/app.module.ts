import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { KafkaModule } from './kafka/kafka.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
      },
    }),
    KafkaModule,
    QueueModule, // Integrated BullMQ for order queue management
    // Future modules (e.g., PostgreSQL integration) will be added here
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}