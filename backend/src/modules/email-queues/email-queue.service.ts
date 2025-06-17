import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EnqueueEmailDto } from './dto/enqueue-email.dto';

@Injectable()
export class EmailQueueService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async enqueueEmail(data: EnqueueEmailDto) {
    const job = await this.emailQueue.add(data);
    return job.id;
  }

  async getStatus(jobId: string) {
    const job = await this.emailQueue.getJob(jobId);
    if (!job) return null;
    return {
      id: job.id,
      state: await job.getState(),
      progress: job.progress(),
    };
  }
}
