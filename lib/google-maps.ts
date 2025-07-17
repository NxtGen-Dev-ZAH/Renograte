import { Loader } from '@googlemaps/js-api-loader';

// Google Maps API configuration
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

if (!GOOGLE_MAPS_API_KEY) {
  console.error('Google Maps API key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.');
}

// Create a singleton loader instance
const loader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['geometry', 'places'],
});

// Promise to track if Google Maps API has been loaded
let googleMapsPromise: Promise<typeof google> | null = null;

/**
 * Load Google Maps API if not already loaded
 */
export const loadGoogleMaps = async (): Promise<typeof google> => {
  if (!googleMapsPromise) {
    googleMapsPromise = loader.load();
  }
  return googleMapsPromise;
};

/**
 * Check if coordinates are within US bounds
 */
export const isWithinUSBounds = (lat: number, lng: number): boolean => {
  const US_BOUNDS = {
    north: 71.4,   // Northern Alaska
    south: 18.9,   // Southern Florida Keys
    west: -179.9,  // Western Alaska
    east: -66.9    // Eastern Maine
  };
  
  return lat >= US_BOUNDS.south && lat <= US_BOUNDS.north && 
         lng >= US_BOUNDS.west && lng <= US_BOUNDS.east;
};

/**
 * Clamp coordinates to US bounds
 */
export const clampToUSBounds = (lat: number, lng: number): [number, number] => {
  const US_BOUNDS = {
    north: 71.4,
    south: 18.9,
    west: -179.9,
    east: -66.9
  };
  
  const clampedLat = Math.max(US_BOUNDS.south, Math.min(US_BOUNDS.north, lat));
  const clampedLng = Math.max(US_BOUNDS.west, Math.min(US_BOUNDS.east, lng));
  
  return [clampedLat, clampedLng];
};

/**
 * Calculate center point from array of coordinates
 */
export const calculateCenter = (coordinates: Array<{ lat: number; lng: number }>): { lat: number; lng: number } => {
  if (coordinates.length === 0) {
    return { lat: 39.8283, lng: -98.5795 }; // Geographic center of US
  }
  
  const sum = coordinates.reduce(
    (acc, coord) => ({
      lat: acc.lat + coord.lat,
      lng: acc.lng + coord.lng
    }),
    { lat: 0, lng: 0 }
  );
  
  return {
    lat: sum.lat / coordinates.length,
    lng: sum.lng / coordinates.length
  };
};

/**
 * Create bounds from array of coordinates
 */
export const createBounds = (coordinates: Array<{ lat: number; lng: number }>): google.maps.LatLngBounds => {
  const bounds = new google.maps.LatLngBounds();
  coordinates.forEach(coord => {
    bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
  });
  return bounds;
};

/**
 * Default map options
 */
export const getDefaultMapOptions = (): google.maps.MapOptions => ({
  zoom: 10,
  center: { lat: 39.8283, lng: -98.5795 }, // Geographic center of US
  mapTypeId: google.maps.MapTypeId.ROADMAP,
  zoomControl: true,
  mapTypeControl: true,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  gestureHandling: 'cooperative',
  styles: [], // Can be customized for styling
  restriction: {
    latLngBounds: {
      north: 71.4,
      south: 18.9,
      west: -179.9,
      east: -66.9
    },
    strictBounds: false
  }
});

/**
 * Map type control options
 */
export const getMapTypeControlOptions = (): google.maps.MapTypeControlOptions => ({
  style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
  position: google.maps.ControlPosition.TOP_RIGHT,
  mapTypeIds: [
    google.maps.MapTypeId.ROADMAP,
    google.maps.MapTypeId.SATELLITE,
    google.maps.MapTypeId.HYBRID
  ]
}); 