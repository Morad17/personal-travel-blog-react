import { Link } from "react-router-dom";
import styles from "./Footer.module.scss";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
            Wanderer<span className={styles.dot}>.</span>
          </Link>
          <p className={styles.tagline}>
            Exploring the world, one story at a time.
          </p>
        </div>

        <nav className={styles.links}>
          <Link to="/blogs">Blogs</Link>
          <Link to="/map">Map</Link>
          <Link to="/gallery">Gallery</Link>
          {/* <Link to="/contact">Contact</Link> */}
        </nav>

        <p className={styles.copy}>© {year} — MoradElb</p>
      </div>
    </footer>
  );
}
