import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { postsService } from "../../services/postsService";
import PostCard from "../blog/PostCard";
import GlobeScene from "./GlobeScene";
import styles from "./FeaturedPlaces.module.scss";

const fadeUp = (delay = 0, duration = 0.7) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, margin: "-80px" },
  transition: { duration, delay, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
});

const fadeLeft = (delay = 0, duration = 0.8) => ({
  initial: { opacity: 0, x: -40 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: false, margin: "-80px" },
  transition: { duration, delay, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
});

const fadeRight = (delay = 0, duration = 0.8) => ({
  initial: { opacity: 0, x: 40 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: false, margin: "-80px" },
  transition: { duration, delay, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
});

export default function FeaturedPlaces() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", "featured"],
    queryFn: () => postsService.getFeatured().then((r) => r.data),
  });

  return (
    <section className={styles.section}>
      {/* Full-width header — label drops in first, title slightly after */}
      <motion.header className={styles.header} {...fadeUp(0, 0.6)}>
        <motion.span
          className={styles.label}
          {...fadeUp(0.1, 0.5)}
        >
          Featured
        </motion.span>
        <motion.h2 className={styles.title} {...fadeUp(0.2, 0.7)}>
          Recent Adventures
        </motion.h2>
      </motion.header>

      <div className={styles.body}>
        {/* Left — map slides in from left */}
        <div className={styles.mapCol}>
          <motion.span className={styles.mapCaption} {...fadeLeft(0.1, 0.6)}>
            Countries visited so far
          </motion.span>
          <motion.div className={styles.mapInner} {...fadeLeft(0.25, 0.9)}>
            <GlobeScene />
          </motion.div>
          <motion.div {...fadeUp(0.5, 0.5)}>
            <Link to="/map" className={styles.ctaLink}>
              View Full Map →
            </Link>
          </motion.div>
        </div>

        {/* Right — subtitle + cards slide in from right, staggered */}
        <div className={styles.postsCol}>
          <motion.p className={styles.subtitle} {...fadeRight(0.15, 0.6)}>
            The latest stories from the road
          </motion.p>
          <div className={styles.grid}>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`skeleton ${styles.skeletonCard}`} />
                ))
              : posts?.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-60px" }}
                    transition={{
                      delay: i * 0.12,
                      duration: 0.65,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))}
          </div>

          <motion.div
            className={styles.cta}
            {...fadeUp(0.3, 0.5)}
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
