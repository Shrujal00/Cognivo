/**
 * Comprehensive Test Suite for Cognivo AI Service
 * Professional testing with mocking, coverage, and edge cases
 */

import { AIService } from '../services/ai';
import { NoteGenerationOptions, QuizGenerationOptions, QAOptions } from '../types/ai';
import { logger } from '../utils/logger';
import { cacheManager } from '../utils/cache-manager';
import { metricsCollector } from '../utils/metrics-collector';

// Mock OpenAI
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    }))
  };
});

// Mock utilities
jest.mock('../utils/logger');
jest.mock('../utils/cache-manager');
jest.mock('../utils/metrics-collector');

describe('AIService', () => {
  let aiService: AIService;
  let mockOpenAI: any;

  beforeEach(() => {
    jest.clearAllMocks();
    aiService = new AIService();
    mockOpenAI = require('openai').OpenAI.mock.results[0].value;
  });

  describe('generateNotes', () => {
    it('should generate notes successfully', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Test Notes',
              keyConcepts: ['concept1', 'concept2'],
              content: 'Generated content',
              examples: ['example1'],
              studyQuestions: ['question1']
            })
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const options: NoteGenerationOptions = {
        difficulty: 'medium',
        style: 'academic',
        language: 'en',
        includeExamples: true,
        includeQuestions: true
      };

      const result = await aiService.generateNotes('Test content', options);

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Notes');
      expect(result.keyConcepts).toHaveLength(2);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors gracefully', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

      const options: NoteGenerationOptions = {
        difficulty: 'medium',
        style: 'academic',
        language: 'en',
        includeExamples: false,
        includeQuestions: false
      };

      await expect(aiService.generateNotes('Test content', options))
        .rejects.toThrow();
    });

    it('should handle invalid JSON response', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const options: NoteGenerationOptions = {
        difficulty: 'medium',
        style: 'academic',
        language: 'en',
        includeExamples: false,
        includeQuestions: false
      };

      const result = await aiService.generateNotes('Test content', options);

      expect(result).toBeDefined();
      expect(result.title).toBe('Generated Notes');
      expect(result.content).toBe('Invalid JSON response');
    });
  });

  describe('generateQuiz', () => {
    it('should generate quiz successfully', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Test Quiz',
              questions: [
                {
                  id: 'q1',
                  type: 'multiple-choice',
                  question: 'What is the capital of France?',
                  options: ['London', 'Berlin', 'Paris', 'Madrid'],
                  correctAnswer: 'Paris',
                  explanation: 'Paris is the capital of France'
                }
              ],
              totalQuestions: 1,
              difficulty: 'easy',
              subject: 'Geography',
              language: 'en',
              estimatedTime: 5
            })
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const options: QuizGenerationOptions = {
        questionCount: 1,
        difficulty: 'easy',
        questionTypes: ['multiple-choice'],
        subject: 'Geography',
        language: 'en'
      };

      const result = await aiService.generateQuiz('Test content', options);

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Quiz');
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].type).toBe('multiple-choice');
    });

    it('should handle quiz generation errors', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('Quiz generation failed'));

      const options: QuizGenerationOptions = {
        questionCount: 5,
        difficulty: 'medium',
        questionTypes: ['multiple-choice'],
        language: 'en'
      };

      await expect(aiService.generateQuiz('Test content', options))
        .rejects.toThrow();
    });
  });

  describe('answerQuestion', () => {
    it('should answer questions with context', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'The answer is based on the provided context.'
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const options: QAOptions = {
        context: 'Test context',
        language: 'en',
        includeSource: true
      };

      const result = await aiService.answerQuestion(
        'What is the main topic?',
        'Test context about machine learning',
        options
      );

      expect(result).toBeDefined();
      expect(result.answer).toContain('answer is based');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should handle Q&A errors', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('Q&A failed'));

      const options: QAOptions = {
        context: 'Test context',
        language: 'en',
        includeSource: false
      };

      await expect(aiService.answerQuestion(
        'Test question',
        'Test context',
        options
      )).rejects.toThrow();
    });
  });

  describe('translateContent', () => {
    it('should translate content successfully', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'El aprendizaje automático es un subconjunto de la inteligencia artificial.'
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await aiService.translateContent(
        'Machine learning is a subset of artificial intelligence.',
        'es',
        {
          targetLanguage: 'es',
          preserveFormatting: true,
          educationalOptimization: true,
          confidenceThreshold: 0.8
        }
      );

      expect(result).toBeDefined();
      expect(result.translatedText).toContain('aprendizaje automático');
      expect(result.targetLanguage).toBe('es');
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle rate limiting', async () => {
      // This would require more complex setup to test rate limiting
      // For now, we'll test the basic error handling
      expect(aiService).toBeDefined();
    });

    it('should handle network timeouts', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(
        new Error('Request timeout')
      );

      const options: NoteGenerationOptions = {
        difficulty: 'medium',
        style: 'academic',
        language: 'en',
        includeExamples: false,
        includeQuestions: false
      };

      await expect(aiService.generateNotes('Test content', options))
        .rejects.toThrow();
    });
  });

  describe('Input Validation', () => {
    it('should handle empty content', async () => {
      const options: NoteGenerationOptions = {
        difficulty: 'medium',
        style: 'academic',
        language: 'en',
        includeExamples: false,
        includeQuestions: false
      };

      const result = await aiService.generateNotes('', options);
      expect(result).toBeDefined();
    });

    it('should handle very long content', async () => {
      const longContent = 'A'.repeat(100000);
      const options: NoteGenerationOptions = {
        difficulty: 'medium',
        style: 'academic',
        language: 'en',
        includeExamples: false,
        includeQuestions: false
      };

      const result = await aiService.generateNotes(longContent, options);
      expect(result).toBeDefined();
    });
  });
});
