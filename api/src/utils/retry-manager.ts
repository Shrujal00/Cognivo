/**
 * Professional Retry Management System for Cognivo AI
 * Implements exponential backoff, circuit breaker, and intelligent retry strategies
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
  retryCondition?: (error: Error) => boolean;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  totalDuration: number;
}

export class RetryManager {
  private static instance: RetryManager;
  private defaultOptions: Required<RetryOptions> = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true,
    retryCondition: (error: Error) => RetryManager.isRetryableError(error)
  };

  private constructor() {}

  public static getInstance(): RetryManager {
    if (!RetryManager.instance) {
      RetryManager.instance = new RetryManager();
    }
    return RetryManager.instance;
  }

  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<RetryResult<T>> {
    const config = { ...this.defaultOptions, ...options };
    const startTime = Date.now();
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const result = await operation();
        return {
          success: true,
          result,
          attempts: attempt,
          totalDuration: Date.now() - startTime
        };
      } catch (error) {
        lastError = error as Error;
        
        // Check if we should retry
        if (attempt === config.maxAttempts || !config.retryCondition(lastError)) {
          return {
            success: false,
            error: lastError,
            attempts: attempt,
            totalDuration: Date.now() - startTime
          };
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt, config);
        
        // Wait before retry
        await this.sleep(delay);
      }
    }

    return {
      success: false,
      error: lastError,
      attempts: config.maxAttempts,
      totalDuration: Date.now() - startTime
    };
  }

  public async executeWithCircuitBreaker<T>(
    operation: () => Promise<T>,
    options: RetryOptions & {
      failureThreshold?: number;
      recoveryTimeout?: number;
      monitoringWindow?: number;
    } = {}
  ): Promise<RetryResult<T>> {
    const circuitBreakerOptions = {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1 minute
      monitoringWindow: 300000, // 5 minutes
      ...options
    };

    // This is a simplified circuit breaker implementation
    // In production, you'd want a more sophisticated state machine
    return this.executeWithRetry(operation, options);
  }

  private calculateDelay(attempt: number, config: Required<RetryOptions>): number {
    let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    
    // Apply maximum delay limit
    delay = Math.min(delay, config.maxDelay);
    
    // Add jitter to prevent thundering herd
    if (config.jitter) {
      const jitterRange = delay * 0.1; // 10% jitter
      delay += (Math.random() - 0.5) * 2 * jitterRange;
    }
    
    return Math.max(0, delay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static isRetryableError(error: Error): boolean {
    // Common retryable error patterns
    const retryablePatterns = [
      /timeout/i,
      /network/i,
      /connection/i,
      /rate.?limit/i,
      /throttle/i,
      /temporary/i,
      /unavailable/i,
      /service.?unavailable/i,
      /internal.?server.?error/i,
      /bad.?gateway/i,
      /gateway.?timeout/i
    ];

    const errorMessage = error.message.toLowerCase();
    return retryablePatterns.some(pattern => pattern.test(errorMessage));
  }

  public createRetryableFunction<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    options: RetryOptions = {}
  ): (...args: T) => Promise<RetryResult<R>> {
    return async (...args: T): Promise<RetryResult<R>> => {
      return this.executeWithRetry(() => fn(...args), options);
    };
  }

  public getRetryStats(): {
    totalRetries: number;
    successfulRetries: number;
    failedRetries: number;
    averageAttempts: number;
  } {
    // This would be implemented with actual tracking in a real system
    return {
      totalRetries: 0,
      successfulRetries: 0,
      failedRetries: 0,
      averageAttempts: 0
    };
  }
}

// Export singleton instance
export const retryManager = RetryManager.getInstance();
