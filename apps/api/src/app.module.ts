import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { QueuesModule } from './queues/queues.module';
import { HealthModule } from './health/health.module';
import { HotelsModule } from './hotels/hotels.module';
import { UsersModule } from './users/users.module';
import { RoomsModule } from './rooms/rooms.module';
import { ReservationsModule } from './reservations/reservations.module';
import { DevicesModule } from './devices/devices.module';
import { AmenitiesModule } from './amenities/amenities.module';
import { ServicesModule } from './services/services.module';
import { PartnersModule } from './partners/partners.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { TenantContextGuard } from './auth/guards/tenant-context.guard';

@Module({
  imports: [
    ClsModule.forRoot({ global: true, middleware: { mount: true } }),
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 100 }],
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    QueuesModule,
    HealthModule,
    HotelsModule,
    UsersModule,
    RoomsModule,
    ReservationsModule,
    DevicesModule,
    AmenitiesModule,
    ServicesModule,
    PartnersModule,
  ],
  providers: [
    // Guard order matters: Throttler → JWT → Roles → TenantContext
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: TenantContextGuard },
  ],
})
export class AppModule {}
