// AI-specific type definitions for Cognivo

export interface NoteGenerationOptions {
  difficulty: 'easy' | 'medium' | 'hard';
  style: 'academic' | 'casual' | 'detailed' | 'summary';
  language: string;
  includeExamples: boolean;
  includeQuestions: boolean;
  maxLength?: number;
}

export interface GeneratedNote {
  title: string;
  keyConcepts: string[];
  content: string;
  examples?: string[];
  studyQuestions?: string[];
  difficulty: string;
  language: string;
  confidence: number;
}

export interface QuizGenerationOptions {
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questionTypes: ('multiple-choice' | 'short-answer' | 'true-false' | 'cloze')[];
  subject?: string;
  language: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'short-answer' | 'true-false' | 'cloze';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: string;
  subject?: string;
}

export interface GeneratedQuiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  totalQuestions: number;
  difficulty: string;
  subject?: string;
  language: string;
  estimatedTime: number; // in minutes
}

export interface QAOptions {
  context: string;
  language: string;
  includeSource: boolean;
  maxLength?: number;
}

export interface QAAnswer {
  answer: string;
  confidence: number;
  sources?: string[];
  relatedTopics?: string[];
  followUpQuestions?: string[];
  language: string;
}

export interface TranslationOptions {
  targetLanguage: string;
  preserveFormatting: boolean;
  educationalOptimization: boolean;
  confidenceThreshold: number;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  targetLanguage: string;
  confidence: number;
  preservedFormatting: boolean;
  educationalTerms?: { [key: string]: string };
}

export interface FlashcardGenerationOptions {
  cardCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cardType: 'basic' | 'cloze' | 'multiple-choice' | 'image-based';
  language: string;
  includeImages: boolean;
  includeAudio: boolean;
  subject?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: string;
  subject?: string;
  tags?: string[];
  hints?: string[];
  examples?: string[];
  imageUrl?: string;
  audioUrl?: string;
  createdAt: Date;
}

export interface GeneratedFlashcardSet {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
  totalCards: number;
  difficulty: string;
  subject?: string;
  language: string;
  estimatedStudyTime: number; // in minutes
  tags: string[];
  createdAt: Date;
}

export interface AudioToTextOptions {
  language?: string;
  includeTimestamps: boolean;
  includeConfidence: boolean;
  includeSpeakerDiarization: boolean;
  maxAlternatives: number;
}

export interface AudioTranscriptionResult {
  id: string;
  text: string;
  language: string;
  confidence: number;
  duration: number; // in seconds
  timestamps?: { start: number; end: number; text: string }[];
  speakers?: { speaker: string; text: string; start: number; end: number }[];
  alternatives?: { text: string; confidence: number }[];
  createdAt: Date;
}

export interface RoadmapGenerationOptions {
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in weeks
  hoursPerWeek: number;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  goals: string[];
  prerequisites?: string[];
  language: string;
}

export interface YoutubeResource {
  title: string;
  url: string;
  reason: string;
}

export interface Task {
  id: string;
  description: string;
  completed: boolean;
}

export interface StudyMilestone {
  id: string;
  title: string;
  description: string;
  week: number;
  topics: string[];
  tasks?: Task[];
  resources: string[];
  youtubeResources?: YoutubeResource[];
  activities: string[];
  assessment: string;
  estimatedHours: number;
  completed: boolean;
}

export interface StudyRoadmap {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
  duration: number;
  totalHours: number;
  milestones: StudyMilestone[];
  weeklySchedule: { week: number; milestones: string[]; hours: number }[];
  createdAt: string; // Changed from Date to string for consistent JSON serialization
}

export interface PerfectQuestionOptions {
  questionType: 'multiple-choice' | 'short-answer' | 'essay' | 'problem-solving';
  difficulty: 'easy' | 'medium' | 'hard';
  focusArea?: string;
  cognitiveLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  language: string;
}

export interface PerfectQuestion {
  id: string;
  question: string;
  type: string;
  difficulty: string;
  cognitiveLevel: string;
  focusArea?: string;
  answer: string;
  explanation: string;
  hints: string[];
  relatedTopics: string[];
  estimatedTime: number; // in minutes
  points: number;
}

export interface ImageGenerationOptions {
  style: 'academic' | 'diagram' | 'infographic' | 'mindmap' | 'timeline' | 'flowchart';
  complexity: 'simple' | 'detailed' | 'comprehensive';
  includeLabels: boolean;
  includeColors: boolean;
  language: string;
}

export interface GeneratedImage {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  style: string;
  complexity: string;
  labels: string[];
  relatedTopics: string[];
  createdAt: Date;
}

export interface ResearchPDFOptions {
  format: 'academic' | 'report' | 'summary' | 'analysis';
  length: 'short' | 'medium' | 'long';
  includeReferences: boolean;
  includeAbstract: boolean;
  includeTableOfContents: boolean;
  language: string;
}

export interface ResearchPDF {
  id: string;
  title: string;
  content: string;
  format: string;
  length: string;
  wordCount: number;
  sections: { title: string; content: string; pageNumber: number }[];
  references: { title: string; url: string; authors: string[] }[];
  abstract?: string;
  tableOfContents?: { title: string; pageNumber: number }[];
  createdAt: Date;
}

export interface TextExtractionOptions {
  includeMetadata: boolean;
  language?: string;
  ocrConfidence?: number;
}

export interface ExtractedText {
  text: string;
  metadata?: {
    pageCount?: number;
    dimensions?: { width: number; height: number };
    fileSize: number;
    mimeType: string;
    extractedAt: Date;
  };
  confidence?: number;
  language?: string;
}

export interface AIConfig {
  openai: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  fileUpload: {
    maxFileSize: number;
    allowedTypes: string[];
  };
}

export interface AIError extends Error {
  code: string;
  statusCode: number;
  retryable: boolean;
}

export interface ProcessingProgress {
  stage: 'extracting' | 'processing' | 'generating' | 'formatting' | 'complete';
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number; // in seconds
}
