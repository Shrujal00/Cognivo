/// <reference types="node" />
/// <reference types="node" />
import { ExtractedText, TextExtractionOptions } from '../types/ai';
export declare class TextProcessor {
    /**
     * Extract text from DOCX files
     */
    static extractTextFromDocx(buffer: Buffer, options?: TextExtractionOptions): Promise<ExtractedText>;
    /**
     * Extract text from plain text files
     */
    static extractTextFromTxt(buffer: Buffer, options?: TextExtractionOptions): Promise<ExtractedText>;
    /**
     * Clean and normalize extracted text
     */
    static cleanText(text: string): string;
    /**
     * Split text into chunks for processing
     */
    static splitTextIntoChunks(text: string, maxChunkSize?: number): string[];
    /**
     * Extract key phrases from text
     */
    static extractKeyPhrases(text: string, maxPhrases?: number): string[];
    /**
     * Detect language of text (simple heuristic)
     */
    static detectLanguage(text: string): string;
    /**
     * Calculate reading time for text
     */
    static calculateReadingTime(text: string, wordsPerMinute?: number): number;
    /**
     * Extract text from various document formats
     */
    static extractTextFromDocument(buffer: Buffer, mimeType: string, options?: TextExtractionOptions): Promise<ExtractedText>;
}
//# sourceMappingURL=text-processor.d.ts.map