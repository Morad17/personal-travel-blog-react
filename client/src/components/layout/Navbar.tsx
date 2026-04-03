import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import styles from "./Navbar.module.scss";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/countries", label: "Countries" },
  { to: "/map", label: "Map" },
  { to: "/gallery", label: "Gallery" },
  // { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoText}>Wanderer</span>
          <span className={styles.logoDot}>.</span>
        </Link>

        <nav className={styles.desktopNav}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          className={styles.menuBtn}
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            <nav className={styles.mobileNav}>
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <NavLink
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `${styles.mobileLink} ${isActive ? styles.active : ""}`
                    }
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// Our next destination was Chiang Mai ,north west Thailand, famed for being the more chilled and relaxed side of Thailand. There are many activities available a half hour away from Chiang Mai. One of these is visiting the Elephant sanctuary. During the last few years there has been more attention on protecting Animals from human exploitation, and so more sanctuaries have become more ethical, by not allowing them to be ridden and caring for sick and injured Elephants. The sanctuary we visited was one of them, which was a massive complex that let Elephants roam the majority of the area freely. This was an amazing opportunity to get very close to the largest land animal in the world, whilst knowing you weren't contributing to inhumane practices. This area was full of jungles and rivers, one activity we took part in was a quad biking trip around the area, stopping to see elephants, villages, jungles and rivers, which I'd highly recommend.
