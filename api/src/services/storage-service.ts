/**
 * Storage Service for Cognivo AI
 * Handles file storage and database operations
 */

import { db } from '../database/connection';
import { GeneratedNote, GeneratedQuiz, QAAnswer, TranslationResult, ExtractedText } from '../types/ai';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

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

export class StorageService {
  private static instance: StorageService;
  private uploadDir: string;

  private constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.ensureUploadDir();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create upload directory:', error);
    }
  }

  // Store AI generated content
  public async storeGeneratedContent(
    userId: string,
    contentType: 'notes' | 'quiz' | 'qa' | 'translation',
    inputContent: string,
    generatedContent: GeneratedNote | GeneratedQuiz | QAAnswer | TranslationResult,
    options?: any
  ): Promise<string> {
    const id = uuidv4();
    
    try {
      await db.query(
        `INSERT INTO ai_generated_content (id, user_id, content_type, input_content, generated_content, options)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, userId, contentType, inputContent, JSON.stringify(generatedContent), JSON.stringify(options)]
      );
      
      return id;
    } catch (error) {
      console.error('Failed to store generated content:', error);
      throw error;
    }
  }

  // Store uploaded file
  public async storeFile(
    userId: string,
    filename: string,
    fileType: string,
    fileSize: number,
    buffer: Buffer,
    extractedText?: string,
    metadata?: any
  ): Promise<string> {
    const id = uuidv4();
    const filePath = path.join(this.uploadDir, `${id}_${filename}`);
    
    try {
      // Save file to disk
      await fs.writeFile(filePath, buffer);
      
      // Store file metadata in database
      await db.query(
        `INSERT INTO file_uploads (id, user_id, filename, file_type, file_size, extracted_text, metadata, file_path)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, userId, filename, fileType, fileSize, extractedText, JSON.stringify(metadata), filePath]
      );
      
      return id;
    } catch (error) {
      console.error('Failed to store file:', error);
      throw error;
    }
  }

  // Get user's generated content
  public async getUserContent(userId: string, contentType?: string): Promise<StoredContent[]> {
    try {
      let query = 'SELECT * FROM ai_generated_content WHERE user_id = $1';
      const params: any[] = [userId];
      
      if (contentType) {
        query += ' AND content_type = $2';
        params.push(contentType);
      }
      
      query += ' ORDER BY created_at DESC LIMIT 100';
      
      const result = await db.query(query, params);
      
      return result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        contentType: row.content_type,
        inputContent: row.input_content,
        generatedContent: JSON.parse(row.generated_content),
        options: row.options ? JSON.parse(row.options) : undefined,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Failed to get user content:', error);
      throw error;
    }
  }

  // Get user's files
  public async getUserFiles(userId: string): Promise<StoredFile[]> {
    try {
      const result = await db.query(
        'SELECT * FROM file_uploads WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100',
        [userId]
      );
      
      return result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        filename: row.filename,
        fileType: row.file_type,
        fileSize: row.file_size,
        extractedText: row.extracted_text,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        filePath: row.file_path,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Failed to get user files:', error);
      throw error;
    }
  }

  // Track API usage
  public async trackUsage(
    userId: string,
    endpoint: string,
    tokensUsed: number,
    cost: number,
    responseTime: number
  ): Promise<void> {
    try {
      await db.query(
        `INSERT INTO api_usage (user_id, endpoint, tokens_used, cost, response_time)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, endpoint, tokensUsed, cost, responseTime]
      );
    } catch (error) {
      console.error('Failed to track API usage:', error);
      // Don't throw error for usage tracking failures
    }
  }

  // Get file by ID
  public async getFile(fileId: string): Promise<StoredFile | null> {
    try {
      const result = await db.query(
        'SELECT * FROM file_uploads WHERE id = $1',
        [fileId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        filename: row.filename,
        fileType: row.file_type,
        fileSize: row.file_size,
        extractedText: row.extracted_text,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        filePath: row.file_path,
        createdAt: row.created_at
      };
    } catch (error) {
      console.error('Failed to get file:', error);
      throw error;
    }
  }

  // Delete file
  public async deleteFile(fileId: string, userId: string): Promise<boolean> {
    try {
      const file = await this.getFile(fileId);
      if (!file || file.userId !== userId) {
        return false;
      }
      
      // Delete file from disk
      try {
        await fs.unlink(file.filePath);
      } catch (error) {
        console.warn('Failed to delete file from disk:', error);
      }
      
      // Delete from database
      await db.query(
        'DELETE FROM file_uploads WHERE id = $1 AND user_id = $2',
        [fileId, userId]
      );
      
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  }

  // Get storage statistics
  public async getStorageStats(userId: string): Promise<{
    totalContent: number;
    totalFiles: number;
    totalSize: number;
    lastActivity: Date | null;
  }> {
    try {
      const [contentResult, filesResult] = await Promise.all([
        db.query('SELECT COUNT(*) as count FROM ai_generated_content WHERE user_id = $1', [userId]),
        db.query('SELECT COUNT(*) as count, COALESCE(SUM(file_size), 0) as total_size, MAX(created_at) as last_activity FROM file_uploads WHERE user_id = $1', [userId])
      ]);
      
      return {
        totalContent: parseInt(contentResult.rows[0].count),
        totalFiles: parseInt(filesResult.rows[0].count),
        totalSize: parseInt(filesResult.rows[0].total_size),
        lastActivity: filesResult.rows[0].last_activity
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      throw error;
    }
  }
}

export const storageService = StorageService.getInstance();
