import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
      },
    }),
    KafkaModule, // Added Kafka integration
    // Additional modules (BullMQ, PostgreSQL, etc.) will be added later
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}