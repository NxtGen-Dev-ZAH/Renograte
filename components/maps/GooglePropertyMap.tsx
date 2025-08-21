"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Property } from "@/types/property";
import {
  loadGoogleMaps,
  isWithinUSBounds,
  clampToUSBounds,
  calculateCenter,
  getDefaultMapOptions,
  getMapTypeControlOptions,
} from "@/lib/google-maps";

interface PropertyMapProps {
  properties: Property[];
  height?: string;
  onMarkerClick?: (propertyId: string) => void;
  highlightedPropertyId?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

interface MarkerData {
  marker: google.maps.Marker;
  property: Property;
  blueDefault: google.maps.Icon;
  orangeDefault: google.maps.Icon;
  orangeHover: google.maps.Icon;
}

interface DirectionalIndicator {
  direction: "top" | "right" | "bottom" | "left";
  visible: boolean;
}

export default function GooglePropertyMap({
  properties,
  height = "400px",
  onMarkerClick,
  highlightedPropertyId,
  initialCenter,
  initialZoom,
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const markersRef = useRef<Map<string, MarkerData>>(new Map());
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(
    null
  );
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const propertiesSignatureRef = useRef<string>("");
  const [directionalIndicators, setDirectionalIndicators] = useState<
    DirectionalIndicator[]
  >([
    { direction: "top", visible: false },
    { direction: "right", visible: false },
    { direction: "bottom", visible: false },
    { direction: "left", visible: false },
  ]);

  // Initialize Google Maps - must respond to property and initialCenter/initialZoom changes
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        await loadGoogleMaps();

        // Check if container has dimensions before initializing
        if (
          mapRef.current!.clientWidth === 0 ||
          mapRef.current!.clientHeight === 0
        ) {
          console.warn(
            "Map container has zero width or height. Delaying map initialization."
          );
          return;
        }

        // Determine initial center
        let center = { lat: 39.8283, lng: -98.5795 }; // Default to geographic center of US

        if (initialCenter) {
          const [lat, lng] = clampToUSBounds(
            initialCenter[0],
            initialCenter[1]
          );
          center = { lat, lng };
        } else if (properties.length > 0) {
          const validProperties = properties.filter((p) => {
            const lat = p.Latitude || 0;
            const lng = p.Longitude || 0;
            return isWithinUSBounds(lat, lng);
          });

          if (validProperties.length > 0) {
            const coords = validProperties.map((p) => ({
              lat: p.Latitude || 0,
              lng: p.Longitude || 0,
            }));
            center = calculateCenter(coords);
          }
        }

        // Create map with default options
        let mapInstance = map;
        if (!mapInstance) {
          const mapOptions = {
            ...getDefaultMapOptions(),
            center,
            zoom: initialZoom || 10,
            mapTypeControlOptions: getMapTypeControlOptions(),
          };

          mapInstance = new google.maps.Map(mapRef.current!, mapOptions);
          setMap(mapInstance);

          // Add bounds_changed listener to check for off-screen markers
          mapInstance.addListener("bounds_changed", () => {
            checkForOffscreenHighlightedMarker();
          });
        } else {
          // If map already exists, just update the center and zoom
          mapInstance.setCenter(center);
          if (initialZoom) {
            mapInstance.setZoom(initialZoom);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing Google Maps:", error);
        setIsLoading(false);
      }
    };

    initMap();
  }, [initialCenter, initialZoom, properties]); // Keep these dependencies to react to property/initial position changes

  // Create a signature of properties to detect meaningful changes
  useEffect(() => {
    // Create a signature based on property IDs
    const newSignature = properties
      .map((p) => p.ListingKey)
      .sort()
      .join(",");
    propertiesSignatureRef.current = newSignature;
  }, [properties]);

  // Check if highlighted marker is in viewport
  const checkForOffscreenHighlightedMarker = useCallback(() => {
    if (!map || !highlightedPropertyId) {
      // Reset all indicators if no highlighted property
      setDirectionalIndicators((prev) =>
        prev.map((indicator) => ({ ...indicator, visible: false }))
      );
      return;
    }

    const markerData = markersRef.current.get(highlightedPropertyId);
    if (!markerData) return;

    const bounds = map.getBounds();
    if (!bounds) return;

    const markerPosition = markerData.marker.getPosition();
    if (!markerPosition) return;

    // Check if marker is in viewport
    const isInViewport = bounds.contains(markerPosition);

    if (isInViewport) {
      // If in viewport, hide all indicators
      setDirectionalIndicators((prev) =>
        prev.map((indicator) => ({ ...indicator, visible: false }))
      );
    } else {
      // If not in viewport, determine direction
      const center = map.getCenter();
      if (!center) return;

      const markerLat = markerPosition.lat();
      const markerLng = markerPosition.lng();
      const centerLat = center.lat();
      const centerLng = center.lng();

      // Determine which direction(s) to show
      const isNorth = markerLat > centerLat;
      const isSouth = markerLat < centerLat;
      const isEast = markerLng > centerLng;
      const isWest = markerLng < centerLng;

      setDirectionalIndicators([
        { direction: "top", visible: isNorth },
        { direction: "right", visible: isEast },
        { direction: "bottom", visible: isSouth },
        { direction: "left", visible: isWest },
      ]);
    }
  }, [map, highlightedPropertyId]);

  // Check for off-screen marker when highlighted property changes
  useEffect(() => {
    if (map && highlightedPropertyId) {
      checkForOffscreenHighlightedMarker();
    }
  }, [map, highlightedPropertyId]);

  // Memoized marker icon creation function
  const createMarkerIcons = useCallback((property: Property) => {
    const formattedPrice = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(property.ListPrice);

    const blueDefault = {
      url:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="140" height="44" viewBox="0 0 140 44">
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.15)"/>
            </filter>
          </defs>
          <rect x="8" y="8" width="124" height="32" rx="16" fill="#1e40af" 
                stroke="white" stroke-width="2" filter="url(#shadow)"/>
          <text x="70" y="29" text-anchor="middle" fill="white" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif" 
                font-size="13" font-weight="700">
            ${formattedPrice}
          </text>
        </svg>
      `),
      scaledSize: new google.maps.Size(140, 44),
      anchor: new google.maps.Point(70, 22),
    };

    const orangeDefault = {
      url:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="140" height="44" viewBox="0 0 140 44">
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.15)"/>
            </filter>
          </defs>
          <rect x="8" y="8" width="124" height="32" rx="16" fill="#f97316" 
                stroke="white" stroke-width="2" filter="url(#shadow)"/>
          <text x="70" y="29" text-anchor="middle" fill="white" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif" 
                font-size="13" font-weight="700">
            ${formattedPrice}
          </text>
        </svg>
      `),
      scaledSize: new google.maps.Size(140, 44),
      anchor: new google.maps.Point(70, 22),
    };

    const orangeHover = {
      url:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="148" height="48" viewBox="0 0 148 48">
          <defs>
            <filter id="shadow-hover" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.2)"/>
            </filter>
          </defs>
          <rect x="8" y="8" width="132" height="36" rx="18" fill="#f97316" 
                stroke="white" stroke-width="3" filter="url(#shadow-hover)"/>
          <text x="74" y="31" text-anchor="middle" fill="white" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif" 
                font-size="14" font-weight="700">
            ${formattedPrice}
          </text>
        </svg>
      `),
      scaledSize: new google.maps.Size(148, 48),
      anchor: new google.maps.Point(74, 24),
    };

    return { blueDefault, orangeDefault, orangeHover };
  }, []);

  // Memoized tooltip content creation
  const createTooltipContent = useCallback((property: Property) => {
    const formattedPrice = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
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
              <span class="spec-value">${property.BedroomsTotal || "N/A"}</span>
              <span class="spec-label">Beds</span>
            </div>
            <div class="spec-divider"></div>
            <div class="spec-item">
              <span class="spec-value">${property.BathroomsTotalInteger || "N/A"}</span>
              <span class="spec-label">Baths</span>
            </div>
            <div class="spec-divider"></div>
            <div class="spec-item">
              <span class="spec-value">${property.LivingArea ? property.LivingArea.toLocaleString() : "N/A"}</span>
              <span class="spec-label">Sq Ft</span>
            </div>
          </div>
          <div class="property-address">
            <div class="street-address">${property.StreetNumber} ${property.StreetName}</div>
            <div class="city-state">${property.City}, ${property.StateOrProvince} ${property.PostalCode}</div>
          </div>
          ${property.PropertyType ? `<div class="property-type">${property.PropertyType}</div>` : ""}
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
  const handleMarkerHover = useCallback(
    (propertyId: string, marker: google.maps.Marker, content: string) => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      // Close any existing InfoWindow
      closeCurrentInfoWindow();

      // Create new InfoWindow
      const infoWindow = new google.maps.InfoWindow({
        content,
        disableAutoPan: true,
        pixelOffset: new google.maps.Size(0, -10),
      });

      // Open the new InfoWindow
      infoWindow.open(map, marker);
      currentInfoWindowRef.current = infoWindow;
      setHoveredPropertyId(propertyId);
    },
    [map, closeCurrentInfoWindow]
  );

  const handleMarkerUnhover = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      closeCurrentInfoWindow();
      setHoveredPropertyId(null);
    }, 150);
  }, [closeCurrentInfoWindow]);

  // Separate effect for creating/updating markers only when properties change
  useEffect(() => {
    if (!map || !window.google) return;

    const currentMarkers = markersRef.current;
    const validProperties = properties.filter((property) => {
      const lat = property.Latitude || 0;
      const lng = property.Longitude || 0;
      return isWithinUSBounds(lat, lng);
    });

    const newPropertyIds = new Set(validProperties.map((p) => p.ListingKey));
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

    validProperties.forEach((property) => {
      if (!currentMarkers.has(property.ListingKey)) {
        hasNewMarkers = true;
        let lat = property.Latitude || 0;
        let lng = property.Longitude || 0;

        // Clamp coordinates to US bounds
        [lat, lng] = clampToUSBounds(lat, lng);

        const position = { lat, lng };

        // Create marker icons
        const icons = createMarkerIcons(property);

        // Create marker with initial blue default
        const marker = new google.maps.Marker({
          position,
          map,
          title: `${property.StreetNumber} ${property.StreetName}`,
          zIndex: 1,
          icon: icons.blueDefault,
          optimized: false,
        });

        // Get tooltip content
        const tooltipContent = createTooltipContent(property);

        // Add hover listeners (only handle state, effect will update icon)
        marker.addListener("mouseover", () => {
          handleMarkerHover(property.ListingKey, marker, tooltipContent);
        });

        marker.addListener("mouseout", () => {
          handleMarkerUnhover();
        });

        // Add click listener
        marker.addListener("click", () => {
          if (onMarkerClick) {
            onMarkerClick(property.ListingKey);
          }
        });

        currentMarkers.set(property.ListingKey, { marker, property, ...icons });
      }

      // Always update bounds with all valid properties
      const lat = property.Latitude || 0;
      const lng = property.Longitude || 0;
      const [clampedLat, clampedLng] = clampToUSBounds(lat, lng);
      bounds.extend({ lat: clampedLat, lng: clampedLng });
    });

    // Always fit bounds when properties change
    if (validProperties.length > 0 && !initialCenter) {
      // Use a small timeout to ensure the map is properly sized
      setTimeout(() => {
        map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });

        // Ensure zoom doesn't go too high
        google.maps.event.addListenerOnce(map, "bounds_changed", () => {
          if (map.getZoom()! > 15) {
            map.setZoom(15);
          }
        });
      }, 100);
    }

    // Check for off-screen markers
    if (highlightedPropertyId) {
      setTimeout(checkForOffscreenHighlightedMarker, 200);
    }
  }, [
    map,
    properties,
    onMarkerClick,
    createTooltipContent,
    createMarkerIcons,
    handleMarkerHover,
    handleMarkerUnhover,
    initialCenter,
    highlightedPropertyId,
    checkForOffscreenHighlightedMarker,
  ]);

  // Separate effect for updating map view when highlighting changes
  useEffect(() => {
    if (!map || markersRef.current.size === 0) return;

    if (highlightedPropertyId) {
      const markerData = markersRef.current.get(highlightedPropertyId);
      if (
        markerData &&
        markerData.property.Latitude &&
        markerData.property.Longitude
      ) {
        const lat = markerData.property.Latitude;
        const lng = markerData.property.Longitude;
        const [clampedLat, clampedLng] = clampToUSBounds(lat, lng);

        // Only adjust center if it's significantly different from current center
        const currentCenter = map.getCenter();
        if (currentCenter) {
          const distance = Math.sqrt(
            Math.pow(currentCenter.lat() - clampedLat, 2) +
              Math.pow(currentCenter.lng() - clampedLng, 2)
          );

          // Only pan if the highlighted property is far from current view
          if (distance > 0.1) {
            map.panTo({ lat: clampedLat, lng: clampedLng });
          }
        } else {
          // If we can't get current center, just set it directly
          map.panTo({ lat: clampedLat, lng: clampedLng });
        }

        // Do NOT automatically adjust zoom on highlight in the listings page
        // This preserves the user's zoom level while exploring
      }
    }
  }, [map, highlightedPropertyId]);

  // Optimized effect for updating only marker styles when highlighting/hovering changes
  useEffect(() => {
    if (!map || !window.google || markersRef.current.size === 0) return;

    // Only update markers that need style changes
    markersRef.current.forEach((markerData, propertyId) => {
      const { marker, blueDefault, orangeDefault, orangeHover } = markerData;
      const isHighlighted = highlightedPropertyId === propertyId;
      const isHovered = hoveredPropertyId === propertyId;

      // Determine the appropriate icon and z-index
      const targetIcon = isHovered
        ? orangeHover
        : isHighlighted
          ? orangeDefault
          : blueDefault;
      const targetZIndex = isHovered ? 2000 : isHighlighted ? 1000 : 1;

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
  }, [map, highlightedPropertyId, hoveredPropertyId]);

  // Add custom CSS for professional styling
  useEffect(() => {
    if (!document.getElementById("google-maps-custom-styles")) {
      const style = document.createElement("style");
      style.id = "google-maps-custom-styles";
      style.innerHTML = `
        .property-tooltip-professional {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          border: 1px solid rgba(226, 232, 240, 0.8) !important;
          overflow: hidden !important;
          animation: tooltipSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          max-width : 200px !important;
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

        /* Direction indicator styles */
        .direction-indicator {
          position: absolute;
          width: 36px;
          height: 36px;
          background-color: rgba(249, 115, 22, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          color: white;
          font-size: 20px;
          z-index: 1000;
          border: 2px solid white;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .direction-indicator:hover {
          transform: scale(1.1);
          background-color: rgba(249, 115, 22, 1);
        }
        
        .direction-indicator.top {
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .direction-indicator.right {
          top: 50%;
          right: 10px;
          transform: translateY(-50%);
        }
        
        .direction-indicator.bottom {
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .direction-indicator.left {
          top: 50%;
          left: 10px;
          transform: translateY(-50%);
        }

        .direction-indicator.top:hover {
          top: 8px;
          transform: translateX(-50%);
        }
        
        .direction-indicator.right:hover {
          right: 8px;
          transform: translateY(-50%);
        }
        
        .direction-indicator.bottom:hover {
          bottom: 8px;
          transform: translateX(-50%);
        }
        
        .direction-indicator.left:hover {
          left: 8px;
          transform: translateY(-50%);
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    if (!map) return;

    const handleResize = () => {
      google.maps.event.trigger(map, "resize");
      setTimeout(checkForOffscreenHighlightedMarker, 100);
    };

    window.addEventListener("resize", handleResize);

    // Trigger resize after small delay to ensure container is fully rendered
    const resizeTimer = setTimeout(() => {
      google.maps.event.trigger(map, "resize");
      checkForOffscreenHighlightedMarker();
    }, 200);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, [map, checkForOffscreenHighlightedMarker]);

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

  // Click handler for directional indicators
  const handleDirectionClick = (_direction: string) => {
    if (!map || !highlightedPropertyId) return;

    const markerData = markersRef.current.get(highlightedPropertyId);
    if (
      !markerData ||
      !markerData.property.Latitude ||
      !markerData.property.Longitude
    )
      return;

    // Pan to the highlighted property
    const lat = markerData.property.Latitude;
    const lng = markerData.property.Longitude;
    const [clampedLat, clampedLng] = clampToUSBounds(lat, lng);

    map.panTo({ lat: clampedLat, lng: clampedLng });
  };

  return (
    <div
      className="map-container"
      style={{ position: "relative", width: "100%", height, zIndex: 51 }}
    >
      <div
        ref={mapRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
      {isLoading && (
        <div
          className="map-loading"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f3f4f6",
          }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Directional indicators for off-screen highlighted markers */}
      {directionalIndicators.map(
        (indicator) =>
          indicator.visible && (
            <div
              key={indicator.direction}
              className={`direction-indicator ${indicator.direction}`}
              onClick={() => handleDirectionClick(indicator.direction)}
              title="Property is outside current view. Click to pan."
            >
              {indicator.direction === "top" && "↑"}
              {indicator.direction === "right" && "→"}
              {indicator.direction === "bottom" && "↓"}
              {indicator.direction === "left" && "←"}
            </div>
          )
      )}
    </div>
  );
}
