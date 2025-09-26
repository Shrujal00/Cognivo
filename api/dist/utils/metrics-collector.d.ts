/**
 * Professional Metrics Collection System for Cognivo AI
 * Tracks performance, usage, and business metrics
 */
export interface MetricData {
    timestamp: number;
    value: number;
    tags?: {
        [key: string]: string;
    };
}
export interface OperationMetrics {
    operation: string;
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    averageDuration: number;
    totalDuration: number;
    lastCallTime: number;
    errorRate: number;
}
export interface AIMetrics {
    totalTokensUsed: number;
    totalCost: number;
    averageTokensPerCall: number;
    callsByModel: {
        [model: string]: number;
    };
    callsByOperation: {
        [operation: string]: number;
    };
}
export interface SystemMetrics {
    memoryUsage: number;
    cpuUsage: number;
    cacheHitRate: number;
    activeConnections: number;
    uptime: number;
}
export declare class MetricsCollector {
    private static instance;
    private metrics;
    private operationMetrics;
    private aiMetrics;
    private systemMetrics;
    private maxMetricsPerKey;
    private constructor();
    static getInstance(): MetricsCollector;
    recordMetric(key: string, value: number, tags?: {
        [key: string]: string;
    }): void;
    recordOperationStart(operation: string): string;
    recordOperationEnd(operation: string, requestId: string, success: boolean, duration: number): void;
    recordAICall(operation: string, model: string, tokensUsed: number, duration: number): void;
    recordCacheHit(key: string): void;
    recordCacheMiss(key: string): void;
    recordError(operation: string, error: Error): void;
    getMetrics(key: string, timeRange?: {
        start: number;
        end: number;
    }): MetricData[];
    getOperationMetrics(operation?: string): OperationMetrics | Map<string, OperationMetrics>;
    getAIMetrics(): AIMetrics;
    getSystemMetrics(): SystemMetrics;
    getSummary(): {
        operations: OperationMetrics[];
        ai: AIMetrics;
        system: SystemMetrics;
        topMetrics: {
            key: string;
            count: number;
        }[];
    };
    private calculateCost;
    private getTotalAICalls;
    private startSystemMetricsCollection;
    private updateSystemMetrics;
    exportMetrics(): string;
    clearMetrics(): void;
}
export declare const metricsCollector: MetricsCollector;
//# sourceMappingURL=metrics-collector.d.ts.map