import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import styles from "./Hero.module.scss";

import indonesiaPortrait from "../../assets/images/slideshow/indonesia-portrait.jpg";
import indonesiaHorizon from "../../assets/images/slideshow/indonesia-horizon.jpg";
import malaysiaPortrait from "../../assets/images/slideshow/malaysia-portrait.jpg";
import malaysiaHorizon from "../../assets/images/slideshow/malaysia-horizon.jpg";
import moroccoPortrait from "../../assets/images/slideshow/morocco-portrait.jpg";
import moroccoHorizon from "../../assets/images/slideshow/morocco-horizon.jpg";
import egyptPortrait from "../../assets/images/slideshow/egypt-portrait.jpg";
import egyptHorizon from "../../assets/images/slideshow/egypt-horizon.jpg";
import japanPortrait from "../../assets/images/slideshow/japan-portrait.jpg";
import japanHorizon from "../../assets/images/slideshow/japan-horizon.jpg";

interface SlideCountry {
  id: string;
  name: string;
  tagline: string;
  portrait: string;
  horizon: string;
}

const COUNTRIES: SlideCountry[] = [
  {
    id: "indonesia",
    name: "Indonesia",
    tagline: "Temples & Rainforests",
    portrait: indonesiaPortrait,
    horizon: indonesiaHorizon,
  },
  {
    id: "malaysia",
    name: "Malaysia",
    tagline: "Jungles & City Lights",
    portrait: malaysiaPortrait,
    horizon: malaysiaHorizon,
  },
  {
    id: "morocco",
    name: "Morocco",
    tagline: "Souks & Desert Sands",
    portrait: moroccoPortrait,
    horizon: moroccoHorizon,
  },
  {
    id: "egypt",
    name: "Egypt",
    tagline: "Pharaohs & Nile Winds",
    portrait: egyptPortrait,
    horizon: egyptHorizon,
  },
  {
    id: "japan",
    name: "Japan",
    tagline: "Shrines & Neon Streets",
    portrait: japanPortrait,
    horizon: japanHorizon,
  },
];

const N = COUNTRIES.length;

// Card dimensions — also reflected in Hero.module.scss
const CARD_WIDTH = 280;
const CARD_GAP = 16;
const STEP = CARD_WIDTH + CARD_GAP;

/**
 * Slot → x-position mapping (pixels from left edge of rightCol):
 *   slot 4 = off-screen LEFT  (card that just exited)
 *   slot 0 = first visible    (new active)
 *   slot 1 = second visible
 *   slot 2 = peeking from right
 *   slot 3 = off-screen RIGHT (next card waiting)
 */
// rightCol width is set to 760px (2.5 cards + 2 gaps + 28px offset) to keep
// slot 2 half-clipped at the right edge.
const OFFSET = 28;
const SLOT_X: Record<number, number> = {
  4: -60, // subtle leftward drift while fading out
  0: OFFSET, // first full card — 28px from left edge
  1: STEP + OFFSET, // second full card
  2: STEP * 2 + OFFSET, // peeking from right edge
  3: STEP * 3 + OFFSET, // off right — invisible, waiting
};

// Active card (slot 0) is slightly larger; others are pulled back
const SLOT_SCALE: Record<number, number> = {
  0: 1.2,
  1: 0.95,
  2: 0.92,
  3: 0.92,
  4: 0.95,
};

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCountry = COUNTRIES[activeIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % N);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <section className={styles.hero}>
      {/* Background */}
      <div className={styles.bg} data-scroll data-scroll-speed="-0.3">
        <AnimatePresence>
          <motion.img
            key={activeCountry.id + "-horizon"}
            src={activeCountry.horizon}
            alt=""
            className={styles.bgImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
          />
        </AnimatePresence>
        <div className={styles.bgOverlay} />
      </div>

      {/* Two-column layout */}
      <div className={styles.layout}>
        {/* Left column */}
        <div className={styles.leftCol}>
          {/* Timeline + country title in the same row */}
          <div className={styles.titleRow}>
            {/* Dot nav — 5 dots on a vertical line */}
            <motion.div
              className={styles.dotNav}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <div className={styles.dotNavLine} />
              {[...COUNTRIES].reverse().map((country, i) => {
                const actualIndex = COUNTRIES.length - 1 - i;
                return (
                  <button
                    key={country.id}
                    className={`${styles.dot} ${actualIndex === activeIndex ? styles.dotActive : ""}`}
                    onClick={() => setActiveIndex(actualIndex)}
                    aria-label={`Go to ${country.name}`}
                  />
                );
              })}
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.h1
                key={activeCountry.id}
                className={styles.countryTitle}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {activeCountry.name}
              </motion.h1>
            </AnimatePresence>
          </div>

          <motion.p
            className={styles.caption}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            follow my travel journeys from the moroccan desserts to the kl
            skyscrapers
          </motion.p>

          <motion.div
            className={styles.ctas}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            <Link to="/countries" className={styles.btnPrimary}>
              Read Stories
            </Link>
            <Link to="/map" className={styles.btnSecondary}>
              View Map
            </Link>
          </motion.div>
        </div>

        {/* Right column — infinite card carousel */}
        <div className={styles.rightCol}>
          {COUNTRIES.map((country, i) => {
            // Circular slot: 0=active, 1=next, 2=peek, 3=off-right, 4=off-left
            const slot = (i - activeIndex + N) % N;
            const x = SLOT_X[slot];
            // Only slots 0-2 are visible; slots 3 & 4 are hidden off-screen
            // so the spring never drags a card through the visible area
            const opacity = slot <= 2 ? 1 : 0;

            return (
              <motion.div
                key={country.id}
                className={styles.portraitCard}
                initial={false}
                animate={{ x, scale: SLOT_SCALE[slot], opacity }}
                transition={{
                  x: { type: "tween", duration: 0.6, ease: [0.4, 0, 0.2, 1] },
                  scale: {
                    type: "tween",
                    duration: 0.6,
                    ease: [0.4, 0, 0.2, 1],
                  },
                  opacity: { duration: 0.6, ease: "easeOut" },
                }}
              >
                <img
                  src={country.portrait}
                  alt={country.name}
                  className={styles.portraitImg}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        className={styles.scrollBtn}
        onClick={scrollDown}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        aria-label="Scroll down"
      >
        <ChevronDown size={24} />
      </motion.button>
    </section>
  );
}
