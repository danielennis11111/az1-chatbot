// Rate limit window in milliseconds (1 hour)
const RATE_LIMIT_WINDOW = 60 * 60 * 1000
// Maximum requests per window (adjust based on Gemini's free tier limits)
const MAX_REQUESTS_PER_WINDOW = 60

type RateLimitStore = {
  requests: number
  windowStart: number
}

export class RateLimiter {
  private static store: RateLimitStore = {
    requests: 0,
    windowStart: Date.now(),
  }

  static checkLimit(): { canProceed: boolean; timeToWait: number } {
    const now = Date.now()
    const windowElapsed = now - this.store.windowStart

    // Reset window if it's expired
    if (windowElapsed >= RATE_LIMIT_WINDOW) {
      this.store = {
        requests: 0,
        windowStart: now,
      }
    }

    // Check if we're at the limit
    if (this.store.requests >= MAX_REQUESTS_PER_WINDOW) {
      const timeToWait = RATE_LIMIT_WINDOW - windowElapsed
      return { canProceed: false, timeToWait }
    }

    // Increment request count
    this.store.requests++
    return { canProceed: true, timeToWait: 0 }
  }

  static getRemainingRequests(): number {
    return MAX_REQUESTS_PER_WINDOW - this.store.requests
  }

  static formatTimeToWait(ms: number): string {
    const minutes = Math.ceil(ms / (1000 * 60))
    return `${minutes} minute${minutes > 1 ? 's' : ''}`
  }
} 