import MapScene from '../components/map/MapScene';
import CountrySidebar from '../components/map/CountrySidebar';
import { MapProvider } from '../context/MapContext';
import styles from './MapPage.module.scss';

export default function MapPage() {
  return (
    <MapProvider>
      <div className={styles.page}>
        <header className={styles.header}>
          <span className={styles.label}>Interactive</span>
          <h1 className={styles.title}>Where I've Been</h1>
        </header>
        <div className={styles.mapContainer}>
          <MapScene />
          <CountrySidebar />
        </div>
      </div>
    </MapProvider>
  );
}
