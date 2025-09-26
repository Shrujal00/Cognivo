import pdf from 'pdf-parse';
import { ExtractedText, TextExtractionOptions } from '../types/ai';

export class PDFParser {
  /**
   * Extract text content from PDF buffer
   */
  static async extractText(
    buffer: Buffer, 
    options: TextExtractionOptions = { includeMetadata: true }
  ): Promise<ExtractedText> {
    try {
      const data = await pdf(buffer, {
        // PDF parsing options
        max: 0, // No page limit
        version: 'v1.10.100' // PDF.js version
      });

      const extractedText: ExtractedText = {
        text: data.text,
        metadata: options.includeMetadata ? {
          pageCount: data.numpages,
          fileSize: buffer.length,
          mimeType: 'application/pdf',
          extractedAt: new Date()
        } : undefined,
        confidence: 1.0 // PDF text extraction is generally reliable
      };

      return extractedText;
    } catch (error) {
      throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from specific pages
   */
  static async extractTextFromPages(
    buffer: Buffer, 
    pageNumbers: number[],
    options: TextExtractionOptions = { includeMetadata: true }
  ): Promise<ExtractedText> {
    try {
      const data = await pdf(buffer, {
        max: Math.max(...pageNumbers),
        version: 'v1.10.100'
      });

      // Split text by pages (this is approximate as pdf-parse doesn't provide exact page boundaries)
      const lines = data.text.split('\n');
      const linesPerPage = Math.ceil(lines.length / data.numpages);
      
      const selectedLines: string[] = [];
      pageNumbers.forEach(pageNum => {
        const startLine = (pageNum - 1) * linesPerPage;
        const endLine = Math.min(pageNum * linesPerPage, lines.length);
        selectedLines.push(...lines.slice(startLine, endLine));
      });

      const extractedText: ExtractedText = {
        text: selectedLines.join('\n'),
        metadata: options.includeMetadata ? {
          pageCount: pageNumbers.length,
          fileSize: buffer.length,
          mimeType: 'application/pdf',
          extractedAt: new Date()
        } : undefined,
        confidence: 1.0
      };

      return extractedText;
    } catch (error) {
      throw new Error(`PDF page extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get PDF metadata without extracting full text
   */
  static async getMetadata(buffer: Buffer): Promise<{ pageCount: number; fileSize: number }> {
    try {
      const data = await pdf(buffer, { max: 1 }); // Only read first page for metadata
      
      return {
        pageCount: data.numpages,
        fileSize: buffer.length
      };
    } catch (error) {
      throw new Error(`PDF metadata extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
