import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerException } from '@nestjs/throttler';
import Redis from 'ioredis';

@Injectable()
export class CustomRateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('REDIS_CLIENT') private redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitConfig = this.reflector.get(
      'customRateLimit',
      context.getHandler(),
    );

    if (!rateLimitConfig) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.ip;
    const endpoint = request.route?.path || request.url;

    const key = `custom_rate_limit:${userId}:${endpoint}`;
    const current = await this.redis.incr(key);

    if (current === 1) {
      // windowMs değil, ttl kullan
      await this.redis.pexpire(key, rateLimitConfig.ttl);
    }

    // requests değil, limit kullan
    if (current > rateLimitConfig.limit) {
      throw new ThrottlerException(
        rateLimitConfig.message || 'Custom rate limit exceeded',
      );
    }

    return true;
  }
}
