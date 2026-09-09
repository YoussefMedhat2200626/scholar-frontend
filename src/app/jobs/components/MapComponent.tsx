"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import worldGeoJSON from "@/src/data/world.geo.json";
import { GeoJsonObject } from "geojson";

interface MapComponentProps {
  selectedCountries: string[];
  onToggleCountry: (country: string) => void;
}

export default function MapComponent({ selectedCountries, onToggleCountry }: MapComponentProps) {
  // Leaflet requires window, we know this component is loaded dynamically so it's safe.
  
  const geoJsonStyle = (feature: any) => {
    const isSelected = selectedCountries.includes(feature.properties.name);
    return {
      fillColor: isSelected ? "#70B5DF" : "#1a2336",
      weight: 1,
      opacity: 1,
      color: "#2a3441",
      fillOpacity: isSelected ? 0.6 : 0.8,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const countryName = feature.properties.name;
    
    // Bind a simple tooltip on hover
    layer.bindTooltip(countryName, {
      className: "bg-[#151c2c] border border-[#2a3441] text-white px-2 py-1 rounded shadow-lg",
      direction: "top"
    });

    layer.on({
      mouseover: (e: any) => {
        const target = e.target;
        if (!selectedCountries.includes(countryName)) {
          target.setStyle({
            fillColor: "#3a4a5e",
            fillOpacity: 0.9,
          });
        }
      },
      mouseout: (e: any) => {
        const target = e.target;
        if (!selectedCountries.includes(countryName)) {
          target.setStyle({
            fillColor: "#1a2336",
            fillOpacity: 0.8,
          });
        }
      },
      click: () => {
        onToggleCountry(countryName);
      },
    });
  };

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(112,181,223,0.1)] border border-white/10">
      <MapContainer
        center={[26, 30]} // Focus roughly on Egypt
        zoom={3}
        style={{ height: "100%", width: "100%", background: "#0a0f18" }}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <GeoJSON 
          data={worldGeoJSON as GeoJsonObject} 
          style={geoJsonStyle}
          onEachFeature={onEachFeature}
        />
      </MapContainer>
    </div>
  );
}
