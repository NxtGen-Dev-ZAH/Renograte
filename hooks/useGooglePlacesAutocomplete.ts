import { useState, useEffect, useRef, useCallback } from 'react';

export interface AutocompletePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlaceResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export const useGooglePlacesAutocomplete = () => {
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Get autocomplete predictions using our server-side API
  const getPredictions = useCallback(async (input: string) => {
    if (!input.trim()) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const params = new URLSearchParams({
        input: input.trim(),
      });

      const response = await fetch(`/api/places/autocomplete?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'OK') {
        setPredictions(data.predictions || []);
        setIsOpen((data.predictions || []).length > 0);
      } else {
        console.error('Places API error:', data.status, data.error_message);
        setPredictions([]);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setPredictions([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get place details using our server-side API
  const getPlaceDetails = useCallback(async (placeId: string): Promise<PlaceResult | null> => {
    try {
      const params = new URLSearchParams({
        place_id: placeId,
      });

      const response = await fetch(`/api/places/details?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'OK' && data.result) {
        return data.result as PlaceResult;
      } else {
        console.error('Places API error:', data.status, data.error_message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }, []);

  // Handle prediction selection
  const selectPrediction = useCallback(async (prediction: AutocompletePrediction) => {
    setIsLoading(true);
    setIsOpen(false);
    
    try {
      const placeDetails = await getPlaceDetails(prediction.place_id);
      if (placeDetails) {
        setSelectedPlace(placeDetails);
        if (inputRef.current) {
          inputRef.current.value = placeDetails.formatted_address;
        }
      }
    } catch (error) {
      console.error('Error selecting prediction:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getPlaceDetails]);

  // Clear all state
  const clear = useCallback(() => {
    setPredictions([]);
    setIsOpen(false);
    setSelectedPlace(null);
    setIsLoading(false);
  }, []);

  return {
    predictions,
    isLoading,
    selectedPlace,
    isOpen,
    inputRef,
    getPredictions,
    selectPrediction,
    clear,
  };
}; 