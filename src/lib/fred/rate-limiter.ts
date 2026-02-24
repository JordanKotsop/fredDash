import { FRED_DEFAULTS } from './constants';

class TokenBucketRateLimiter {
  private tokens: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per millisecond
  private lastRefillTimestamp: number;

  constructor(maxRequestsPerMinute: number = FRED_DEFAULTS.RATE_LIMIT_PER_MINUTE) {
    this.maxTokens = maxRequestsPerMinute;
    this.tokens = maxRequestsPerMinute;
    this.refillRate = maxRequestsPerMinute / 60_000;
    this.lastRefillTimestamp = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefillTimestamp;
    const tokensToAdd = elapsed * this.refillRate;
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefillTimestamp = now;
  }

  async acquire(): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    const waitTime = Math.ceil((1 - this.tokens) / this.refillRate);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        this.refill();
        this.tokens -= 1;
        resolve();
      }, waitTime);
    });
  }

  getStatus() {
    this.refill();
    return {
      availableTokens: Math.floor(this.tokens),
      maxTokens: this.maxTokens,
    };
  }
}

export const rateLimiter = new TokenBucketRateLimiter();
