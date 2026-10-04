import Redis from 'ioredis';
import { env } from './env.js';

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  // Connected successfully
});

redis.on('error', (err) => {
  // Silent fail in dev or fallback gracefully if Redis is not running locally
  if (env.NODE_ENV === 'development') {
    // Keep log minimal to avoid polluting terminal in dev without Redis
  }
});
