import { useEffect, useRef, useState } from "react";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import { Map as MapGL } from "react-map-gl/maplibre";
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
  pitch: 30,
  minPitch: 30,
  maxPitch: 30,
  bearing: 0,
};

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

interface GeoProps {
  ISO_A2?: string;
  ISO_A2_EH?: string;
  NAME?: string;
}

// Overseas territories whose ISO_A2_EH falls back to the sovereign country code.
// Map them to their own ISO codes so they aren't coloured as the parent country.
const TERRITORY_ISO: Record<string, string> = {
  'French Guiana': 'GF',
  'Martinique': 'MQ',
  'Guadeloupe': 'GP',
  'Réunion': 'RE',
  'Mayotte': 'YT',
  'Saint Pierre and Miquelon': 'PM',
  'New Caledonia': 'NC',
  'French Polynesia': 'PF',
  'Wallis and Futuna': 'WF',
};

interface HoverInfo {
  x: number;
  y: number;
  object?: { properties: GeoProps };
}

interface MapSceneProps {
  isStatic?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialViewState?: any;
}

export default function MapScene({ isStatic = false, initialViewState }: MapSceneProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [geoData, setGeoData] = useState<any>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [viewState, setViewState] = useState<any>(initialViewState ?? INITIAL_VIEW_STATE);
  const { setSelectedCountry } = useMapContext();
  const containerRef = useRef<HTMLDivElement>(null);

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

  const visitedSet = new Map<string, MapCountry>(
    visitedCountries?.map((c) => [c.isoCode, c]) ?? [],
  );

  useEffect(() => {
    fetch("/geo/countries.geojson")
      .then((r) => r.json())
      .then((data) => {
        // Some countries (e.g. France) are MultiPolygons that include overseas
        // territories far outside Europe. Strip any polygon whose centroid
        // longitude falls outside the -20 to 55 European window.
        const EUROPEAN_COUNTRIES = new Set(['France', 'Norway', 'Portugal', 'Spain']);
        const fixed = {
          ...data,
          features: data.features.map((f: { geometry: { type: string; coordinates: number[][][][] }; properties: GeoProps }) => {
            if (
              f.geometry.type === 'MultiPolygon' &&
              f.properties.NAME &&
              EUROPEAN_COUNTRIES.has(f.properties.NAME)
            ) {
              const euroPolygons = f.geometry.coordinates.filter((poly) => {
                const lngs = poly[0].map((c) => c[0]);
                const centLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
                return centLng > -20 && centLng < 55;
              });
              return {
                ...f,
                geometry: { ...f.geometry, coordinates: euroPolygons },
              };
            }
            return f;
          }),
        };
        setGeoData(fixed);
      })
      .catch(console.error);
  }, []);

  const getIso = (props: GeoProps): string => {
    if (props?.NAME && TERRITORY_ISO[props.NAME]) return TERRITORY_ISO[props.NAME];
    const iso = props?.ISO_A2;
    if (iso && iso !== "-99") return iso;
    return props?.ISO_A2_EH || "";
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layer = geoData
    ? new (GeoJsonLayer as any)({
        id: "countries",
        data: geoData,
        extruded: true,
        wireframe: false,
        pickable: true,
        getElevation: (f: { properties: GeoProps }) =>
          visitedSet.has(getIso(f.properties)) ? 180000 : 0,
        getFillColor: (f: { properties: GeoProps }) => {
          const iso = getIso(f.properties);
          return visitedSet.has(iso) ? [245, 158, 11, 220] : [30, 41, 59, 180];
        },
        getLineColor: [255, 255, 255, 25],
        getLineWidth: 1,
        lineWidthMinPixels: 0.5,
        updateTriggers: {
          getFillColor: [visitedSet.size],
          getElevation: [visitedSet.size],
        },
        transitions: { getElevation: 600 },
        onHover: (info: {
          x: number;
          y: number;
          object?: { properties: GeoProps };
        }) => {
          setHoverInfo(info.object ? info : null);
        },
        onClick: (info: { object?: { properties: GeoProps } }) => {
          if (!info.object) return;
          const iso = getIso(info.object.properties);
          setSelectedCountry(visitedSet.get(iso) ?? null);
        },
      })
    : null;

  return (
    <div className={styles.container} ref={containerRef}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const v = vs as any;
          const atMinZoom = v.zoom <= INITIAL_VIEW_STATE.minZoom;
          setViewState({
            ...v,
            latitude: Math.min(v.latitude, 20),
            pitch: 30,
            longitude: atMinZoom ? INITIAL_VIEW_STATE.longitude : v.longitude,
          });
        }}
        controller={!isStatic}
        layers={layer ? [layer] : []}
      >
        <MapGL mapStyle={MAP_STYLE} />
      </DeckGL>

      {hoverInfo?.object && (
        <div
          className={styles.tooltip}
          style={{ left: hoverInfo.x + 12, top: hoverInfo.y - 8 }}
        >
          {(() => {
            const iso = getIso(hoverInfo.object.properties);
            const visited = visitedSet.get(iso);
            return (
              <>
                {visited && <span className={styles.visitedDot} />}
                <span>
                  {visited?.flagEmoji ?? ""}{" "}
                  {hoverInfo.object.properties.NAME ?? iso}
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
