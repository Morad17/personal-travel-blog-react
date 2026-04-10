import MapScene from "../../components/map/MapScene";
import CountrySidebar from "../../components/map/CountrySidebar";
import MapTimeline from "../../components/map/MapTimeline";
import { MapProvider } from "../../context/MapContext";
import styles from "./MapPage.module.scss";

export default function MapPage() {
  return (
    <MapProvider>
      <div className={styles.page}>
        <aside className={styles.panel}>
          <span className={styles.label}>Interactive</span>
          <h1 className={styles.title}>My journeys so far</h1>
          <p className={styles.instructions}>
            Click on a country to see where I&apos;ve been.
            <br />
            Zoom in to get a closer look.
          </p>
          <MapTimeline />
        </aside>
        <div className={styles.mapContainer}>
          <MapScene />
          <CountrySidebar />
        </div>
      </div>
    </MapProvider>
  );
}
