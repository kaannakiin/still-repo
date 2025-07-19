import { SetMetadata } from '@nestjs/common';
import { ThrottlerOptions } from '@nestjs/throttler';

interface CustomRateLimitOptions extends ThrottlerOptions {
  message?: string;
}

export const CustomRateLimit = (options: CustomRateLimitOptions) =>
  SetMetadata('customRateLimit', options);
