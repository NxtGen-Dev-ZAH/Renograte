import { useState, useEffect } from 'react';

/**
 * A hook to fetch data from the Realty Feed API
 * @param resource The OData resource and query parameters to fetch
 * @returns An object containing the data, loading state, and any error
 */

// Simple cache implementation
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  error: string | null;
}

const cache: Record<string, CacheEntry<any>> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL
const pendingRequests: Record<string, Promise<any>> = {};

export default function useRealtyFeedApi<T>(resource: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Reset state when resource changes
    if (resource !== null) {
      setLoading(true);
      setError(null);
      
      // Check if we have a valid cached response
      const now = Date.now();
      if (cache[resource] && (now - cache[resource].timestamp) < CACHE_TTL) {
        setData(cache[resource].data);
        setError(cache[resource].error);
        setLoading(false);
        return;
      }
      
      // Function to make the actual API call
      const fetchData = async () => {
        try {
          // Check if this request is already in flight
          const existingRequest = pendingRequests[resource];
          if (existingRequest) {
            return await existingRequest;
          }
          
          // Set up the request promise
          const requestPromise = fetch(`/api/realtyfeed?resource=${encodeURIComponent(resource)}`)
            .then(async (response) => {
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error ${response.status}`);
              }
              return response.json();
            });
          
          // Store the pending request
          pendingRequests[resource] = requestPromise;
          
          // Execute the request
          const result = await requestPromise;
          
          // Update cache
          cache[resource] = {
            data: result,
            timestamp: Date.now(),
            error: null
          };
          
          // Clean up
          delete pendingRequests[resource];
          
          return result;
        } catch (err: any) {
          // Update cache with error
          cache[resource] = {
            data: null,
            timestamp: Date.now(),
            error: err.message
          };
          
          // Clean up
          delete pendingRequests[resource];
          
          throw err;
        }
      };

      fetchData()
        .then((result) => {
          setData(result);
          setError(null);
        })
        .catch((err) => {
          setError(err.message || 'An error occurred');
          console.error('API Error:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [resource]);

  // Additional utility for manual refresh
  const refresh = async (): Promise<void> => {
    if (!resource) return;
    
    // Remove from cache to force refetch
    delete cache[resource];
    
    setLoading(true);
    try {
      const response = await fetch(`/api/realtyfeed?resource=${encodeURIComponent(resource)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
      
      // Update cache
      cache[resource] = {
        data: result,
        timestamp: Date.now(),
        error: null
      };
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('API Refresh Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, refresh };
}

// Helper function to invalidate cached entries - useful for mutations
export function invalidateCache(resourcePattern?: RegExp) {
  if (resourcePattern) {
    // Invalidate matching cache entries
    Object.keys(cache).forEach(key => {
      if (resourcePattern.test(key)) {
        delete cache[key];
      }
    });
  } else {
    // Clear entire cache
    Object.keys(cache).forEach(key => {
      delete cache[key];
    });
  }
} 