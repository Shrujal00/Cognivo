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
export declare class RetryManager {
    private static instance;
    private defaultOptions;
    private constructor();
    static getInstance(): RetryManager;
    executeWithRetry<T>(operation: () => Promise<T>, options?: RetryOptions): Promise<RetryResult<T>>;
    executeWithCircuitBreaker<T>(operation: () => Promise<T>, options?: RetryOptions & {
        failureThreshold?: number;
        recoveryTimeout?: number;
        monitoringWindow?: number;
    }): Promise<RetryResult<T>>;
    private calculateDelay;
    private sleep;
    private static isRetryableError;
    createRetryableFunction<T extends any[], R>(fn: (...args: T) => Promise<R>, options?: RetryOptions): (...args: T) => Promise<RetryResult<R>>;
    getRetryStats(): {
        totalRetries: number;
        successfulRetries: number;
        failedRetries: number;
        averageAttempts: number;
    };
}
export declare const retryManager: RetryManager;
//# sourceMappingURL=retry-manager.d.ts.map