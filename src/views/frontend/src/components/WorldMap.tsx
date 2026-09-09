import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./WorldMap.css";

// Fix Leaflet's default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface Location {
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export interface MapMarkerItem {
  id: string;
  name: string;
  photo?: string;
  affiliation?: string;
  location?: Location;
}

interface WorldMapProps {
  items: MapMarkerItem[];
}

export function WorldMap({ items }: WorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [25, 20],
      zoom: 2,
      minZoom: 2,
      maxBounds: [
        [-90, -180],
        [90, 180],
      ],
      maxBoundsViscosity: 1.0,
    });
    mapInstanceRef.current = map;

    // CartoDB Voyager tiles
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    // Initialize marker cluster group
    const markers = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        let size = "small";
        if (count > 10) size = "medium";
        if (count > 25) size = "large";

        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster marker-cluster-${size}`,
          iconSize: L.point(40, 40),
        });
      },
    });
    markersRef.current = markers;
    map.addLayer(markers);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!markersRef.current || !mapInstanceRef.current) return;

    const markers = markersRef.current;
    markers.clearLayers();

    items.forEach((item) => {
      if (item.location && item.location.lat && item.location.lng) {
        const marker = L.circleMarker([item.location.lat, item.location.lng], {
          radius: 8,
          fillColor: "#1C8394",
          color: "#091B2B",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        });
        
        const photoUrl = item.photo || "https://via.placeholder.com/64";
        
        const popupContent = `
          <div class="researcher-popup">
            <img src="${photoUrl}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/64'" />
            <h4>${item.name}</h4>
            <p class="affiliation">${item.affiliation || ""}</p>
            <p class="location">${item.location.city}, ${item.location.country}</p>
          </div>
        `;
        
        marker.bindPopup(popupContent, {
          maxWidth: 250,
          className: "researcher-popup-container",
        });
        markers.addLayer(marker);
      }
    });
  }, [items]);

  return (
    <div className="map-container">
      <div ref={mapRef} className="world-map" />
    </div>
  );
}
