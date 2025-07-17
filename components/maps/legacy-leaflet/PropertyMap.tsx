"use client";

import { useState, useEffect, useRef } from 'react';
import { Property } from '@/types/property';
import dynamic from 'next/dynamic';

// Only import Leaflet on the client side
const L = typeof window !== 'undefined' ? require('leaflet') : null;
import 'leaflet/dist/leaflet.css';
import { createRoot } from 'react-dom/client';

// Fix Leaflet icon issue in Next.js with type assertion to avoid TS errors
const fixLeafletIcon = () => {
  if (!L) return;
  
  // @ts-ignore - Leaflet's internal API
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  });
};

// Define US bounds
const US_BOUNDS = {
  north: 49.38, // Northern border with Canada
  south: 24.52, // Southern tip of Florida
  west: -125.0, // Western coast
  east: -66.93  // Eastern coast
};

// Function to check if coordinates are within US bounds
const isWithinUSBounds = (lat: number, lng: number): boolean => {
  return (
    lat >= US_BOUNDS.south &&
    lat <= US_BOUNDS.north &&
    lng >= US_BOUNDS.west &&
    lng <= US_BOUNDS.east
  );
};

// Function to clamp coordinates to US bounds
const clampToUSBounds = (lat: number, lng: number): [number, number] => {
  const clampedLat = Math.max(US_BOUNDS.south, Math.min(US_BOUNDS.north, lat));
  const clampedLng = Math.max(US_BOUNDS.west, Math.min(US_BOUNDS.east, lng));
  return [clampedLat, clampedLng];
};

interface PropertyMapProps {
  properties: Property[];
  height?: string;
  onMarkerClick?: (propertyId: string) => void;
  highlightedPropertyId?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export default function PropertyMap({ 
  properties, 
  height = "400px", 
  onMarkerClick,
  highlightedPropertyId,
  initialCenter,
  initialZoom
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [priceTags, setPriceTags] = useState<L.Marker[]>([]);
  const priceTagLayerRef = useRef<L.LayerGroup | null>(null);
  const tooltipLayerRef = useRef<L.LayerGroup | null>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const tooltipTimeout = useRef<NodeJS.Timeout | null>(null);

  // Create map when component mounts
  useEffect(() => {
    if (!mapRef.current || map || !L) return;

    // Check if container has dimensions before initializing
    if (mapRef.current.clientWidth === 0 || mapRef.current.clientHeight === 0) {
      console.warn('Map container has zero width or height. Delaying map initialization.');
      return;
    }

    try {
      // Fix Leaflet icon issue
      fixLeafletIcon();

      // Find center of properties or default to a location
      let center: [number, number] = initialCenter || [33.8283, -112.5795]; // Default to geographic center of the US
      
      if (!initialCenter && properties.length > 0) {
        const validProperties = properties.filter(p => {
          const lat = p.Latitude || 0;
          const lng = p.Longitude || 0;
          return isWithinUSBounds(lat, lng);
        });
        
        if (validProperties.length > 0) {
          // Calculate the average of lat/lng for properties
          const avgLat = validProperties.reduce((sum, p) => sum + (p.Latitude || 0), 0) / validProperties.length;
          const avgLng = validProperties.reduce((sum, p) => sum + (p.Longitude || 0), 0) / validProperties.length;
          center = [avgLat, avgLng];
        }
      }
      
      // Ensure center is within US bounds
      center = clampToUSBounds(center[0], center[1]);

      const newMap = L.map(mapRef.current, {
        attributionControl: false,
        zoomControl: true,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        wheelDebounceTime: 40,
        wheelPxPerZoomLevel: 80,
        maxBounds: L.latLngBounds(
          L.latLng(US_BOUNDS.south - 5, US_BOUNDS.west - 5), // Add some padding
          L.latLng(US_BOUNDS.north + 5, US_BOUNDS.east + 5)
        )
      }).setView(center, initialZoom || 10);
      
      // Add tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(newMap);

      // Add attribution control in bottom right
      L.control.attribution({
        position: 'bottomright'
      }).addTo(newMap);

      // Create price tag layer group
      const priceTagLayer = L.layerGroup().addTo(newMap);
      priceTagLayerRef.current = priceTagLayer;
      
      // Create tooltip layer group
      const tooltipLayer = L.layerGroup().addTo(newMap);
      tooltipLayerRef.current = tooltipLayer;

      // Force a map invalidation to ensure sizes are correct
      setTimeout(() => {
        newMap.invalidateSize();
      }, 100);

      setMap(newMap);

      // Clean up on unmount
      return () => {
        if (tooltipTimeout.current) {
          clearTimeout(tooltipTimeout.current);
        }
        
        if (priceTagLayerRef.current) {
          priceTagLayerRef.current.clearLayers();
        }
        
        if (tooltipLayerRef.current) {
          tooltipLayerRef.current.clearLayers();
        }
        
        newMap.remove();
        setMap(null);
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, []);

  // Handle window resize to invalidate size
  useEffect(() => {
    if (!map) return;

    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', handleResize);
    
    // Invalidate after a small delay to ensure container is fully rendered
    const invalidateTimer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(invalidateTimer);
    };
  }, [map]);

  // Add price tags when map is initialized and properties change
  useEffect(() => {
    if (!map || !priceTagLayerRef.current || !tooltipLayerRef.current) return;

    // Clear previous price tags and tooltips
    priceTagLayerRef.current.clearLayers();
    tooltipLayerRef.current.clearLayers();
    setPriceTags([]);
    
    // Create a bounds object to fit all price tags
    const bounds = L.latLngBounds([]);
    
    // Add new price tags
    const newPriceTags = properties
      .filter(property => {
        const lat = property.Latitude || 0;
        const lng = property.Longitude || 0;
        return isWithinUSBounds(lat, lng);
      })
      .map(property => {
        // Get latitude and longitude, ensuring they're within US bounds
        let lat = property.Latitude || 0;
        let lng = property.Longitude || 0;
        
        // Clamp coordinates to US bounds
        [lat, lng] = clampToUSBounds(lat, lng);
        
        // Create a formatted price for the popup
        const formattedPrice = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0
        }).format(property.ListPrice);

        // Create custom price tag icon
        const icon = L.divIcon({
          className: 'custom-price-tag',
          html: `<div class="price-tag ${highlightedPropertyId === property.ListingKey || hoveredPropertyId === property.ListingKey ? 'highlighted' : ''}">
                  ${formattedPrice}
                </div>`,
          iconSize: [100, 30],
          iconAnchor: [50, 15]
        });

        // Create price tag marker without default icon
        const priceTag = L.marker([lat, lng], { 
          icon,
          interactive: true,
          keyboard: false,
          zIndexOffset: highlightedPropertyId === property.ListingKey ? 1000 : 0
        }).addTo(priceTagLayerRef.current!);
        
        // Create tooltip content
        const tooltipContent = document.createElement('div');
        tooltipContent.className = 'tooltip-content';
        
        // Render tooltip content with React
        createRoot(tooltipContent).render(
          <div className="property-tooltip">
            <div className="property-tooltip-price">{formattedPrice}</div>
            <div className="property-tooltip-details">
              <div>{property.BedroomsTotal} BD | {property.BathroomsTotalInteger} BA | {property.LivingArea} SQ FT</div>
              <div>{property.StreetNumber} {property.StreetName}</div>
              <div>{property.City}, {property.StateOrProvince}</div>
            </div>
          </div>
        );
        
        // Handle hover events with delay for smoother experience
        priceTag.on('mouseover', () => {
          if (tooltipTimeout.current) {
            clearTimeout(tooltipTimeout.current);
            tooltipTimeout.current = null;
          }
          
          setHoveredPropertyId(property.ListingKey);
          
          // Create and show tooltip
          const tooltip = L.popup({
            className: 'property-popup',
            closeButton: false,
            offset: [0, -15],
            autoPan: false
          })
            .setLatLng([lat, lng])
            .setContent(tooltipContent)
            .openOn(map);
          
          // Add to tooltip layer
          tooltipLayerRef.current!.addLayer(tooltip);
        });
        
        priceTag.on('mouseout', () => {
          // Add delay before hiding tooltip for smoother experience
          tooltipTimeout.current = setTimeout(() => {
            setHoveredPropertyId(null);
            tooltipLayerRef.current!.clearLayers();
          }, 100);
        });
        
        // Handle click event - navigate to property
        priceTag.on('click', () => {
          if (onMarkerClick) {
            onMarkerClick(property.ListingKey);
          }
        });

        // Add to bounds
        bounds.extend([lat, lng]);
        
        return priceTag;
      });
    
    setPriceTags(newPriceTags);
    
    // Fit bounds if we have price tags
    if (newPriceTags.length > 0) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15
      });
    }
    
    // Add custom CSS for price tags and tooltips
    if (!document.getElementById('leaflet-custom-styles')) {
      const style = document.createElement('style');
      style.id = 'leaflet-custom-styles';
      style.innerHTML = `
        .price-tag {
          padding: 8px 12px;
          background-color: #3b82f6;
          color: white;
          font-weight: 600;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 13px;
          white-space: nowrap;
          border: 2px solid rgba(255,255,255,0.8);
          transform: translateY(0);
        }
        
        .price-tag.highlighted {
          background-color: #f97316;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1), 0 6px 12px rgba(0,0,0,0.05);
          z-index: 1000 !important;
        }
        
        .custom-price-tag {
          background: none;
          border: none;
        }
        
        .property-popup .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.1);
          transform-origin: 50% 100%;
          animation: popup-appear 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes popup-appear {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .property-popup .leaflet-popup-content {
          margin: 0;
          min-width: 240px;
        }
        
        .property-popup .leaflet-popup-tip {
          background: white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .property-tooltip {
          overflow: hidden;
          background: white;
        }
        
        .property-tooltip-price {
          background-color: #3b82f6;
          color: white;
          font-weight: 600;
          padding: 10px 14px;
          font-size: 16px;
          border-bottom: 1px solid rgba(0,0,0,0.1);
        }
        
        .property-tooltip-details {
          padding: 12px 14px;
          color: #374151;
          font-size: 13px;
          line-height: 1.5;
        }
        
        .property-tooltip-details div {
          margin-bottom: 4px;
        }
        
        .property-tooltip-details div:last-child {
          margin-bottom: 0;
          color: #6b7280;
          font-size: 12px;
        }
      `;
      document.head.appendChild(style);
    }
  }, [map, properties, onMarkerClick, highlightedPropertyId, hoveredPropertyId]);

  return (
    <div className="map-container" style={{ position: 'relative', width: '100%', height }}>
      <div 
        ref={mapRef} 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%' 
        }}
      />
      {map === null && (
        <div className="map-loading" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6'
        }}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
} 