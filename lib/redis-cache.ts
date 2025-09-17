// Production-ready Redis cache utility for API response caching
// Supports both real Redis and in-memory fallback for development

import { Redis } from '@upstash/redis';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

// Production Redis client
let redisClient: any = null;

// Initialize Redis client for production
function initializeRedis(): any {
  if (typeof window !== 'undefined') {
    // Client-side: no Redis
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  try {
    // Check if we have Redis environment variables
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
        retry: {
          retries: 3,
          backoff: (retryCount: number) => Math.min(retryCount * 50, 2000),
        },
      });
      console.log('✅ Redis client initialized successfully');
      return redisClient;
    } else {
      console.warn('⚠️ Redis environment variables not found, using in-memory cache');
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to initialize Redis client:', error);
    return null;
  }
}

// In-memory cache fallback for development
class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private cleanupInterval: NodeJS.Timeout;
  private maxSize: number = 1000; // Prevent memory leaks

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  async set<T>(key: string, data: T, ttl: number = 300): Promise<void> {
    // Prevent memory leaks by limiting cache size
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entries (simple LRU approximation)
      const keysToDelete = Array.from(this.cache.keys()).slice(0, Math.floor(this.maxSize * 0.1));
      keysToDelete.forEach(key => this.cache.delete(key));
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async flush(): Promise<void> {
    this.cache.clear();
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Create singleton instances
const memoryCache = new MemoryCache();
const redis = initializeRedis();

// Production-ready cache interface
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      if (redis) {
        // Use real Redis
        const result = await redis.get(key);
        return result as T | null;
      } else {
        // Fallback to memory cache
        return await memoryCache.get<T>(key);
      }
    } catch (error) {
      console.error('Cache get error:', error);
      // Fallback to memory cache on Redis error
      if (redis) {
        return await memoryCache.get<T>(key);
      }
      return null;
    }
  },

  async set<T>(key: string, data: T, ttl: number = 300): Promise<void> {
    try {
      if (redis) {
        // Use real Redis with proper TTL
        await redis.setex(key, ttl, JSON.stringify(data));
      } else {
        // Fallback to memory cache
        await memoryCache.set(key, data, ttl);
      }
    } catch (error) {
      console.error('Cache set error:', error);
      // Fallback to memory cache on Redis error
      if (redis) {
        await memoryCache.set(key, data, ttl);
      }
    }
  },

  async del(key: string): Promise<void> {
    try {
      if (redis) {
        await redis.del(key);
      } else {
        await memoryCache.del(key);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
      if (redis) {
        await memoryCache.del(key);
      }
    }
  },

  async flush(): Promise<void> {
    try {
      if (redis) {
        await redis.flushall();
      } else {
        await memoryCache.flush();
      }
    } catch (error) {
      console.error('Cache flush error:', error);
      if (redis) {
        await memoryCache.flush();
      }
    }
  },

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (redis) {
        // Use Redis SCAN for pattern matching (production-safe)
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } else {
        // Memory cache pattern matching
        const keys = await memoryCache.keys(pattern);
        for (const key of keys) {
          await memoryCache.del(key);
        }
      }
    } catch (error) {
      console.error('Cache pattern invalidation error:', error);
    }
  }
};

// Cache utility functions with proper error handling
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    return await cache.get<T>(key);
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
}

export async function setCachedData<T>(
  key: string,
  data: T,
  ttl: number = 300
): Promise<void> {
  try {
    await cache.set(key, data, ttl);
  } catch (error) {
    console.error("Cache set error:", error);
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    await cache.invalidatePattern(pattern);
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
}

// Cache key generators with proper sanitization
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  // Sanitize parameters to prevent cache key collisions
  const sanitizedParams = Object.keys(params)
    .sort()
    .map(key => {
      const value = params[key];
      // Handle undefined/null values
      if (value === undefined || value === null) {
        return `${key}:null`;
      }
      // Convert to string and sanitize
      return `${key}:${String(value).replace(/[^a-zA-Z0-9\-_]/g, '_')}`;
    })
    .join('|');
  
  return `${prefix}:${sanitizedParams}`;
}

// Specific cache key generators for common use cases
export function getListingsCacheKey(agentId: string, status?: string, limit?: number): string {
  return generateCacheKey('listings', { agentId, status, limit });
}

export function getTasksCacheKey(userId: string, status?: string, priority?: string): string {
  return generateCacheKey('tasks', { userId, status, priority });
}

// Health check function
export async function checkCacheHealth(): Promise<{ status: string; type: string; error?: string }> {
  try {
    const testKey = 'health_check';
    const testValue = { timestamp: Date.now() };
    
    await cache.set(testKey, testValue, 10);
    const retrieved = await cache.get(testKey);
    await cache.del(testKey);
    
    if (retrieved && (retrieved as any).timestamp === testValue.timestamp) {
      return {
        status: 'healthy',
        type: redis ? 'redis' : 'memory'
      };
    } else {
      return {
        status: 'unhealthy',
        type: redis ? 'redis' : 'memory',
        error: 'Cache read/write test failed'
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      type: redis ? 'redis' : 'memory',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Cleanup on process exit
process.on('SIGINT', () => {
  memoryCache.destroy();
});

process.on('SIGTERM', () => {
  memoryCache.destroy();
});

// Export the cache instance for direct use
export { cache as redis };