"use client";

import { useEffect, useRef, useState } from 'react';
import { Property } from '@/types/property';
import { X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
const L = typeof window !== 'undefined' ? require('leaflet') : null;
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

interface PropertyMapOverlayProps {
  properties: Property[];
  onClose: () => void;
  onPropertySelect: (propertyId: string) => void;
  highlightedPropertyId?: string;
}

export default function PropertyMapOverlay({
  properties,
  onClose,
  onPropertySelect,
  highlightedPropertyId
}: PropertyMapOverlayProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const tooltipLayerRef = useRef<L.LayerGroup | null>(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);

  // Handle ESC key to close overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current || !L) return;

    // Fix Leaflet icon issue
    fixLeafletIcon();

    // Prevent body scrolling when overlay is open
    document.body.style.overflow = 'hidden';
    
    // Find center of properties or default to a location
    let center: [number, number] = [33.4484, -112.0740]; // Default to Phoenix, AZ
    
    if (properties.length > 0) {
      const validProperties = properties.filter(p => p.Latitude && p.Longitude);
      
      if (validProperties.length > 0) {
        // Calculate the average of lat/lng for properties
        const avgLat = validProperties.reduce((sum, p) => sum + (p.Latitude || 0), 0) / validProperties.length;
        const avgLng = validProperties.reduce((sum, p) => sum + (p.Longitude || 0), 0) / validProperties.length;
        center = [avgLat, avgLng];
      }
    }

    const newMap = L.map(mapRef.current, {
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      wheelDebounceTime: 40,
      wheelPxPerZoomLevel: 80
    }).setView(center, 10);
    
    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(newMap);

    // Add satellite layer
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 19
    });

    // Add layer control
    const baseMaps = {
      "Street": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }),
      "Satellite": satellite
    };
    
    L.control.layers(baseMaps).addTo(newMap);

    // Create marker layer group
    const markerLayer = L.layerGroup().addTo(newMap);
    markerLayerRef.current = markerLayer;
    
    // Create tooltip layer group
    const tooltipLayer = L.layerGroup().addTo(newMap);
    tooltipLayerRef.current = tooltipLayer;

    setMap(newMap);
    
    return () => {
      document.body.style.overflow = 'auto';
      newMap.remove();
    };
  }, [properties]);

  // Add markers when map is initialized and properties change
  useEffect(() => {
    if (!map || !markerLayerRef.current || !tooltipLayerRef.current) return;

    // Clear previous markers and tooltips
    markerLayerRef.current.clearLayers();
    tooltipLayerRef.current.clearLayers();
    setMarkers([]);
    
    // Create a bounds object to fit all markers
    const bounds = L.latLngBounds([]);
    
    // Add new markers
    const newMarkers = properties
      .filter(property => property.Latitude && property.Longitude)
      .map(property => {
        const lat = property.Latitude || 0;
        const lng = property.Longitude || 0;
        
        // Create a formatted price for the popup
        const formattedPrice = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0
        }).format(property.ListPrice);

        // Create custom icon
        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="marker-pin ${highlightedPropertyId === property.ListingKey || hoveredMarkerId === property.ListingKey ? 'highlighted' : ''}">
                  <span>${formattedPrice}</span>
                </div>`,
          iconSize: [70, 30],
          iconAnchor: [35, 15],
        });

        // Create marker
        const marker = L.marker([lat, lng], { icon }).addTo(markerLayerRef.current!);
        
        // Create tooltip content
        const tooltipContent = document.createElement('div');
        tooltipContent.className = 'tooltip-content';
        
        // Render tooltip content with React
        createRoot(tooltipContent).render(
          <div className="bg-white p-3 rounded-lg shadow-lg min-w-[240px] border border-gray-200">
            <div className="text-lg font-bold text-blue-700">{formattedPrice}</div>
            <div className="text-gray-700">{property.BedroomsTotal} BD | {property.BathroomsTotalInteger} BA | {property.LivingArea} SQ FT</div>
            <div className="text-gray-700">{property.StreetNumber} {property.StreetName}</div>
            <div className="text-blue-700">{property.City}, {property.StateOrProvince} {property.PostalCode}</div>
            <div className="mt-2 text-gray-500 text-sm">Click for details</div>
          </div>
        );
        
        // Handle hover events
        marker.on('mouseover', () => {
          setHoveredMarkerId(property.ListingKey);
          
          // Create and show tooltip
          const tooltip = L.popup({
            className: 'custom-popup',
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
        
        marker.on('mouseout', () => {
          setHoveredMarkerId(null);
          tooltipLayerRef.current!.clearLayers();
        });

        // Handle click event - navigate to property details
        marker.on('click', () => {
          onPropertySelect(property.ListingKey);
        });

        // Add to bounds
        bounds.extend([lat, lng]);
        
        return marker;
      });
    
    setMarkers(newMarkers);
    
    // Fit bounds if we have markers
    if (newMarkers.length > 0 && !highlightedPropertyId) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16
      });
    } else if (highlightedPropertyId) {
      // Find the highlighted property
      const highlightedProperty = properties.find(p => p.ListingKey === highlightedPropertyId);
      if (highlightedProperty && highlightedProperty.Latitude && highlightedProperty.Longitude) {
        map.setView([highlightedProperty.Latitude, highlightedProperty.Longitude], 15);
      }
    }
    
    // Add custom CSS for markers
    if (!document.getElementById('leaflet-custom-styles-overlay')) {
      const style = document.createElement('style');
      style.id = 'leaflet-custom-styles-overlay';
      style.innerHTML = `
        .marker-pin {
          width: auto;
          min-width: 70px;
          height: 30px;
          padding: 0 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #3b82f6;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          font-size: 13px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
          transform: translateX(-50%) translateY(0);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid rgba(255,255,255,0.8);
        }
        
        .marker-pin:hover, .marker-pin.highlighted {
          background-color: #f97316;
          z-index: 1000 !important;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1), 0 6px 8px rgba(0,0,0,0.05);
          transform: translateX(-50%) translateY(-2px);
        }
        
        .custom-div-icon {
          background: none;
          border: none;
        }
        
        .custom-popup .leaflet-popup-content-wrapper {
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
        
        .custom-popup .leaflet-popup-content {
          margin: 0;
          padding: 0;
        }
        
        .custom-popup .leaflet-popup-tip {
          background: white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .leaflet-control-layers {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border: 1px solid rgba(0,0,0,0.1);
        }
        
        .leaflet-control-layers-selector {
          margin-right: 8px;
        }
        
        .leaflet-control-layers-base label {
          padding: 6px 8px;
          margin: 0;
          transition: background-color 0.2s ease;
        }
        
        .leaflet-control-layers-base label:hover {
          background-color: rgba(0,0,0,0.05);
        }
      `;
      document.head.appendChild(style);
    }
  }, [map, properties, onPropertySelect, highlightedPropertyId, hoveredMarkerId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="relative w-full h-full max-w-7xl mx-auto flex flex-col bg-white rounded-lg shadow-2xl">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Property Map</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <div ref={mapRef} className="w-full h-full" />
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <p className="text-gray-600 text-sm">
            Showing {properties.length} properties. Hover over a price tag to see details, click to view the property.
          </p>
        </div>
      </div>
    </div>
  );
} 