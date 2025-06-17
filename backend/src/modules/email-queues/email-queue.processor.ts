import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { EnqueueEmailDto } from './dto/enqueue-email.dto';

@Processor('email')
export class EmailQueueProcessor {
  @Process()
  async handleEmailJob(job: Job<EnqueueEmailDto>) {
    const { to, subject, body } = job.data;

    // จำลองการส่งอีเมล (ไม่ส่งจริง)
    console.log(`🔔 [Email Simulation]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    
    // อัปเดต progress ให้ดูเหมือนกำลังส่ง
    await job.progress(50);
    // รอสักพักจำลองเวลา network / processing
    await new Promise((resolve) => setTimeout(resolve, 500));
    await job.progress(100);

    console.log(`✅ [Email Simulation Complete] Job ${job.id}`);
  }
}
