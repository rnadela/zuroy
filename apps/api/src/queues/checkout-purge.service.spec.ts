import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { CheckoutPurgeService } from './checkout-purge.service';

describe('CheckoutPurgeService', () => {
  let service: CheckoutPurgeService;
  const queue = {
    add: vi.fn(),
    getJob: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CheckoutPurgeService,
        { provide: getQueueToken('checkout-purge'), useValue: queue },
      ],
    }).compile();
    service = module.get(CheckoutPurgeService);
  });

  describe('scheduleCheckoutPurge', () => {
    it('should schedule a job with delay for future checkout', async () => {
      const future = new Date(Date.now() + 60_000);
      await service.scheduleCheckoutPurge('res-1', future);
      expect(queue.add).toHaveBeenCalledWith(
        'purge',
        { reservationId: 'res-1' },
        expect.objectContaining({
          jobId: 'purge-res-1',
          removeOnComplete: true,
          removeOnFail: false,
        }),
      );
    });

    it('should skip scheduling if checkoutDate is in the past', async () => {
      await service.scheduleCheckoutPurge('res-1', new Date(Date.now() - 1000));
      expect(queue.add).not.toHaveBeenCalled();
    });
  });

  describe('cancelCheckoutPurge', () => {
    it('should remove existing job', async () => {
      const job = { remove: vi.fn() };
      queue.getJob.mockResolvedValue(job);
      await service.cancelCheckoutPurge('res-1');
      expect(queue.getJob).toHaveBeenCalledWith('purge-res-1');
      expect(job.remove).toHaveBeenCalled();
    });

    it('should do nothing when job is missing', async () => {
      queue.getJob.mockResolvedValue(null);
      await expect(service.cancelCheckoutPurge('res-x')).resolves.not.toThrow();
    });
  });
});
