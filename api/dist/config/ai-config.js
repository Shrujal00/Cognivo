"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConfig = exports.aiConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.aiConfig = {
    openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-4',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000'),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7')
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
    },
    fileUpload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
        allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,docx,txt,jpg,jpeg,png').split(',')
    }
};
const validateConfig = () => {
    if (!exports.aiConfig.openai.apiKey) {
        throw new Error('OPENAI_API_KEY is required');
    }
    if (!exports.aiConfig.openai.model) {
        throw new Error('OPENAI_MODEL is required');
    }
    if (exports.aiConfig.openai.maxTokens <= 0) {
        throw new Error('OPENAI_MAX_TOKENS must be greater than 0');
    }
    if (exports.aiConfig.openai.temperature < 0 || exports.aiConfig.openai.temperature > 2) {
        throw new Error('OPENAI_TEMPERATURE must be between 0 and 2');
    }
};
exports.validateConfig = validateConfig;
//# sourceMappingURL=ai-config.js.map