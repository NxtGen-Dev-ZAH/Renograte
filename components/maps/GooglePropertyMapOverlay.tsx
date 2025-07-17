"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Property } from '@/types/property';
import { X } from 'lucide-react';
import { 
  loadGoogleMaps, 
  calculateCenter, 
  createBounds,
  getDefaultMapOptions,
  getMapTypeControlOptions
} from '@/lib/google-maps';

interface PropertyMapOverlayProps {
  properties: Property[];
  onClose: () => void;
  onPropertySelect: (propertyId: string) => void;
  highlightedPropertyId?: string;
}

interface MarkerData {
  marker: google.maps.Marker;
  property: Property;
  blueDefault: google.maps.Icon;
  orangeDefault: google.maps.Icon;
  orangeHover: google.maps.Icon;
}

export default function GooglePropertyMapOverlay({
  properties,
  onClose,
  onPropertySelect,
  highlightedPropertyId
}: PropertyMapOverlayProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, MarkerData>>(new Map());
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);

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
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        await loadGoogleMaps();

        // Prevent body scrolling when overlay is open
        document.body.style.overflow = 'hidden';
        
        // Determine center from properties
        let center = { lat: 33.4484, lng: -112.0740 }; // Default to Phoenix, AZ
        
        if (properties.length > 0) {
          const validProperties = properties.filter(p => p.Latitude && p.Longitude);
          
          if (validProperties.length > 0) {
            const coords = validProperties.map(p => ({ 
              lat: p.Latitude || 0, 
              lng: p.Longitude || 0 
            }));
            center = calculateCenter(coords);
          }
        }

        const mapOptions = {
          ...getDefaultMapOptions(),
          center,
          zoom: 10,
          mapTypeControlOptions: getMapTypeControlOptions()
        };

        const newMap = new google.maps.Map(mapRef.current!, mapOptions);
        setMap(newMap);
        setIsLoading(false);

      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        setIsLoading(false);
      }
    };

    initMap();
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []); // Only run once, not dependent on properties

  // Memoized marker icon creation function
  const createMarkerIcons = useCallback((property: Property) => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(property.ListPrice);

    const blueDefault = {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40">
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.15)"/>
            </filter>
          </defs>
          <rect x="6" y="6" width="108" height="28" rx="14" fill="#1e40af" 
                stroke="white" stroke-width="2" filter="url(#shadow)"/>
          <text x="60" y="25" text-anchor="middle" fill="white" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif" 
                font-size="12" font-weight="700">
            ${formattedPrice}
          </text>
        </svg>
      `),
      scaledSize: new google.maps.Size(120, 40),
      anchor: new google.maps.Point(60, 20)
    };

    const orangeDefault = {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40">
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.15)"/>
            </filter>
          </defs>
          <rect x="6" y="6" width="108" height="28" rx="14" fill="#f97316" 
                stroke="white" stroke-width="2" filter="url(#shadow)"/>
          <text x="60" y="25" text-anchor="middle" fill="white" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif" 
                font-size="12" font-weight="700">
            ${formattedPrice}
          </text>
        </svg>
      `),
      scaledSize: new google.maps.Size(120, 40),
      anchor: new google.maps.Point(60, 20)
    };

    const orangeHover = {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="128" height="44" viewBox="0 0 128 44">
          <defs>
            <filter id="shadow-hover" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.2)"/>
            </filter>
          </defs>
          <rect x="6" y="6" width="116" height="32" rx="16" fill="#f97316" 
                stroke="white" stroke-width="3" filter="url(#shadow-hover)"/>
          <text x="64" y="27" text-anchor="middle" fill="white" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif" 
                font-size="13" font-weight="700">
            ${formattedPrice}
          </text>
        </svg>
      `),
      scaledSize: new google.maps.Size(128, 44),
      anchor: new google.maps.Point(64, 22)
    };

    return { blueDefault, orangeDefault, orangeHover };
  }, []);

  // Memoized tooltip content creation
  const createTooltipContent = useCallback((property: Property) => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(property.ListPrice);

    return `
      <div class="property-tooltip-professional">
        <div class="tooltip-header">
          <div class="tooltip-price">${formattedPrice}</div>
          <div class="tooltip-badge">For Sale</div>
        </div>
        <div class="tooltip-content">
          <div class="property-specs">
            <div class="spec-item">
              <span class="spec-value">${property.BedroomsTotal || 'N/A'}</span>
              <span class="spec-label">Beds</span>
            </div>
            <div class="spec-divider"></div>
            <div class="spec-item">
              <span class="spec-value">${property.BathroomsTotalInteger || 'N/A'}</span>
              <span class="spec-label">Baths</span>
            </div>
            <div class="spec-divider"></div>
            <div class="spec-item">
              <span class="spec-value">${property.LivingArea ? property.LivingArea.toLocaleString() : 'N/A'}</span>
              <span class="spec-label">Sq Ft</span>
            </div>
          </div>
          <div class="property-address">
            <div class="street-address">${property.StreetNumber} ${property.StreetName}</div>
            <div class="city-state">${property.City}, ${property.StateOrProvince} ${property.PostalCode}</div>
          </div>
          ${property.PropertyType ? `<div class="property-type">${property.PropertyType}</div>` : ''}
        </div>
      </div>
    `;
  }, []);

  // Close current InfoWindow if open
  const closeCurrentInfoWindow = useCallback(() => {
    if (currentInfoWindowRef.current) {
      currentInfoWindowRef.current.close();
      currentInfoWindowRef.current = null;
    }
  }, []);

  // Memoized hover handler to prevent jerky movement
  const handleMarkerHover = useCallback((propertyId: string, marker: google.maps.Marker, content: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Close any existing InfoWindow
    closeCurrentInfoWindow();
    
    // Create new InfoWindow
    const infoWindow = new google.maps.InfoWindow({
      content,
      disableAutoPan: true,
      pixelOffset: new google.maps.Size(0, -10)
    });
    
    // Open the new InfoWindow
    infoWindow.open(map, marker);
    currentInfoWindowRef.current = infoWindow;
    setHoveredMarkerId(propertyId);
  }, [map, closeCurrentInfoWindow]);

  const handleMarkerUnhover = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      closeCurrentInfoWindow();
      setHoveredMarkerId(null);
    }, 150);
  }, [closeCurrentInfoWindow]);

  // Separate effect for creating/updating markers only when properties change
  useEffect(() => {
    if (!map || !window.google) return;

    const currentMarkers = markersRef.current;
    const newPropertyIds = new Set(properties.filter(p => p.Latitude && p.Longitude).map(p => p.ListingKey));
    const existingPropertyIds = new Set(currentMarkers.keys());

    // Remove markers that are no longer in the properties list
    for (const propertyId of existingPropertyIds) {
      if (!newPropertyIds.has(propertyId)) {
        const markerData = currentMarkers.get(propertyId);
        if (markerData) {
          markerData.marker.setMap(null);
          currentMarkers.delete(propertyId);
        }
      }
    }

    // Add new markers for properties that don't exist yet
    const bounds = new google.maps.LatLngBounds();
    let hasNewMarkers = false;

    properties
      .filter(property => property.Latitude && property.Longitude)
      .forEach(property => {
        if (!currentMarkers.has(property.ListingKey)) {
          hasNewMarkers = true;
          const lat = property.Latitude || 0;
          const lng = property.Longitude || 0;
          const position = { lat, lng };
          const icons = createMarkerIcons(property);
          
          const marker = new google.maps.Marker({
            position,
            map,
            title: `${property.StreetNumber} ${property.StreetName}`,
            zIndex: 1,
            icon: icons.blueDefault,
            optimized: false
          });

          const tooltipContent = createTooltipContent(property);

          marker.addListener('mouseover', () => {
            handleMarkerHover(property.ListingKey, marker, tooltipContent);
          });

          marker.addListener('mouseout', () => {
            handleMarkerUnhover();
          });

          marker.addListener('click', () => {
            onPropertySelect(property.ListingKey);
          });

          currentMarkers.set(property.ListingKey, { marker, property, ...icons });
        }
        
        // Add to bounds for fitting
        bounds.extend({ lat: property.Latitude || 0, lng: property.Longitude || 0 });
      });

    // Fit bounds only if we have new markers
    if (hasNewMarkers && currentMarkers.size > 0) {
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
      google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        if (map.getZoom()! > 16) map.setZoom(16);
      });
    }
  }, [map, properties, createMarkerIcons, createTooltipContent, handleMarkerHover, handleMarkerUnhover, onPropertySelect]);

  // Separate effect for updating map view when highlighting changes
  useEffect(() => {
    if (!map || markersRef.current.size === 0) return;

    if (highlightedPropertyId) {
      const markerData = markersRef.current.get(highlightedPropertyId);
      if (markerData && markerData.property.Latitude && markerData.property.Longitude) {
        map.setCenter({ lat: markerData.property.Latitude, lng: markerData.property.Longitude });
        map.setZoom(15);
      }
    } else {
      const bounds = new google.maps.LatLngBounds();
      markersRef.current.forEach(({ property }) => {
        if (property.Latitude && property.Longitude) {
          bounds.extend({ lat: property.Latitude, lng: property.Longitude });
        }
      });
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
        google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          if (map.getZoom()! > 16) map.setZoom(16);
        });
      }
    }
  }, [map, highlightedPropertyId]);

  // Optimized effect for updating only marker styles when highlighting/hovering changes
  useEffect(() => {
    if (!map || markersRef.current.size === 0) return;

    // Only update markers that need style changes
    markersRef.current.forEach((markerData, propertyId) => {
      const { marker, blueDefault, orangeDefault, orangeHover } = markerData;
      const isHighlighted = highlightedPropertyId === propertyId;
      const isHovered = hoveredMarkerId === propertyId;
      
      // Determine the appropriate icon and z-index
      const targetIcon = isHovered ? orangeHover : (isHighlighted ? orangeDefault : blueDefault);
      const targetZIndex = isHovered ? 2000 : (isHighlighted ? 1000 : 1);
      
      // Only update if the icon or z-index actually changed
      const currentIcon = marker.getIcon();
      const currentZIndex = marker.getZIndex();
      
      if (currentIcon !== targetIcon) {
        marker.setIcon(targetIcon);
      }
      
      if (currentZIndex !== targetZIndex) {
        marker.setZIndex(targetZIndex);
      }
    });
  }, [map, highlightedPropertyId, hoveredMarkerId]);

  // Add custom CSS for professional styling
  useEffect(() => {
    if (!document.getElementById('google-maps-overlay-styles')) {
      const style = document.createElement('style');
      style.id = 'google-maps-overlay-styles';
      style.innerHTML = `
        .property-tooltip-professional {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          border: 1px solid rgba(226, 232, 240, 0.8) !important;
          overflow: hidden !important;
          animation: tooltipSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          max-width: 200px !important;
          min-width: 180px !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        @keyframes tooltipSlideIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .tooltip-header {
          background: linear-gradient(135deg, #1e40af 0%, #031026 100%) !important;
          padding: 12px 16px 10px !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: flex-start !important;
          margin: 0 !important;
        }
        
        .tooltip-price {
          color: white !important;
          font-weight: 700 !important;
          font-size: 18px !important;
          line-height: 1.1 !important;
          letter-spacing: -0.025em !important;
          margin: 0 !important;
        }
        
        .tooltip-badge {
          background: rgba(255, 255, 255, 0.2) !important;
          color: white !important;
          padding: 3px 8px !important;
          border-radius: 8px !important;
          font-size: 10px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          margin: 0 !important;
        }
        
        .tooltip-content {
          padding: 14px 16px 12px !important;
          margin: 0 !important;
        }
        
        .property-specs {
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          margin-bottom: 12px !important;
          padding: 8px 12px !important;
          background: #f1f5f9 !important;
          border-radius: 8px !important;
        }
        
        .spec-item {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          flex: 1 !important;
          margin: 0 !important;
        }
        
        .spec-value {
          font-size: 16px !important;
          font-weight: 700 !important;
          color: #1e293b !important;
          line-height: 1 !important;
          margin: 0 !important;
        }
        
        .spec-label {
          font-size: 11px !important;
          color: #64748b !important;
          margin-top: 2px !important;
          font-weight: 500 !important;
          margin-bottom: 0 !important;
        }
        
        .spec-divider {
          width: 1px !important;
          height: 24px !important;
          background: #cbd5e1 !important;
          margin: 0 !important;
        }
        
        .property-address {
          margin-bottom: 8px !important;
        }
        
        .street-address {
          font-size: 14px !important;
          font-weight: 600 !important;
          color: #1e293b !important;
          margin-bottom: 3px !important;
          margin-top: 0 !important;
        }
        
        .city-state {
          font-size: 12px !important;
          color: #64748b !important;
          font-weight: 500 !important;
          margin: 0 !important;
        }
        
        .property-type {
          display: inline-block !important;
          background: #dbeafe !important;
          color: #1e40af !important;
          padding: 3px 8px !important;
          border-radius: 6px !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          text-transform: capitalize !important;
          margin: 0 !important;
        }
        
        .tooltip-footer {
          background: #f8fafc !important;
          padding: 12px 20px !important;
          border-top: 1px solid #e2e8f0 !important;
          text-align: center !important;
          margin: 0 !important;
        }
        
        .click-hint {
          color: #64748b !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          margin: 0 !important;
        }
        
        .click-hint::before {
          content: "👆" !important;
          font-size: 14px !important;
        }
        
        /* Custom styles for Google Maps InfoWindow */
        .gm-style .gm-style-iw-c {
          padding: 0 !important;
          border-radius: 12px !important;
          box-shadow: none !important;
          max-width: 240px !important;
          background: transparent !important;
        }
        
        .gm-style .gm-style-iw-t::after {
          display: none !important;
        }
        
        .gm-style .gm-style-iw-d {
          overflow: hidden !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        
        .gm-style-iw-chr {
          display: none !important;
        }
        
        .gm-style .gm-style-iw {
          border-radius: 12px !important;
          background: transparent !important;
          box-shadow: none !important;
        }
        
        .gm-style .gm-style-iw-tc::after {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      
      closeCurrentInfoWindow();
      
      markersRef.current.forEach(({ marker }) => {
        marker.setMap(null);
      });
      markersRef.current.clear();
    };
  }, [closeCurrentInfoWindow]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

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