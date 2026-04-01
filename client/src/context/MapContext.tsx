import { createContext, useContext, useState, ReactNode } from 'react';
import type { MapCountry } from '../types';

interface MapContextValue {
  selectedCountry: MapCountry | null;
  setSelectedCountry: (country: MapCountry | null) => void;
}

const MapContext = createContext<MapContextValue | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const [selectedCountry, setSelectedCountry] = useState<MapCountry | null>(null);

  return (
    <MapContext.Provider value={{ selectedCountry, setSelectedCountry }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMapContext must be used within MapProvider');
  return ctx;
}
