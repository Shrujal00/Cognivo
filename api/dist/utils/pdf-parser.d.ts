/// <reference types="node" />
/// <reference types="node" />
import { ExtractedText, TextExtractionOptions } from '../types/ai';
export declare class PDFParser {
    /**
     * Extract text content from PDF buffer
     */
    static extractText(buffer: Buffer, options?: TextExtractionOptions): Promise<ExtractedText>;
    /**
     * Extract text from specific pages
     */
    static extractTextFromPages(buffer: Buffer, pageNumbers: number[], options?: TextExtractionOptions): Promise<ExtractedText>;
    /**
     * Get PDF metadata without extracting full text
     */
    static getMetadata(buffer: Buffer): Promise<{
        pageCount: number;
        fileSize: number;
    }>;
}
//# sourceMappingURL=pdf-parser.d.ts.map