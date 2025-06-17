import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EmailQueueService } from './email-queues.service';
import { EnqueueEmailDto } from './dto/enqueue-email.dto';

@Controller('emails/queue')
export class EmailQueueController {
  constructor(private readonly queueService: EmailQueueService) {}

  @Post()
  enqueue(@Body() dto: EnqueueEmailDto) {
    return this.queueService.enqueueEmail(dto);
  }

  @Get(':id/status')
  status(@Param('id') id: string) {
    return this.queueService.getStatus(id);
  }
}
