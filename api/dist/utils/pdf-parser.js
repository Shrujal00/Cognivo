"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFParser = void 0;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
class PDFParser {
    /**
     * Extract text content from PDF buffer
     */
    static async extractText(buffer, options = { includeMetadata: true }) {
        try {
            const data = await (0, pdf_parse_1.default)(buffer, {
                // PDF parsing options
                max: 0, // No page limit
                version: 'v1.10.100' // PDF.js version
            });
            const extractedText = {
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
        }
        catch (error) {
            throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Extract text from specific pages
     */
    static async extractTextFromPages(buffer, pageNumbers, options = { includeMetadata: true }) {
        try {
            const data = await (0, pdf_parse_1.default)(buffer, {
                max: Math.max(...pageNumbers),
                version: 'v1.10.100'
            });
            // Split text by pages (this is approximate as pdf-parse doesn't provide exact page boundaries)
            const lines = data.text.split('\n');
            const linesPerPage = Math.ceil(lines.length / data.numpages);
            const selectedLines = [];
            pageNumbers.forEach(pageNum => {
                const startLine = (pageNum - 1) * linesPerPage;
                const endLine = Math.min(pageNum * linesPerPage, lines.length);
                selectedLines.push(...lines.slice(startLine, endLine));
            });
            const extractedText = {
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
        }
        catch (error) {
            throw new Error(`PDF page extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get PDF metadata without extracting full text
     */
    static async getMetadata(buffer) {
        try {
            const data = await (0, pdf_parse_1.default)(buffer, { max: 1 }); // Only read first page for metadata
            return {
                pageCount: data.numpages,
                fileSize: buffer.length
            };
        }
        catch (error) {
            throw new Error(`PDF metadata extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.PDFParser = PDFParser;
//# sourceMappingURL=pdf-parser.js.map