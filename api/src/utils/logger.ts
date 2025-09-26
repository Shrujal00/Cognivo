/**
 * Professional Logging System for Cognivo AI
 * Provides structured logging with different levels and contexts
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace'
}

export interface LogContext {
  userId?: string;
  sessionId?: string;
  operation?: string;
  requestId?: string;
  duration?: number;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  private constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG, LogLevel.TRACE];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private formatLogEntry(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
        code: (error as any).code
      };
    }

    return entry;
  }

  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const logMessage = this.isDevelopment 
      ? JSON.stringify(entry, null, 2)
      : JSON.stringify(entry);

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.INFO:
        console.info(logMessage);
        break;
      case LogLevel.DEBUG:
        console.debug(logMessage);
        break;
      case LogLevel.TRACE:
        console.trace(logMessage);
        break;
    }
  }

  public error(message: string, context?: LogContext, error?: Error): void {
    this.output(this.formatLogEntry(LogLevel.ERROR, message, context, error));
  }

  public warn(message: string, context?: LogContext): void {
    this.output(this.formatLogEntry(LogLevel.WARN, message, context));
  }

  public info(message: string, context?: LogContext): void {
    this.output(this.formatLogEntry(LogLevel.INFO, message, context));
  }

  public debug(message: string, context?: LogContext): void {
    this.output(this.formatLogEntry(LogLevel.DEBUG, message, context));
  }

  public trace(message: string, context?: LogContext): void {
    this.output(this.formatLogEntry(LogLevel.TRACE, message, context));
  }

  public logOperationStart(operation: string, context?: LogContext): string {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.info(`Starting operation: ${operation}`, { ...context, operation, requestId });
    return requestId;
  }

  public logOperationEnd(operation: string, requestId: string, duration: number, context?: LogContext): void {
    this.info(`Completed operation: ${operation}`, { ...context, operation, requestId, duration });
  }

  public logOperationError(operation: string, requestId: string, error: Error, context?: LogContext): void {
    this.error(`Operation failed: ${operation}`, { ...context, operation, requestId }, error);
  }

  public logAICall(operation: string, tokensUsed: number, duration: number, context?: LogContext): void {
    this.info(`AI API call completed`, {
      ...context,
      operation,
      tokensUsed,
      duration,
      cost: this.calculateCost(tokensUsed)
    });
  }

  private calculateCost(tokens: number): number {
    // Approximate cost calculation based on OpenAI pricing
    const costPer1KTokens = 0.03; // GPT-4 pricing (approximate)
    return (tokens / 1000) * costPer1KTokens;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public getLogLevel(): LogLevel {
    return this.logLevel;
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
