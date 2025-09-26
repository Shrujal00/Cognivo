import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import { ExtractedText, TextExtractionOptions } from '../types/ai';

export class OCRProcessor {
  /**
   * Extract text from image using OCR
   */
  static async extractTextFromImage(
    buffer: Buffer, 
    options: TextExtractionOptions = { includeMetadata: true, ocrConfidence: 0.6 }
  ): Promise<ExtractedText> {
    try {
      // Preprocess image for better OCR results
      const processedBuffer = await this.preprocessImage(buffer);
      
      // Perform OCR
      const { data: { text, confidence } } = await Tesseract.recognize(
        processedBuffer,
        options.language || 'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      // Filter out low-confidence text
      const filteredText = confidence > (options.ocrConfidence || 0.6) * 100 
        ? text 
        : '';

      const extractedText: ExtractedText = {
        text: filteredText,
        metadata: options.includeMetadata ? {
          fileSize: buffer.length,
          mimeType: this.detectImageType(buffer),
          extractedAt: new Date()
        } : undefined,
        confidence: confidence / 100,
        language: options.language || 'eng'
      };

      return extractedText;
    } catch (error) {
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Preprocess image for better OCR results
   */
  private static async preprocessImage(buffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .grayscale() // Convert to grayscale
        .normalize() // Normalize contrast
        .sharpen() // Sharpen edges
        .png() // Convert to PNG for better OCR
        .toBuffer();
    } catch (error) {
      // If preprocessing fails, return original buffer
      console.warn('Image preprocessing failed, using original image');
      return buffer;
    }
  }

  /**
   * Detect image type from buffer
   */
  private static detectImageType(buffer: Buffer): string {
    const signatures: { [key: string]: string } = {
      'ffd8ffe0': 'image/jpeg',
      'ffd8ffe1': 'image/jpeg',
      'ffd8ffe2': 'image/jpeg',
      '89504e47': 'image/png',
      '47494638': 'image/gif',
      '424d': 'image/bmp'
    };

    const hex = buffer.toString('hex', 0, 4);
    return signatures[hex] || 'image/unknown';
  }

  /**
   * Extract text from multiple images
   */
  static async extractTextFromImages(
    buffers: Buffer[], 
    options: TextExtractionOptions = { includeMetadata: true, ocrConfidence: 0.6 }
  ): Promise<ExtractedText[]> {
    const results: ExtractedText[] = [];
    
    for (let i = 0; i < buffers.length; i++) {
      try {
        const result = await this.extractTextFromImage(buffers[i], options);
        results.push(result);
      } catch (error) {
        console.error(`OCR failed for image ${i + 1}:`, error);
        // Add empty result for failed images
        results.push({
          text: '',
          confidence: 0,
          language: options.language || 'eng'
        });
      }
    }

    return results;
  }

  /**
   * Get supported languages for OCR
   */
  static getSupportedLanguages(): string[] {
    return [
      'eng', 'spa', 'fra', 'deu', 'ita', 'por', 'rus', 'jpn', 'kor', 'chi_sim', 'chi_tra',
      'ara', 'hin', 'ben', 'tam', 'tel', 'mar', 'guj', 'kan', 'mal', 'ori', 'pan', 'asm'
    ];
  }
}
