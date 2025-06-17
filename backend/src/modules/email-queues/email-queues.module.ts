import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailQueueService } from './email-queues.service';
import { EmailQueueProcessor } from './email-queues.processor';
import { EmailQueueController } from './email-queues.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
      redis: {
        host: process.env.REDIS_HOST ?? 'redis',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      },
    }),
  ],
  providers: [EmailQueueService, EmailQueueProcessor],
  controllers: [EmailQueueController],
  exports: [EmailQueueService],
})
export class EmailQueueModule {}
