import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { postsService } from "../../services/postsService";
import PostCard from "../blog/PostCard";
import MapScene from "../map/MapScene";
import { MapProvider } from "../../context/MapContext";
import styles from "./FeaturedPlaces.module.scss";

export default function FeaturedPlaces() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", "featured"],
    queryFn: () => postsService.getFeatured().then((r) => r.data),
  });

  return (
    <section className={styles.section}>
      {/* Full-width header */}
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <span className={styles.label}>Featured</span>
        <h2 className={styles.title}>Recent Adventures</h2>
      </motion.header>

      <div className={styles.body}>
        {/* Left — static map */}
        <div className={styles.mapCol}>
          <span className={styles.mapCaption}>Countries visited so far</span>
          <div className={styles.mapInner}>
            <MapProvider>
              <MapScene
                isStatic
                initialViewState={{
                  longitude: 15,
                  latitude: 10,
                  zoom: 0.95,
                  minZoom: 0.95,
                  pitch: 30,
                  minPitch: 30,
                  maxPitch: 30,
                  bearing: 0,
                }}
              />
            </MapProvider>
          </div>
          <Link to="/map" className={styles.ctaLink}>
            View Full Map →
          </Link>
        </div>

        {/* Right — blog posts */}
        <div className={styles.postsCol}>
          <p className={styles.subtitle}>The latest stories from the road</p>
          <div className={styles.grid}>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`skeleton ${styles.skeletonCard}`} />
                ))
              : posts?.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))}
          </div>

          <motion.div
            className={styles.cta}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/blogs" className={styles.ctaLink}>
              View All Stories →
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
