"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextProcessor = void 0;
const mammoth_1 = __importDefault(require("mammoth"));
class TextProcessor {
    /**
     * Extract text from DOCX files
     */
    static async extractTextFromDocx(buffer, options = { includeMetadata: true }) {
        try {
            const result = await mammoth_1.default.extractRawText({ buffer });
            const extractedText = {
                text: result.value,
                metadata: options.includeMetadata ? {
                    fileSize: buffer.length,
                    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    extractedAt: new Date()
                } : undefined,
                confidence: 1.0
            };
            return extractedText;
        }
        catch (error) {
            throw new Error(`DOCX parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Extract text from plain text files
     */
    static async extractTextFromTxt(buffer, options = { includeMetadata: true }) {
        try {
            const text = buffer.toString('utf-8');
            const extractedText = {
                text,
                metadata: options.includeMetadata ? {
                    fileSize: buffer.length,
                    mimeType: 'text/plain',
                    extractedAt: new Date()
                } : undefined,
                confidence: 1.0
            };
            return extractedText;
        }
        catch (error) {
            throw new Error(`Text file parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Clean and normalize extracted text
     */
    static cleanText(text) {
        return text
            .replace(/\r\n/g, '\n') // Normalize line endings
            .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
            .replace(/\s{2,}/g, ' ') // Remove excessive spaces
            .trim();
    }
    /**
     * Split text into chunks for processing
     */
    static splitTextIntoChunks(text, maxChunkSize = 4000) {
        const chunks = [];
        const sentences = text.split(/[.!?]+/);
        let currentChunk = '';
        for (const sentence of sentences) {
            const trimmedSentence = sentence.trim();
            if (!trimmedSentence)
                continue;
            if (currentChunk.length + trimmedSentence.length + 1 <= maxChunkSize) {
                currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
            }
            else {
                if (currentChunk) {
                    chunks.push(currentChunk + '.');
                    currentChunk = trimmedSentence;
                }
                else {
                    // If single sentence is too long, split by words
                    const words = trimmedSentence.split(' ');
                    let wordChunk = '';
                    for (const word of words) {
                        if (wordChunk.length + word.length + 1 <= maxChunkSize) {
                            wordChunk += (wordChunk ? ' ' : '') + word;
                        }
                        else {
                            if (wordChunk) {
                                chunks.push(wordChunk);
                                wordChunk = word;
                            }
                            else {
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
    static extractKeyPhrases(text, maxPhrases = 10) {
        // Simple key phrase extraction based on word frequency
        const words = text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3);
        const wordFreq = {};
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
    static detectLanguage(text) {
        // Simple language detection based on common words
        const commonWords = {
            'en': ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with'],
            'es': ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se'],
            'fr': ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir'],
            'de': ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich'],
            'it': ['il', 'di', 'che', 'e', 'la', 'per', 'un', 'in', 'con', 'da']
        };
        const words = text.toLowerCase().split(/\s+/);
        const scores = {};
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
    static calculateReadingTime(text, wordsPerMinute = 200) {
        const wordCount = text.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    }
    /**
     * Extract text from various document formats
     */
    static async extractTextFromDocument(buffer, mimeType, options = { includeMetadata: true }) {
        switch (mimeType) {
            case 'application/pdf':
                const { PDFParser } = await Promise.resolve().then(() => __importStar(require('./pdf-parser')));
                return PDFParser.extractText(buffer, options);
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                return this.extractTextFromDocx(buffer, options);
            case 'text/plain':
                return this.extractTextFromTxt(buffer, options);
            case 'image/jpeg':
            case 'image/png':
            case 'image/gif':
            case 'image/bmp':
                const { OCRProcessor } = await Promise.resolve().then(() => __importStar(require('./ocr-processor')));
                return OCRProcessor.extractTextFromImage(buffer, options);
            default:
                throw new Error(`Unsupported file type: ${mimeType}`);
        }
    }
}
exports.TextProcessor = TextProcessor;
//# sourceMappingURL=text-processor.js.map