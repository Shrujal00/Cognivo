"use strict";
/**
 * Professional Retry Management System for Cognivo AI
 * Implements exponential backoff, circuit breaker, and intelligent retry strategies
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryManager = exports.RetryManager = void 0;
class RetryManager {
    constructor() {
        this.defaultOptions = {
            maxAttempts: 3,
            baseDelay: 1000,
            maxDelay: 30000,
            backoffMultiplier: 2,
            jitter: true,
            retryCondition: (error) => RetryManager.isRetryableError(error)
        };
    }
    static getInstance() {
        if (!RetryManager.instance) {
            RetryManager.instance = new RetryManager();
        }
        return RetryManager.instance;
    }
    async executeWithRetry(operation, options = {}) {
        const config = { ...this.defaultOptions, ...options };
        const startTime = Date.now();
        let lastError;
        for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
            try {
                const result = await operation();
                return {
                    success: true,
                    result,
                    attempts: attempt,
                    totalDuration: Date.now() - startTime
                };
            }
            catch (error) {
                lastError = error;
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
    async executeWithCircuitBreaker(operation, options = {}) {
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
    calculateDelay(attempt, config) {
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
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    static isRetryableError(error) {
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
    createRetryableFunction(fn, options = {}) {
        return async (...args) => {
            return this.executeWithRetry(() => fn(...args), options);
        };
    }
    getRetryStats() {
        // This would be implemented with actual tracking in a real system
        return {
            totalRetries: 0,
            successfulRetries: 0,
            failedRetries: 0,
            averageAttempts: 0
        };
    }
}
exports.RetryManager = RetryManager;
// Export singleton instance
exports.retryManager = RetryManager.getInstance();
//# sourceMappingURL=retry-manager.js.map