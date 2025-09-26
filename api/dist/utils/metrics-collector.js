"use strict";
/**
 * Professional Metrics Collection System for Cognivo AI
 * Tracks performance, usage, and business metrics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsCollector = exports.MetricsCollector = void 0;
class MetricsCollector {
    constructor() {
        this.metrics = new Map();
        this.operationMetrics = new Map();
        this.aiMetrics = {
            totalTokensUsed: 0,
            totalCost: 0,
            averageTokensPerCall: 0,
            callsByModel: {},
            callsByOperation: {}
        };
        this.systemMetrics = {
            memoryUsage: 0,
            cpuUsage: 0,
            cacheHitRate: 0,
            activeConnections: 0,
            uptime: Date.now()
        };
        this.maxMetricsPerKey = 1000;
        this.startSystemMetricsCollection();
    }
    static getInstance() {
        if (!MetricsCollector.instance) {
            MetricsCollector.instance = new MetricsCollector();
        }
        return MetricsCollector.instance;
    }
    recordMetric(key, value, tags) {
        const metric = {
            timestamp: Date.now(),
            value,
            tags
        };
        if (!this.metrics.has(key)) {
            this.metrics.set(key, []);
        }
        const metricsArray = this.metrics.get(key);
        metricsArray.push(metric);
        // Keep only the most recent metrics
        if (metricsArray.length > this.maxMetricsPerKey) {
            metricsArray.splice(0, metricsArray.length - this.maxMetricsPerKey);
        }
    }
    recordOperationStart(operation) {
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        if (!this.operationMetrics.has(operation)) {
            this.operationMetrics.set(operation, {
                operation,
                totalCalls: 0,
                successfulCalls: 0,
                failedCalls: 0,
                averageDuration: 0,
                totalDuration: 0,
                lastCallTime: 0,
                errorRate: 0
            });
        }
        return requestId;
    }
    recordOperationEnd(operation, requestId, success, duration) {
        const metrics = this.operationMetrics.get(operation);
        if (!metrics)
            return;
        metrics.totalCalls++;
        metrics.lastCallTime = Date.now();
        metrics.totalDuration += duration;
        metrics.averageDuration = metrics.totalDuration / metrics.totalCalls;
        if (success) {
            metrics.successfulCalls++;
        }
        else {
            metrics.failedCalls++;
        }
        metrics.errorRate = metrics.failedCalls / metrics.totalCalls;
        this.recordMetric(`operation.${operation}.duration`, duration);
        this.recordMetric(`operation.${operation}.success`, success ? 1 : 0);
    }
    recordAICall(operation, model, tokensUsed, duration) {
        this.aiMetrics.totalTokensUsed += tokensUsed;
        this.aiMetrics.totalCost += this.calculateCost(tokensUsed, model);
        this.aiMetrics.averageTokensPerCall = this.aiMetrics.totalTokensUsed / this.getTotalAICalls();
        if (!this.aiMetrics.callsByModel[model]) {
            this.aiMetrics.callsByModel[model] = 0;
        }
        this.aiMetrics.callsByModel[model]++;
        if (!this.aiMetrics.callsByOperation[operation]) {
            this.aiMetrics.callsByOperation[operation] = 0;
        }
        this.aiMetrics.callsByOperation[operation]++;
        this.recordMetric('ai.tokens_used', tokensUsed, { model, operation });
        this.recordMetric('ai.cost', this.calculateCost(tokensUsed, model), { model, operation });
        this.recordMetric('ai.duration', duration, { model, operation });
    }
    recordCacheHit(key) {
        this.recordMetric('cache.hit', 1, { key });
    }
    recordCacheMiss(key) {
        this.recordMetric('cache.miss', 1, { key });
    }
    recordError(operation, error) {
        this.recordMetric('error.count', 1, {
            operation,
            errorType: error.constructor.name
        });
    }
    getMetrics(key, timeRange) {
        const metrics = this.metrics.get(key) || [];
        if (!timeRange) {
            return metrics;
        }
        return metrics.filter(metric => metric.timestamp >= timeRange.start && metric.timestamp <= timeRange.end);
    }
    getOperationMetrics(operation) {
        if (operation) {
            return this.operationMetrics.get(operation) || {
                operation,
                totalCalls: 0,
                successfulCalls: 0,
                failedCalls: 0,
                averageDuration: 0,
                totalDuration: 0,
                lastCallTime: 0,
                errorRate: 0
            };
        }
        return new Map(this.operationMetrics);
    }
    getAIMetrics() {
        return { ...this.aiMetrics };
    }
    getSystemMetrics() {
        return { ...this.systemMetrics };
    }
    getSummary() {
        const topMetrics = Array.from(this.metrics.entries())
            .map(([key, values]) => ({ key, count: values.length }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        return {
            operations: Array.from(this.operationMetrics.values()),
            ai: this.getAIMetrics(),
            system: this.getSystemMetrics(),
            topMetrics
        };
    }
    calculateCost(tokens, model) {
        // OpenAI pricing (approximate)
        const pricing = {
            'gpt-4': 0.03,
            'gpt-4-turbo': 0.01,
            'gpt-3.5-turbo': 0.002,
            'gpt-3.5-turbo-16k': 0.004
        };
        const costPer1K = pricing[model] || 0.03;
        return (tokens / 1000) * costPer1K;
    }
    getTotalAICalls() {
        return Object.values(this.aiMetrics.callsByOperation)
            .reduce((sum, count) => sum + count, 0);
    }
    startSystemMetricsCollection() {
        setInterval(() => {
            this.updateSystemMetrics();
        }, 30000); // Update every 30 seconds
    }
    updateSystemMetrics() {
        const memUsage = process.memoryUsage();
        this.systemMetrics.memoryUsage = memUsage.heapUsed;
        this.systemMetrics.uptime = Date.now() - this.systemMetrics.uptime;
        // Update cache hit rate
        const hitMetrics = this.getMetrics('cache.hit');
        const missMetrics = this.getMetrics('cache.miss');
        const totalCacheCalls = hitMetrics.length + missMetrics.length;
        if (totalCacheCalls > 0) {
            this.systemMetrics.cacheHitRate = hitMetrics.length / totalCacheCalls;
        }
    }
    exportMetrics() {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            summary: this.getSummary(),
            metrics: Object.fromEntries(this.metrics)
        }, null, 2);
    }
    clearMetrics() {
        this.metrics.clear();
        this.operationMetrics.clear();
        this.aiMetrics = {
            totalTokensUsed: 0,
            totalCost: 0,
            averageTokensPerCall: 0,
            callsByModel: {},
            callsByOperation: {}
        };
    }
}
exports.MetricsCollector = MetricsCollector;
// Export singleton instance
exports.metricsCollector = MetricsCollector.getInstance();
//# sourceMappingURL=metrics-collector.js.map