/**
 * Storage Service for Cognivo AI
 * Handles file storage and database operations
 */
/// <reference types="node" />
/// <reference types="node" />
import { GeneratedNote, GeneratedQuiz, QAAnswer, TranslationResult } from '../types/ai';
export interface StoredContent {
    id: string;
    userId: string;
    contentType: 'notes' | 'quiz' | 'qa' | 'translation';
    inputContent: string;
    generatedContent: any;
    options?: any;
    createdAt: Date;
}
export interface StoredFile {
    id: string;
    userId: string;
    filename: string;
    fileType: string;
    fileSize: number;
    extractedText?: string;
    metadata?: any;
    filePath: string;
    createdAt: Date;
}
export declare class StorageService {
    private static instance;
    private uploadDir;
    private constructor();
    static getInstance(): StorageService;
    private ensureUploadDir;
    storeGeneratedContent(userId: string, contentType: 'notes' | 'quiz' | 'qa' | 'translation', inputContent: string, generatedContent: GeneratedNote | GeneratedQuiz | QAAnswer | TranslationResult, options?: any): Promise<string>;
    storeFile(userId: string, filename: string, fileType: string, fileSize: number, buffer: Buffer, extractedText?: string, metadata?: any): Promise<string>;
    getUserContent(userId: string, contentType?: string): Promise<StoredContent[]>;
    getUserFiles(userId: string): Promise<StoredFile[]>;
    trackUsage(userId: string, endpoint: string, tokensUsed: number, cost: number, responseTime: number): Promise<void>;
    getFile(fileId: string): Promise<StoredFile | null>;
    deleteFile(fileId: string, userId: string): Promise<boolean>;
    getStorageStats(userId: string): Promise<{
        totalContent: number;
        totalFiles: number;
        totalSize: number;
        lastActivity: Date | null;
    }>;
}
export declare const storageService: StorageService;
//# sourceMappingURL=storage-service.d.ts.map