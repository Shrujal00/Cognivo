/// <reference types="node" />
/// <reference types="node" />
import { NoteGenerationOptions, GeneratedNote, QuizGenerationOptions, GeneratedQuiz, QAOptions, QAAnswer, TranslationOptions, TranslationResult, FlashcardGenerationOptions, GeneratedFlashcardSet, AudioToTextOptions, AudioTranscriptionResult, RoadmapGenerationOptions, StudyRoadmap, PerfectQuestionOptions, PerfectQuestion, ImageGenerationOptions, GeneratedImage, ResearchPDFOptions, ResearchPDF, TextExtractionOptions, ExtractedText } from '../types/ai';
export declare class AIService {
    private openai;
    private rateLimitMap;
    constructor();
    /**
     * Generate structured study notes from content
     */
    generateNotes(content: string, options: NoteGenerationOptions): Promise<GeneratedNote>;
    /**
     * Generate quiz questions from content
     */
    generateQuiz(content: string, options: QuizGenerationOptions): Promise<GeneratedQuiz>;
    /**
     * Answer questions using context
     */
    answerQuestion(question: string, context: string, options?: QAOptions): Promise<QAAnswer>;
    /**
     * Generate flashcard sets from content
     */
    generateFlashcards(content: string, options: FlashcardGenerationOptions): Promise<GeneratedFlashcardSet>;
    /**
     * Convert audio to text using OpenAI Whisper
     */
    transcribeAudio(audioBuffer: Buffer, options: AudioToTextOptions): Promise<AudioTranscriptionResult>;
    /**
     * Generate study roadmap
     */
    generateStudyRoadmap(options: RoadmapGenerationOptions): Promise<StudyRoadmap>;
    /**
     * Generate perfect questions based on content
     */
    generatePerfectQuestions(content: string, options: PerfectQuestionOptions): Promise<PerfectQuestion[]>;
    /**
     * Generate images/graphs from study content
     */
    generateStudyImages(content: string, options: ImageGenerationOptions): Promise<GeneratedImage[]>;
    /**
     * Generate research PDF from content
     */
    generateResearchPDF(content: string, options: ResearchPDFOptions): Promise<ResearchPDF>;
    /**
     * Translate educational content
     */
    translateContent(content: string, targetLanguage: string, options?: TranslationOptions): Promise<TranslationResult>;
    /**
     * Extract text from PDF files
     */
    extractTextFromPDF(buffer: Buffer, options?: TextExtractionOptions): Promise<ExtractedText>;
    /**
     * Extract text from images using OCR
     */
    extractTextFromImage(buffer: Buffer, options?: TextExtractionOptions): Promise<ExtractedText>;
    /**
     * Extract text from various document formats
     */
    extractTextFromDocument(buffer: Buffer, mimeType: string, options?: TextExtractionOptions): Promise<ExtractedText>;
    private buildNoteGenerationPrompt;
    private buildQuizGenerationPrompt;
    private buildQAPrompt;
    private buildFlashcardGenerationPrompt;
    private buildTranslationPrompt;
    private parseGeneratedNote;
    private parseGeneratedQuiz;
    private parseGeneratedFlashcards;
    private calculateConfidence;
    private calculateTranslationConfidence;
    private extractSources;
    private extractRelatedTopics;
    private generateFollowUpQuestions;
    private extractEducationalTerms;
    private checkRateLimit;
    private handleAIError;
    private buildRoadmapPrompt;
    private buildPerfectQuestionPrompt;
    private buildImageGenerationPrompt;
    private buildResearchPDFPrompt;
    private parseGeneratedRoadmap;
    private parseGeneratedQuestions;
    private parseGeneratedResearchPDF;
    private extractTopics;
}
//# sourceMappingURL=ai.d.ts.map