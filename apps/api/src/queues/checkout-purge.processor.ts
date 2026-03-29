import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Processor('checkout-purge')
export class CheckoutPurgeProcessor extends WorkerHost {
  private readonly logger = new Logger(CheckoutPurgeProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<{ reservationId: string }>) {
    this.logger.log(`Auto-purging reservation ${job.data.reservationId}`);

    const reservation = await this.prisma.reservation.findUnique({
      where: { id: job.data.reservationId },
    });

    if (!reservation || reservation.status !== 'CHECKED_IN') {
      this.logger.log(
        `Reservation ${job.data.reservationId} not checked in, skipping purge`,
      );
      return;
    }

    await this.prisma.reservation.update({
      where: { id: job.data.reservationId },
      data: {
        status: 'CHECKED_OUT',
        provisioningToken: null,
        provisioningTokenExpiresAt: null,
        deviceId: null,
      },
    });

    this.logger.log(
      `Auto-purge complete for reservation ${job.data.reservationId}`,
    );
    // Future: trigger AMAPI CLEAR_APP_DATA here
  }
}
