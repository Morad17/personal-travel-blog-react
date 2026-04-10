import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, MapPin, BookOpen } from 'lucide-react';
import { useMapContext } from '../../context/MapContext';
import { formatDateOrdinal } from '../../utils/formatDate';
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
              {selectedCountry.visits?.length > 0 && (
                <div className={styles.stat}>
                  <MapPin size={14} className={styles.statIcon} />
                  <div className={styles.visitsList}>
                    {selectedCountry.visits.map((v, i) => (
                      <div key={i} className={styles.visitEntry}>
                        <span className={styles.visitDate}>
                          <img
                            src={`https://flagcdn.com/w20/${selectedCountry.isoCode.toLowerCase()}.png`}
                            width="16"
                            height="12"
                            alt={selectedCountry.name}
                            className={styles.visitFlag}
                          />
                          {formatDateOrdinal(v.date)}
                        </span>
                        {v.cities.length > 0 && (
                          <span className={styles.visitCities}>{v.cities.join(', ')}</span>
                        )}
                      </div>
                    ))}
                  </div>
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
