import { useEffect, useState, useCallback } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useQuery } from '@tanstack/react-query';
import { mapService } from '../../services/mapService';
import { useMapContext } from '../../context/MapContext';
import type { MapCountry } from '../../types';
import styles from './MapScene.module.scss';

const INITIAL_VIEW_STATE = {
  longitude: 15,
  latitude: 20,
  zoom: 1.5,
  pitch: 45,
  bearing: 0,
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

interface GeoFeature {
  properties: {
    ISO_A2?: string;
    ISO_A2_EH?: string;
    NAME?: string;
    [key: string]: unknown;
  };
  geometry: object;
}

interface HoverInfo {
  x: number;
  y: number;
  object?: GeoFeature;
}

export default function MapScene() {
  const [geoData, setGeoData] = useState<object | null>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  const { setSelectedCountry } = useMapContext();

  const { data: visitedCountries } = useQuery({
    queryKey: ['map-visited'],
    queryFn: () => mapService.getVisited().then((r) => r.data),
  });

  const visitedSet = new Map<string, MapCountry>(
    visitedCountries?.map((c) => [c.isoCode, c]) ?? []
  );

  useEffect(() => {
    fetch('/geo/countries.geojson')
      .then((r) => r.json())
      .then(setGeoData)
      .catch(console.error);
  }, []);

  const getIso = (f: GeoFeature) =>
    f.properties?.ISO_A2 || f.properties?.ISO_A2_EH || '';

  const layer =
    geoData &&
    new GeoJsonLayer({
      id: 'countries',
      data: geoData as object,
      extruded: true,
      wireframe: false,
      pickable: true,
      getElevation: (f: GeoFeature) => (visitedSet.has(getIso(f)) ? 180000 : 0),
      getFillColor: (f: GeoFeature) => {
        const iso = getIso(f);
        if (visitedSet.has(iso)) return [245, 158, 11, 220];
        return [30, 41, 59, 180];
      },
      getLineColor: [255, 255, 255, 25],
      getLineWidth: 1,
      lineWidthMinPixels: 0.5,
      updateTriggers: {
        getFillColor: [visitedSet.size],
        getElevation: [visitedSet.size],
      },
      transitions: {
        getElevation: 600,
        getFillColor: 400,
      },
      onHover: (info: { x: number; y: number; object?: GeoFeature }) => {
        setHoverInfo(info.object ? { x: info.x, y: info.y, object: info.object } : null);
      },
      onClick: (info: { object?: GeoFeature }) => {
        if (!info.object) return;
        const iso = getIso(info.object);
        const country = visitedSet.get(iso);
        setSelectedCountry(country ?? null);
      },
    });

  return (
    <div className={styles.container}>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layer ? [layer] : []}
      >
        <Map mapStyle={MAP_STYLE} />
      </DeckGL>

      {hoverInfo?.object && (
        <div
          className={styles.tooltip}
          style={{ left: hoverInfo.x + 12, top: hoverInfo.y - 8 }}
        >
          {(() => {
            const iso = getIso(hoverInfo.object);
            const visited = visitedSet.get(iso);
            return (
              <>
                {visited ? (
                  <span className={styles.visitedDot} />
                ) : null}
                <span>{visited?.flagEmoji ?? ''} {hoverInfo.object.properties?.NAME ?? iso}</span>
                {visited && <span className={styles.postCount}>{visited.postCount} posts</span>}
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
