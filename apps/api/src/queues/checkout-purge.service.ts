import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CheckoutPurgeService {
  constructor(@InjectQueue('checkout-purge') private readonly queue: Queue) {}

  async scheduleCheckoutPurge(reservationId: string, checkoutDate: Date) {
    const delay = checkoutDate.getTime() - Date.now();
    if (delay <= 0) return; // already past

    await this.queue.add(
      'purge',
      { reservationId },
      {
        delay,
        jobId: `purge-${reservationId}`,
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  async cancelCheckoutPurge(reservationId: string) {
    const job = await this.queue.getJob(`purge-${reservationId}`);
    if (job) await job.remove();
  }
}
