import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer, Consumer, logLevel, EachMessagePayload } from 'kafkajs';
import { Observable, Subject } from 'rxjs';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private messageSubject: Subject<EachMessagePayload> = new Subject();

  // Expose an observable for subscribers
  public messages$: Observable<EachMessagePayload> = this.messageSubject.asObservable();

  constructor(private readonly logger: PinoLogger) {
    // Initialize Kafka client with brokers from environment variables or default to localhost
    this.kafka = new Kafka({
      clientId: 'etf-backend',
      brokers: process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'],
      logLevel: logLevel.INFO,
    });
    // Create producer and consumer instances
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'etf-backend-group' });
  }

  async onModuleInit() {
    // Connect both producer and consumer
    await this.producer.connect();
    await this.consumer.connect();
    this.logger.info('Kafka producer and consumer connected.');

    // Subscribe to the topic (defaults to 'etf-topic' if not set via env)
    const topic = process.env.KAFKA_TOPIC || 'etf-topic';
    await this.consumer.subscribe({ topic, fromBeginning: true });

    // Start the consumer run loop and push each received message into the RxJS subject
    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        this.logger.debug(`Received message on topic ${payload.topic}: ${payload.message.value?.toString()}`);
        this.messageSubject.next(payload);
      },
    });
  }

  async onModuleDestroy() {
    // Disconnect both producer and consumer on shutdown
    await this.producer.disconnect();
    await this.consumer.disconnect();
    this.logger.info('Kafka producer and consumer disconnected.');
  }

  // Utility method to send messages to a specified topic
  async sendMessage(topic: string, messages: { key?: string; value: string }[]) {
    await this.producer.send({ topic, messages });
    this.logger.debug(`Sent message to topic ${topic}`);
  }
}