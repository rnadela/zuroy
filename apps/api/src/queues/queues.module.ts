import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { CheckoutPurgeProcessor } from './checkout-purge.processor';
import { CheckoutPurgeService } from './checkout-purge.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>('REDIS_URL') || 'redis://localhost:6379',
        },
      }),
    }),
    BullModule.registerQueue({ name: 'checkout-purge' }),
  ],
  providers: [CheckoutPurgeProcessor, CheckoutPurgeService],
  exports: [CheckoutPurgeService],
})
export class QueuesModule {}
