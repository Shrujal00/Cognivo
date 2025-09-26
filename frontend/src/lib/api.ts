import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  NoteGenerationOptions,
  GeneratedNote,
  QuizGenerationOptions,
  GeneratedQuiz,
  QAOptions,
  QAAnswer,
  FlashcardGenerationOptions,
  GeneratedFlashcardSet,
  RoadmapGenerationOptions,
  StudyRoadmap,
  TranslationOptions,
  TranslationResult,
  ExtractedText,
} from '@/types/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
      timeout: 60000, // 60 seconds for AI operations
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/health`);
    return response.data;
  }

  // AI Note Generation
  async generateNotes(content: string, options: NoteGenerationOptions): Promise<GeneratedNote> {
    const response: AxiosResponse<GeneratedNote> = await this.api.post('/ai/generate-notes', {
      content,
      options,
    });
    return response.data;
  }

  // AI Quiz Generation
  async generateQuiz(content: string, options: QuizGenerationOptions): Promise<GeneratedQuiz> {
    const response: AxiosResponse<GeneratedQuiz> = await this.api.post('/ai/generate-quiz', {
      content,
      options,
    });
    return response.data;
  }

  // AI Q&A
  async answerQuestion(question: string, context: string, options?: QAOptions): Promise<QAAnswer> {
    const response: AxiosResponse<QAAnswer> = await this.api.post('/ai/answer-question', {
      question,
      context,
      options: options || { context: '', language: 'en', includeSource: true },
    });
    return response.data;
  }

  // AI Flashcard Generation
  async generateFlashcards(content: string, options: FlashcardGenerationOptions): Promise<GeneratedFlashcardSet> {
    const response: AxiosResponse<GeneratedFlashcardSet> = await this.api.post('/ai/generate-flashcards', {
      content,
      options,
    });
    return response.data;
  }

  // AI Study Roadmap Generation
  async generateRoadmap(options: RoadmapGenerationOptions): Promise<StudyRoadmap> {
    const response: AxiosResponse<StudyRoadmap> = await this.api.post('/ai/generate-roadmap', {
      options,
    });
    return response.data;
  }

  // AI Translation
  async translateContent(content: string, targetLanguage: string, options?: TranslationOptions): Promise<TranslationResult> {
    const response: AxiosResponse<TranslationResult> = await this.api.post('/ai/translate', {
      content,
      targetLanguage,
      options: options || {
        targetLanguage,
        preserveFormatting: true,
        educationalOptimization: true,
        confidenceThreshold: 0.8,
      },
    });
    return response.data;
  }

  // Text extraction from PDF
  async extractTextFromPDF(file: File): Promise<ExtractedText> {
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse<ExtractedText> = await this.api.post('/ai/extract-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Text extraction from Image (OCR)
  async extractTextFromImage(file: File): Promise<ExtractedText> {
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse<ExtractedText> = await this.api.post('/ai/extract-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Generic text extraction
  async extractText(file: File): Promise<ExtractedText> {
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse<ExtractedText> = await this.api.post('/ai/extract-text', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;