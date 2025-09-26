"use strict";
/**
 * Professional Logging System for Cognivo AI
 * Provides structured logging with different levels and contexts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
    LogLevel["TRACE"] = "trace";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor() {
        this.logLevel = process.env.LOG_LEVEL || LogLevel.INFO;
        this.isDevelopment = process.env.NODE_ENV === 'development';
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    shouldLog(level) {
        const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG, LogLevel.TRACE];
        const currentLevelIndex = levels.indexOf(this.logLevel);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex <= currentLevelIndex;
    }
    formatLogEntry(level, message, context, error) {
        const entry = {
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
                code: error.code
            };
        }
        return entry;
    }
    output(entry) {
        if (!this.shouldLog(entry.level))
            return;
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
    error(message, context, error) {
        this.output(this.formatLogEntry(LogLevel.ERROR, message, context, error));
    }
    warn(message, context) {
        this.output(this.formatLogEntry(LogLevel.WARN, message, context));
    }
    info(message, context) {
        this.output(this.formatLogEntry(LogLevel.INFO, message, context));
    }
    debug(message, context) {
        this.output(this.formatLogEntry(LogLevel.DEBUG, message, context));
    }
    trace(message, context) {
        this.output(this.formatLogEntry(LogLevel.TRACE, message, context));
    }
    logOperationStart(operation, context) {
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.info(`Starting operation: ${operation}`, { ...context, operation, requestId });
        return requestId;
    }
    logOperationEnd(operation, requestId, duration, context) {
        this.info(`Completed operation: ${operation}`, { ...context, operation, requestId, duration });
    }
    logOperationError(operation, requestId, error, context) {
        this.error(`Operation failed: ${operation}`, { ...context, operation, requestId }, error);
    }
    logAICall(operation, tokensUsed, duration, context) {
        this.info(`AI API call completed`, {
            ...context,
            operation,
            tokensUsed,
            duration,
            cost: this.calculateCost(tokensUsed)
        });
    }
    calculateCost(tokens) {
        // Approximate cost calculation based on OpenAI pricing
        const costPer1KTokens = 0.03; // GPT-4 pricing (approximate)
        return (tokens / 1000) * costPer1KTokens;
    }
    setLogLevel(level) {
        this.logLevel = level;
    }
    getLogLevel() {
        return this.logLevel;
    }
}
exports.Logger = Logger;
// Export singleton instance
exports.logger = Logger.getInstance();
//# sourceMappingURL=logger.js.map