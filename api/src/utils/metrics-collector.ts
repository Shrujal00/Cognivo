/**
 * Professional Metrics Collection System for Cognivo AI
 * Tracks performance, usage, and business metrics
 */

export interface MetricData {
  timestamp: number;
  value: number;
  tags?: { [key: string]: string };
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
  callsByModel: { [model: string]: number };
  callsByOperation: { [operation: string]: number };
}

export interface SystemMetrics {
  memoryUsage: number;
  cpuUsage: number;
  cacheHitRate: number;
  activeConnections: number;
  uptime: number;
}

export class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: Map<string, MetricData[]> = new Map();
  private operationMetrics: Map<string, OperationMetrics> = new Map();
  private aiMetrics: AIMetrics = {
    totalTokensUsed: 0,
    totalCost: 0,
    averageTokensPerCall: 0,
    callsByModel: {},
    callsByOperation: {}
  };
  private systemMetrics: SystemMetrics = {
    memoryUsage: 0,
    cpuUsage: 0,
    cacheHitRate: 0,
    activeConnections: 0,
    uptime: Date.now()
  };
  private maxMetricsPerKey: number = 1000;

  private constructor() {
    this.startSystemMetricsCollection();
  }

  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  public recordMetric(key: string, value: number, tags?: { [key: string]: string }): void {
    const metric: MetricData = {
      timestamp: Date.now(),
      value,
      tags
    };

    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const metricsArray = this.metrics.get(key)!;
    metricsArray.push(metric);

    // Keep only the most recent metrics
    if (metricsArray.length > this.maxMetricsPerKey) {
      metricsArray.splice(0, metricsArray.length - this.maxMetricsPerKey);
    }
  }

  public recordOperationStart(operation: string): string {
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

  public recordOperationEnd(operation: string, requestId: string, success: boolean, duration: number): void {
    const metrics = this.operationMetrics.get(operation);
    if (!metrics) return;

    metrics.totalCalls++;
    metrics.lastCallTime = Date.now();
    metrics.totalDuration += duration;
    metrics.averageDuration = metrics.totalDuration / metrics.totalCalls;

    if (success) {
      metrics.successfulCalls++;
    } else {
      metrics.failedCalls++;
    }

    metrics.errorRate = metrics.failedCalls / metrics.totalCalls;

    this.recordMetric(`operation.${operation}.duration`, duration);
    this.recordMetric(`operation.${operation}.success`, success ? 1 : 0);
  }

  public recordAICall(operation: string, model: string, tokensUsed: number, duration: number): void {
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

  public recordCacheHit(key: string): void {
    this.recordMetric('cache.hit', 1, { key });
  }

  public recordCacheMiss(key: string): void {
    this.recordMetric('cache.miss', 1, { key });
  }

  public recordError(operation: string, error: Error): void {
    this.recordMetric('error.count', 1, { 
      operation, 
      errorType: error.constructor.name 
    });
  }

  public getMetrics(key: string, timeRange?: { start: number; end: number }): MetricData[] {
    const metrics = this.metrics.get(key) || [];
    
    if (!timeRange) {
      return metrics;
    }

    return metrics.filter(metric => 
      metric.timestamp >= timeRange.start && metric.timestamp <= timeRange.end
    );
  }

  public getOperationMetrics(operation?: string): OperationMetrics | Map<string, OperationMetrics> {
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

  public getAIMetrics(): AIMetrics {
    return { ...this.aiMetrics };
  }

  public getSystemMetrics(): SystemMetrics {
    return { ...this.systemMetrics };
  }

  public getSummary(): {
    operations: OperationMetrics[];
    ai: AIMetrics;
    system: SystemMetrics;
    topMetrics: { key: string; count: number }[];
  } {
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

  private calculateCost(tokens: number, model: string): number {
    // OpenAI pricing (approximate)
    const pricing: { [key: string]: number } = {
      'gpt-4': 0.03,
      'gpt-4-turbo': 0.01,
      'gpt-3.5-turbo': 0.002,
      'gpt-3.5-turbo-16k': 0.004
    };

    const costPer1K = pricing[model] || 0.03;
    return (tokens / 1000) * costPer1K;
  }

  private getTotalAICalls(): number {
    return Object.values(this.aiMetrics.callsByOperation)
      .reduce((sum, count) => sum + count, 0);
  }

  private startSystemMetricsCollection(): void {
    setInterval(() => {
      this.updateSystemMetrics();
    }, 30000); // Update every 30 seconds
  }

  private updateSystemMetrics(): void {
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

  public exportMetrics(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: this.getSummary(),
      metrics: Object.fromEntries(this.metrics)
    }, null, 2);
  }

  public clearMetrics(): void {
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

// Export singleton instance
export const metricsCollector = MetricsCollector.getInstance();
