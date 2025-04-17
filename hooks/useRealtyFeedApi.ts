import { useState, useEffect } from 'react';

/**
 * A hook to fetch data from the Realty Feed API
 * @param resource The OData resource and query parameters to fetch
 * @returns An object containing the data, loading state, and any error
 */
export default function useRealtyFeedApi<T>(resource: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset states when the resource changes
    setData(null);
    setError(null);

    // Don't fetch if resource is null
    if (!resource) {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Encode the resource for a URL parameter
        const encodedResource = encodeURIComponent(resource);
        const response = await fetch(`/api/realtyfeed?resource=${encodedResource}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `API returned ${response.status}`);
        }
        
        const responseData = await response.json();
        setData(responseData);
      } catch (err) {
        console.error('Error fetching from RealtyFeed API:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resource]);

  return { data, loading, error };
} 