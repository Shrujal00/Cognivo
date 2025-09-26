"use strict";
/**
 * Database Connection Manager
 * Handles PostgreSQL connections with connection pooling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const pg_1 = require("pg");
class DatabaseManager {
    constructor() {
        this.pool = null;
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME || 'edunexus_ai',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'password',
            max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
            idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
            connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000')
        };
    }
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
    async connect() {
        try {
            this.pool = new pg_1.Pool(this.config);
            // Test connection
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            console.log('✅ Database connected successfully');
        }
        catch (error) {
            console.error('❌ Database connection failed:', error);
            throw error;
        }
    }
    async disconnect() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            console.log('✅ Database disconnected');
        }
    }
    async query(text, params) {
        if (!this.pool) {
            throw new Error('Database not connected');
        }
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            // Log slow queries
            if (duration > 1000) {
                console.warn(`Slow query (${duration}ms): ${text.substring(0, 100)}...`);
            }
            return result;
        }
        catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }
    async getClient() {
        if (!this.pool) {
            throw new Error('Database not connected');
        }
        return this.pool.connect();
    }
    getPool() {
        return this.pool;
    }
    async healthCheck() {
        try {
            const result = await this.query('SELECT 1 as health');
            return result.rows[0].health === 1;
        }
        catch (error) {
            console.error('Database health check failed:', error);
            return false;
        }
    }
}
exports.db = DatabaseManager.getInstance();
//# sourceMappingURL=connection.js.map