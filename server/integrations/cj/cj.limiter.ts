/**
 * Rate limiter ensuring at least minIntervalMs (1,050ms) between outgoing CJ API requests
 * to respect CJ's 1 QPS rate limit.
 */
export class CJRateLimiter {
  private lastRequestTime: number = 0;
  private queue: Promise<void> = Promise.resolve();

  constructor(private readonly minIntervalMs: number = 1050) {}

  async wait(): Promise<void> {
    const next = this.queue.then(async () => {
      const now = Date.now();
      const elapsed = now - this.lastRequestTime;
      if (elapsed < this.minIntervalMs) {
        await new Promise((resolve) => setTimeout(resolve, this.minIntervalMs - elapsed));
      }
      this.lastRequestTime = Date.now();
    });
    this.queue = next;
    return next;
  }
}
