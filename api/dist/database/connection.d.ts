/**
 * Database Connection Manager
 * Handles PostgreSQL connections with connection pooling
 */
import { Pool, PoolClient } from 'pg';
export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    max: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
}
declare class DatabaseManager {
    private static instance;
    private pool;
    private config;
    constructor();
    static getInstance(): DatabaseManager;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query(text: string, params?: any[]): Promise<any>;
    getClient(): Promise<PoolClient>;
    getPool(): Pool | null;
    healthCheck(): Promise<boolean>;
}
export declare const db: DatabaseManager;
export {};
//# sourceMappingURL=connection.d.ts.map