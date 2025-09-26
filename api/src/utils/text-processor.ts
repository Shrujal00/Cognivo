import mammoth from 'mammoth';
import { ExtractedText, TextExtractionOptions } from '../types/ai';

export class TextProcessor {
  /**
   * Extract text from DOCX files
   */
  static async extractTextFromDocx(
    buffer: Buffer, 
    options: TextExtractionOptions = { includeMetadata: true }
  ): Promise<ExtractedText> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      
      const extractedText: ExtractedText = {
        text: result.value,
        metadata: options.includeMetadata ? {
          fileSize: buffer.length,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          extractedAt: new Date()
        } : undefined,
        confidence: 1.0
      };

      return extractedText;
    } catch (error) {
      throw new Error(`DOCX parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from plain text files
   */
  static async extractTextFromTxt(
    buffer: Buffer, 
    options: TextExtractionOptions = { includeMetadata: true }
  ): Promise<ExtractedText> {
    try {
      const text = buffer.toString('utf-8');
      
      const extractedText: ExtractedText = {
        text,
        metadata: options.includeMetadata ? {
          fileSize: buffer.length,
          mimeType: 'text/plain',
          extractedAt: new Date()
        } : undefined,
        confidence: 1.0
      };

      return extractedText;
    } catch (error) {
      throw new Error(`Text file parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clean and normalize extracted text
   */
  static cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .replace(/\s{2,}/g, ' ') // Remove excessive spaces
      .trim();
  }

  /**
   * Split text into chunks for processing
   */
  static splitTextIntoChunks(text: string, maxChunkSize: number = 4000): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/);
    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      if (currentChunk.length + trimmedSentence.length + 1 <= maxChunkSize) {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk + '.');
          currentChunk = trimmedSentence;
        } else {
          // If single sentence is too long, split by words
          const words = trimmedSentence.split(' ');
          let wordChunk = '';
          
          for (const word of words) {
            if (wordChunk.length + word.length + 1 <= maxChunkSize) {
              wordChunk += (wordChunk ? ' ' : '') + word;
            } else {
              if (wordChunk) {
                chunks.push(wordChunk);
                wordChunk = word;
              } else {
                chunks.push(word);
              }
            }
          }
          currentChunk = wordChunk;
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk + '.');
    }

    return chunks.filter(chunk => chunk.trim().length > 0);
  }

  /**
   * Extract key phrases from text
   */
  static extractKeyPhrases(text: string, maxPhrases: number = 10): string[] {
    // Simple key phrase extraction based on word frequency
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    return Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxPhrases)
      .map(([word]) => word);
  }

  /**
   * Detect language of text (simple heuristic)
   */
  static detectLanguage(text: string): string {
    // Simple language detection based on common words
    const commonWords: { [key: string]: string[] } = {
      'en': ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with'],
      'es': ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se'],
      'fr': ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir'],
      'de': ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich'],
      'it': ['il', 'di', 'che', 'e', 'la', 'per', 'un', 'in', 'con', 'da']
    };

    const words = text.toLowerCase().split(/\s+/);
    const scores: { [key: string]: number } = {};

    Object.entries(commonWords).forEach(([lang, words]) => {
      scores[lang] = words.reduce((score, word) => {
        return score + (words.includes(word) ? 1 : 0);
      }, 0);
    });

    const detectedLang = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)[0][0];

    return detectedLang || 'en';
  }

  /**
   * Calculate reading time for text
   */
  static calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Extract text from various document formats
   */
  static async extractTextFromDocument(
    buffer: Buffer, 
    mimeType: string,
    options: TextExtractionOptions = { includeMetadata: true }
  ): Promise<ExtractedText> {
    switch (mimeType) {
      case 'application/pdf':
        const { PDFParser } = await import('./pdf-parser');
        return PDFParser.extractText(buffer, options);
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return this.extractTextFromDocx(buffer, options);
      
      case 'text/plain':
        return this.extractTextFromTxt(buffer, options);
      
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
      case 'image/bmp':
        const { OCRProcessor } = await import('./ocr-processor');
        return OCRProcessor.extractTextFromImage(buffer, options);
      
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  }
}
