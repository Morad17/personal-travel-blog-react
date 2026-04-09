import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, MapPin, BookOpen } from 'lucide-react';
import { useMapContext } from '../../context/MapContext';
import { formatDateUK } from '../../utils/formatDate';
import styles from './CountrySidebar.module.scss';

export default function CountrySidebar() {
  const { selectedCountry, setSelectedCountry } = useMapContext();

  return (
    <AnimatePresence>
      {selectedCountry && (
        <motion.aside
          className={styles.sidebar}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'tween', duration: 0.3 }}
        >
          <button className={styles.close} onClick={() => setSelectedCountry(null)} aria-label="Close">
            <X size={20} />
          </button>

          {selectedCountry.coverImageUrl && (
            <div className={styles.imageWrap}>
              <img src={selectedCountry.coverImageUrl} alt={selectedCountry.name} className={styles.image} />
              <div className={styles.imageOverlay} />
            </div>
          )}

          <div className={styles.body}>
            <div className={styles.flag}>{selectedCountry.flagEmoji}</div>
            <h2 className={styles.name}>{selectedCountry.name}</h2>

            <div className={styles.stats}>
              {selectedCountry.visitedAt && (
                <div className={styles.stat}>
                  <MapPin size={14} className={styles.statIcon} />
                  <span>Visited {formatDateUK(selectedCountry.visitedAt)}</span>
                </div>
              )}
              <div className={styles.stat}>
                <BookOpen size={14} className={styles.statIcon} />
                <span>{selectedCountry.postCount} {selectedCountry.postCount === 1 ? 'story' : 'stories'}</span>
              </div>
            </div>

            {selectedCountry.postCount > 0 && (
              <Link
                to={`/countries/${selectedCountry.slug}`}
                className={styles.cta}
                onClick={() => setSelectedCountry(null)}
              >
                Read Stories →
              </Link>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
