"use strict";
/**
 * Jest Test Setup
 * Global test configuration and utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
// Global test timeout
globals_1.jest.setTimeout(30000);
// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    log: globals_1.jest.fn(),
    debug: globals_1.jest.fn(),
    info: globals_1.jest.fn(),
    warn: globals_1.jest.fn(),
    error: globals_1.jest.fn(),
};
// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-api-key';
process.env.OPENAI_MODEL = 'gpt-3.5-turbo';
process.env.OPENAI_MAX_TOKENS = '1000';
process.env.OPENAI_TEMPERATURE = '0.7';
process.env.PORT = '3000';
process.env.LOG_LEVEL = 'error';
// Global test utilities
global.testUtils = {
    createMockRequest: (overrides = {}) => ({
        body: {},
        params: {},
        query: {},
        headers: {},
        file: null,
        ...overrides
    }),
    createMockResponse: () => {
        const res = {};
        res.status = globals_1.jest.fn().mockReturnValue(res);
        res.json = globals_1.jest.fn().mockReturnValue(res);
        res.send = globals_1.jest.fn().mockReturnValue(res);
        res.setHeader = globals_1.jest.fn().mockReturnValue(res);
        return res;
    },
    createMockNext: () => globals_1.jest.fn(),
    waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};
// Clean up after each test
afterEach(() => {
    globals_1.jest.clearAllMocks();
});
// Global error handler for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});
//# sourceMappingURL=setup.js.map