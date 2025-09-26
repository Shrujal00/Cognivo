/**
 * Professional Caching System for Cognivo AI
 * Provides intelligent caching with TTL, LRU eviction, and memory management
 */

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  maxMemory?: number; // Maximum memory usage in bytes
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
}

export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private options: Required<CacheOptions>;
  private currentMemoryUsage: number = 0;
  private accessOrder: string[] = [];

  private constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 300000, // 5 minutes default
      maxSize: options.maxSize || 1000,
      maxMemory: options.maxMemory || 100 * 1024 * 1024 // 100MB default
    };
  }

  public static getInstance(options?: CacheOptions): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(options);
    }
    return CacheManager.instance;
  }

  public set<T>(key: string, value: T, ttl?: number): boolean {
    try {
      const entrySize = this.calculateSize(value);
      const entryTtl = ttl || this.options.ttl;

      // Check if we need to evict items
      this.evictIfNeeded(entrySize);

      const entry: CacheEntry<T> = {
        value,
        timestamp: Date.now(),
        ttl: entryTtl,
        accessCount: 0,
        lastAccessed: Date.now(),
        size: entrySize
      };

      // Remove old entry if exists
      if (this.cache.has(key)) {
        this.removeFromAccessOrder(key);
        this.currentMemoryUsage -= this.cache.get(key)!.size;
      }

      this.cache.set(key, entry);
      this.currentMemoryUsage += entrySize;
      this.addToAccessOrder(key);

      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.delete(key);
      return null;
    }

    // Update access information
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.moveToEnd(key);

    return entry.value;
  }

  public has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  public delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.currentMemoryUsage -= entry.size;
    this.removeFromAccessOrder(key);
    return true;
  }

  public clear(): void {
    this.cache.clear();
    this.currentMemoryUsage = 0;
    this.accessOrder = [];
  }

  public size(): number {
    return this.cache.size;
  }

  public memoryUsage(): number {
    return this.currentMemoryUsage;
  }

  public getStats(): {
    size: number;
    memoryUsage: number;
    hitRate: number;
    maxSize: number;
    maxMemory: number;
  } {
    const totalAccesses = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.accessCount, 0);
    
    const totalHits = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + Math.max(0, entry.accessCount - 1), 0);

    return {
      size: this.cache.size,
      memoryUsage: this.currentMemoryUsage,
      hitRate: totalAccesses > 0 ? totalHits / totalAccesses : 0,
      maxSize: this.options.maxSize,
      maxMemory: this.options.maxMemory
    };
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private calculateSize(value: any): number {
    try {
      return JSON.stringify(value).length * 2; // Rough estimate (UTF-16)
    } catch {
      return 1024; // Default size if serialization fails
    }
  }

  private evictIfNeeded(newEntrySize: number): void {
    // Check memory limit
    while (this.currentMemoryUsage + newEntrySize > this.options.maxMemory && this.cache.size > 0) {
      this.evictLRU();
    }

    // Check size limit
    while (this.cache.size >= this.options.maxSize && this.cache.size > 0) {
      this.evictLRU();
    }
  }

  private evictLRU(): void {
    if (this.accessOrder.length === 0) return;

    const keyToEvict = this.accessOrder[0];
    this.delete(keyToEvict);
  }

  private addToAccessOrder(key: string): void {
    this.accessOrder.push(key);
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  private moveToEnd(key: string): void {
    this.removeFromAccessOrder(key);
    this.addToAccessOrder(key);
  }

  public cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }

  // Start cleanup interval
  public startCleanupInterval(intervalMs: number = 60000): void {
    setInterval(() => {
      this.cleanup();
    }, intervalMs);
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();
