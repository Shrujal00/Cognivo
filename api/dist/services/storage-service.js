"use strict";
/**
 * Storage Service for Cognivo AI
 * Handles file storage and database operations
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = exports.StorageService = void 0;
const connection_1 = require("../database/connection");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
class StorageService {
    constructor() {
        this.uploadDir = process.env.UPLOAD_DIR || './uploads';
        this.ensureUploadDir();
    }
    static getInstance() {
        if (!StorageService.instance) {
            StorageService.instance = new StorageService();
        }
        return StorageService.instance;
    }
    async ensureUploadDir() {
        try {
            await promises_1.default.mkdir(this.uploadDir, { recursive: true });
        }
        catch (error) {
            console.error('Failed to create upload directory:', error);
        }
    }
    // Store AI generated content
    async storeGeneratedContent(userId, contentType, inputContent, generatedContent, options) {
        const id = (0, uuid_1.v4)();
        try {
            await connection_1.db.query(`INSERT INTO ai_generated_content (id, user_id, content_type, input_content, generated_content, options)
         VALUES ($1, $2, $3, $4, $5, $6)`, [id, userId, contentType, inputContent, JSON.stringify(generatedContent), JSON.stringify(options)]);
            return id;
        }
        catch (error) {
            console.error('Failed to store generated content:', error);
            throw error;
        }
    }
    // Store uploaded file
    async storeFile(userId, filename, fileType, fileSize, buffer, extractedText, metadata) {
        const id = (0, uuid_1.v4)();
        const filePath = path_1.default.join(this.uploadDir, `${id}_${filename}`);
        try {
            // Save file to disk
            await promises_1.default.writeFile(filePath, buffer);
            // Store file metadata in database
            await connection_1.db.query(`INSERT INTO file_uploads (id, user_id, filename, file_type, file_size, extracted_text, metadata, file_path)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [id, userId, filename, fileType, fileSize, extractedText, JSON.stringify(metadata), filePath]);
            return id;
        }
        catch (error) {
            console.error('Failed to store file:', error);
            throw error;
        }
    }
    // Get user's generated content
    async getUserContent(userId, contentType) {
        try {
            let query = 'SELECT * FROM ai_generated_content WHERE user_id = $1';
            const params = [userId];
            if (contentType) {
                query += ' AND content_type = $2';
                params.push(contentType);
            }
            query += ' ORDER BY created_at DESC LIMIT 100';
            const result = await connection_1.db.query(query, params);
            return result.rows.map((row) => ({
                id: row.id,
                userId: row.user_id,
                contentType: row.content_type,
                inputContent: row.input_content,
                generatedContent: JSON.parse(row.generated_content),
                options: row.options ? JSON.parse(row.options) : undefined,
                createdAt: row.created_at
            }));
        }
        catch (error) {
            console.error('Failed to get user content:', error);
            throw error;
        }
    }
    // Get user's files
    async getUserFiles(userId) {
        try {
            const result = await connection_1.db.query('SELECT * FROM file_uploads WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100', [userId]);
            return result.rows.map((row) => ({
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
        }
        catch (error) {
            console.error('Failed to get user files:', error);
            throw error;
        }
    }
    // Track API usage
    async trackUsage(userId, endpoint, tokensUsed, cost, responseTime) {
        try {
            await connection_1.db.query(`INSERT INTO api_usage (user_id, endpoint, tokens_used, cost, response_time)
         VALUES ($1, $2, $3, $4, $5)`, [userId, endpoint, tokensUsed, cost, responseTime]);
        }
        catch (error) {
            console.error('Failed to track API usage:', error);
            // Don't throw error for usage tracking failures
        }
    }
    // Get file by ID
    async getFile(fileId) {
        try {
            const result = await connection_1.db.query('SELECT * FROM file_uploads WHERE id = $1', [fileId]);
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
        }
        catch (error) {
            console.error('Failed to get file:', error);
            throw error;
        }
    }
    // Delete file
    async deleteFile(fileId, userId) {
        try {
            const file = await this.getFile(fileId);
            if (!file || file.userId !== userId) {
                return false;
            }
            // Delete file from disk
            try {
                await promises_1.default.unlink(file.filePath);
            }
            catch (error) {
                console.warn('Failed to delete file from disk:', error);
            }
            // Delete from database
            await connection_1.db.query('DELETE FROM file_uploads WHERE id = $1 AND user_id = $2', [fileId, userId]);
            return true;
        }
        catch (error) {
            console.error('Failed to delete file:', error);
            throw error;
        }
    }
    // Get storage statistics
    async getStorageStats(userId) {
        try {
            const [contentResult, filesResult] = await Promise.all([
                connection_1.db.query('SELECT COUNT(*) as count FROM ai_generated_content WHERE user_id = $1', [userId]),
                connection_1.db.query('SELECT COUNT(*) as count, COALESCE(SUM(file_size), 0) as total_size, MAX(created_at) as last_activity FROM file_uploads WHERE user_id = $1', [userId])
            ]);
            return {
                totalContent: parseInt(contentResult.rows[0].count),
                totalFiles: parseInt(filesResult.rows[0].count),
                totalSize: parseInt(filesResult.rows[0].total_size),
                lastActivity: filesResult.rows[0].last_activity
            };
        }
        catch (error) {
            console.error('Failed to get storage stats:', error);
            throw error;
        }
    }
}
exports.StorageService = StorageService;
exports.storageService = StorageService.getInstance();
//# sourceMappingURL=storage-service.js.map