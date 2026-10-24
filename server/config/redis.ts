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

});

redis.on('error', (err) => {

  if (env.NODE_ENV === 'development') {

  }
});
