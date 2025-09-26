import OpenAI from 'openai';
import { 
  NoteGenerationOptions, 
  GeneratedNote, 
  QuizGenerationOptions, 
  GeneratedQuiz, 
  QuizQuestion,
  QAOptions, 
  QAAnswer, 
  TranslationOptions, 
  TranslationResult,
  FlashcardGenerationOptions,
  GeneratedFlashcardSet,
  Flashcard,
  AudioToTextOptions,
  AudioTranscriptionResult,
  RoadmapGenerationOptions,
  StudyRoadmap,
  PerfectQuestionOptions,
  PerfectQuestion,
  ImageGenerationOptions,
  GeneratedImage,
  ResearchPDFOptions,
  ResearchPDF,
  TextExtractionOptions,
  ExtractedText,
  AIError,
  ProcessingProgress
} from '../types/ai';
import { aiConfig, validateConfig } from '../config/ai-config';
import { PDFParser } from '../utils/pdf-parser';
import { OCRProcessor } from '../utils/ocr-processor';
import { TextProcessor } from '../utils/text-processor';
import { Logger } from '../utils/logger';
import { CacheManager } from '../utils/cache-manager';
import { MetricsCollector } from '../utils/metrics-collector';
import { RetryManager } from '../utils/retry-manager';

export class AIService {
  private openai: OpenAI;
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();

  constructor() {
    validateConfig();
    this.openai = new OpenAI({
      apiKey: aiConfig.openai.apiKey,
    });
  }

  /**
   * Generate structured study notes from content
   */
  async generateNotes(
    content: string, 
    options: NoteGenerationOptions
  ): Promise<GeneratedNote> {
    try {
      this.checkRateLimit('generateNotes');
      
      const prompt = this.buildNoteGenerationPrompt(content, options);
      
      const response = await this.openai.chat.completions.create({
        model: aiConfig.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content generator. Create structured, comprehensive study notes that help students learn effectively.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: aiConfig.openai.maxTokens,
        temperature: aiConfig.openai.temperature
      });

      const generatedContent = response.choices[0]?.message?.content || '';
      const parsedNote = this.parseGeneratedNote(generatedContent, options);
      
      return parsedNote;
    } catch (error) {
      throw this.handleAIError(error, 'generateNotes');
    }
  }

  /**
   * Generate quiz questions from content
   */
  async generateQuiz(
    content: string, 
    options: QuizGenerationOptions
  ): Promise<GeneratedQuiz> {
    try {
      this.checkRateLimit('generateQuiz');
      
      const prompt = this.buildQuizGenerationPrompt(content, options);
      
      const response = await this.openai.chat.completions.create({
        model: aiConfig.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert quiz generator. Create high-quality educational questions that test understanding and knowledge retention.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: aiConfig.openai.maxTokens,
        temperature: aiConfig.openai.temperature
      });

      const generatedContent = response.choices[0]?.message?.content || '';
      const parsedQuiz = this.parseGeneratedQuiz(generatedContent, options);
      
      return parsedQuiz;
    } catch (error) {
      throw this.handleAIError(error, 'generateQuiz');
    }
  }

  /**
   * Answer questions using context
   */
  async answerQuestion(
    question: string, 
    context: string,
    options: QAOptions = { context: '', language: 'en', includeSource: true }
  ): Promise<QAAnswer> {
    try {
      this.checkRateLimit('answerQuestion');
      
      const prompt = this.buildQAPrompt(question, context, options);
      
      const response = await this.openai.chat.completions.create({
        model: aiConfig.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are Cognivo AI, an advanced educational assistant and learning companion. You are part of the Cognivo platform - a comprehensive AI-powered study platform. Your role is to provide accurate, helpful, and engaging educational answers. Always introduce yourself as Cognivo AI when appropriate and maintain a friendly, knowledgeable tone. You specialize in helping students learn through personalized guidance, study materials, and educational content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: aiConfig.openai.maxTokens,
        temperature: 0.3 // Lower temperature for more consistent answers
      });

      const answer = response.choices[0]?.message?.content || '';
      const confidence = this.calculateConfidence(answer, context);
      
      return {
        answer,
        confidence,
        sources: options.includeSource ? this.extractSources(context) : undefined,
        relatedTopics: this.extractRelatedTopics(answer),
        followUpQuestions: this.generateFollowUpQuestions(question, answer),
        language: options.language
      };
    } catch (error) {
      throw this.handleAIError(error, 'answerQuestion');
    }
  }

  /**
   * Generate flashcard sets from content
   */
  async generateFlashcards(
    content: string, 
    options: FlashcardGenerationOptions
  ): Promise<GeneratedFlashcardSet> {
    try {
      this.checkRateLimit('generateFlashcards');
      
      const prompt = this.buildFlashcardGenerationPrompt(content, options);
      
      const response = await this.openai.chat.completions.create({
        model: aiConfig.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator specializing in flashcard generation. Create effective, memorable flashcards that help students learn and retain information.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: aiConfig.openai.maxTokens,
        temperature: aiConfig.openai.temperature
      });

      const generatedContent = response.choices[0]?.message?.content || '';
      const parsedFlashcards = this.parseGeneratedFlashcards(generatedContent, options);
      
      return parsedFlashcards;
    } catch (error) {
      throw this.handleAIError(error, 'generateFlashcards');
    }
  }

  /**
   * Convert audio to text using OpenAI Whisper
   */
  async transcribeAudio(
    audioBuffer: Buffer,
    options: AudioToTextOptions
  ): Promise<AudioTranscriptionResult> {
    try {
      this.checkRateLimit('transcribeAudio');
      
      const response = await this.openai.audio.transcriptions.create({
        file: new File([audioBuffer], 'audio.mp3', { type: 'audio/mpeg' }),
        model: 'whisper-1',
        language: options.language,
        response_format: 'verbose_json',
        timestamp_granularities: options.includeTimestamps ? ['word', 'segment'] : undefined
      });

      const now = new Date();
      return {
        id: `transcription_${Date.now()}`,
        text: response.text,
        language: response.language || options.language || 'en',
        confidence: 0.95, // Whisper doesn't provide confidence scores
        duration: response.duration || 0,
        timestamps: options.includeTimestamps ? response.words?.map((w: any) => ({
          start: w.start,
          end: w.end,
          text: w.word
        })) : undefined,
        createdAt: now
      };
    } catch (error) {
      throw this.handleAIError(error, 'transcribeAudio');
    }
  }

  /**
   * Generate study roadmap
   */
  async generateStudyRoadmap(
    options: RoadmapGenerationOptions
  ): Promise<StudyRoadmap> {
    try {
      this.checkRateLimit('generateStudyRoadmap');
      
      const prompt = this.buildRoadmapPrompt(options);
      
      const response = await this.openai.chat.completions.create({
        model: aiConfig.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational planner specializing in creating comprehensive study roadmaps. Create detailed, structured learning paths that help students achieve their educational goals. ALWAYS include at least 3-5 specific, concrete tasks for EACH milestone in the tasks array with "id", "description", and "completed" fields. These tasks are the most critical part of the response. Each milestone must have tasks that can be completed and checked off. Format all output as valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: aiConfig.openai.maxTokens,
        temperature: aiConfig.openai.temperature
      });

      const generatedContent = response.choices[0]?.message?.content || '';
      const parsedRoadmap = this.parseGeneratedRoadmap(generatedContent, options);
      
      return parsedRoadmap;
    } catch (error) {
      throw this.handleAIError(error, 'generateStudyRoadmap');
    }
  }

  /**
   * Generate perfect questions based on content
   */
  async generatePerfectQuestions(
    content: string,
    options: PerfectQuestionOptions
  ): Promise<PerfectQuestion[]> {
    try {
      this.checkRateLimit('generatePerfectQuestions');
      
      const prompt = this.buildPerfectQuestionPrompt(content, options);
      
      const response = await this.openai.chat.completions.create({
        model: aiConfig.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert educator specializing in creating high-quality assessment questions. Generate questions that test different cognitive levels and learning objectives.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: aiConfig.openai.maxTokens,
        temperature: aiConfig.openai.temperature
      });

      const generatedContent = response.choices[0]?.message?.content || '';
      const parsedQuestions = this.parseGeneratedQuestions(generatedContent, options);
      
      return parsedQuestions;
    } catch (error) {
      throw this.handleAIError(error, 'generatePerfectQuestions');
    }
  }

  /**
   * Generate images/graphs from study content
   */
  async generateStudyImages(
    content: string,
    options: ImageGenerationOptions
  ): Promise<GeneratedImage[]> {
    try {
      this.checkRateLimit('generateStudyImages');
      
      const prompt = this.buildImageGenerationPrompt(content, options);
      
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural'
      });

      const now = new Date();
      return [{
        id: `image_${Date.now()}`,
        title: `Study Visual: ${options.style}`,
        description: `Generated ${options.style} for study content`,
        imageUrl: response.data?.[0]?.url || '',
        style: options.style,
        complexity: options.complexity,
        labels: [],
        relatedTopics: this.extractTopics(content),
        createdAt: now
      }];
    } catch (error) {
      throw this.handleAIError(error, 'generateStudyImages');
    }
  }

  /**
   * Generate research PDF from content
   */
  async generateResearchPDF(
    content: string,
    options: ResearchPDFOptions
  ): Promise<ResearchPDF> {
    try {
      this.checkRateLimit('generateResearchPDF');
      
      const prompt = this.buildResearchPDFPrompt(content, options);
      
      const response = await this.openai.chat.completions.create({
        model: aiConfig.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert academic writer specializing in creating comprehensive research documents. Generate well-structured, professional research papers with proper formatting and citations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: aiConfig.openai.maxTokens,
        temperature: aiConfig.openai.temperature
      });

      const generatedContent = response.choices[0]?.message?.content || '';
      const parsedPDF = this.parseGeneratedResearchPDF(generatedContent, options);
      
      return parsedPDF;
    } catch (error) {
      throw this.handleAIError(error, 'generateResearchPDF');
    }
  }

  /**
   * Translate educational content
   */
  async translateContent(
    content: string, 
    targetLanguage: string,
    options: TranslationOptions = { 
      targetLanguage: 'en', 
      preserveFormatting: true, 
      educationalOptimization: true, 
      confidenceThreshold: 0.8 
    }
  ): Promise<TranslationResult> {
    try {
      this.checkRateLimit('translateContent');
      
      const prompt = this.buildTranslationPrompt(content, targetLanguage, options);
      
      const response = await this.openai.chat.completions.create({
        model: aiConfig.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert translator specializing in educational content. Preserve formatting and optimize terminology for educational contexts.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: aiConfig.openai.maxTokens,
        temperature: 0.2 // Lower temperature for more consistent translations
      });

      const translatedText = response.choices[0]?.message?.content || '';
      const confidence = this.calculateTranslationConfidence(content, translatedText);
      
      return {
        originalText: content,
        translatedText,
        targetLanguage,
        confidence,
        preservedFormatting: options.preserveFormatting,
        educationalTerms: options.educationalOptimization ? 
          this.extractEducationalTerms(content, translatedText) : undefined
      };
    } catch (error) {
      throw this.handleAIError(error, 'translateContent');
    }
  }

  /**
   * Extract text from PDF files
   */
  async extractTextFromPDF(
    buffer: Buffer, 
    options: TextExtractionOptions = { includeMetadata: true }
  ): Promise<ExtractedText> {
    try {
      return await PDFParser.extractText(buffer, options);
    } catch (error) {
      throw this.handleAIError(error, 'extractTextFromPDF');
    }
  }

  /**
   * Extract text from images using OCR
   */
  async extractTextFromImage(
    buffer: Buffer, 
    options: TextExtractionOptions = { includeMetadata: true, ocrConfidence: 0.6 }
  ): Promise<ExtractedText> {
    try {
      return await OCRProcessor.extractTextFromImage(buffer, options);
    } catch (error) {
      throw this.handleAIError(error, 'extractTextFromImage');
    }
  }

  /**
   * Extract text from various document formats
   */
  async extractTextFromDocument(
    buffer: Buffer, 
    mimeType: string,
    options: TextExtractionOptions = { includeMetadata: true }
  ): Promise<ExtractedText> {
    try {
      return await TextProcessor.extractTextFromDocument(buffer, mimeType, options);
    } catch (error) {
      throw this.handleAIError(error, 'extractTextFromDocument');
    }
  }

  // Helper Methods

  private buildNoteGenerationPrompt(content: string, options: NoteGenerationOptions): string {
    const styleInstructions = {
      academic: 'Use formal academic language with proper citations and references.',
      casual: 'Use conversational, easy-to-understand language.',
      detailed: 'Provide comprehensive explanations with extensive examples.',
      summary: 'Create concise, bullet-point summaries focusing on key concepts.'
    };

    const difficultyInstructions = {
      easy: 'Use simple language and basic concepts suitable for beginners.',
      medium: 'Use intermediate language and concepts for students with some background.',
      hard: 'Use advanced language and complex concepts for advanced students.'
    };

    return `
Generate structured study notes from the following content:

Content: ${content}

Requirements:
- Difficulty Level: ${difficultyInstructions[options.difficulty]}
- Style: ${styleInstructions[options.style]}
- Language: ${options.language}
- Include Examples: ${options.includeExamples ? 'Yes' : 'No'}
- Include Study Questions: ${options.includeQuestions ? 'Yes' : 'No'}
- Max Length: ${options.maxLength || 'No limit'}

Format the response as JSON with the following structure:
{
  "title": "Main topic title",
  "keyConcepts": ["concept1", "concept2", "concept3"],
  "content": "Detailed study notes content",
  "examples": ["example1", "example2"] (if includeExamples is true),
  "studyQuestions": ["question1", "question2"] (if includeQuestions is true)
}
    `.trim();
  }

  private buildQuizGenerationPrompt(content: string, options: QuizGenerationOptions): string {
    const questionTypeInstructions = {
      'multiple-choice': 'Include 4 options (A, B, C, D) with one correct answer',
      'short-answer': 'Require brief written responses',
      'true-false': 'Simple true/false statements',
      'cloze': 'Fill-in-the-blank questions with context'
    };

    const difficultyInstructions = {
      easy: 'Basic recall and comprehension questions',
      medium: 'Application and analysis questions',
      hard: 'Synthesis and evaluation questions'
    };

    return `
Generate a quiz from the following content:

Content: ${content}

Requirements:
- Number of Questions: ${options.questionCount}
- Difficulty: ${difficultyInstructions[options.difficulty]}
- Question Types: ${options.questionTypes.map(type => questionTypeInstructions[type]).join(', ')}
- Subject: ${options.subject || 'General'}
- Language: ${options.language}

IMPORTANT: Respond with ONLY valid JSON. Do not include any text before or after the JSON. Use this exact structure:

{
  "title": "Quiz title",
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "A",
      "explanation": "Why this answer is correct"
    }
  ],
  "totalQuestions": ${options.questionCount},
  "difficulty": "${options.difficulty}",
  "subject": "${options.subject || 'General'}",
  "language": "${options.language}",
  "estimatedTime": 15
}

Note: correctAnswer should be a string (A, B, C, or D) representing the correct option letter.
    `.trim();
  }

  private buildQAPrompt(question: string, context: string, options: QAOptions): string {
    return `
As Cognivo AI, your educational learning companion, please answer the following question:

Question: ${question}

Context: ${context}

Instructions:
- Provide a clear, accurate answer as Cognivo AI
- If the answer is not in the context, provide helpful educational guidance
- Include relevant details and examples when available
- Maintain a friendly, educational tone
- Language: ${options.language}
- Max Length: ${options.maxLength || 'No limit'}

Remember: You are Cognivo AI, here to help with learning and education.

Answer:
    `.trim();
  }

  private buildFlashcardGenerationPrompt(content: string, options: FlashcardGenerationOptions): string {
    const cardTypeInstructions = {
      'basic': 'Create simple front/back flashcards with clear questions and answers',
      'cloze': 'Create fill-in-the-blank flashcards with missing words to complete',
      'multiple-choice': 'Create flashcards with multiple choice options on the back',
      'image-based': 'Create flashcards that reference images or visual elements'
    };

    const difficultyInstructions = {
      easy: 'Use simple vocabulary and basic concepts suitable for beginners',
      medium: 'Use intermediate vocabulary and concepts for students with some background',
      hard: 'Use advanced vocabulary and complex concepts for advanced students'
    };

    return `
Generate a flashcard set from the following content:

Content: ${content}

Requirements:
- Number of Cards: ${options.cardCount}
- Difficulty: ${difficultyInstructions[options.difficulty]}
- Card Type: ${cardTypeInstructions[options.cardType]}
- Language: ${options.language}
- Subject: ${options.subject || 'General'}
- Include Images: ${options.includeImages ? 'Yes' : 'No'}
- Include Audio: ${options.includeAudio ? 'Yes' : 'No'}

Format the response as JSON with the following structure:
{
  "title": "Flashcard Set Title",
  "description": "Brief description of the flashcard set",
  "cards": [
    {
      "id": "card1",
      "front": "Question or prompt",
      "back": "Answer or explanation",
      "difficulty": "${options.difficulty}",
      "subject": "${options.subject || 'General'}",
      "tags": ["tag1", "tag2"],
      "hints": ["hint1", "hint2"],
      "examples": ["example1", "example2"]
    }
  ],
  "totalCards": ${options.cardCount},
  "difficulty": "${options.difficulty}",
  "subject": "${options.subject || 'General'}",
  "language": "${options.language}",
  "estimatedStudyTime": 15,
  "tags": ["main-tag1", "main-tag2"]
}
    `.trim();
  }

  private buildTranslationPrompt(content: string, targetLanguage: string, options: TranslationOptions): string {
    return `
Translate the following educational content to ${targetLanguage}:

Content: ${content}

Instructions:
- Preserve formatting: ${options.preserveFormatting ? 'Yes' : 'No'}
- Optimize for educational context: ${options.educationalOptimization ? 'Yes' : 'No'}
- Maintain accuracy and clarity
- Use appropriate educational terminology

Translation:
    `.trim();
  }

  private parseGeneratedNote(content: string, options: NoteGenerationOptions): GeneratedNote {
    try {
      const parsed = JSON.parse(content);
      return {
        title: parsed.title || 'Generated Notes',
        keyConcepts: parsed.keyConcepts || [],
        content: parsed.content || '',
        examples: parsed.examples,
        studyQuestions: parsed.studyQuestions,
        difficulty: options.difficulty,
        language: options.language,
        confidence: 0.9 // High confidence for structured generation
      };
    } catch (error) {
      // Fallback parsing if JSON parsing fails
      return {
        title: 'Generated Notes',
        keyConcepts: [],
        content: content,
        difficulty: options.difficulty,
        language: options.language,
        confidence: 0.7
      };
    }
  }

  private parseGeneratedQuiz(content: string, options: QuizGenerationOptions): GeneratedQuiz {
    try {
      // Try to extract JSON from the response if it's wrapped in markdown
      let jsonContent = content;
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      } else {
        // Try to find JSON object in the content
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          jsonContent = content.substring(jsonStart, jsonEnd + 1);
        }
      }

      const parsed = JSON.parse(jsonContent);
      
      // Ensure questions array exists and has proper structure
      let questions = parsed.questions || [];
      if (!Array.isArray(questions)) {
        questions = [];
      }

      // Validate and fix question structure
      questions = questions.map((q: any, index: number) => ({
        id: q.id || `q${index + 1}`,
        question: q.question || q.text || `Question ${index + 1}`,
        options: Array.isArray(q.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: q.correctAnswer || q.answer || 'A',
        explanation: q.explanation || q.reason || '',
        difficulty: q.difficulty || options.difficulty,
        type: (q.type || 'multiple-choice') as 'multiple-choice' | 'short-answer' | 'true-false' | 'cloze'
      }));

      return {
        id: `quiz_${Date.now()}`,
        title: parsed.title || 'Generated Quiz',
        questions: questions,
        totalQuestions: questions.length || options.questionCount,
        difficulty: parsed.difficulty || options.difficulty,
        subject: parsed.subject || options.subject,
        language: parsed.language || options.language,
        estimatedTime: parsed.estimatedTime || Math.max(15, questions.length * 2)
      };
    } catch (error) {
      // Fallback: create a simple quiz with the content
      console.warn('Quiz parsing failed, creating fallback quiz:', error);
      
      const fallbackQuestions: QuizQuestion[] = [
        {
          id: 'q1',
          question: 'What is the main topic of this content?',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'A',
          explanation: 'This is a fallback question due to parsing error.',
          difficulty: options.difficulty,
          type: 'multiple-choice' as const
        }
      ];

      return {
        id: `quiz_${Date.now()}`,
        title: 'Generated Quiz (Fallback)',
        questions: fallbackQuestions,
        totalQuestions: 1,
        difficulty: options.difficulty,
        subject: options.subject,
        language: options.language,
        estimatedTime: 5
      };
    }
  }

  private parseGeneratedFlashcards(content: string, options: FlashcardGenerationOptions): GeneratedFlashcardSet {
    try {
      const parsed = JSON.parse(content);
      const now = new Date();
      
      return {
        id: `flashcards_${Date.now()}`,
        title: parsed.title || 'Generated Flashcard Set',
        description: parsed.description || 'AI-generated flashcard set',
        cards: (parsed.cards || []).map((card: any, index: number) => ({
          id: card.id || `card_${index + 1}`,
          front: card.front || '',
          back: card.back || '',
          difficulty: card.difficulty || options.difficulty,
          subject: card.subject || options.subject,
          tags: card.tags || [],
          hints: card.hints || [],
          examples: card.examples || [],
          imageUrl: card.imageUrl,
          audioUrl: card.audioUrl,
          createdAt: now
        })),
        totalCards: parsed.totalCards || options.cardCount,
        difficulty: parsed.difficulty || options.difficulty,
        subject: parsed.subject || options.subject,
        language: parsed.language || options.language,
        estimatedStudyTime: parsed.estimatedStudyTime || 15,
        tags: parsed.tags || [],
        createdAt: now
      };
    } catch (error) {
      // Fallback parsing if JSON parsing fails
      const now = new Date();
      return {
        id: `flashcards_${Date.now()}`,
        title: 'Generated Flashcard Set',
        description: 'AI-generated flashcard set',
        cards: [{
          id: 'card_1',
          front: 'Sample Question',
          back: 'Sample Answer',
          difficulty: options.difficulty,
          subject: options.subject,
          tags: [],
          hints: [],
          examples: [],
          createdAt: now
        }],
        totalCards: 1,
        difficulty: options.difficulty,
        subject: options.subject,
        language: options.language,
        estimatedStudyTime: 5,
        tags: [],
        createdAt: now
      };
    }
  }

  private calculateConfidence(answer: string, context: string): number {
    // Simple confidence calculation based on answer length and context relevance
    const answerLength = answer.length;
    const contextLength = context.length;
    const relevanceScore = Math.min(answerLength / contextLength * 10, 1);
    
    return Math.min(relevanceScore + 0.5, 1); // Base confidence of 0.5
  }

  private calculateTranslationConfidence(original: string, translated: string): number {
    // Simple confidence calculation for translations
    const lengthRatio = translated.length / original.length;
    const confidence = Math.max(0.5, Math.min(1, 1 - Math.abs(lengthRatio - 1) * 0.5));
    return confidence;
  }

  private extractSources(context: string): string[] {
    // Extract potential sources from context (simplified)
    const sources: string[] = [];
    const lines = context.split('\n');
    
    lines.forEach(line => {
      if (line.includes('Source:') || line.includes('Reference:')) {
        sources.push(line.trim());
      }
    });
    
    return sources;
  }

  private extractRelatedTopics(answer: string): string[] {
    // Simple related topic extraction
    const topics: string[] = [];
    const keywords = ['concept', 'theory', 'method', 'principle', 'approach'];
    
    keywords.forEach(keyword => {
      if (answer.toLowerCase().includes(keyword)) {
        topics.push(keyword);
      }
    });
    
    return topics;
  }

  private generateFollowUpQuestions(originalQuestion: string, answer: string): string[] {
    // Generate follow-up questions based on the answer
    return [
      `Can you explain more about ${originalQuestion.toLowerCase()}?`,
      `What are the practical applications of this concept?`,
      `How does this relate to other topics in the subject?`
    ];
  }

  private extractEducationalTerms(original: string, translated: string): { [key: string]: string } {
    // Extract educational terms and their translations
    const terms: { [key: string]: string } = {};
    const educationalWords = ['concept', 'theory', 'principle', 'method', 'analysis', 'synthesis'];
    
    educationalWords.forEach(word => {
      if (original.toLowerCase().includes(word)) {
        // This is a simplified extraction - in practice, you'd use more sophisticated NLP
        terms[word] = word; // Placeholder
      }
    });
    
    return terms;
  }

  private checkRateLimit(operation: string): void {
    const now = Date.now();
    const key = `${operation}_${Math.floor(now / aiConfig.rateLimit.windowMs)}`;
    
    const current = this.rateLimitMap.get(key) || { count: 0, resetTime: now + aiConfig.rateLimit.windowMs };
    
    if (current.count >= aiConfig.rateLimit.maxRequests) {
      throw new Error(`Rate limit exceeded for ${operation}. Try again later.`);
    }
    
    this.rateLimitMap.set(key, { count: current.count + 1, resetTime: current.resetTime });
  }

  private handleAIError(error: unknown, operation: string): AIError {
    const aiError = error as AIError;
    aiError.code = `AI_${operation.toUpperCase()}_ERROR`;
    aiError.statusCode = 500;
    aiError.retryable = true;
    return aiError;
  }

  private buildRoadmapPrompt(options: RoadmapGenerationOptions): string {
    const learningStyleInstructions = {
      visual: 'Include diagrams, charts, and visual learning materials',
      auditory: 'Focus on lectures, discussions, and audio content',
      kinesthetic: 'Emphasize hands-on activities and practical exercises',
      reading: 'Prioritize textbooks, articles, and written materials'
    };

    return `
Create a comprehensive study roadmap for the following requirements:

Subject: ${options.subject}
Difficulty Level: ${options.difficulty}
Duration: ${options.duration} weeks
Hours per Week: ${options.hoursPerWeek}
Learning Style: ${learningStyleInstructions[options.learningStyle]}
Goals: ${options.goals.join(', ')}
Prerequisites: ${options.prerequisites?.join(', ') || 'None specified'}
Language: ${options.language}

Create a detailed roadmap with:
1. Weekly milestones with specific learning objectives
2. CRITICAL AND REQUIRED: Every milestone MUST include at least 3-5 specific tasks in the "tasks" array field
   - Each task must have an "id" and "description" field formatted exactly like this example:
   - Tasks JSON format: { "id": "task1_1", "description": "Read chapter 3", "completed": false }
   - Tasks must be concrete, actionable items (e.g., "Read chapter 3", "Complete exercise set 2", "Implement a linked list")
   - The tasks array MUST NOT be empty - this is the most important part of the roadmap
3. Recommended resources for each week, including:
   - At least 2 YouTube video recommendations per week (include title, URL and what makes it valuable)
   - Books, articles, and other learning materials
4. Assessment methods for each milestone
5. Estimated time allocation for each topic
6. Prerequisites and dependencies between topics

Format as JSON with this structure:
{
  "title": "Study Roadmap Title",
  "milestones": [
    {
      "id": "milestone1",
      "title": "Week 1: Introduction",
      "description": "Detailed description",
      "week": 1,
      "topics": ["topic1", "topic2"],
      "tasks": [
        {"id": "task1_1", "description": "Complete specific task 1", "completed": false},
        {"id": "task1_2", "description": "Complete specific task 2", "completed": false}
      ],
      "resources": [
        {"type": "book", "title": "Resource Title", "description": "Book description"},
        {"type": "article", "title": "Article Title", "description": "Article description"}
      ],
      "youtubeResources": [
        {"title": "Most viewed video on topic", "url": "video-url", "reason": "Has over 1M views and excellent explanations"},
        {"title": "Highest rated tutorial", "url": "video-url", "reason": "Highly rated for clarity and depth"}
      ],
      "activities": ["activity1", "activity2"],
      "assessment": "Assessment method",
      "estimatedHours": 10,
      "completed": false
    }
  ],
  "weeklySchedule": [
    {
      "week": 1,
      "milestones": ["milestone1"],
      "hours": 10
    }
  ]
}
    `.trim();
  }

  private buildPerfectQuestionPrompt(content: string, options: PerfectQuestionOptions): string {
    const cognitiveLevelInstructions = {
      remember: 'Test recall of facts, terms, basic concepts',
      understand: 'Test comprehension and interpretation',
      apply: 'Test ability to use knowledge in new situations',
      analyze: 'Test ability to break down information and identify patterns',
      evaluate: 'Test ability to make judgments and justify decisions',
      create: 'Test ability to produce original work or solutions'
    };

    return `
Generate high-quality assessment questions based on the following content:

Content: ${content}

Requirements:
- Question Type: ${options.questionType}
- Difficulty: ${options.difficulty}
- Cognitive Level: ${cognitiveLevelInstructions[options.cognitiveLevel]}
- Focus Area: ${options.focusArea || 'General content'}
- Language: ${options.language}

Generate 5 questions that:
1. Test the specified cognitive level
2. Are appropriate for the difficulty level
3. Cover different aspects of the content
4. Include clear, detailed explanations
5. Provide helpful hints for students

Format as JSON array:
[
  {
    "id": "q1",
    "question": "Question text",
    "type": "${options.questionType}",
    "difficulty": "${options.difficulty}",
    "cognitiveLevel": "${options.cognitiveLevel}",
    "focusArea": "${options.focusArea || 'General'}",
    "answer": "Detailed answer",
    "explanation": "Why this answer is correct",
    "hints": ["hint1", "hint2"],
    "relatedTopics": ["topic1", "topic2"],
    "estimatedTime": 5,
    "points": 10
  }
]
    `.trim();
  }

  private buildImageGenerationPrompt(content: string, options: ImageGenerationOptions): string {
    const styleInstructions = {
      academic: 'Clean, professional academic diagram with clear labels',
      diagram: 'Technical diagram showing processes or relationships',
      infographic: 'Colorful infographic with statistics and key points',
      mindmap: 'Central topic with branching subtopics and connections',
      timeline: 'Chronological timeline with events and dates',
      flowchart: 'Step-by-step process flow with decision points'
    };

    return `
Create a ${options.style} visualization for the following educational content:

Content: ${content}

Style: ${styleInstructions[options.style]}
Complexity: ${options.complexity}
Include Labels: ${options.includeLabels ? 'Yes' : 'No'}
Include Colors: ${options.includeColors ? 'Yes' : 'No'}

Generate a detailed, educational image that:
1. Clearly represents the key concepts
2. Uses appropriate visual hierarchy
3. Includes relevant labels and annotations
4. Is suitable for ${options.complexity} level understanding
5. Follows academic design principles

Focus on making the content visually accessible and educationally effective.
    `.trim();
  }

  private buildResearchPDFPrompt(content: string, options: ResearchPDFOptions): string {
    const formatInstructions = {
      academic: 'Formal academic paper with abstract, introduction, methodology, results, discussion, conclusion, and references',
      report: 'Professional report with executive summary, findings, recommendations, and appendices',
      summary: 'Concise summary with key points, main findings, and conclusions',
      analysis: 'Detailed analysis with data interpretation, trends, and insights'
    };

    return `
Create a comprehensive research document based on the following content:

Content: ${content}

Format: ${formatInstructions[options.format]}
Length: ${options.length}
Include References: ${options.includeReferences ? 'Yes' : 'No'}
Include Abstract: ${options.includeAbstract ? 'Yes' : 'No'}
Include Table of Contents: ${options.includeTableOfContents ? 'Yes' : 'No'}
Language: ${options.language}

Generate a well-structured document that:
1. Follows academic writing standards
2. Includes proper citations and references
3. Has clear sections and logical flow
4. Provides comprehensive analysis
5. Is professionally formatted

Format as JSON with this structure:
{
  "title": "Research Document Title",
  "content": "Full document content",
  "sections": [
    {
      "title": "Section Title",
      "content": "Section content",
      "pageNumber": 1
    }
  ],
  "references": [
    {
      "title": "Reference Title",
      "url": "https://example.com",
      "authors": ["Author 1", "Author 2"]
    }
  ],
  "abstract": "Document abstract",
  "tableOfContents": [
    {
      "title": "Section Title",
      "pageNumber": 1
    }
  ]
}
    `.trim();
  }

  private parseGeneratedRoadmap(content: string, options: RoadmapGenerationOptions): any {
    // Changed return type to 'any' for flexibility
    try {
      // Enhanced error handling for JSON parsing
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (error) {
        const jsonError = error as Error;
        console.error("JSON Parse Error:", jsonError.message);
        console.error("Content received:", content.substring(0, 200) + "...");
        
        // Try to extract JSON using regex if direct parsing fails
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
            console.log("Successfully extracted JSON with regex");
          } catch (error) {
            const extractError = error as Error;
            throw new Error(`Failed to parse JSON content: ${extractError.message}`);
          }
        } else {
          throw new Error("No valid JSON found in the response");
        }
      }
      
      const now = new Date();
      
      // Create a proper roadmap with milestones even if parsing fails partially
      if (!parsed.milestones || !Array.isArray(parsed.milestones) || parsed.milestones.length === 0) {
        console.log("No valid milestones found in response, creating default milestones");
        parsed.milestones = Array.from({ length: options.duration }, (_, i) => ({
          id: `milestone_${i + 1}`,
          title: `Week ${i + 1}: ${i === 0 ? 'Introduction' : `Advanced Topics ${i}`}`,
          description: i === 0 ? 
            `Introduction to key concepts in ${options.subject}` : 
            `Build on previous knowledge and explore advanced topics in ${options.subject}`,
          week: i + 1,
          topics: [`Topic ${i+1}.1`, `Topic ${i+1}.2`],
          tasks: [
            { id: `task_${i+1}_1`, description: `Read introductory materials on ${options.subject}`, completed: false },
            { id: `task_${i+1}_2`, description: `Complete practice exercises for Week ${i+1}`, completed: false },
            { id: `task_${i+1}_3`, description: `Create summary notes of key concepts`, completed: false }
          ],
          resources: [`Book: ${options.subject} fundamentals`],
          activities: ['Practice exercises']
        }));
      }
      
      return {
        id: `roadmap_${Date.now()}`,
        title: parsed.title || `${options.subject} Study Roadmap`,
        subject: options.subject,
        difficulty: options.difficulty,
        duration: options.duration,
        totalHours: options.duration * options.hoursPerWeek,
        milestones: (parsed.milestones || []).map((m: any, index: number) => {
          // Convert complex resource objects to strings if needed
          let resourceStrings = [];
          if (m.resources && Array.isArray(m.resources)) {
            resourceStrings = m.resources.map((r: any) => {
              if (typeof r === 'string') return r;
              if (r.title && r.type) {
                return `${r.type}: ${r.title}${r.description ? ` - ${r.description}` : ''}`;
              }
              return JSON.stringify(r);
            });
          }
          
          // Ensure tasks are properly formatted
          let formattedTasks = [];
          if (m.tasks && Array.isArray(m.tasks)) {
            formattedTasks = m.tasks.map((task: any, taskIndex: number) => {
              if (typeof task === 'string') {
                // Convert string tasks to proper task objects
                return {
                  id: `task_${index + 1}_${taskIndex + 1}`,
                  description: task,
                  completed: false
                };
              }
              // Ensure task object has all required properties
              return {
                id: task.id || `task_${index + 1}_${taskIndex + 1}`,
                description: task.description || `Task ${taskIndex + 1}`,
                completed: task.completed !== undefined ? task.completed : false
              };
            });
          }
          
          // If no tasks provided or less than minimum, create or add default tasks
          if (formattedTasks.length < 3) {
            // Keep any existing tasks
            const defaultTasks = [
              { id: `task_${index + 1}_1`, description: `Read materials on ${m.title || 'this topic'}`, completed: false },
              { id: `task_${index + 1}_2`, description: `Complete practice exercises for ${m.title || 'this topic'}`, completed: false },
              { id: `task_${index + 1}_3`, description: `Review and summarize key concepts from ${m.title || 'this topic'}`, completed: false },
              { id: `task_${index + 1}_4`, description: `Implement a project applying ${m.title || 'these concepts'}`, completed: false },
              { id: `task_${index + 1}_5`, description: `Create a presentation on ${m.title || 'this topic'}`, completed: false }
            ];
            
            // Add enough default tasks to reach minimum of 3
            for (let i = formattedTasks.length; i < 3; i++) {
              formattedTasks.push(defaultTasks[i]);
            }
          }
          
          return {
            id: m.id || `milestone_${index + 1}`,
            title: m.title || `Milestone ${index + 1}`,
            description: m.description || '',
            week: m.week || index + 1,
            topics: m.topics || [],
            tasks: formattedTasks,
            resources: resourceStrings,
            youtubeResources: m.youtubeResources || [],
            activities: m.activities || [],
            assessment: m.assessment || '',
            estimatedHours: m.estimatedHours || options.hoursPerWeek,
            completed: false
          };
        }),
        weeklySchedule: parsed.weeklySchedule || [],
        createdAt: now.toISOString() // Convert Date to ISO string format
      };
    } catch (error) {
      // Fallback roadmap
      const now = new Date();
      return {
        id: `roadmap_${Date.now()}`,
        title: `${options.subject} Study Roadmap (Fallback)`,
        subject: options.subject,
        difficulty: options.difficulty,
        duration: options.duration,
        totalHours: options.duration * options.hoursPerWeek,
        milestones: [{
          id: 'milestone1',
          title: 'Week 1: Introduction',
          description: 'Get started with the basics',
          week: 1,
          topics: ['Introduction', 'Fundamentals'],
          tasks: [
            { id: 'task1_1', description: 'Read introduction chapter', completed: false },
            { id: 'task1_2', description: 'Complete practice exercises', completed: false }
          ],
          resources: ['Textbook', 'Online tutorials'],
          youtubeResources: [
            { 
              title: 'Introduction to ' + options.subject, 
              url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent('introduction to ' + options.subject), 
              reason: 'Great starting point for beginners' 
            }
          ],
          activities: ['Reading', 'Practice exercises'],
          assessment: 'Quiz',
          estimatedHours: options.hoursPerWeek,
          completed: false
        }],
        weeklySchedule: [{ week: 1, milestones: ['milestone1'], hours: options.hoursPerWeek }],
        createdAt: now.toISOString()
      };
    }
  }

  private parseGeneratedQuestions(content: string, options: PerfectQuestionOptions): PerfectQuestion[] {
    try {
      const parsed = JSON.parse(content);
      const now = new Date();
      
      return (parsed || []).map((q: any, index: number) => ({
        id: q.id || `question_${index + 1}`,
        question: q.question || `Question ${index + 1}`,
        type: q.type || options.questionType,
        difficulty: q.difficulty || options.difficulty,
        cognitiveLevel: q.cognitiveLevel || options.cognitiveLevel,
        focusArea: q.focusArea || options.focusArea,
        answer: q.answer || '',
        explanation: q.explanation || '',
        hints: q.hints || [],
        relatedTopics: q.relatedTopics || [],
        estimatedTime: q.estimatedTime || 5,
        points: q.points || 10
      }));
    } catch (error) {
      // Fallback question
      return [{
        id: 'question_1',
        question: 'What is the main concept discussed in this content?',
        type: options.questionType,
        difficulty: options.difficulty,
        cognitiveLevel: options.cognitiveLevel,
        focusArea: options.focusArea,
        answer: 'This is a fallback question due to parsing error.',
        explanation: 'This question was generated as a fallback.',
        hints: ['Review the main topics', 'Look for key concepts'],
        relatedTopics: [],
        estimatedTime: 5,
        points: 10
      }];
    }
  }

  private parseGeneratedResearchPDF(content: string, options: ResearchPDFOptions): ResearchPDF {
    try {
      const parsed = JSON.parse(content);
      const now = new Date();
      
      return {
        id: `research_${Date.now()}`,
        title: parsed.title || 'Generated Research Document',
        content: parsed.content || content,
        format: options.format,
        length: options.length,
        wordCount: (parsed.content || content).split(' ').length,
        sections: parsed.sections || [],
        references: parsed.references || [],
        abstract: parsed.abstract,
        tableOfContents: parsed.tableOfContents,
        createdAt: now
      };
    } catch (error) {
      // Fallback PDF
      const now = new Date();
      return {
        id: `research_${Date.now()}`,
        title: 'Generated Research Document (Fallback)',
        content: content,
        format: options.format,
        length: options.length,
        wordCount: content.split(' ').length,
        sections: [{ title: 'Main Content', content: content, pageNumber: 1 }],
        references: [],
        createdAt: now
      };
    }
  }

  private extractTopics(content: string): string[] {
    // Simple topic extraction - in a real implementation, this would be more sophisticated
    const words = content.toLowerCase().split(/\s+/);
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);
    
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      if (word.length > 3 && !commonWords.has(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }
}
