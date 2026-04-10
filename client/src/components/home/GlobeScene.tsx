import { useState, useEffect, useMemo, useRef } from "react";
import DeckGL from "@deck.gl/react";
import { _GlobeView as GlobeView } from "@deck.gl/core";
import type { GlobeViewState } from "@deck.gl/core";
import { GeoJsonLayer, TextLayer, ScatterplotLayer } from "@deck.gl/layers";
import type { FeatureCollection } from "geojson";
import { useQuery } from "@tanstack/react-query";
import { mapService } from "../../services/mapService";
import type { MapCountry } from "../../types";
import styles from "./GlobeScene.module.scss";

interface GeoProps {
  ISO_A2?: string;
  ISO_A2_EH?: string;
  NAME?: string;
}

interface LabelDatum {
  position: [number, number];
  text: string;
}

const getIso = (p: GeoProps): string =>
  p.ISO_A2 && p.ISO_A2 !== "-99" ? p.ISO_A2 : (p.ISO_A2_EH ?? "");

function ringCentroid(coords: number[][]): [number, number] {
  let lng = 0,
    lat = 0;
  for (const [x, y] of coords) {
    lng += x;
    lat += y;
  }
  return [lng / coords.length, lat / coords.length];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function featureCentroid(geometry: any): [number, number] | null {
  if (geometry.type === "Polygon") {
    return ringCentroid(geometry.coordinates[0]);
  }
  if (geometry.type === "MultiPolygon") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const largest = geometry.coordinates.reduce((a: any[], b: any[]) =>
      b[0].length > a[0].length ? b : a,
    );
    return ringCentroid(largest[0]);
  }
  return null;
}

/** Normalise longitude difference to [-180, 180] */
function lngDiff(a: number, b: number): number {
  return ((a - b + 540) % 360) - 180;
}

const INITIAL_VIEW: GlobeViewState = { longitude: 0, latitude: 20, zoom: 1.7 };
const FIXED_LAT = 20; // lock latitude so only horizontal rotation is possible

export default function GlobeScene() {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [viewState, setViewState] = useState<GlobeViewState>(INITIAL_VIEW);
  const isDragging = useRef(false);

  const globeView = useMemo(
    () => new GlobeView({ id: "globe", resolution: 5 }),
    [],
  );

  const { data: visitedCountries } = useQuery({
    queryKey: ["map-visited"],
    queryFn: () => mapService.getVisited().then((r) => r.data),
  });

  const visitedSet = new Set<string>(
    visitedCountries?.map((c: MapCountry) => c.isoCode) ?? [],
  );

  useEffect(() => {
    fetch("/geo/countries.geojson")
      .then((r) => { if (!r.ok) throw new Error(`geo fetch ${r.status}`); return r.json(); })
      .then(setGeoData)
      .catch(console.error);
  }, []);

  // Auto-rotate when user isn't dragging
  useEffect(() => {
    const tick = () => {
      if (!isDragging.current) {
        setViewState((prev) => ({
          ...prev,
          longitude: (prev.longitude + 0.3) % 360,
        }));
      }
    };
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const geoFeatures = Array.isArray(geoData?.features) ? geoData.features : [];

  const countryLayer = geoData
    ? new GeoJsonLayer({
        id: "globe-countries",
        data: geoData,
        filled: true,
        stroked: true,
        pickable: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getFillColor: (f: any) =>
          visitedSet.has(getIso(f.properties))
            ? [245, 158, 11, 255]
            : [30, 41, 59, 200],
        getLineColor: [255, 255, 255, 50],
        getLineWidth: 1,
        lineWidthMinPixels: 0.3,
        updateTriggers: { getFillColor: [visitedSet.size] },
      })
    : null;

  /** 0 at centre, 1 at horizon — used to fade markers near the edge */
  const edgeFade = (lng: number): number => {
    const diff = Math.abs(lngDiff(lng, viewState.longitude));
    if (diff >= 88) return 0;
    if (diff <= 55) return 1;
    // linear fade from 55° → 88°
    return 1 - (diff - 55) / (88 - 55);
  };

  // Build marker data with per-item fade opacity
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visibleVisited: (LabelDatum & { opacity: number })[] = (geoFeatures as any[])
    .filter((f: { properties: GeoProps }) =>
      visitedSet.has(getIso(f.properties)),
    )
    .flatMap((f: { properties: GeoProps; geometry: any }) => {
      const pos = featureCentroid(f.geometry);
      if (!pos) return [];
      const opacity = edgeFade(pos[0]);
      if (opacity <= 0) return [];
      return [{ position: pos, text: f.properties.NAME ?? "", opacity }];
    });

  // Amber dot anchored to centroid
  const dotLayer = visibleVisited.length
    ? new ScatterplotLayer<(typeof visibleVisited)[0]>({
        id: "country-dots",
        data: visibleVisited,
        getPosition: (d) => d.position,
        getRadius: 22000,
        getFillColor: (d) => [245, 158, 11, Math.round(d.opacity * 255)],
        getLineColor: (d) => [255, 255, 255, Math.round(d.opacity * 180)],
        stroked: true,
        lineWidthMinPixels: 1,
        pickable: false,
        updateTriggers: {
          getFillColor: [viewState.longitude],
          getLineColor: [viewState.longitude],
        },
      })
    : null;

  // Label floats above the dot via pixel offset
  const labelLayer = visibleVisited.length
    ? new TextLayer<(typeof visibleVisited)[0]>({
        id: "country-labels",
        data: visibleVisited,
        getPosition: (d) => d.position,
        getText: (d) => d.text,
        getPixelOffset: [0, -36],
        getSize: 12,
        getColor: (d) => [255, 255, 255, Math.round(d.opacity * 240)],
        fontFamily: "sans-serif",
        fontWeight: "bold",
        fontSettings: { sdf: true },
        outlineWidth: 4,
        outlineColor: [10, 10, 15, 220],
        pickable: false,
        billboard: true,
        sizeScale: 1,
        updateTriggers: { getColor: [viewState.longitude] },
      })
    : null;

  const layers = [countryLayer, dotLayer, labelLayer].filter(Boolean);

  return (
    <div className={styles.container}>
      <DeckGL
        views={globeView}
        viewState={viewState}
        controller={{
          scrollZoom: false,
          doubleClickZoom: false,
          touchZoom: false,
        }}
        layers={layers}
        style={{ background: "transparent" }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onViewStateChange={({ viewState: vs, interactionState }: any) => {
          isDragging.current = interactionState?.isDragging ?? false;
          // Lock latitude — horizontal rotation only
          setViewState((prev) => ({
            ...prev,
            longitude: (vs as GlobeViewState).longitude,
            latitude: FIXED_LAT,
          }));
        }}
      />
    </div>
  );
}
