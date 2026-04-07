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
import profilePic from "../../assets/images/profile-picture.jpg";

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

const CARD_WIDTH = 280;
const CARD_GAP = 16;
const STEP = CARD_WIDTH + CARD_GAP;

const OFFSET = 28;
const SLOT_X: Record<number, number> = {
  4: -60,
  0: OFFSET,
  1: STEP + OFFSET,
  2: STEP * 2 + OFFSET,
  3: STEP * 3 + OFFSET,
};

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
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <section className={styles.hero}>
      {/* Full-bleed background */}
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

      {/* ── Main layout: left bio panel | right slideshow ── */}
      <div className={styles.layout}>
        {/* ── LEFT: country title + journal info ── */}
        <motion.div
          className={styles.bioPanel}
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Journal title + profile pic */}
          <div className={styles.bioHeader}>
            <h2 className={styles.journalTitle}>Morad's</h2>
            <div className={styles.journalTitleGroup}>
              <img src={profilePic} alt="Morad" className={styles.profilePic} />{" "}
              <h2 className={styles.journalTitle}>Journal</h2>
            </div>
          </div>

          {/* Bio text */}
          <p className={styles.bioText}>
            A passionate traveller looking for the next adventure. From the
            cenotes of Mexico to the temples of Japan — chasing culture, and the
            spontaneous stories.Writing and picturing my journies so far, feel
            free to grab some inspiration and wonderlust...
          </p>

          {/* CTAs */}
          <div className={styles.ctas}>
            <Link to="/countries" className={styles.btnPrimary}>
              Read Stories
            </Link>
            <Link to="/map" className={styles.btnSecondary}>
              View Map
            </Link>
          </div>
        </motion.div>

        {/* ── RIGHT: portrait cards + country title below ── */}
        <div className={styles.rightPanel}>
          <div className={styles.cardCol}>
            {COUNTRIES.map((country, i) => {
              const slot = (i - activeIndex + N) % N;
              const x = SLOT_X[slot];
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

          {/* Country title — below cards */}
          <div className={styles.titleRow}>
            <AnimatePresence mode="wait">
              <motion.h1
                key={activeCountry.id}
                className={styles.countryTitle}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {activeCountry.name}
              </motion.h1>
            </AnimatePresence>
          </div>
        </div>

        {/* ── CENTRE: vertical timeline — absolutely between the two columns ── */}
        <motion.div
          className={styles.centreTimeline}
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
