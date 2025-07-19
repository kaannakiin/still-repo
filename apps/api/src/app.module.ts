import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'burst',
            ttl: 1000, // 1 saniye
            limit: 20, // Saniyede max 20 request
          },
          {
            name: 'sustained',
            ttl: 60000, // 1 dakika
            limit: 1000, // Dakikada max 1000 request
          },
          {
            name: 'hourly',
            ttl: 3600000, // 1 saat
            limit: 10000, // Saatte max 10k request
          },
        ],
        errorMessage: 'Server protection: Too many requests',
        storage: new ThrottlerStorageRedisService(
          configService.getOrThrow('REDIS_URL'),
        ),
      }),
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
