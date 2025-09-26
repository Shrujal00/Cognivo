/// <reference types="node" />
/// <reference types="node" />
import { ExtractedText, TextExtractionOptions } from '../types/ai';
export declare class OCRProcessor {
    /**
     * Extract text from image using OCR
     */
    static extractTextFromImage(buffer: Buffer, options?: TextExtractionOptions): Promise<ExtractedText>;
    /**
     * Preprocess image for better OCR results
     */
    private static preprocessImage;
    /**
     * Detect image type from buffer
     */
    private static detectImageType;
    /**
     * Extract text from multiple images
     */
    static extractTextFromImages(buffers: Buffer[], options?: TextExtractionOptions): Promise<ExtractedText[]>;
    /**
     * Get supported languages for OCR
     */
    static getSupportedLanguages(): string[];
}
//# sourceMappingURL=ocr-processor.d.ts.map