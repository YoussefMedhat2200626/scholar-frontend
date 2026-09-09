import { useMemo, useState } from "react";
import { WorldMap, MapMarkerItem, Location } from "@/components/WorldMap";
import researchersData from "@/assets/researchers.json";
import locationsData from "@/assets/locations.json";

function enrichWithLocations(researchers: any[], locationsMap: Record<string, Location>) {
  return researchers.map((researcher) => {
    let location: Location | undefined = undefined;
    const affiliation = researcher.affiliation;
    
    if (affiliation && affiliation !== "nan" && affiliation !== "") {
      const normalized = affiliation.trim();
      
      // Try exact or normalized match
      if (locationsMap[affiliation]) {
        location = locationsMap[affiliation];
      } else if (locationsMap[normalized]) {
        location = locationsMap[normalized];
      } else {
        // Try parts
        const separators = /[|,&\/;]/;
        if (separators.test(affiliation)) {
          const parts = affiliation.split(separators).map((p: string) => p.trim());
          for (const part of parts) {
            if (locationsMap[part]) {
              location = locationsMap[part];
              break;
            }
          }
        }
        
        // If still no location, try partial match
        if (!location) {
          const keys = Object.keys(locationsMap).sort((a, b) => b.length - a.length);
          for (const key of keys) {
            if (affiliation.toLowerCase().includes(key.toLowerCase())) {
              location = locationsMap[key];
              break;
            }
          }
        }
      }
    }
    
    return {
      id: researcher.name,
      name: researcher.name,
      affiliation: researcher.affiliation,
      photo: researcher.photo?.replace("./assets/images/", "https://raw.githubusercontent.com/egyptians-in-cs/egyptians-in-cs.github.io/main/src/assets/images/"),
      location
    } as MapMarkerItem;
  });
}

export function MapPage() {
  const mapItems = useMemo(() => {
    return enrichWithLocations(researchersData, locationsData);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Global Researcher Map</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Explore the global distribution of prominent Egyptian researchers in Computer Science.
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <WorldMap items={mapItems} />
      </div>
    </div>
  );
}
