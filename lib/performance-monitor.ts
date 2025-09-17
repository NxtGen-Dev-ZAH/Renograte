// Performance monitoring utility for API endpoints
// This helps track the effectiveness of our optimizations

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  cacheHit: boolean;
  userId?: string;
  timestamp: string;
  error?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics

  log(metrics: Omit<PerformanceMetrics, 'timestamp'>) {
    const fullMetrics: PerformanceMetrics = {
      ...metrics,
      timestamp: new Date().toISOString()
    };

    this.metrics.push(fullMetrics);

    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const emoji = metrics.cacheHit ? '🚀' : '🐌';
      const status = metrics.error ? '❌' : '✅';
      console.log(`${emoji} ${status} ${metrics.method} ${metrics.endpoint} - ${metrics.duration}ms${metrics.cacheHit ? ' (cached)' : ''}`);
    }
  }

  getStats() {
    const total = this.metrics.length;
    if (total === 0) return null;

    const avgDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0) / total;
    const cacheHitRate = this.metrics.filter(m => m.cacheHit).length / total;
    const errorRate = this.metrics.filter(m => m.error).length / total;

    const endpointStats = this.metrics.reduce((acc, metric) => {
      const key = `${metric.method} ${metric.endpoint}`;
      if (!acc[key]) {
        acc[key] = { count: 0, totalDuration: 0, cacheHits: 0, errors: 0 };
      }
      acc[key].count++;
      acc[key].totalDuration += metric.duration;
      if (metric.cacheHit) acc[key].cacheHits++;
      if (metric.error) acc[key].errors++;
      return acc;
    }, {} as Record<string, { count: number; totalDuration: number; cacheHits: number; errors: number }>);

    return {
      total,
      avgDuration: Math.round(avgDuration),
      cacheHitRate: Math.round(cacheHitRate * 100),
      errorRate: Math.round(errorRate * 100),
      endpointStats: Object.entries(endpointStats).map(([endpoint, stats]) => ({
        endpoint,
        count: stats.count,
        avgDuration: Math.round(stats.totalDuration / stats.count),
        cacheHitRate: Math.round((stats.cacheHits / stats.count) * 100),
        errorRate: Math.round((stats.errors / stats.count) * 100)
      }))
    };
  }

  clear() {
    this.metrics = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Helper function to wrap API endpoints with performance monitoring
export function withPerformanceMonitoring<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  endpoint: string,
  method: string = 'GET'
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    let cacheHit = false;
    let error: string | undefined;

    try {
      const result = await fn(...args);
      return result;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      throw err;
    } finally {
      const duration = Date.now() - startTime;
      performanceMonitor.log({
        endpoint,
        method,
        duration,
        cacheHit,
        error
      });
    }
  };
}

// Helper function to track cache hits
export function trackCacheHit(endpoint: string, method: string = 'GET') {
  performanceMonitor.log({
    endpoint,
    method,
    duration: 0, // Cache hits are instant
    cacheHit: true
  });
}

// API endpoint to get performance stats (admin only)
export async function getPerformanceStats() {
  return performanceMonitor.getStats();
}

