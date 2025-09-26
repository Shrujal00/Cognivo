import { AIConfig } from '../types/ai';
import dotenv from 'dotenv';

dotenv.config();

export const aiConfig: AIConfig = {
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

export const validateConfig = (): void => {
  if (!aiConfig.openai.apiKey) {
    throw new Error('OPENAI_API_KEY is required');
  }
  
  if (!aiConfig.openai.model) {
    throw new Error('OPENAI_MODEL is required');
  }
  
  if (aiConfig.openai.maxTokens <= 0) {
    throw new Error('OPENAI_MAX_TOKENS must be greater than 0');
  }
  
  if (aiConfig.openai.temperature < 0 || aiConfig.openai.temperature > 2) {
    throw new Error('OPENAI_TEMPERATURE must be between 0 and 2');
  }
};
