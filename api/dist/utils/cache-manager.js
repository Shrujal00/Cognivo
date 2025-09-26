"use strict";
/**
 * Professional Caching System for Cognivo AI
 * Provides intelligent caching with TTL, LRU eviction, and memory management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheManager = exports.CacheManager = void 0;
class CacheManager {
    constructor(options = {}) {
        this.cache = new Map();
        this.currentMemoryUsage = 0;
        this.accessOrder = [];
        this.options = {
            ttl: options.ttl || 300000, // 5 minutes default
            maxSize: options.maxSize || 1000,
            maxMemory: options.maxMemory || 100 * 1024 * 1024 // 100MB default
        };
    }
    static getInstance(options) {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager(options);
        }
        return CacheManager.instance;
    }
    set(key, value, ttl) {
        try {
            const entrySize = this.calculateSize(value);
            const entryTtl = ttl || this.options.ttl;
            // Check if we need to evict items
            this.evictIfNeeded(entrySize);
            const entry = {
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
                this.currentMemoryUsage -= this.cache.get(key).size;
            }
            this.cache.set(key, entry);
            this.currentMemoryUsage += entrySize;
            this.addToAccessOrder(key);
            return true;
        }
        catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }
    get(key) {
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
    has(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        if (this.isExpired(entry)) {
            this.delete(key);
            return false;
        }
        return true;
    }
    delete(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        this.cache.delete(key);
        this.currentMemoryUsage -= entry.size;
        this.removeFromAccessOrder(key);
        return true;
    }
    clear() {
        this.cache.clear();
        this.currentMemoryUsage = 0;
        this.accessOrder = [];
    }
    size() {
        return this.cache.size;
    }
    memoryUsage() {
        return this.currentMemoryUsage;
    }
    getStats() {
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
    isExpired(entry) {
        return Date.now() - entry.timestamp > entry.ttl;
    }
    calculateSize(value) {
        try {
            return JSON.stringify(value).length * 2; // Rough estimate (UTF-16)
        }
        catch {
            return 1024; // Default size if serialization fails
        }
    }
    evictIfNeeded(newEntrySize) {
        // Check memory limit
        while (this.currentMemoryUsage + newEntrySize > this.options.maxMemory && this.cache.size > 0) {
            this.evictLRU();
        }
        // Check size limit
        while (this.cache.size >= this.options.maxSize && this.cache.size > 0) {
            this.evictLRU();
        }
    }
    evictLRU() {
        if (this.accessOrder.length === 0)
            return;
        const keyToEvict = this.accessOrder[0];
        this.delete(keyToEvict);
    }
    addToAccessOrder(key) {
        this.accessOrder.push(key);
    }
    removeFromAccessOrder(key) {
        const index = this.accessOrder.indexOf(key);
        if (index > -1) {
            this.accessOrder.splice(index, 1);
        }
    }
    moveToEnd(key) {
        this.removeFromAccessOrder(key);
        this.addToAccessOrder(key);
    }
    cleanup() {
        const now = Date.now();
        const keysToDelete = [];
        for (const [key, entry] of this.cache.entries()) {
            if (this.isExpired(entry)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.delete(key));
    }
    // Start cleanup interval
    startCleanupInterval(intervalMs = 60000) {
        setInterval(() => {
            this.cleanup();
        }, intervalMs);
    }
}
exports.CacheManager = CacheManager;
// Export singleton instance
exports.cacheManager = CacheManager.getInstance();
//# sourceMappingURL=cache-manager.js.map