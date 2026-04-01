import { useEffect, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { Map as MapGL } from 'react-map-gl/maplibre';
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

interface GeoProps {
  ISO_A2?: string;
  ISO_A2_EH?: string;
  NAME?: string;
}

interface HoverInfo {
  x: number;
  y: number;
  object?: { properties: GeoProps };
}

export default function MapScene() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [geoData, setGeoData] = useState<any>(null);
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

  const getIso = (props: GeoProps): string =>
    props?.ISO_A2 || props?.ISO_A2_EH || '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layer = geoData ? new (GeoJsonLayer as any)({
    id: 'countries',
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
    onHover: (info: { x: number; y: number; object?: { properties: GeoProps } }) => {
      setHoverInfo(info.object ? info : null);
    },
    onClick: (info: { object?: { properties: GeoProps } }) => {
      if (!info.object) return;
      const iso = getIso(info.object.properties);
      setSelectedCountry(visitedSet.get(iso) ?? null);
    },
  }) : null;

  return (
    <div className={styles.container}>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
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
                <span>{visited?.flagEmoji ?? ''} {hoverInfo.object.properties.NAME ?? iso}</span>
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
