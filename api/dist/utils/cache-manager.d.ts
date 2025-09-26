/**
 * Professional Caching System for Cognivo AI
 * Provides intelligent caching with TTL, LRU eviction, and memory management
 */
export interface CacheOptions {
    ttl?: number;
    maxSize?: number;
    maxMemory?: number;
}
export interface CacheEntry<T> {
    value: T;
    timestamp: number;
    ttl: number;
    accessCount: number;
    lastAccessed: number;
    size: number;
}
export declare class CacheManager {
    private static instance;
    private cache;
    private options;
    private currentMemoryUsage;
    private accessOrder;
    private constructor();
    static getInstance(options?: CacheOptions): CacheManager;
    set<T>(key: string, value: T, ttl?: number): boolean;
    get<T>(key: string): T | null;
    has(key: string): boolean;
    delete(key: string): boolean;
    clear(): void;
    size(): number;
    memoryUsage(): number;
    getStats(): {
        size: number;
        memoryUsage: number;
        hitRate: number;
        maxSize: number;
        maxMemory: number;
    };
    private isExpired;
    private calculateSize;
    private evictIfNeeded;
    private evictLRU;
    private addToAccessOrder;
    private removeFromAccessOrder;
    private moveToEnd;
    cleanup(): void;
    startCleanupInterval(intervalMs?: number): void;
}
export declare const cacheManager: CacheManager;
//# sourceMappingURL=cache-manager.d.ts.map