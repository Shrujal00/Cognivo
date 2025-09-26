/**
 * Professional Logging System for Cognivo AI
 * Provides structured logging with different levels and contexts
 */
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug",
    TRACE = "trace"
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
export declare class Logger {
    private static instance;
    private logLevel;
    private isDevelopment;
    private constructor();
    static getInstance(): Logger;
    private shouldLog;
    private formatLogEntry;
    private output;
    error(message: string, context?: LogContext, error?: Error): void;
    warn(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    debug(message: string, context?: LogContext): void;
    trace(message: string, context?: LogContext): void;
    logOperationStart(operation: string, context?: LogContext): string;
    logOperationEnd(operation: string, requestId: string, duration: number, context?: LogContext): void;
    logOperationError(operation: string, requestId: string, error: Error, context?: LogContext): void;
    logAICall(operation: string, tokensUsed: number, duration: number, context?: LogContext): void;
    private calculateCost;
    setLogLevel(level: LogLevel): void;
    getLogLevel(): LogLevel;
}
export declare const logger: Logger;
//# sourceMappingURL=logger.d.ts.map