import { useEffect, useRef, useState, useMemo } from "react";
import { Map as MapGL, Source, Layer } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent, MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useQuery } from "@tanstack/react-query";
import { mapService } from "../../services/mapService";
import { useMapContext } from "../../context/MapContext";
import type { MapCountry } from "../../types";
import styles from "./MapScene.module.scss";

const INITIAL_VIEW_STATE = {
  longitude: 15,
  latitude: 20,
  zoom: 1.7,
  minZoom: 1.7,
  pitch: 0,
  bearing: 0,
};

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

interface GeoProps {
  ISO_A2?: string;
  ISO_A2_EH?: string;
  NAME?: string;
  _normIso?: string;
  _visited?: boolean;
}

// Overseas territories whose ISO_A2_EH falls back to the sovereign country code.
const TERRITORY_ISO: Record<string, string> = {
  "French Guiana": "GF",
  "Martinique": "MQ",
  "Guadeloupe": "GP",
  "Réunion": "RE",
  "Mayotte": "YT",
  "Saint Pierre and Miquelon": "PM",
  "New Caledonia": "NC",
  "French Polynesia": "PF",
  "Wallis and Futuna": "WF",
};

interface HoverInfo {
  x: number;
  y: number;
  properties: GeoProps;
}

interface MapSceneProps {
  isStatic?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialViewState?: any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getIso(props: GeoProps): string {
  if (props?.NAME && TERRITORY_ISO[props.NAME]) return TERRITORY_ISO[props.NAME];
  const iso = props?.ISO_A2;
  if (iso && iso !== "-99") return iso;
  return props?.ISO_A2_EH || "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fillLayer: any = {
  id: "country-fill",
  type: "fill",
  paint: {
    "fill-color": [
      "case",
      ["==", ["get", "_visited"], true],
      "rgba(245, 158, 11, 0.35)",
      "rgba(20, 30, 48, 0.08)",
    ],
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lineLayer: any = {
  id: "country-line",
  type: "line",
  paint: {
    "line-color": [
      "case",
      ["==", ["get", "_visited"], true],
      "rgba(245, 158, 11, 0.85)",
      "rgba(255, 255, 255, 0.12)",
    ],
    "line-width": [
      "case",
      ["==", ["get", "_visited"], true],
      1.5,
      0.4,
    ],
  },
};

export default function MapScene({ isStatic = false, initialViewState }: MapSceneProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [geoData, setGeoData] = useState<any>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [viewState, setViewState] = useState<any>(initialViewState ?? INITIAL_VIEW_STATE);
  const { setSelectedCountry } = useMapContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (isStatic) return;
    const el = containerRef.current;
    if (!el) return;
    const prevent = (e: Event) => e.preventDefault();
    el.addEventListener("wheel", prevent, { passive: false });
    el.addEventListener("touchmove", prevent, { passive: false });
    return () => {
      el.removeEventListener("wheel", prevent);
      el.removeEventListener("touchmove", prevent);
    };
  }, [isStatic]);

  const { data: visitedCountries } = useQuery({
    queryKey: ["map-visited"],
    queryFn: () => mapService.getVisited().then((r) => r.data),
  });

  const visitedSet = useMemo(
    () => new Map<string, MapCountry>(
      visitedCountries?.map((c) => [c.isoCode, c]) ?? []
    ),
    [visitedCountries]
  );

  useEffect(() => {
    fetch("/geo/countries.geojson")
      .then((r) => r.json())
      .then((data) => {
        const EUROPEAN_COUNTRIES = new Set(["France", "Norway", "Portugal", "Spain"]);
        const fixed = {
          ...data,
          features: data.features.map((f: { geometry: { type: string; coordinates: number[][][][] }; properties: GeoProps }) => {
            if (
              f.geometry.type === "MultiPolygon" &&
              f.properties.NAME &&
              EUROPEAN_COUNTRIES.has(f.properties.NAME)
            ) {
              const euroPolygons = f.geometry.coordinates.filter((poly) => {
                const lngs = poly[0].map((c) => c[0]);
                const centLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
                return centLng > -20 && centLng < 55;
              });
              return { ...f, geometry: { ...f.geometry, coordinates: euroPolygons } };
            }
            return f;
          }),
        };
        setGeoData(fixed);
      })
      .catch(console.error);
  }, []);

  const annotatedGeo = useMemo(() => {
    if (!geoData) return null;
    return {
      ...geoData,
      features: geoData.features.map((f: { properties: GeoProps }) => ({
        ...f,
        properties: {
          ...f.properties,
          _normIso: getIso(f.properties),
          _visited: visitedSet.has(getIso(f.properties)),
        },
      })),
    };
  }, [geoData, visitedSet]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onMove(e: { viewState: any }) {
    const v = e.viewState;
    const atMinZoom = v.zoom <= INITIAL_VIEW_STATE.minZoom;
    setViewState({
      ...v,
      longitude: atMinZoom ? INITIAL_VIEW_STATE.longitude : v.longitude,
    });
  }

  function onMouseMove(e: MapLayerMouseEvent) {
    const f = e.features?.[0];
    if (f) {
      setHoverInfo({ x: e.point.x, y: e.point.y, properties: f.properties as GeoProps });
    } else {
      setHoverInfo(null);
    }
  }

  function onClick(e: MapLayerMouseEvent) {
    const f = e.features?.[0];
    if (!f) return;
    const iso = (f.properties as GeoProps)._normIso ?? "";
    setSelectedCountry(visitedSet.get(iso) ?? null);
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <MapGL
        ref={mapRef}
        {...viewState}
        onMove={onMove}
        mapStyle={MAP_STYLE}
        style={{ width: "100%", height: "100%" }}
        interactiveLayerIds={isStatic ? [] : ["country-fill"]}
        onMouseMove={isStatic ? undefined : onMouseMove}
        onClick={isStatic ? undefined : onClick}
        dragPan={!isStatic}
        scrollZoom={!isStatic}
        touchZoomRotate={!isStatic}
      >
        {annotatedGeo && (
          <Source id="countries" type="geojson" data={annotatedGeo}>
            <Layer {...fillLayer} />
            <Layer {...lineLayer} />
          </Source>
        )}
      </MapGL>

      {hoverInfo && (
        <div
          className={styles.tooltip}
          style={{ left: hoverInfo.x + 12, top: hoverInfo.y - 8 }}
        >
          {(() => {
            const iso = hoverInfo.properties._normIso ?? "";
            const visited = visitedSet.get(iso);
            return (
              <>
                {visited && <span className={styles.visitedDot} />}
                <span>
                  {hoverInfo.properties.NAME ?? iso}
                </span>
                {visited && (
                  <span className={styles.postCount}>
                    {visited.postCount} posts
                  </span>
                )}
              </>
            );
          })()}
        </div>
      )}

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.dotVisited} />
          <span>Visited</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.dotUnvisited} />
          <span>Not yet</span>
        </div>
      </div>
    </div>
  );
}
