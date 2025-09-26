/**
 * Integration Tests for Cognivo AI Features
 * Tests the complete workflow and API endpoints
 */

import request from 'supertest';
import app from '../index';
import { AIService } from '../services/ai';

// Mock the AI service for integration tests
jest.mock('../services/ai');

describe('Cognivo AI API Integration Tests', () => {
  let mockAIService: jest.Mocked<AIService>;

  beforeEach(() => {
    mockAIService = new AIService() as jest.Mocked<AIService>;
    (AIService as jest.Mock).mockImplementation(() => mockAIService);
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'Cognivo AI API');
    });
  });

  describe('Note Generation API', () => {
    it('should generate notes via API', async () => {
      const mockNotes = {
        title: 'Test Notes',
        keyConcepts: ['concept1', 'concept2'],
        content: 'Generated content',
        difficulty: 'medium',
        language: 'en',
        confidence: 0.9
      };

      mockAIService.generateNotes.mockResolvedValue(mockNotes);

      const response = await request(app)
        .post('/api/ai/generate-notes')
        .send({
          content: 'Test content',
          options: {
            difficulty: 'medium',
            style: 'academic',
            language: 'en',
            includeExamples: true,
            includeQuestions: true
          }
        })
        .expect(200);

      expect(response.body).toEqual(mockNotes);
      expect(mockAIService.generateNotes).toHaveBeenCalledWith(
        'Test content',
        expect.objectContaining({
          difficulty: 'medium',
          style: 'academic',
          language: 'en',
          includeExamples: true,
          includeQuestions: true
        })
      );
    });

    it('should return 400 for missing content', async () => {
      const response = await request(app)
        .post('/api/ai/generate-notes')
        .send({
          options: {
            difficulty: 'medium',
            style: 'academic',
            language: 'en'
          }
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Content is required');
    });

    it('should handle AI service errors', async () => {
      mockAIService.generateNotes.mockRejectedValue(new Error('AI service error'));

      const response = await request(app)
        .post('/api/ai/generate-notes')
        .send({
          content: 'Test content',
          options: {
            difficulty: 'medium',
            style: 'academic',
            language: 'en'
          }
        })
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to generate notes');
    });
  });

  describe('Quiz Generation API', () => {
    it('should generate quiz via API', async () => {
      const mockQuiz = {
        id: 'quiz_123',
        title: 'Test Quiz',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice' as const,
            question: 'What is the capital of France?',
            options: ['London', 'Berlin', 'Paris', 'Madrid'],
            correctAnswer: 'Paris',
            explanation: 'Paris is the capital of France',
            difficulty: 'easy'
          }
        ],
        totalQuestions: 1,
        difficulty: 'easy',
        language: 'en',
        estimatedTime: 5
      };

      mockAIService.generateQuiz.mockResolvedValue(mockQuiz);

      const response = await request(app)
        .post('/api/ai/generate-quiz')
        .send({
          content: 'Test content',
          options: {
            questionCount: 1,
            difficulty: 'easy',
            questionTypes: ['multiple-choice'],
            language: 'en'
          }
        })
        .expect(200);

      expect(response.body).toEqual(mockQuiz);
    });
  });

  describe('Q&A API', () => {
    it('should answer questions via API', async () => {
      const mockAnswer = {
        answer: 'The answer is based on the context provided.',
        confidence: 0.85,
        sources: ['source1', 'source2'],
        relatedTopics: ['topic1', 'topic2'],
        followUpQuestions: ['question1', 'question2'],
        language: 'en'
      };

      mockAIService.answerQuestion.mockResolvedValue(mockAnswer);

      const response = await request(app)
        .post('/api/ai/answer-question')
        .send({
          question: 'What is the main topic?',
          context: 'Test context about machine learning',
          options: {
            language: 'en',
            includeSource: true
          }
        })
        .expect(200);

      expect(response.body).toEqual(mockAnswer);
    });

    it('should return 400 for missing question or context', async () => {
      const response = await request(app)
        .post('/api/ai/answer-question')
        .send({
          question: 'Test question'
          // Missing context
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Question and context are required');
    });
  });

  describe('Translation API', () => {
    it('should translate content via API', async () => {
      const mockTranslation = {
        originalText: 'Machine learning is a subset of AI.',
        translatedText: 'El aprendizaje automático es un subconjunto de la IA.',
        targetLanguage: 'es',
        confidence: 0.92,
        preservedFormatting: true,
        educationalTerms: {
          'machine learning': 'aprendizaje automático',
          'AI': 'IA'
        }
      };

      mockAIService.translateContent.mockResolvedValue(mockTranslation);

      const response = await request(app)
        .post('/api/ai/translate')
        .send({
          content: 'Machine learning is a subset of AI.',
          targetLanguage: 'es',
          options: {
            preserveFormatting: true,
            educationalOptimization: true,
            confidenceThreshold: 0.8
          }
        })
        .expect(200);

      expect(response.body).toEqual(mockTranslation);
    });
  });

  describe('File Upload APIs', () => {
    it('should handle PDF upload', async () => {
      const mockExtractedText = {
        text: 'Extracted text from PDF',
        metadata: {
          pageCount: 5,
          fileSize: 1024000,
          mimeType: 'application/pdf',
          extractedAt: new Date()
        },
        confidence: 1.0
      };

      mockAIService.extractTextFromPDF.mockResolvedValue(mockExtractedText);

      const response = await request(app)
        .post('/api/ai/extract-pdf')
        .attach('file', Buffer.from('fake pdf content'), 'test.pdf')
        .expect(200);

      expect(response.body).toEqual(mockExtractedText);
    });

    it('should handle image upload for OCR', async () => {
      const mockExtractedText = {
        text: 'Text extracted from image',
        metadata: {
          fileSize: 512000,
          mimeType: 'image/jpeg',
          extractedAt: new Date()
        },
        confidence: 0.85,
        language: 'en'
      };

      mockAIService.extractTextFromImage.mockResolvedValue(mockExtractedText);

      const response = await request(app)
        .post('/api/ai/extract-image')
        .attach('file', Buffer.from('fake image content'), 'test.jpg')
        .expect(200);

      expect(response.body).toEqual(mockExtractedText);
    });

    it('should return 400 for missing file', async () => {
      const response = await request(app)
        .post('/api/ai/extract-pdf')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'PDF file is required');
    });
  });

  describe('Error Handling', () => {
    it('should handle file size limit', async () => {
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB

      const response = await request(app)
        .post('/api/ai/extract-pdf')
        .attach('file', largeBuffer, 'large.pdf')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'File too large');
    });

    it('should handle invalid file types', async () => {
      const response = await request(app)
        .post('/api/ai/extract-pdf')
        .attach('file', Buffer.from('content'), 'test.txt')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid file type');
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      const mockNotes = {
        title: 'Test Notes',
        keyConcepts: ['concept1'],
        content: 'Generated content',
        difficulty: 'medium',
        language: 'en',
        confidence: 0.9
      };

      mockAIService.generateNotes.mockResolvedValue(mockNotes);

      const requests = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/ai/generate-notes')
          .send({
            content: 'Test content',
            options: {
              difficulty: 'medium',
              style: 'academic',
              language: 'en'
            }
          })
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});
