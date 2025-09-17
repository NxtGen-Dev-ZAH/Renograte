"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, MapPin } from "lucide-react";
import {
  useGooglePlacesAutocomplete,
  AutocompletePrediction,
} from "@/hooks/useGooglePlacesAutocomplete";

interface AutocompleteInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  className?: string;
}

export default function AutocompleteInput({
  placeholder = "Enter property address",
  value,
  onChange,
  onSearch,
  className = "",
}: AutocompleteInputProps) {
  const {
    predictions,
    isLoading,
    isOpen,
    inputRef,
    getPredictions,
    selectPrediction,
    clear,
  } = useGooglePlacesAutocomplete();

  const [inputValue, setInputValue] = useState(value);
  const [debouncedValue, setDebouncedValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce input changes to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Get predictions when debounced value changes
  useEffect(() => {
    if (debouncedValue !== value) {
      getPredictions(debouncedValue);
    }
  }, [debouncedValue, getPredictions, value]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    clear(); // Clear previous predictions when user types
  };

  // Handle prediction selection
  const handlePredictionSelect = async (prediction: AutocompletePrediction) => {
    await selectPrediction(prediction);
    setInputValue(prediction.description);
    onChange(prediction.description);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (isOpen && predictions.length > 0) {
        // Select the first prediction
        handlePredictionSelect(predictions[0]);
      } else {
        onSearch();
      }
    } else if (e.key === "Escape") {
      clear();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        clear();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [clear]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="px-4 py-3 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-300 shadow-sm pr-10"
        />
        <div className="absolute inset-0 border border-gradient-blue opacity-50 rounded-lg pointer-events-none" />

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {isOpen && predictions.length > 0 && (
        <div className="autocomplete-dropdown mt-1">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              className="autocomplete-item w-full text-left"
              onClick={() => handlePredictionSelect(prediction)}
              onMouseEnter={(e) => e.currentTarget.focus()}
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {prediction.structured_formatting?.main_text ||
                      prediction.description}
                  </div>
                  {prediction.structured_formatting?.secondary_text && (
                    <div className="text-sm text-gray-500 truncate mt-1">
                      {prediction.structured_formatting.secondary_text}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen &&
        predictions.length === 0 &&
        debouncedValue.trim() &&
        !isLoading && (
          <div className="autocomplete-dropdown mt-1">
            <div className="px-4 py-3 text-gray-500 text-center">
              No addresses found
            </div>
          </div>
        )}
    </div>
  );
}
